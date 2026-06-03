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

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [selected, setSelected] = useState(null);

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

  const pinned = announcements.filter(a => a.is_pinned);
  const regular = announcements.filter(a => !a.is_pinned);

  return (
    <div className="min-h-screen bg-[#f8fbfb]">
      <HeaderNav />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#00473f] via-[#006252] to-[#00836f] px-8 py-16 text-center">
        <div className="absolute inset-0 bg-[url('/macau-page-bg.webp')] bg-cover bg-center opacity-15" />
        <div className="relative mx-auto max-w-[860px]">
          <p className="text-[14px] font-semibold tracking-[4px] text-[#8ed4c4] uppercase mb-4">Announcements</p>
          <h1 className="text-[44px] font-bold leading-tight text-white mb-5">公告資訊</h1>
          <p className="text-[17px] leading-relaxed text-[#c8e8df] max-w-[620px] mx-auto">
            了解澳門直播協會最新動態、活動預告、會員喜報及行業資訊。
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="mx-auto max-w-[960px] px-6 pt-10 pb-2">
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
      </section>

      {/* Announcement List */}
      <section className="mx-auto max-w-[960px] px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-[#6a7679]">載入中...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[48px] mb-4">📭</p>
            <p className="text-[15px] text-[#6a7679]">暫無公告</p>
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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#ad7b00] bg-[#fff0c0] px-2 py-0.5 rounded-full">置頂</span>
                    <span className="text-[12px] text-[#8ba09c]">{formatDate(ann.created_at)}</span>
                  </div>
                  <span className="text-[12px] text-[#57696d]">{CATEGORY_ICONS[ann.category]} {ann.category}</span>
                </div>
                <h3 className="text-[17px] font-bold text-[#1b292b]">{ann.title}</h3>
              </div>
            ))}

            {/* Regular */}
            {regular.map(ann => (
              <div
                key={ann.id}
                onClick={() => setSelected(ann)}
                className="cursor-pointer rounded-[12px] border border-[#dde7e5] bg-white p-5 shadow-[0_2px_12px_rgba(35,70,74,0.04)] hover:shadow-[0_6px_20px_rgba(35,70,74,0.1)] transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[#8ba09c]">{formatDate(ann.created_at)}</span>
                  <span className="text-[12px] text-[#57696d]">{CATEGORY_ICONS[ann.category]} {ann.category}</span>
                </div>
                <h3 className="text-[16px] font-bold text-[#1b292b]">{ann.title}</h3>
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
            </div>
          </div>
        </div>
      )}

      <PageFooter />
    </div>
  );
}