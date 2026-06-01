function HomeIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="m4 11 8-7 8 7v8a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg aria-hidden="true" className="h-[19px] w-[19px]" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.8 9.4a2.4 2.4 0 1 1 3.5 2.1c-.9.5-1.3 1-1.3 2.1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="12" cy="17" fill="currentColor" r="1" />
    </svg>
  );
}

function UserAvatar() {
  return (
    <span className="grid h-[44px] w-[44px] place-items-center rounded-full bg-white text-[#006252] shadow-[0_6px_14px_rgba(0,35,31,0.18)]">
      <svg aria-hidden="true" className="h-[28px] w-[28px]" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="8" fill="currentColor" r="4" />
        <path d="M4.8 21c1-4.4 3.5-6.6 7.2-6.6s6.2 2.2 7.2 6.6" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function ApplyTopBar({ progress = 0 }) {
  return (
    <header className="sticky top-0 z-50 h-[78px] w-full rounded-b-[10px] bg-[linear-gradient(110deg,#003d36_0%,#005548_45%,#00483f_100%)] px-[42px] text-white shadow-[0_12px_30px_rgba(0,45,40,0.24)]">
      <div className="mx-auto grid h-full max-w-[1450px] grid-cols-[360px_1fr_360px] items-center">
        <div className="flex items-center">
          <a className="flex h-[58px] items-center" href="/" aria-label="返回首頁">
            <img
              alt="小揚同學 澳門直播協會"
              className="h-[50px] w-auto select-none object-contain"
              draggable="false"
              src="/apply-top-logo.png"
            />
          </a>
          <span className="ml-[34px] h-[31px] w-px bg-white/65" />
          <nav className="ml-[28px] flex items-center gap-2 text-[15px] font-medium text-white/92" aria-label="當前位置">
            <HomeIcon />
            <span className="text-white/70">›</span>
            <span>申請入會</span>
          </nav>
        </div>

        <h1 className="text-center font-serifCn text-[31px] font-semibold leading-none tracking-[0.08em] text-white">
          申請入會 · 進度 {progress}%
        </h1>

        <div className="flex items-center justify-end gap-[24px] text-[15px] font-medium">
          <a className="flex items-center gap-2 text-white/92 transition hover:text-white" href="#">
            <HelpIcon />
            幫助中心
          </a>
          <span className="h-[31px] w-px bg-white/65" />
          <button className="flex items-center gap-3 text-white" type="button">
            <UserAvatar />
            <span className="text-[16px] font-semibold">陳先生</span>
            <span className="text-white/85">⌄</span>
          </button>
        </div>
      </div>
    </header>
  );
}
