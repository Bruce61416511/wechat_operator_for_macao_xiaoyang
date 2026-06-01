import HeaderNav from "./HeaderNav.jsx";
import PageFooter from "./PageFooter.jsx";

function SectionTitle({ children }) {
  return (
    <h2 className="text-[22px] font-bold text-[#00473f] mb-5 flex items-center gap-3">
      <span className="h-1 w-8 rounded-full bg-[#006252]" />
      {children}
    </h2>
  );
}

function InfoCard({ icon, title, children }) {
  return (
    <div className="rounded-[12px] border border-[#d4e8e3] bg-white p-6 shadow-[0_4px_16px_rgba(35,70,74,0.06)] transition-shadow hover:shadow-[0_8px_24px_rgba(35,70,74,0.12)]">
      <div className="flex items-center gap-4 mb-3">
        <span className="text-[28px]">{icon}</span>
        <h3 className="text-[17px] font-bold text-[#1b292b]">{title}</h3>
      </div>
      <p className="text-[14px] leading-relaxed text-[#57696d]">{children}</p>
    </div>
  );
}

function TimelineItem({ year, title, desc }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center shrink-0">
        <div className="h-3 w-3 rounded-full bg-[#006252]" />
        <div className="w-0.5 flex-1 bg-[#d4e8e3]" />
      </div>
      <div className="pb-8">
        <span className="text-[12px] font-semibold text-[#006252] tracking-wider">{year}</span>
        <h4 className="text-[16px] font-bold text-[#1b292b] mt-1">{title}</h4>
        <p className="text-[14px] text-[#57696d] mt-1.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function AssociationIntroPage() {
  return (
    <div className="min-h-screen bg-[#f8fbfb]">
      <HeaderNav />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#00473f] via-[#006252] to-[#00836f] px-8 py-20 text-center">
        <div className="absolute inset-0 bg-[url('/macau-page-bg.webp')] bg-cover bg-center opacity-15" />
        <div className="relative mx-auto max-w-[860px]">
          <p className="text-[14px] font-semibold tracking-[4px] text-[#8ed4c4] uppercase mb-4">
            Associação de Live Streaming de Macau
          </p>
          <h1 className="text-[44px] font-bold leading-tight text-white mb-5">
            澳門直播協會
          </h1>
          <p className="text-[17px] leading-relaxed text-[#c8e8df] max-w-[620px] mx-auto">
            致力於推動澳門直播及數字經濟發展，凝聚行業力量，培育專業人才，搭建交流合作平台，助力澳門經濟適度多元化。
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-[1100px] px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard icon="🎯" title="協會使命">
            團結澳門直播及新媒體從業者，建立行業標準，推動直播經濟健康有序發展，為會員創造價值，為社會貢獻力量。
          </InfoCard>
          <InfoCard icon="🔭" title="發展願景">
            成為粵港澳大灣區最具影響力的直播行業組織，讓澳門成為直播電商及數字內容創作的重要樞紐。
          </InfoCard>
          <InfoCard icon="🤝" title="核心價值">
            專業、創新、共享、共贏。我們相信通過合作與分享，每一位會員都能在數字經濟浪潮中找到自己的位置。
          </InfoCard>
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1100px] px-6">
          <SectionTitle>協會服務</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "📡", title: "直播培訓", desc: "定期舉辦直播技巧、內容創作、短視頻製作等專業培訓課程，涵蓋從入門到進階的全階段學習。" },
              { icon: "🛒", title: "電商對接", desc: "為會員鏈接優質供應鏈資源，提供選品、物流、平台入駐等一站式電商服務支持。" },
              { icon: "🎤", title: "行業交流", desc: "組織行業論壇、企業參訪、經驗分享會等活動，促進會員之間的深度交流與商業合作。" },
              { icon: "📋", title: "政策倡導", desc: "代表行業與政府溝通，反映會員訴求，參與行業政策制定，維護會員合法權益。" },
              { icon: "🌐", title: "跨境合作", desc: "推動與內地及海外直播機構的合作，拓展澳門直播產業的國際視野與市場空間。" },
              { icon: "🏅", title: "認證評級", desc: "建立會員資質認證體系，提升行業專業水平，為優秀會員提供官方背書與品牌增值。" },
              { icon: "📊", title: "數據研究", desc: "發布澳門直播行業趨勢報告，為會員提供市場洞察，助力業務決策。" },
              { icon: "🎓", title: "人才孵化", desc: "與高校合作設立直播人才培養計劃，為行業輸送新生力量，打造可持續發展生態。" },
            ].map((item) => (
              <InfoCard key={item.title} icon={item.icon} title={item.title}>
                {item.desc}
              </InfoCard>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="mx-auto max-w-[1100px] px-6 py-16">
        <SectionTitle>發展歷程</SectionTitle>
        <div className="ml-3">
          <TimelineItem year="2023" title="協會正式成立" desc="澳門直播協會在澳門特區政府註冊成立，首批會員逾百人，涵蓋直播主、電商運營、內容創作者等多元領域。" />
          <TimelineItem year="2024" title="舉辦首屆澳門直播節" desc="聯合多家機構成功舉辦首屆澳門直播節，吸引超過五十家品牌參與，線上觀看人次突破百萬。" />
          <TimelineItem year="2025" title="啟動人才培育計劃" desc="與澳門多所高校簽署合作備忘錄，推出直播人才孵化計劃，首期培訓學員超過二百人。" />
          <TimelineItem year="2026" title="拓展大灣區合作" desc="與廣州、深圳、珠海等地行業協會建立戰略合作關係，推動跨境直播電商生態建設，會員規模突破五百人。" />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#006252] to-[#00836f] py-14 text-center">
        <div className="mx-auto max-w-[600px] px-6">
          <h2 className="text-[26px] font-bold text-white mb-4">加入我們，共創未來</h2>
          <p className="text-[15px] text-[#c8e8df] mb-7 leading-relaxed">
            無論您是直播從業者、內容創作者，還是對數字經濟感興趣的企業，澳門直播協會歡迎您的加入。
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
