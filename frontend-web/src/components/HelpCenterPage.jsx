import { useState } from "react";
import HeaderNav from "./HeaderNav.jsx";
import PageFooter from "./PageFooter.jsx";

function SectionTitle({ children }) {
  return (
    <h2 className="text-[22px] font-bold text-[#00473f] mb-6 flex items-center gap-3">
      <span className="h-1 w-8 rounded-full bg-[#006252]" />
      {children}
    </h2>
  );
}

function StepCard({ num, title, desc }) {
  return (
    <div className="flex gap-4 rounded-[12px] border border-[#dde7e5] bg-white p-5 shadow-[0_2px_12px_rgba(35,70,74,0.04)]">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e7f5f0] text-[15px] font-bold text-[#006252]">
        {num}
      </div>
      <div>
        <h4 className="text-[15px] font-bold text-[#1b292b] mb-1">{title}</h4>
        <p className="text-[14px] text-[#57696d] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[10px] border border-[#dde7e5] bg-[#f9fbfa] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-[15px] font-semibold text-[#1b292b] hover:bg-[#f0f5f3] transition-colors"
      >
        <span>{q}</span>
        <span className={`text-[#006252] text-[18px] transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-[14px] text-[#57696d] leading-relaxed border-t border-[#eef3f1] pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function HelpCenterPage() {
  const [activeTab, setActiveTab] = useState("guide");

  const tabs = [
    { key: "guide", label: "使用指南" },
    { key: "faq", label: "常見問題" },
    { key: "contact", label: "聯繫我們" },
    { key: "about", label: "平台介紹" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fbfb]">
      <HeaderNav />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#00473f] via-[#006252] to-[#00836f] px-8 py-16 text-center">
        <div className="absolute inset-0 bg-[url('/macau-page-bg.webp')] bg-cover bg-center opacity-15" />
        <div className="relative mx-auto max-w-[860px]">
          <p className="text-[14px] font-semibold tracking-[4px] text-[#8ed4c4] uppercase mb-4">Help Center</p>
          <h1 className="text-[44px] font-bold leading-tight text-white mb-5">幫助中心</h1>
          <p className="text-[17px] leading-relaxed text-[#c8e8df] max-w-[620px] mx-auto">
            無論您是首次來訪還是老會員，在這裡都能找到所需的幫助與指引。
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="mx-auto max-w-[860px] px-6 pt-10 pb-2">
        <div className="flex gap-2 border-b border-[#dde7e5]">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-[14px] font-semibold transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab.key
                  ? "border-[#006252] text-[#006252]"
                  : "border-transparent text-[#6a7679] hover:text-[#004f46]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Tab Content */}
      <section className="mx-auto max-w-[860px] px-6 py-8 pb-16">
        {/* 使用指南 */}
        {activeTab === "guide" && (
          <div className="space-y-8">
            <SectionTitle>使用指南</SectionTitle>
            <div className="space-y-4">
              <StepCard num={1} title="如何申請入會" desc="點擊首頁「申請入會」按鈕，或導航欄中的「入會指南」了解詳情。依次填寫基本資訊、從業經歷、資質文件，閱讀並同意聲明後提交即可。整個過程約需 5-10 分鐘。" />
              <StepCard num={2} title="如何查詢申請進度" desc="在首頁或導航欄點擊「進度查詢」，輸入您申請時使用的證件號碼（身份證或護照號碼），即可實時查看審核狀態。支持初審、終審、補件等各環節跟蹤。" />
              <StepCard num={3} title="如何報名參加活動" desc="點擊導航欄「活動日曆」查看當月所有活動安排，點擊有活動標記的日期查看詳情。也可前往「活動中心」瀏覽全部可報名活動，點擊「立即報名」完成登記。" />
              <StepCard num={4} title="忘記密碼怎麼辦" desc="在登錄頁面點擊「忘記密碼」，輸入您的用戶名和入會時登記的證件號碼，系統驗證通過後即可重置密碼。理事賬號暫不支持此方式重置，請聯繫管理員。" />
              <StepCard num={5} title="如何修改個人資料" desc="登錄後進入「會員中心」，點擊右上角頭像旁的用戶名，選擇「查看資料」或「更新資料」。您可修改聯繫方式、通訊地址、上傳新的資質文件等。" />
              <StepCard num={6} title="如何使用小揚 AI 助手" desc="在申請頁面右側，小揚 AI 助手可以幫您快速選擇領域、通過語音或文字輸入輔助填寫表格。AI 生成內容僅供參考，請以實際提交信息為準。" />
            </div>
          </div>
        )}

        {/* 常見問題 */}
        {activeTab === "faq" && (
          <div className="space-y-8">
            <SectionTitle>常見問題</SectionTitle>
            <div className="space-y-3">
              <FaqItem q="審核需要多長時間？" a="一般情況下，協會工作人員會在 5-7 個工作日內完成申請資料的審核。如遇申請高峰期，處理時間可能略有延長，請耐心等待。" />
              <FaqItem q="會費可以退款嗎？" a="會費一經繳納，原則上不予退款。特殊情況可向協會秘書處提出書面申請，由理事會審議決定。" />
              <FaqItem q="個人會員和機構會員有什麼區別？" a="個人會員以自然人身份加入，適合個人從業者；機構會員以企業或組織名義加入，適合公司、機構等團體。機構會員可指定最多三名聯繫人。" />
              <FaqItem q="審核不通過怎麼辦？" a="若初審或終審不通過，您可在 30 天後修改申請資料並重新提交。系統會在審核意見中說明不通過原因，請根據反饋完善資料。" />
              <FaqItem q="可以升級會員等級嗎？" a="可以。會員可在會籍有效期內申請升級，補繳差額即可。無需重新提交全部資料，協會工作人員會協助您完成升級流程。" />
              <FaqItem q="上傳文件支持什麼格式？" a="目前支持 JPG 和 PNG 格式的圖片文件，單個文件大小不超過 5MB。如需上傳 PDF 或其他格式，請聯繫協會秘書處。" />
              <FaqItem q="如何成為理事？" a="理事需由現有理事推薦，並經理事會表決通過。理事享有參與協會決策、專屬顧問服務等權益，同時需承擔相應的會費和義務。" />
              <FaqItem q="會員資格有效期是多久？" a="會員資格以年度計算，自繳費確認之日起有效期為一年。到期前協會將通過電郵和站內通知提醒續費。" />
            </div>
          </div>
        )}

        {/* 聯繫我們 */}
        {activeTab === "contact" && (
          <div className="space-y-8">
            <SectionTitle>聯繫我們</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { icon: "📍", label: "協會地址", value: "澳門宋玉生廣場 180 號\n東南亞商業中心 12 樓" },
                { icon: "📞", label: "聯絡電話", value: "(853) 2888-8888" },
                { icon: "📧", label: "電子郵箱", value: "info@macaolive.org.mo" },
                { icon: "🕐", label: "辦公時間", value: "週一至週五\n09:00 - 18:00" },
                { icon: "💬", label: "微信公眾號", value: "澳門直播協會" },
                { icon: "🌐", label: "官方網站", value: "www.macaolive.org.mo" },
              ].map(item => (
                <div key={item.label} className="rounded-[12px] border border-[#dde7e5] bg-white p-6 shadow-[0_2px_12px_rgba(35,70,74,0.04)]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[24px]">{item.icon}</span>
                    <h3 className="text-[15px] font-bold text-[#1b292b]">{item.label}</h3>
                  </div>
                  <p className="text-[14px] text-[#57696d] leading-relaxed whitespace-pre-line">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[12px] border border-[#d4e8e3] bg-[#f0faf4] p-6 mt-4">
              <p className="text-[14px] font-semibold text-[#005d50] mb-2">💡 溫馨提示</p>
              <p className="text-[13px] text-[#57696d] leading-relaxed">
                如需緊急協助，建議優先通過電話聯繫。電郵查詢通常會在 1-2 個工作日內回覆。您也可以關注微信公眾號獲取最新協會動態。
              </p>
            </div>
          </div>
        )}

        {/* 平台介紹 */}
        {activeTab === "about" && (
          <div className="space-y-8">
            <SectionTitle>平台介紹</SectionTitle>
            <div className="space-y-5">
              <div className="rounded-[12px] border border-[#dde7e5] bg-white p-6 shadow-[0_2px_12px_rgba(35,70,74,0.04)]">
                <h3 className="text-[16px] font-bold text-[#1b292b] mb-3 flex items-center gap-2">
                  <span className="text-[20px]">🤖</span> 小揚 AI 助手
                </h3>
                <p className="text-[14px] text-[#57696d] leading-relaxed">
                  小揚 AI 助手是協會為申請人提供的智能輔助工具，位於申請頁面右側。它可以幫助您快速選擇行業領域、通過語音或文字輸入輔助填寫申請表格、整理結構化內容。AI 生成的內容僅供參考，請在提交前仔細核對並以實際情況為準。
                </p>
              </div>

              <div className="rounded-[12px] border border-[#dde7e5] bg-white p-6 shadow-[0_2px_12px_rgba(35,70,74,0.04)]">
                <h3 className="text-[16px] font-bold text-[#1b292b] mb-3 flex items-center gap-2">
                  <span className="text-[20px]">💎</span> 會員權益一覽
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead>
                      <tr className="border-b border-[#dde7e5] text-left">
                        <th className="py-3 pr-4 font-semibold text-[#27383a]">權益項目</th>
                        <th className="py-3 px-4 font-semibold text-[#27383a] text-center">普通會員</th>
                        <th className="py-3 px-4 font-semibold text-[#27383a] text-center">高級會員</th>
                        <th className="py-3 pl-4 font-semibold text-[#27383a] text-center">理事</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#57696d]">
                      {[
                        ["協會活動報名", "✓", "✓", "✓"],
                        ["基礎培訓課程", "✓", "✓", "✓"],
                        ["行業資訊推送", "✓", "✓", "✓"],
                        ["電子會員證書", "✓", "✓", "✓"],
                        ["活動優先報名", "—", "✓", "✓"],
                        ["高級培訓課程", "—", "✓", "✓"],
                        ["商務資源對接", "—", "✓", "✓"],
                        ["協會決策參與", "—", "—", "✓"],
                        ["專屬一對一顧問", "—", "—", "✓"],
                        ["品牌推廣資源", "—", "—", "✓"],
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-[#eef3f1]">
                          <td className="py-3 pr-4 font-medium text-[#27383a]">{row[0]}</td>
                          {row.slice(1).map((cell, j) => (
                            <td key={j} className={`py-3 px-4 text-center ${cell === "✓" ? "text-[#006252] font-bold" : "text-[#bcc7c5]"}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#dde7e5] bg-white p-6 shadow-[0_2px_12px_rgba(35,70,74,0.04)]">
                <h3 className="text-[16px] font-bold text-[#1b292b] mb-3 flex items-center gap-2">
                  <span className="text-[20px]">📜</span> 協會章程
                </h3>
                <p className="text-[14px] text-[#57696d] leading-relaxed">
                  澳門直播協會章程是協會運作的基本規範文件，涵蓋協會宗旨、組織架構、會員權利義務、理事會職權、財務管理等內容。入會即視為同意並遵守協會章程。如需查閱完整章程，請聯繫協會秘書處獲取。
                </p>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-[14px] text-[#6a7679] mb-4">仍有疑問？</p>
              <a
                href="/apply"
                className="inline-block rounded-full bg-[#006252] px-8 py-3 text-[15px] font-bold text-white hover:bg-[#004d40] transition-colors"
              >
                立即申請入會
              </a>
            </div>
          </div>
        )}
      </section>

      <PageFooter />
    </div>
  );
}
