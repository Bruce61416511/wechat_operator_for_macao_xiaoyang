import React from "react";

const normalBenefits = [
  { title: "協會活動報名", desc: "參加各類協會主辦的交流活動", icon: "📅" },
  { title: "基礎培訓課程", desc: "免費參加基礎培訓課程", icon: "📚" },
  { title: "行業資訊", desc: "定期推送行業動態和政策信息", icon: "📨" },
  { title: "會員證書", desc: "獲得電子會員證書", icon: "🏅" },
];

const premiumBenefits = [
  { title: "優先報名", desc: "活動名額優先保留", icon: "⭐" },
  { title: "高級培訓", desc: "專屬高級培訓課程", icon: "🎓" },
  { title: "商務對接", desc: "企業資源精準匹配", icon: "🤝" },
  { title: "全部活動", desc: "參加所有協會活動", icon: "📅" },
  { title: "全部培訓", desc: "基礎與進階培訓全包含", icon: "📚" },
  { title: "行業分析", desc: "定期行業報告與深度分析", icon: "📨" },
];

export default function PublicBenefitsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[860px] max-h-[85vh] overflow-y-auto rounded-[14px] border border-[#dde7e5] bg-white shadow-[0_20px_50px_rgba(35,70,74,0.25)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#eef3f1]">
          <h2 className="text-[22px] font-bold text-[#142528]">會員權益</h2>
          <button onClick={onClose} className="text-[24px] text-[#9ba8aa] hover:text-[#142528]">×</button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Normal Tier */}
          <div>
            <div className="bg-gradient-to-br from-[#006252] to-[#00836f] rounded-[10px] px-5 py-4 text-white mb-4">
              <p className="text-[12px] opacity-75">年費 500 澳門元</p>
              <h3 className="text-[20px] font-bold">普通會員</h3>
            </div>
            <div className="space-y-3">
              {normalBenefits.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-[8px] border border-[#eef3f1] bg-[#f9fbfa]">
                  <span className="text-[22px] shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#142528]">{item.title}</h4>
                    <p className="text-[12px] text-[#6a7679] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Tier */}
          <div>
            <div className="bg-gradient-to-br from-[#b7950b] to-[#d4a017] rounded-[10px] px-5 py-4 text-white mb-4">
              <p className="text-[12px] opacity-75">年費 1000 澳門元</p>
              <h3 className="text-[20px] font-bold">高級會員</h3>
            </div>
            <div className="space-y-3">
              {premiumBenefits.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-[8px] border border-[#eef3f1] bg-[#f9fbfa]">
                  <span className="text-[22px] shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#142528]">{item.title}</h4>
                    <p className="text-[12px] text-[#6a7679] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <p className="text-[12px] text-[#9ba8aa] text-center">理事會員爲協會核心成員，享有全部權益 + 協會決策參與權，詳情請諮詢協會祕書處。</p>
        </div>
      </div>
    </div>
  );
}
