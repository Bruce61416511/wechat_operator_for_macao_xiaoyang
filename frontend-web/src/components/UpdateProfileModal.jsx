import { useState, useRef } from "react";
import { uploadQualificationFile } from "../services/api.js";

function fieldClass() {
  return "w-full rounded-[6px] border border-[#cfd9d7] bg-white px-3 py-2 text-[14px] font-medium text-[#1b292b] placeholder:text-[#a0acaf] focus:outline-none focus:ring-2 focus:ring-[#006252]/30 transition-colors resize-none";
}

function Label({ children }) {
  return <label className="mb-1 block text-[13px] font-semibold text-[#27383a]">{children}</label>;
}

export default function UpdateProfileModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    phone: profile?.phone || "",
    address: profile?.address || "",
    career_history: profile?.career_history || "",
    qualifications: profile?.qualifications || "",
    qualification_files: profile?.qualification_files || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const fileUrls = (() => {
    try {
      const raw = form.qualification_files;
      if (!raw) return [];
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch { return []; }
  })();

  async function handleUpload(files) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newUrls = [...fileUrls];
      for (const file of files) {
        const result = await uploadQualificationFile(file);
        newUrls.push(result.url);
      }
      set("qualification_files", JSON.stringify(newUrls));
    } catch (err) {
      setError(err.message || "上傳失敗");
    } finally {
      setUploading(false);
    }
  }

  function removeFile(index) {
    const newUrls = fileUrls.filter((_, i) => i !== index);
    set("qualification_files", JSON.stringify(newUrls));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("/v1/members/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phone: form.phone || undefined,
          address: form.address || undefined,
          career_history: form.career_history || undefined,
          qualifications: form.qualifications || undefined,
          qualification_files: form.qualification_files || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const detail = data?.detail;
        throw new Error(typeof detail === "object" ? detail.message || "保存失敗" : detail || "保存失敗");
      }
      const data = await res.json();
      onSaved?.(data.member);
      onClose();
    } catch (err) {
      setError(err.message || "保存失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-[12px] border border-[#dde7e5] bg-white p-6 shadow-[0_20px_50px_rgba(35,70,74,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-bold text-[#142528]">更新資料</h2>
          <button onClick={onClose} className="text-[#9ba8aa] hover:text-[#57696d] text-[20px] leading-none" type="button">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>手機號碼</Label>
            <input className={fieldClass()} value={form.phone} onChange={e => set("phone", e.target.value)} />
          </div>
          <div>
            <Label>通訊地址</Label>
            <input className={fieldClass()} value={form.address} onChange={e => set("address", e.target.value)} />
          </div>
          <div>
            <Label>從業經歷</Label>
            <textarea className={fieldClass()} rows={4} value={form.career_history} onChange={e => set("career_history", e.target.value)} />
          </div>
          <div>
            <Label>資質說明</Label>
            <textarea className={fieldClass()} rows={3} value={form.qualifications} onChange={e => set("qualifications", e.target.value)} />
          </div>
          <div>
            <Label>資質文件</Label>
            <div
              className="cursor-pointer rounded-[6px] border-2 border-dashed border-[#cfd9d7] bg-[#f8fbfb] px-4 py-4 text-center hover:border-[#006252] hover:bg-[#f0faf4] transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
            >
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
              {uploading ? <p className="text-[13px] text-[#006252]">上傳中...</p> : <p className="text-[13px] text-[#57696d]">點擊或拖拽上傳 JPG/PNG</p>}
            </div>
            {fileUrls.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {fileUrls.map((url, i) => (
                  <div key={i} className="relative h-16 w-16 rounded-[4px] overflow-hidden border border-[#dde7e5]">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => removeFile(i)} className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center" type="button">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <p className="mt-4 text-[13px] font-medium text-red-500 text-center">{error}</p>}

        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onClose} className="rounded-[6px] border border-[#cfd9d7] px-5 py-2 text-[14px] font-medium text-[#6a7679]" type="button">取消</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-[6px] bg-gradient-to-br from-[#00836f] to-[#006252] px-5 py-2 text-[14px] font-bold text-white disabled:opacity-60"
            type="button"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
