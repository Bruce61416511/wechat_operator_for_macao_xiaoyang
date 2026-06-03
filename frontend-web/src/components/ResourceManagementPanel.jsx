import { useState, useEffect } from "react";

const CATEGORIES = [
  { key: "report", label: "行業報告" },
  { key: "training", label: "培訓教學" },
  { key: "template", label: "模板工具" },
  { key: "policy", label: "平台政策" },
  { key: "association", label: "協會文件" },
];

function getToken() {
  return sessionStorage.getItem("token");
}

export default function ResourceManagementPanel() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "report",
    file_url: "",
    original_filename: "",
  });

  function fetchResources() {
    setLoading(true);
    fetch("/v1/resources?page_size=200")
      .then(r => r.json())
      .then(data => setResources(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchResources(); }, []);

  function resetForm() {
    setForm({ title: "", description: "", category: "report", file_url: "", original_filename: "" });
    setEditing(null);
    setShowForm(false);
    setUploadFile(null);
  }

  async function handleUpload() {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      const res = await fetch("/v1/resources/upload-file", {
        method: "POST",
        headers: { Authorization: "Bearer " + getToken() },
        body: fd,
      });
      if (!res.ok) throw new Error("上傳失敗");
      const data = await res.json();
      setForm(prev => ({ ...prev, file_url: data.url, original_filename: data.filename }));
    } catch (e) {
      alert("文件上傳失敗: " + (e.message || ""));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return alert("請輸入標題");
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    };

    try {
      let res;
      if (editing) {
        res = await fetch("/v1/resources/" + editing, {
          method: "PUT",
          headers,
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/v1/resources", {
          method: "POST",
          headers,
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) throw new Error("操作失敗");
      resetForm();
      fetchResources();
    } catch (e) {
      alert(e.message || "操作失敗");
    }
  }

  async function handleDelete(id) {
    if (!confirm("確定要刪除這項資源嗎？")) return;
    try {
      const res = await fetch("/v1/resources/" + id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + getToken() },
      });
      if (!res.ok) throw new Error("刪除失敗");
      fetchResources();
    } catch (e) {
      alert(e.message || "刪除失敗");
    }
  }

  function startEdit(res) {
    setForm({
      title: res.title,
      description: res.description || "",
      category: res.category,
      file_url: res.file_url || "",
      original_filename: res.original_filename || "",
    });
    setEditing(res.id);
    setShowForm(true);
  }

  return (
    <div className="w-full px-3 pb-8">
      <div className="rounded-[14px] border border-[#dde7e5] bg-white/90 p-6 shadow-[0_16px_34px_rgba(35,70,74,0.08)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-bold text-[#00473f]">資源管理</h2>
            <p className="text-[13px] text-[#6a7679] mt-1">管理資源中心的文件，創建的資源將在資源中心公開展示</p>
          </div>
          {!showForm && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="rounded-[7px] bg-gradient-to-br from-[#00836f] to-[#006252] px-5 py-2.5 text-[14px] font-bold text-white shadow-[0_4px_10px_rgba(0,93,80,0.2)] hover:shadow-[0_6px_14px_rgba(0,93,80,0.3)] transition"
            >
              + 新增資源
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-[10px] border border-[#d4e8e3] bg-[#f8fbfb] p-5">
            <h3 className="text-[16px] font-bold text-[#00473f] mb-4">
              {editing ? "編輯資源" : "新增資源"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#57696d] mb-1">標題 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-[6px] border border-[#cfd9d7] px-3 py-2 text-[13px] focus:border-[#006252] focus:outline-none"
                  placeholder="資源標題"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#57696d] mb-1">分類</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-[6px] border border-[#cfd9d7] px-3 py-2 text-[13px] focus:border-[#006252] focus:outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[13px] font-semibold text-[#57696d] mb-1">描述</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-[6px] border border-[#cfd9d7] px-3 py-2 text-[13px] focus:border-[#006252] focus:outline-none"
                  rows={3}
                  placeholder="資源描述"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#57696d] mb-1">上傳附件</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    onChange={e => setUploadFile(e.target.files[0])}
                    className="flex-1 rounded-[6px] border border-[#cfd9d7] px-3 py-2 text-[13px] file:mr-3 file:rounded-[4px] file:border-0 file:bg-[#e7f5f0] file:px-3 file:py-1 file:text-[12px] file:font-medium file:text-[#006252]"
                  />
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!uploadFile || uploading}
                    className="shrink-0 rounded-[6px] bg-gradient-to-br from-[#00836f] to-[#006252] px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
                  >
                    {uploading ? "上傳中..." : "上傳"}
                  </button>
                </div>
                {form.original_filename && (
                  <p className="mt-1 text-[12px] text-[#006252]">已上傳: {form.original_filename}</p>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#57696d] mb-1">或手動輸入鏈接</label>
                <input
                  type="text"
                  value={form.file_url}
                  onChange={e => setForm({ ...form, file_url: e.target.value, original_filename: "" })}
                  className="w-full rounded-[6px] border border-[#cfd9d7] px-3 py-2 text-[13px] focus:border-[#006252] focus:outline-none"
                  placeholder="https://... 或 /uploads/..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="rounded-[6px] bg-gradient-to-br from-[#00836f] to-[#006252] px-6 py-2 text-[14px] font-bold text-white"
              >
                {editing ? "保存修改" : "創建資源"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-[6px] border border-[#cfd9d7] px-6 py-2 text-[14px] font-medium text-[#6a7679] hover:bg-[#f0f4f3]"
              >
                取消
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[15px] text-[#6a7679]">加載中...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[48px] mb-3">📭</p>
                <p className="text-[15px] text-[#6a7679]">暫無資源，點擊上方按鈕創建</p>
              </div>
            ) : (
              resources.map(res => (
                <div
                  key={res.id}
                  className="flex items-center justify-between rounded-[9px] border border-[#dde7e5] bg-white p-4 hover:shadow-[0_2px_8px_rgba(35,70,74,0.06)] transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#8ba09c] bg-[#f0f4f3] px-2 py-0.5 rounded-full">
                        {CATEGORIES.find(c => c.key === res.category)?.label || res.category}
                      </span>
                      <h4 className="text-[14px] font-bold text-[#1b292b] truncate">{res.title}</h4>
                    </div>
                    {res.description && (
                      <p className="text-[12px] text-[#6a7679] mt-1 truncate">{res.description}</p>
                    )}
                    {res.file_url && (
                      <a href={res.file_url} className="text-[12px] text-[#006252] underline mt-1 inline-block" target="_blank" rel="noreferrer">
                        {(res.original_filename || res.file_url).length > 60
                          ? (res.original_filename || res.file_url).slice(0, 60) + "..."
                          : (res.original_filename || res.file_url)}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => startEdit(res)}
                      className="rounded-[5px] border border-[#cfd9d7] px-3 py-1.5 text-[12px] font-semibold text-[#57696d] hover:bg-[#f0f4f3]"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="rounded-[5px] border border-[#f5d0d0] px-3 py-1.5 text-[12px] font-semibold text-[#c53030] hover:bg-[#fef0f0]"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}