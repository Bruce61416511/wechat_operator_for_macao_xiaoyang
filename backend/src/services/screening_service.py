import json
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.application import Application
from ..models.constitution_rules import ConstitutionRule
from ..ai.deepseek_client import chat


# rule_key -> Application 字段映射，用於前置空值檢查
RULE_FIELD_MAP = {
    "address_region": "applicant_address",
    "從業經歷": "career_history",
    "qualification": "qualifications",
}


class ScreeningService:
    """AI 語義驅動的自動化初審服務"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def evaluate(self, application: Application) -> dict:
        """根據現行章程規則，調用大模型逐條評估申請"""
        rules_result = await self.db.execute(
            select(ConstitutionRule).where(
                ConstitutionRule.rule_type.in_(["入會條件", "篩選標準"]),
                ConstitutionRule.expired_at.is_(None)
            )
        )
        rules = rules_result.scalars().all()

        if not rules:
            return {"passed": True, "reasons": ["無生效規則，自動通過"]}

        # 前置檢查：空值直接拒絕，不浪費 AI 調用
        pre_reasons = []
        ai_rules = []
        for rule in rules:
            field = RULE_FIELD_MAP.get(rule.rule_key)
            if field:
                val = getattr(application, field, None)
                if not val or not str(val).strip():
                    pre_reasons.append(f"[{rule.rule_key}] ✗ {rule.description}（字段未填寫）")
                    continue
            # min_age 特殊處理：年齡可計算才送 AI
            if rule.rule_key == "min_age":
                age = self._calc_age(application.id_number)
                if age is None:
                    pre_reasons.append(f"[{rule.rule_key}] ✗ {rule.description}（身份證號無效，無法計算年齡）")
                    continue
            ai_rules.append(rule)

        # 如果全部被前置攔截，直接返回
        if not ai_rules:
            if pre_reasons:
                return {"passed": False, "reasons": pre_reasons}
            return {"passed": True, "reasons": ["無生效規則，自動通過"]}

        # AI 判斷剩餘規則
        prompt = self._build_prompt(application, ai_rules)
        try:
            raw = await chat(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=2048
            )
            ai_result = self._parse_result(raw, ai_rules)
        except Exception as e:
            # AI 異常時，前置結果仍有效
            if pre_reasons:
                return {"passed": False, "reasons": pre_reasons}
            return {
                "passed": True,
                "reasons": [f"AI 審核暫不可用，轉人工處理 ({str(e)[:100]})"]
            }

        # 合併前置結果和 AI 結果
        reasons = pre_reasons + ai_result["reasons"]
        passed = ai_result["passed"] and len(pre_reasons) == 0
        return {"passed": passed, "reasons": reasons}

    def _calc_age(self, id_number: str) -> int | None:
        # Strip _upd_ suffix for member info update applications
        import re
        clean_id = re.sub(r'_upd_\d+$', '', id_number)
        try:
            if len(clean_id) == 18:
                birth = date(int(clean_id[6:10]), int(clean_id[10:12]), int(clean_id[12:14]))
            elif len(clean_id) == 15:
                birth = date(int("19" + clean_id[6:8]), int(clean_id[8:10]), int(clean_id[10:12]))
            else:
                return None
            today = date.today()
            return today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
        except (ValueError, IndexError):
            return None

    def _build_prompt(self, app: Application, rules) -> str:
        age = self._calc_age(app.id_number)
        age_info = f"{age}歲" if age is not None else "未知"
        addr = app.applicant_address or "未填寫"
        career = app.career_history or "未填寫"

        questions = []
        for r in rules:
            rk = r.rule_key
            desc = r.description
            if rk == "min_age":
                questions.append(f"[{rk}] 申請人年齡{age_info}，要求：{desc}。{age_info}是否滿足該要求？")
            elif rk == "address_region":
                questions.append(f"[{rk}] 地址={addr}，要求={desc}。滿足？")
            elif "從業" in rk or "經歷" in rk:
                questions.append(f"[{rk}] 經歷={career}，要求={desc}。滿足？")
            else:
                questions.append(f"[{rk}] 要求={desc}。滿足？")

        questions_text = "\n".join(questions)

        return f"""逐條回答是或否，禁止說"不確定"。\n注意：地址檢查中，香港、澳門、臺灣均視爲中國境內地區。\n\n申請人：{app.applicant_name}，年齡{age_info}\n\n{questions_text}\n\n只返回JSON：{{"results":[{{"rule_key":"...","passed":true/false,"reason":"理由"}}],"overall_passed":true/false}}"""

    def _parse_result(self, raw: str, rules) -> dict:
        raw = raw.strip()
        if raw.startswith("```"):
            lines = raw.split("\n")
            raw = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            start = raw.find("{")
            end = raw.rfind("}")
            if start >= 0 and end > start:
                data = json.loads(raw[start:end+1])
            else:
                return {"passed": True, "reasons": ["AI 返回格式異常，轉人工處理"]}

        results = data.get("results", [])
        reasons = []
        passed = True

        seen_keys = {r.get("rule_key") for r in results}
        for rule in rules:
            if rule.rule_key not in seen_keys:
                results.append({"rule_key": rule.rule_key, "passed": True, "reason": "（未評估，默認通過）"})

        for r in results:
            if not r.get("passed", True):
                passed = False
            reasons.append(f"[{r.get('rule_key', '?')}] {'✓' if r.get('passed', True) else '✗'} {r.get('reason', '')}")

        if data.get("overall_passed") is False:
            passed = False

        return {"passed": passed, "reasons": reasons}

    async def perform_screening(self, application: Application, result: str, reason: str) -> Application:
        if result == "pass":
            application.status = "初審通過"
        else:
            application.status = "初審不通過"
        application.screening_result = reason
        application.screening_by = "AI系統"
        await self.db.flush()
        return application