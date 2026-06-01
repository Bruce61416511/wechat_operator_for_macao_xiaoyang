function fieldClass(hasError) {
  return [
    "w-full rounded-[7px] border bg-white/90 px-4 py-3 text-[15px] font-medium text-[#1b292b]",
    "placeholder:text-[#a0acaf] focus:outline-none focus:ring-2 focus:ring-[#006252]/30",
    "transition-colors resize-none",
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

export default function CareerForm({ data, onChange, errors }) {
  const set = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-6">
      <div>
        <Label required>從業經歷</Label>
        <textarea
          className={fieldClass(errors?.career_history)}
          placeholder="請描述您的從業背景、主要方向和相關經驗，例如：曾任職機構、負責領域、從業年限等"
          rows={8}
          value={data.career_history || ""}
          onChange={(e) => set("career_history", e.target.value)}
        />
        <ErrorText>{errors?.career_history}</ErrorText>
      </div>
    </div>
  );
}