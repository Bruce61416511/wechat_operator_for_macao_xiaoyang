import { useEffect, useRef, useState } from "react";
import { checkDuplicate } from "../../services/api.js";

const TIER_OPTIONS = [
  { value: "普通會員", label: "普通會員", desc: "適合個人從業者，年費 500 澳門元" },
  { value: "高級會員", label: "高級會員", desc: "適合機構/企業，年費 1000 澳門元" },
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

export default function BasicInfoForm({ data, onChange, errors }) {
  const set = (field, value) => onChange({ ...data, [field]: value });
  const [conflicts, setConflicts] = useState({});
  const debounceRef = useRef(null);

  useEffect(() => {
    const username = data.username || "";
    const idNumber = data.id_number || "";

    if (username.length < 2 && idNumber.length < 15) {
      setConflicts({});
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const u = username.length >= 2 ? username : null;
        const id = idNumber.length >= 15 ? idNumber : null;
        if (!u && !id) {
          setConflicts({});
          return;
        }
        const result = await checkDuplicate(u, id);
        const next = {};
        if (result.username_exists) next.username = "該用戶名稱已被佔用，請更換";
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
      <div className="grid grid-cols-2 gap-5">
        <div>
          <Label required>用戶名</Label>
          <ConflictWarning>{conflicts.username}</ConflictWarning>
          <input
            className={fieldClass(errors?.username || conflicts.username)}
            placeholder="字母或數字，2-50 位"
            autoComplete="off"
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
          <Label required>申請人姓名</Label>
          <input
            className={fieldClass(errors?.applicant_name)}
            placeholder="真實姓名"
            autoComplete="off"
            value={data.applicant_name || ""}
            onChange={(e) => set("applicant_name", e.target.value)}
          />
          <ErrorText>{errors?.applicant_name}</ErrorText>
        </div>
        <div>
          <Label required>證件號碼</Label>
          <ConflictWarning>{conflicts.id_number}</ConflictWarning>
          <input
            className={fieldClass(errors?.id_number || conflicts.id_number)}
            placeholder="身份證 / 護照號碼，15-18 位"
            autoComplete="off"
            value={data.id_number || ""}
            onChange={(e) => set("id_number", e.target.value)}
          />
          <ErrorText>{errors?.id_number}</ErrorText>
        </div>
      </div>

      <div>
        <Label required>聯繫電話</Label>
        <input
          className={fieldClass(errors?.applicant_phone)}
          placeholder="可聯繫到本人的手機號碼"
          autoComplete="off"
          value={data.applicant_phone || ""}
          onChange={(e) => set("applicant_phone", e.target.value)}
        />
        <ErrorText>{errors?.applicant_phone}</ErrorText>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <Label>電子郵箱</Label>
          <input
            className={fieldClass(errors?.applicant_email)}
            placeholder="選填"
            autoComplete="off"
            value={data.applicant_email || ""}
            onChange={(e) => set("applicant_email", e.target.value)}
          />
          <ErrorText>{errors?.applicant_email}</ErrorText>
        </div>
        <div>
          <Label>申請會員級別</Label>
          <select
            className={fieldClass(false)}
            value={data.requested_tier || ""}
            onChange={(e) => set("requested_tier", e.target.value)}
          >
            <option value="">請選擇</option>
            {TIER_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
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

      {data.requested_tier && (
        <div className="rounded-[9px] border border-[#d4e8e3] bg-[#f0faf4] px-5 py-4">
          <p className="text-[14px] font-semibold text-[#005d50]">
            {TIER_OPTIONS.find((t) => t.value === data.requested_tier)?.label}
          </p>
          <p className="mt-1 text-[13px] font-medium text-[#57696d]">
            {TIER_OPTIONS.find((t) => t.value === data.requested_tier)?.desc}
          </p>
        </div>
      )}
    </div>
  );
}