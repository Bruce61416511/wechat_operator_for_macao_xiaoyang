import { useState, useEffect } from "react";
import HeaderNav from "./HeaderNav.jsx";
import PageFooter from "./PageFooter.jsx";

const CATEGORIES = [
  { key: "all", label: "全部", icon: "📂" },
  { key: "report", label: "行業報告", icon: "📊" },
  { key: "training", label: "培訓教學", icon: "🎓" },
  { key: "template", label: "模板工具", icon: "📋" },
  { key: "policy", label: "平台政策", icon: "🏛️" },
  { key: "association", label: "協會文件", icon: "📜" },
];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/v1/resources?page_size=200")
      .then(r => r.json())
      .then(data => setResources(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "all"
    ? resources
    : resources.filter(r => r.category === activeCategory);

  const activeCat = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div className="min-h-screen bg-[#f8fbfb]">
      <HeaderNav />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#00473f] via-[#006252] to-[#00836f] px-8 py-16 text-center">
        <div className="absolute inset-0 bg-[url('/macau-page-bg.webp')] bg-cover bg-center opacity-15" />
        <div className="relative mx-auto max-w-[860px]">
          <p className="text-[14px] font-semibold tracking-[4px] text-[#8ed4c4] uppercase mb-4">Resources</p>
          <h1 className="text-[44px] font-bold leading-tight text-white mb-5">資源中心</h1>
          <p className="text-[17px] leading-relaxed text-[#c8e8df] max-w-[620px] mx-auto">
            行業報告、培訓資料、模板工具、政策文件一站式下載，助您快速提升專業能力。
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
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                activeCategory === cat.key
                  ? "bg-[#006252] text-white"
                  : "bg-white border border-[#dde7e5] text-[#57696d] hover:border-[#006252] hover:text-[#004f46]"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Resource Grid */}
      <section className="mx-auto max-w-[960px] px-6 py-8 pb-16">
        {activeCat && activeCategory !== "all" && (
          <h2 className="text-[18px] font-bold text-[#00473f] mb-5 flex items-center gap-2">
            <span>{activeCat.icon}</span> {activeCat.label}
            <span className="text-[13px] font-normal text-[#8ba09c] ml-2">（{filtered.length} 項資源）</span>
          </h2>
        )}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-[48px] mb-4 animate-pulse">⏳</p>
            <p className="text-[15px] text-[#6a7679]">加載中...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(res => (
                <div key={res.id} className="flex flex-col rounded-[12px] border border-[#dde7e5] bg-white p-5 shadow-[0_2px_12px_rgba(35,70,74,0.04)] hover:shadow-[0_6px_20px_rgba(35,70,74,0.1)] transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[20px]">{CATEGORIES.find(c => c.key === res.category)?.icon || "📄"}</span>
                      <span className="text-[11px] font-semibold text-[#8ba09c] uppercase tracking-wide">
                        {CATEGORIES.find(c => c.key === res.category)?.label || res.category || ""}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-[15px] font-bold text-[#1b292b] mb-2">{res.title}</h3>
                  <p className="text-[13px] text-[#57696d] leading-relaxed mb-4 flex-1">{res.description}</p>
                  {res.file_url ? (
                    <a
                      href={res.file_url}
                      download={res.original_filename || undefined}
                      className="inline-flex items-center gap-1.5 self-start rounded-full border border-[#006252] px-4 py-2 text-[13px] font-semibold text-[#006252] hover:bg-[#f0faf4] transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      下載
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-[#dde7e5] px-4 py-2 text-[13px] text-[#8ba09c]">尚無附件</span>
                  )}
                </div>
              ))}
            </div>

            {filtered.length === 0 && !loading && (
              <div className="text-center py-16">
                <p className="text-[48px] mb-4">📭</p>
                <p className="text-[15px] text-[#6a7679]">暫無資源，敬請期待</p>
              </div>
            )}

            {/* Note */}
            <div className="mt-10 rounded-[12px] border border-[#d4e8e3] bg-[#f0faf4] p-5 text-center">
              <p className="text-[14px] text-[#57696d]">
                💡 資源持續更新中。如需更多資料或提交資源，請<a href="/member" className="text-[#006252] font-semibold underline">登錄會員中心</a>。
              </p>
            </div>
          </>
        )}
      </section>

      <PageFooter />
    </div>
  );
}
