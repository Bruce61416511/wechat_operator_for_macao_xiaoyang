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

function TierCard({ name, price, gradient, benefits, recommended }) {
  return (
    <div className={`relative rounded-[14px] border bg-white p-7 shadow-[0_4px_16px_rgba(35,70,74,0.06)] transition-shadow hover:shadow-[0_8px_24px_rgba(35,70,74,0.12)] ${recommended ? "border-[#006252] ring-1 ring-[#006252]" : "border-[#dde7e5]"}`}>
      {recommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#006252] px-4 py-1 text-[11px] font-bold text-white tracking-wide">
          推薦
        </span>
      )}
      <div className={`-mx-7 -mt-7 mb-5 rounded-t-[14px] bg-gradient-to-br ${gradient} px-7 py-5 text-white`}>
        <h3 className="text-[20px] font-bold">{name}</h3>
        <p className="mt-2 text-[28px] font-bold">{price}<span className="text-[14px] font-normal opacity-80"> / 年</span></p>
      </div>
      <ul className="space-y-3">
        {benefits.map((b, i) => (
          <li key={i} className="flex items-start gap-3 text-[14px] text-[#57696d]">
            <span className="mt-0.5 shrink-0 text-[#006252] font-bold">✓</span>
            <span><strong className="text-[#27383a]">{b.title}</strong> — {b.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepItem({ num, title, desc }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center shrink-0">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-[#006252] text-[15px] font-bold text-white shadow-[0_3px_10px_rgba(0,98,82,0.25)]">
          {num}
        </div>
        {num < 5 && <div className="w-0.5 flex-1 bg-[#d4e8e3]" />}
      </div>
      <div className="pb-8">
        <h4 className="text-[17px] font-bold text-[#1b292b]">{title}</h4>
        <p className="text-[14px] text-[#57696d] mt-1.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function MembershipGuidePage() {
  return (
    <div className="min-h-screen bg-[#f8fbfb]">
      <HeaderNav />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#00473f] via-[#006252] to-[#00836f] px-8 py-20 text-center">
        <div className="absolute inset-0 bg-[url('/macau-page-bg.webp')] bg-cover bg-center opacity-15" />
        <div className="relative mx-auto max-w-[860px]">
          <p className="text-[14px] font-semibold tracking-[4px] text-[#8ed4c4] uppercase mb-4">
            Membership Guide
          </p>
          <h1 className="text-[44px] font-bold leading-tight text-white mb-5">
            入會指南
          </h1>
          <p className="text-[17px] leading-relaxed text-[#c8e8df] max-w-[620px] mx-auto">
            了解會員等級、權益與申請流程，選擇最適合您的會員類型，加入澳門直播協會，開啟專業成長之旅。
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="mx-auto max-w-[1100px] px-6 py-16">
        <SectionTitle>會員等級</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TierCard
            name="普通會員"
            price="MOP 500"
            gradient="from-[#006252] to-[#00836f]"
            benefits={[
              { title: "協會活動報名", desc: "參加各類協會主辦的交流活動" },
              { title: "基礎培訓課程", desc: "免費參加基礎培訓課程" },
              { title: "行業資訊推送", desc: "定期推送行業動態和政策信息" },
              { title: "電子會員證書", desc: "獲得官方電子會員證書" },
            ]}
          />
          <TierCard
            name="高級會員"
            price="MOP 1,000"
            gradient="from-[#b7950b] to-[#d4a017]"
            recommended
            benefits={[
              { title: "活動優先報名", desc: "活動名額優先保留" },
              { title: "高級培訓課程", desc: "專屬高級培訓課程" },
              { title: "商務資源對接", desc: "企業資源精準匹配" },
              { title: "行業研究報告", desc: "定期行業報告與深度分析" },
            ]}
          />
          <TierCard
            name="理事"
            price="MOP 3,000"
            gradient="from-[#7b2d8b] to-[#9b4dca]"
            benefits={[
              { title: "協會決策參與", desc: "參與協會重大事項表決" },
              { title: "專屬一對一顧問", desc: "專屬服務顧問全程跟進" },
              { title: "品牌推廣資源", desc: "協會平台品牌曝光資源" },
              { title: "全部活動優先", desc: "所有活動無條件優先參與" },
            ]}
          />
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[800px] px-6">
          <SectionTitle>申請流程</SectionTitle>
          <div className="ml-2">
            <StepItem num={1} title="填寫申請表" desc="在線填寫個人或機構基本資訊，包括姓名、聯絡方式、從業經歷及專業資質等內容。" />
            <StepItem num={2} title="上傳資質文件" desc="上傳相關證書、培訓證明或營業執照等資質材料，支援 JPG 和 PNG 格式。" />
            <StepItem num={3} title="協會審核" desc="協會工作人員將對您的申請材料進行形式審查與內容核實，通常需 5-7 個工作日。" />
            <StepItem num={4} title="繳納會費" desc="審核通過後，您將收到繳費通知。請在指定期限內完成會費繳納以激活會籍。" />
            <StepItem num={5} title="正式入會" desc="繳費確認後，您將收到電子會員證書，正式成為澳門直播協會會員，開始享受各項權益。" />
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="mx-auto max-w-[1100px] px-6 py-16">
        <SectionTitle>申請條件</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { title: "基本條件", desc: "年滿十八歲，具有完全民事行為能力，認同並願意遵守協會章程。" },
            { title: "從業要求", desc: "從事或有意從事直播、短視頻、電商及相關新媒體行業的個人或機構。" },
            { title: "推薦制度", desc: "申請高級會員或理事需由現有會員或理事推薦，確保社群質量。" },
            { title: "資料真實", desc: "所提交的申請資料須真實有效，如有虛假，協會有權取消會員資格。" },
          ].map((item) => (
            <div key={item.title} className="rounded-[12px] border border-[#d4e8e3] bg-white p-6 shadow-[0_4px_16px_rgba(35,70,74,0.06)]">
              <h3 className="text-[16px] font-bold text-[#1b292b] mb-2">{item.title}</h3>
              <p className="text-[14px] text-[#57696d] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[800px] px-6">
          <SectionTitle>常見問題</SectionTitle>
          <div className="space-y-4">
            {[
              { q: "會費可以退款嗎？", a: "會費一經繳納，原則上不予退款。特殊情況可向協會秘書處提出書面申請，由理事會審議決定。" },
              { q: "會員資格有效期是多久？", a: "會員資格以年度計算，自繳費確認之日起有效期為一年。到期前協會將提醒續費。" },
              { q: "可以升級會員等級嗎？", a: "可以。會員可在會籍有效期內申請升級，補繳差額即可，無需重新提交全部資料。" },
              { q: "機構會員和個人會員有什麼區別？", a: "個人會員以自然人身份加入，機構會員以企業或組織名義加入。機構會員可指定最多三名聯繫人。" },
              { q: "審核不通過可以重新申請嗎？", a: "可以。審核不通過後，您可在 30 天後修改資料重新提交申請。" },
            ].map((faq, i) => (
              <details key={i} className="group rounded-[10px] border border-[#dde7e5] bg-[#f9fbfa]">
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-[15px] font-semibold text-[#1b292b] select-none">
                  {faq.q}
                  <span className="text-[#006252] text-[18px] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-6 pb-4 text-[14px] text-[#57696d] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#006252] to-[#00836f] py-14 text-center">
        <div className="mx-auto max-w-[600px] px-6">
          <h2 className="text-[26px] font-bold text-white mb-4">準備好加入了嗎？</h2>
          <p className="text-[15px] text-[#c8e8df] mb-7 leading-relaxed">
            選擇適合您的會員等級，立即開始在線申請，整個過程只需幾分鐘。
          </p>
          <a
            href="/apply"
            className="inline-block rounded-full bg-white px-10 py-3.5 text-[15px] font-bold text-[#006252] shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all hover:shadow-[0_8px_28px_rgba(0,0,0,0.25)] hover:-translate-y-0.5"
          >
            立即申請入會
          </a>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
