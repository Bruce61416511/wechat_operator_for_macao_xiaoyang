export default function DeclarationForm({ data, onChange, errors }) {
  const agreed = data.declaration_agreed === true;
  const set = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-6">
      <div className="rounded-[9px] border border-[#d4e8e3] bg-[#f8fbfb] px-6 py-5">
        <h4 className="text-[16px] font-bold text-[#142528]">申請人聲明與授權</h4>
        <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-[#57696d]">
          <p>1. 本人聲明以上所填資訊均真實、準確、完整，如有虛假，願承擔由此產生的一切後果。</p>
          <p>2. 本人同意並授權澳門直播協會對本人提交的資訊進行核實、存檔及在必要範圍內使用。</p>
          <p>3. 本人已知悉會員章程及相關規定，並承諾遵守協會的各項制度。</p>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => set("declaration_agreed", e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded-[4px] border-[#cfd9d7] text-[#006252] focus:ring-[#006252]/30 accent-[#006252]"
        />
        <span className={`text-[14px] font-medium ${errors?.declaration_agreed ? "text-red-500" : "text-[#27383a]"}`}>
          我已閱讀並同意以上聲明與授權內容
          {errors?.declaration_agreed && (
            <span className="block mt-1 text-[12px] text-red-500">{errors.declaration_agreed}</span>
          )}
        </span>
      </label>
    </div>
  );
}
