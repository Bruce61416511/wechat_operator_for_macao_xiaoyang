import { useEffect, useRef, useState } from "react";
import { checkDuplicate } from "../../services/api.js";

const MEMBER_TYPES = [
  { value: "個人會員", label: "個人會員", desc: "適合個人從業者，年費 500 澳門元", fields: "individual" },
  { value: "企業會員", label: "企業會員", desc: "適合機構/企業，年費 2000 澳門元", fields: "enterprise" },
  { value: "高級會員", label: "高級會員", desc: "品牌展示權益，年費 5000 澳門元", fields: "enterprise" },
];

function fieldClass(hasError) {
  return [
    "w-full rounded-[7px] border bg-white/90 px-4 py-3 text-[15px] font-medium text-[#1b292b]",
    "placeholder:text-[#a0acaf] focus:outline-none focus:ring-2 focus:ring-[#006252]/30",
    "transition-colors",
    hasError ? "border-red-400" : "border-[#cfd9d7]",
  ].join(" ");
}

function Label({ children, required }) {
  return (
    <label className="mb-1.5 block text-[14px] font-semibold text-[#27383a]">
      {children}
      {required ? <span className="ml-1 text-red-400">*</span> : null}
    </label>
  );
}

function ErrorText({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-[12px] font-medium text-red-500">{children}</p>;
}

function ConflictWarning({ children }) {
  if (!children) return null;
  return <p className="mb-1.5 text-[12px] font-medium text-red-500">{children}</p>;
}

function MemberTypeCard({ type, selected, onClick }) {
  const isEnterprise = type.fields === "enterprise";
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 rounded-[10px] border-2 px-5 py-4 text-left transition-all",
        selected
          ? "border-[#006252] bg-[#e8f5f0] shadow-sm"
          : "border-[#cfd9d7] bg-white hover:border-[#9bbab2]",
      ].join(" ")}
    >
      <p className="text-[16px] font-bold text-[#1b292b]">{type.label}</p>
      <p className="mt-1 text-[13px] font-medium leading-relaxed text-[#57696d]">{type.desc}</p>
      {isEnterprise && (
        <span className="mt-2 inline-block rounded-full bg-[#006252]/10 px-3 py-0.5 text-[11px] font-semibold text-[#006252]">
          需填寫企業資訊
        </span>
      )}
    </button>
  );
}

export default function BasicInfoForm({ data, onChange, errors }) {
  const set = (field, value) => onChange({ ...data, [field]: value });
  const [conflicts, setConflicts] = useState({});
  const debounceRef = useRef(null);

  const isEnterprise = data.member_type === "企業會員" || data.member_type === "高級會員";
  const selectedType = MEMBER_TYPES.find((t) => t.value === data.member_type);

  useEffect(() => {
    const username = data.username || "";
    const idNumber = data.id_number || "";

    if (username.length < 6 && idNumber.length < 15) {
      setConflicts({});
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const u = username.length >= 6 ? username : null;
        const id = idNumber.length >= 15 ? idNumber : null;
        if (!u && !id) {
          setConflicts({});
          return;
        }
        const result = await checkDuplicate(u, id);
        const next = {};
        if (result.username_exists) next.username = "該郵箱已被註冊，請更換";
        if (result.id_number_exists) next.id_number = "該證件號碼已被註冊，請檢查";
        setConflicts(next);
      } catch {
        // Silently ignore network errors
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [data.username, data.id_number]);

  return (
    <div className="space-y-6">
      {/* Step 1: Member Type Selection */}
      <div>
        <Label required>選擇會員類型</Label>
        <div className="mt-2 flex gap-4">
          {MEMBER_TYPES.map((t) => (
            <MemberTypeCard
              key={t.value}
              type={t}
              selected={data.member_type === t.value}
              onClick={() => {
                const updates = { member_type: t.value, requested_tier: t.value };
                if (t.fields === "individual") {
                  updates.company_name = "";
                  updates.business_reg_no = "";
                }
                onChange({ ...data, ...updates });
              }}
            />
          ))}
        </div>
        <ErrorText>{errors?.member_type}</ErrorText>
      </div>

      {selectedType && (
        <div className="rounded-[9px] border border-[#d4e8e3] bg-[#f0faf4] px-5 py-4">
          <p className="text-[14px] font-semibold text-[#005d50]">{selectedType.label}</p>
          <p className="mt-1 text-[13px] font-medium text-[#57696d]">{selectedType.desc}</p>
        </div>
      )}

      {data.member_type && (
        <>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label required>郵箱地址</Label>
              <ConflictWarning>{conflicts.username}</ConflictWarning>
              <input
                className={fieldClass(errors?.username || conflicts.username)}
                placeholder="請輸入郵箱地址"
                autoComplete="off"
                type="email"
                value={data.username || ""}
                onChange={(e) => set("username", e.target.value)}
              />
              <ErrorText>{errors?.username}</ErrorText>
            </div>
            <div>
              <Label required>密碼</Label>
              <input
                className={fieldClass(errors?.password)}
                type="password"
                placeholder="設置登錄密碼"
                autoComplete="new-password"
                value={data.password || ""}
                onChange={(e) => set("password", e.target.value)}
              />
              <ErrorText>{errors?.password}</ErrorText>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label required>申請人姓名{isEnterprise ? " / 聯絡人" : ""}</Label>
              <input
                className={fieldClass(errors?.applicant_name)}
                placeholder={isEnterprise ? "聯絡人真實姓名" : "真實姓名"}
                autoComplete="off"
                value={data.applicant_name || ""}
                onChange={(e) => set("applicant_name", e.target.value)}
              />
              <ErrorText>{errors?.applicant_name}</ErrorText>
            </div>
            <div>
              <Label required={!isEnterprise}>證件號碼</Label>
              <ConflictWarning>{conflicts.id_number}</ConflictWarning>
              <input
                className={fieldClass(errors?.id_number || conflicts.id_number)}
                placeholder={isEnterprise ? "聯絡人身份證號碼（可選）" : "身份證 / 護照號碼，15-18 位"}
                autoComplete="off"
                value={data.id_number || ""}
                onChange={(e) => set("id_number", e.target.value)}
              />
              <ErrorText>{errors?.id_number}</ErrorText>
            </div>
          </div>

          {isEnterprise && (
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label required>公司名稱</Label>
                <input
                  className={fieldClass(errors?.company_name)}
                  placeholder="企業/機構全稱"
                  autoComplete="off"
                  value={data.company_name || ""}
                  onChange={(e) => set("company_name", e.target.value)}
                />
                <ErrorText>{errors?.company_name}</ErrorText>
              </div>
              <div>
                <Label required>商業登記號</Label>
                <input
                  className={fieldClass(errors?.business_reg_no)}
                  placeholder="商業登記編號"
                  autoComplete="off"
                  value={data.business_reg_no || ""}
                  onChange={(e) => set("business_reg_no", e.target.value)}
                />
                <ErrorText>{errors?.business_reg_no}</ErrorText>
              </div>
            </div>
          )}

          <div>
            <Label required>聯絡電話</Label>
            <input
              className={fieldClass(errors?.applicant_phone)}
              placeholder="可聯絡到本人的手機號碼"
              autoComplete="off"
              value={data.applicant_phone || ""}
              onChange={(e) => set("applicant_phone", e.target.value)}
            />
            <ErrorText>{errors?.applicant_phone}</ErrorText>
          </div>

          <div>
            <Label>通訊地址</Label>
            <input
              className={fieldClass(false)}
              placeholder="選填"
              autoComplete="off"
              value={data.applicant_address || ""}
              onChange={(e) => set("applicant_address", e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}
