import { useState } from "react";
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

const RESOURCES = [
  { category: "report", title: "2026 Q1 澳門直播電商行業報告", desc: "第一季度市場規模、熱門品類、跨境帶貨佔比等核心數據分析。", link: "#" },
  { category: "report", title: "大灣區數字經濟發展白皮書", desc: "粵港澳大灣區數字經濟現狀與未來趨勢深度解讀。", link: "#" },
  { category: "report", title: "直播消費者行為洞察報告", desc: "澳門及大灣區直播觀眾畫像、消費偏好與行為模式分析。", link: "#" },
  { category: "training", title: "直播話術與控場技巧", desc: "從開場留人到逼單轉化，系統學習高轉化率直播話術。", link: "#" },
  { category: "training", title: "短視頻策劃與剪輯入門", desc: "手機拍攝、剪輯軟件操作、爆款內容策劃全流程教學。", link: "#" },
  { category: "training", title: "選品策略與供應鏈管理", desc: "如何選擇適合直播帶貨的產品，搭建穩定供應鏈體系。", link: "#" },
  { category: "training", title: "新人主播入門手冊", desc: "從零開始成為專業主播的完整指南，涵蓋設備、心態、運營。", link: "#" },
  { category: "template", title: "直播腳本模板（帶貨專用）", desc: "適用於產品帶貨直播的標準化腳本模板，直接下載使用。", link: "#" },
  { category: "template", title: "品牌合作協議範本", desc: "主播與品牌方合作的法律協議範本，保障雙方權益。", link: "#" },
  { category: "template", title: "直播活動策劃清單", desc: "從選品到復盤的全流程活動策劃核對清單，確保無遺漏。", link: "#" },
  { category: "policy", title: "抖音平台運營指南", desc: "抖音算法機制、流量分發規則、帳號冷啟動策略全面解讀。", link: "#" },
  { category: "policy", title: "TikTok 跨境直播入門", desc: "TikTok 海外市場開拓指南，跨境直播電商實操教學。", link: "#" },
  { category: "policy", title: "澳門跨境電商政策法規匯編", desc: "澳門及內地跨境電商相關法律法規、稅務政策匯總。", link: "#" },
  { category: "association", title: "澳門直播協會章程", desc: "協會運作的基本規範文件，涵蓋宗旨、組織架構、會員權益。", link: "#" },
  { category: "association", title: "會員手冊 2026", desc: "新會員入會必讀，包含權益說明、活動參與、會費標準等。", link: "#" },
  { category: "association", title: "2025 年度工作報告", desc: "協會年度工作總結，涵蓋活動回顧、財務摘要、未來規劃。", link: "#" },
];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? RESOURCES
    : RESOURCES.filter(r => r.category === activeCategory);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((res, i) => (
            <div key={i} className="flex flex-col rounded-[12px] border border-[#dde7e5] bg-white p-5 shadow-[0_2px_12px_rgba(35,70,74,0.04)] hover:shadow-[0_6px_20px_rgba(35,70,74,0.1)] transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[20px]">{CATEGORIES.find(c => c.key === res.category)?.icon || "📄"}</span>
                  <span className="text-[11px] font-semibold text-[#8ba09c] uppercase tracking-wide">
                    {CATEGORIES.find(c => c.key === res.category)?.label || ""}
                  </span>
                </div>
              </div>
              <h3 className="text-[15px] font-bold text-[#1b292b] mb-2">{res.title}</h3>
              <p className="text-[13px] text-[#57696d] leading-relaxed mb-4 flex-1">{res.desc}</p>
              <a
                href={res.link}
                className="inline-flex items-center gap-1.5 self-start rounded-full border border-[#006252] px-4 py-2 text-[13px] font-semibold text-[#006252] hover:bg-[#f0faf4] transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                下載
              </a>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[48px] mb-4">📭</p>
            <p className="text-[15px] text-[#6a7679]">暫無資源，敬請期待</p>
          </div>
        )}

        {/* Note */}
        <div className="mt-10 rounded-[12px] border border-[#d4e8e3] bg-[#f0faf4] p-5 text-center">
          <p className="text-[14px] text-[#57696d]">
            💡 資源持續更新中。如需更多資料或提交資源，請<a href="/help" className="text-[#006252] font-semibold underline">聯繫我們</a>。
          </p>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
