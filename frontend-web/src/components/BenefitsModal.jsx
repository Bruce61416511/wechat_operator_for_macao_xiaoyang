import React from "react";

const benefits = {
  "普通會員": [
    { title: "協會活動報名", desc: "參加各類協會主辦的活動", icon: "📅" },
    { title: "基礎培訓課程", desc: "免費參加基礎培訓課程", icon: "📚" },
    { title: "行業資訊", desc: "定期推送行業動態和政策信息", icon: "📨" },
    { title: "會員證書", desc: "獲得電子會員證書", icon: "🏅" },
  ],
  "高級會員": [
    { title: "優先報名", desc: "活動名額優先保留", icon: "⭐" },
    { title: "高級培訓", desc: "專屬高級培訓課程", icon: "🎓" },
    { title: "商務對接", desc: "企業資源精準匹配", icon: "🤝" },
    { title: "活動報名", desc: "參加各類協會活動", icon: "📅" },
    { title: "培訓課程", desc: "基礎與進階培訓", icon: "📚" },
    { title: "行業資訊", desc: "定期行業報告與分析", icon: "📨" },
  ],
  "理事": [
    { title: "協會決策", desc: "參與協會重大事項表決", icon: "🏛️" },
    { title: "專屬顧問", desc: "一對一專屬服務顧問", icon: "💼" },
    { title: "品牌推廣", desc: "協會平臺品牌曝光資源", icon: "📣" },
    { title: "優先報名", desc: "所有活動無條件優先", icon: "⭐" },
    { title: "高級培訓", desc: "全部培訓課程免費", icon: "🎓" },
    { title: "商務對接", desc: "高端資源優先匹配", icon: "🤝" },
  ],
};

const tierNames = {
  "普通會員": "普通會員",
  "高級會員": "高級會員",
  "理事": "理事",
};

const tierColors = {
  "普通會員": "from-[#006252] to-[#00836f]",
  "高級會員": "from-[#b7950b] to-[#d4a017]",
  "理事": "from-[#7b2d8b] to-[#9b4dca]",
};

export default function BenefitsModal({ tier, onClose }) {
  const items = benefits[tier] || benefits["普通會員"];
  const tierName = tierNames[tier] || tier || "普通會員";
  const gradient = tierColors[tier] || tierColors["普通會員"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[640px] max-h-[85vh] overflow-y-auto rounded-[14px] border border-[#dde7e5] bg-white shadow-[0_20px_50px_rgba(35,70,74,0.25)]" onClick={e => e.stopPropagation()}>
        <div className={`bg-gradient-to-br ${gradient} px-6 py-8 rounded-t-[14px] text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] opacity-80">會員權益</p>
              <h2 className="text-[26px] font-bold mt-1">{tierName}</h2>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-[24px]">×</button>
          </div>
          <p className="mt-3 text-[14px] opacity-90">以下爲您當前等級可享受的權益</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-[10px] border border-[#eef3f1] bg-[#f9fbfa] hover:shadow-sm transition">
                <span className="text-[28px] shrink-0">{item.icon}</span>
                <div>
                  <h3 className="text-[15px] font-bold text-[#142528]">{item.title}</h3>
                  <p className="text-[13px] text-[#6a7679] mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-[10px] bg-[#f4f8f7] border border-[#dde7e5]">
            <p className="text-[13px] font-semibold text-[#27383a]">權益說明</p>
            <ul className="mt-2 text-[13px] text-[#6a7679] space-y-1 list-disc list-inside">
              <li>會員權益僅限本人使用，不得轉讓</li>
              <li>部分活動可能涉及額外費用，以具體活動說明爲準</li>
              <li>權益可能隨協會政策調整，請以最新公告爲準</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
