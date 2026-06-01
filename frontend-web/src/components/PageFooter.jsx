const footerLinks = ['協會介紹', '入會指南', '會員權益', '活動日曆', '資源中心', '幫助中心'];
const policyLinks = ['隱私政策', '服務條款', '聯繫我們'];

export default function PageFooter({ maxWidthClass = 'max-w-[1196px]' }) {
  return (
    <footer className={`mx-auto mt-6 ${maxWidthClass} overflow-hidden rounded-[10px] border border-white/70 bg-white/64 text-[#064f47] shadow-[0_12px_28px_rgba(38,74,78,0.12)] backdrop-blur-xl`}>
      <div className="grid gap-6 px-7 py-7 md:grid-cols-[1.2fr_1.1fr_0.9fr] md:px-9">
        <div>
          <img
            alt="澳門直播協會 · 小揚同學"
            className="h-[48px] w-auto select-none object-contain"
            draggable="false"
            src="/logo-nav.png"
          />
          <p className="mt-4 max-w-[360px] text-[14px] font-medium leading-7 text-[#52676a]">
            爲澳門直播行業從業者、機構與合作伙伴提供入會諮詢、活動報名、資源指引與會員服務支持。
          </p>
        </div>

        <div>
          <h2 className="text-[16px] font-bold leading-none text-[#005d50]">快捷入口</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-7 gap-y-3">
            {footerLinks.map((link) => (
              <a className="text-[14px] font-semibold text-[#536469] transition hover:text-[#005d50]" href="#" key={link}>
                {link}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[16px] font-bold leading-none text-[#005d50]">服務支持</h2>
          <p className="mt-4 text-[14px] font-medium leading-7 text-[#52676a]">
            工作日 09:30 - 18:30
            <br />
            Macau Live Streaming Association
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {policyLinks.map((link) => (
              <a className="text-[13px] font-semibold text-[#536469] transition hover:text-[#005d50]" href="#" key={link}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/65 bg-white/34 px-7 py-4 text-center text-[12px] font-medium text-[#6f7f82] md:px-9">
        © 2026 澳門直播協會 · 小揚同學。內容由 AI 輔助生成，具體信息請以協會官方發佈爲準。
      </div>
    </footer>
  );
}
