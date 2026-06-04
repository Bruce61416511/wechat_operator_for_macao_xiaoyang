import React from "react";

const tiers = [
  {
    name: "個人會員",
    price: "MOP 500",
    gradient: "from-[#006252] to-[#00836f]",
    borderFocus: "border-[#006252] ring-[#006252]",
    benefits: [
      { title: "協會活動報名", desc: "參加各類協會主辦的交流活動", icon: "📋" },
      { title: "基礎培訓課程", desc: "免費參加基礎培訓課程", icon: "📚" },
      { title: "行業資訊推送", desc: "定期推送行業動態和政策信息", icon: "📡" },
      { title: "電子會員證書", desc: "獲得官方電子會員證書", icon: "🎲" },
    ],
  },
  {
    name: "企業會員",
    price: "MOP 2,000",
    gradient: "from-[#1a6090] to-[#2980b9]",
    borderFocus: "border-[#1a6090] ring-[#1a6090]",
    recommended: true,
    benefits: [
      { title: "個人會員全部權益", desc: "包含個人會員所有基礎權益", icon: "✅" },
      { title: "公司品牌展示", desc: "協會平台專屬品牌頁面曝光", icon: "🏢" },
      { title: "商業資源共享", desc: "對接行業資源與合作機會", icon: "🤝" },
      { title: "精選推薦曝光", desc: "首頁精選位優先展示", icon: "⭐" },
      { title: "多聯繫人管理", desc: "可指定最多三名企業聯繫人", icon: "👥" },
    ],
  },
  {
    name: "高級會員",
    price: "MOP 5,000",
    gradient: "from-[#b7950b] to-[#d4a017]",
    borderFocus: "border-[#b7950b] ring-[#b7950b]",
    benefits: [
      { title: "企業會員全部權益", desc: "包含企業會員所有權益", icon: "✅" },
      { title: "活動優先報名", desc: "活動名額優先保留", icon: "⭐" },
      { title: "高級專屬培訓", desc: "專屬高級培訓課程", icon: "🎗️" },
      { title: "商務資源對接", desc: "企業資源精準匹配", icon: "💼" },
      { title: "行業深度報告", desc: "定期行業報告與深度分析", icon: "📊" },
    ],
  },
];

export default function PublicBenefitsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[1060px] max-h-[90vh] overflow-y-auto rounded-[16px] border border-[#dde7e5] bg-white shadow-[0_24px_60px_rgba(35,70,74,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#eef3f1]">
          <div>
            <h2 className="text-[26px] font-bold text-[#142528]">會員權益一覽</h2>
            <p className="mt-1 text-[14px] text-[#8ba09c]">選擇最適合您的會員類型，開啟專業成長之旅</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-[22px] text-[#9ba8aa] hover:bg-[#f4f7f6] hover:text-[#142528] transition"
          >
            ×
          </button>
        </div>

        {/* Tier Cards */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-[14px] border-2 bg-white p-6 transition-shadow hover:shadow-[0_8px_28px_rgba(35,70,74,0.14)] ${
                tier.recommended
                  ? "border-[#1a6090] shadow-[0_4px_18px_rgba(26,96,144,0.15)]"
                  : "border-[#dde7e5]"
              }`}
            >
              {tier.recommended && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#1a6090] px-5 py-1 text-[11px] font-bold text-white tracking-wide whitespace-nowrap">
                  推薦
                </span>
              )}

              {/* Card Header */}
              <div className={`-mx-6 -mt-6 mb-5 rounded-t-[12px] bg-gradient-to-br ${tier.gradient} px-6 py-5 text-white`}>
                <p className="text-[12px] opacity-75">年費</p>
                <h3 className="text-[24px] font-bold mt-0.5">{tier.price}</h3>
                <p className="text-[11px] opacity-70 mt-0.5">澳門元 / 年</p>
              </div>

              {/* Tier Name */}
              <h4 className="text-[18px] font-bold text-[#142528] mb-4">{tier.name}</h4>

              {/* Benefits */}
              <ul className="space-y-3.5">
                {tier.benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[18px] shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-[#27383a]">{item.title}</p>
                      <p className="text-[12px] text-[#8ba09c] mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="px-8 pb-7">
          <div className="rounded-[10px] bg-[#f4f8f7] border border-[#dde7e5] px-6 py-4">
            <p className="text-[13px] font-semibold text-[#27383a] mb-2">💡 說明</p>
            <ul className="text-[12px] text-[#6a7679] space-y-1.5">
              <li>· 高級會員需以企業會員身份升級，不可直接申請</li>
              <li>· 會員權益僅限本人／本機構使用，不得轉讓</li>
              <li>· 部分活動可能涉及額外費用，以具體活動說明為準</li>
              <li>· 會費按年度計收，到期前協會將提醒續費</li>
            </ul>
          </div>
          <div className="mt-5 text-center">
            <a
              href="/apply"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00836f] to-[#006252] px-10 py-3.5 text-[15px] font-bold text-white shadow-[0_6px_20px_rgba(0,98,82,0.28)] transition-all hover:shadow-[0_8px_28px_rgba(0,98,82,0.35)] hover:-translate-y-0.5"
            >
              立即申請入會
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path d="M4 12h16M13 5l7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
