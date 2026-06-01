import { useRef, useState } from "react";
import { uploadQualificationFile } from "../../services/api.js";

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

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24">
      <path d="M12 16V4M8 8l4-4 4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export default function QualificationForm({ data, onChange, errors }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileUrls = (() => {
    try {
      const raw = data.qualification_files;
      if (!raw) return [];
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return [];
    }
  })();

  const set = (field, value) => onChange(prev => ({ ...prev, [field]: value }));

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      const newUrls = [...fileUrls];
      for (const file of files) {
        try {
          const result = await uploadQualificationFile(file);
          newUrls.push(result.url);
        } catch (err) {
          setUploadError((err && err.message) || "上傳失敗，請重試");
        }
      }
      set("qualification_files", JSON.stringify(newUrls));
    } finally {
      setUploading(false);
    }
  }

  function removeFile(index) {
    const newUrls = fileUrls.filter((_, i) => i !== index);
    set("qualification_files", JSON.stringify(newUrls));
  }

  return (
    <div className="space-y-6">
      <div>
        <Label required>資質文件</Label>
        <p className="mb-3 text-[13px] text-[#6a7679]">支援 JPG、PNG 格式，單檔案不超過 5MB</p>

        {/* Upload area */}
        <div
          className={[
            "cursor-pointer rounded-[9px] border-2 border-dashed px-6 py-8 text-center transition-colors",
            uploading ? "border-[#006252] bg-[#f0faf4]" : "border-[#cfd9d7] bg-[#f8fbfb] hover:border-[#006252] hover:bg-[#f0faf4]",
          ].join(" ")}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            onClick={(e) => { e.target.value = ""; }}
          />
          {uploading ? (
            <p className="text-[14px] font-medium text-[#006252]">上傳中...</p>
          ) : uploadError ? (
            <p className="text-[14px] font-medium text-red-500">{uploadError}</p>
          ) : (
            <>
              <UploadIcon />
              <p className="mt-2 text-[14px] font-medium text-[#57696d]">點擊或拖曳檔案到此處上傳</p>
              <p className="mt-1 text-[12px] text-[#9ba8aa]">JPG / PNG 格式</p>
            </>
          )}
        </div>

        {/* File previews */}
        {fileUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {fileUrls.map((url, index) => (
              <div key={index} className="group relative overflow-hidden rounded-[7px] border border-[#dde7e5] bg-white">
                <img
                  src={url}
                  alt={`資質文件 ${index + 1}`}
                  className="h-32 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        <ErrorText>{errors?.qualification_files}</ErrorText>
      </div>

      <div>
        <Label>資質說明</Label>
        <textarea
          className={fieldClass(false)}
          placeholder="請描述您的專業資質，如持有的證書、培訓經歷、行業認證等"
          rows={4}
          value={data.qualifications || ""}
          onChange={(e) => set("qualifications", e.target.value)}
        />
      </div>
    </div>
  );
}
