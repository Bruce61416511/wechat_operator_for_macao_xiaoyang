import { useState, useEffect } from "react";
import HeaderNav from "./HeaderNav.jsx";
import PageFooter from "./PageFooter.jsx";

const API = "/v1/announcements";

const CATEGORIES = [
  { key: "", label: "全部" },
  { key: "協會動態", label: "協會動態" },
  { key: "活動預告", label: "活動預告" },
  { key: "會員喜報", label: "會員喜報" },
  { key: "合作公告", label: "合作公告" },
  { key: "制度更新", label: "制度更新" },
  { key: "行業快訊", label: "行業快訊" },
];

const CATEGORY_ICONS = {
  "協會動態": "🏛️",
  "活動預告": "🎉",
  "會員喜報": "🏅",
  "合作公告": "🤝",
  "制度更新": "📜",
  "行業快訊": "🌐",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}年${m}月${day}日`;
}

function getToken() {
  return sessionStorage.getItem("token");
}

function isAdmin() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[0]));
    return payload.role === "root" || payload.role === "staff";
  } catch {
    return false;
  }
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", category: "協會動態", is_pinned: false });
  const [msg, setMsg] = useState("");
  const admin = isAdmin();

  useEffect(() => {
    fetchAnnouncements();
  }, [activeCategory]);

  async function fetchAnnouncements() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page_size: "50" });
      if (activeCategory) params.set("category", activeCategory);
      const res = await fetch(`${API}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAnnouncements(data.items || []);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const token = getToken();
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    try {
      const url = editing ? `${API}/${editing.id}` : API;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      setMsg(editing ? "公告已更新" : "公告已發佈");
      setShowForm(false);
      setEditing(null);
      setForm({ title: "", content: "", category: "協會動態", is_pinned: false });
      fetchAnnouncements();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("操作失敗");
      setTimeout(() => setMsg(""), 3000);
    }
  }

  async function handleDelete(ann) {
    if (!confirm("確認刪除該公告？")) return;
    const token = getToken();
    try {
      await fetch(`${API}/${ann.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setMsg("公告已刪除");
      setSelected(null);
      fetchAnnouncements();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("刪除失敗");
      setTimeout(() => setMsg(""), 3000);
    }
  }

  function openEdit(ann) {
    setEditing(ann);
    setForm({ title: ann.title, content: ann.content, category: ann.category, is_pinned: ann.is_pinned });
    setShowForm(true);
  }

  const pinned = announcements.filter(a => a.is_pinned);
  const regular = announcements.filter(a => !a.is_pinned);

  return (
    <div className="min-h-screen bg-[#f8fbfb]">
      <HeaderNav />

      {/* Toast */}
      {msg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#006252] px-6 py-3 text-[14px] font-semibold text-white shadow-lg">
          {msg}
        </div>
      )}

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#00473f] via-[#006252] to-[#00836f] px-8 py-16 text-center">
        <div className="absolute inset-0 bg-[url('/macau-page-bg.webp')] bg-cover bg-center opacity-15" />
        <div className="relative mx-auto max-w-[860px]">
          <p className="text-[14px] font-semibold tracking-[4px] text-[#8ed4c4] uppercase mb-4">Announcements</p>
          <h1 className="text-[44px] font-bold leading-tight text-white mb-5">公告資訊</h1>
          <p className="text-[17px] leading-relaxed text-[#c8e8df] max-w-[620px] mx-auto">
            了解澳門直播協會最新動態、活動預告、會員喜報及行業快訊。
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="mx-auto max-w-[960px] px-6 pt-10 pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                  activeCategory === cat.key
                    ? "bg-[#006252] text-white"
                    : "bg-white border border-[#dde7e5] text-[#57696d] hover:border-[#006252] hover:text-[#004f46]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {admin && (
            <button
              onClick={() => { setEditing(null); setForm({ title: "", content: "", category: "協會動態", is_pinned: false }); setShowForm(true); }}
              className="rounded-full bg-[#006252] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#004d40] transition-colors"
            >
              + 發佈公告
            </button>
          )}
        </div>
      </section>

      {/* Announcement List */}
      <section className="mx-auto max-w-[960px] px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-[#6a7679]">載入中...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[48px] mb-4">📭</p>
            <p className="text-[16px] text-[#6a7679]">暫無公告</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pinned */}
            {pinned.map(ann => (
              <div
                key={ann.id}
                onClick={() => setSelected(ann)}
                className="cursor-pointer rounded-[12px] border border-[#f0d78c] bg-gradient-to-r from-[#fffdf5] to-[#fff9e6] p-5 shadow-[0_4px_16px_rgba(180,140,40,0.1)] hover:shadow-[0_6px_20px_rgba(180,140,40,0.18)] transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold text-[#ad7b00] bg-[#fff0c0] px-2 py-0.5 rounded-full">置頂</span>
                      <span className="text-[12px] text-[#8ba09c]">{formatDate(ann.created_at)}</span>
                      <span className="text-[12px] text-[#57696d]">{CATEGORY_ICONS[ann.category]} {ann.category}</span>
                    </div>
                    <h3 className="text-[17px] font-bold text-[#1b292b]">{ann.title}</h3>
                  </div>
                </div>
              </div>
            ))}

            {/* Regular */}
            {regular.map(ann => (
              <div
                key={ann.id}
                onClick={() => setSelected(ann)}
                className="cursor-pointer rounded-[12px] border border-[#dde7e5] bg-white p-5 shadow-[0_2px_12px_rgba(35,70,74,0.04)] hover:shadow-[0_6px_20px_rgba(35,70,74,0.1)] transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[12px] text-[#8ba09c]">{formatDate(ann.created_at)}</span>
                      <span className="text-[12px] text-[#57696d]">{CATEGORY_ICONS[ann.category]} {ann.category}</span>
                    </div>
                    <h3 className="text-[16px] font-bold text-[#1b292b]">{ann.title}</h3>
                  </div>
                  <svg className="h-5 w-5 shrink-0 text-[#bcc7c5] mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="w-full max-w-[640px] max-h-[80vh] overflow-y-auto rounded-[14px] border border-[#dde7e5] bg-white shadow-[0_20px_50px_rgba(35,70,74,0.25)]" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-[#006252] to-[#00836f] px-6 py-5 rounded-t-[14px] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-[13px] opacity-80">
                  <span>{CATEGORY_ICONS[selected.category]} {selected.category}</span>
                  <span>·</span>
                  <span>{formatDate(selected.created_at)}</span>
                </div>
                <h3 className="text-[20px] font-bold mt-1">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white text-[24px]">×</button>
            </div>
            <div className="p-6">
              <div className="text-[15px] leading-relaxed text-[#3d4a4c] whitespace-pre-wrap">{selected.content}</div>
              {admin && (
                <div className="mt-6 flex gap-3 border-t border-[#eef3f1] pt-5">
                  <button onClick={() => { setSelected(null); openEdit(selected); }} className="rounded-full border border-[#dde7e5] px-5 py-2 text-[13px] font-semibold text-[#57696d] hover:bg-[#f5f7f6] transition-colors">
                    編輯
                  </button>
                  <button onClick={() => handleDelete(selected)} className="rounded-full border border-red-200 px-5 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors">
                    刪除
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="w-full max-w-[560px] max-h-[85vh] overflow-y-auto rounded-[14px] border border-[#dde7e5] bg-white shadow-[0_20px_50px_rgba(35,70,74,0.25)]" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-[#006252] to-[#00836f] px-6 py-5 rounded-t-[14px] text-white flex items-center justify-between">
              <h3 className="text-[18px] font-bold">{editing ? "編輯公告" : "發佈公告"}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-white/70 hover:text-white text-[24px]">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#27383a] mb-1.5">標題</label>
                <input className="w-full rounded-[7px] border border-[#cfd9d7] px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#006252]/30" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#27383a] mb-1.5">分類</label>
                <select className="w-full rounded-[7px] border border-[#cfd9d7] px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#006252]/30" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {CATEGORIES.filter(c => c.key).map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#27383a] mb-1.5">內容</label>
                <textarea className="w-full rounded-[7px] border border-[#cfd9d7] px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#006252]/30 resize-none" rows={6} value={form.content} onChange={e => setForm({...form, content: e.target.value})} required />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_pinned} onChange={e => setForm({...form, is_pinned: e.target.checked})} className="h-4 w-4 rounded accent-[#006252]" />
                <span className="text-[14px] font-medium text-[#57696d]">置頂公告</span>
              </label>
              <button type="submit" className="w-full rounded-full bg-[#006252] py-3 text-[15px] font-bold text-white hover:bg-[#004d40] transition-colors">
                {editing ? "更新公告" : "發佈公告"}
              </button>
            </form>
          </div>
        </div>
      )}

      <PageFooter />
    </div>
  );
}
