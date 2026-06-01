import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import PublicBenefitsModal from "./PublicBenefitsModal.jsx";
import ResetPasswordModal from "./ResetPasswordModal.jsx";
function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg aria-hidden="true" className="h-[38px] w-[38px]" fill="none" viewBox="0 0 48 48">
      <path d="M14 6h15l8 8v28H14z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.8" />
      <path d="M29 6v9h8M20 23h9M20 30h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" />
      <path d="m31 35 7.4-7.4 3.6 3.6-7.4 7.4-5.6 1.9z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.8" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg aria-hidden="true" className="h-[38px] w-[38px]" fill="none" viewBox="0 0 48 48">
      <path d="M13 13h22l8 10-19 20L5 23z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.8" />
      <path d="M5 23h38M13 13l11 30 11-30M18 13l-5 10M30 13l5 10" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-[38px] w-[38px]" fill="none" viewBox="0 0 48 48">
      <rect height="31" rx="4" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.8" width="34" x="7" y="11" />
      <path d="M15 7v8M33 7v8M7 20h34" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" />
      <path d="m24 27 2 4 4.4.7-3.2 3.1.8 4.4-4-2.1-4 2.1.8-4.4-3.2-3.1 4.4-.7z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  );
}

function SearchCircleIcon() {
  return (
    <svg aria-hidden="true" className="h-[38px] w-[38px]" fill="none" viewBox="0 0 48 48">
      <circle cx="21" cy="21" r="12" stroke="currentColor" strokeWidth="2.8" />
      <path d="m31 31 6 6" stroke="currentColor" strokeLinecap="round" strokeWidth="2.8" />
      <path d="M21 15v12M15 21h12" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg aria-hidden="true" className="h-[38px] w-[38px]" fill="none" viewBox="0 0 48 48">
      <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2.8" />
      <path d="M8 40c2.4-7.2 7.2-12 16-12s13.6 4.8 16 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg aria-hidden="true" className="h-[38px] w-[38px]" fill="none" viewBox="0 0 48 48">
      <circle cx="18" cy="22" r="9" stroke="currentColor" strokeWidth="2.8" />
      <path d="m25 29 9 9M36 27l-3 3M27.5 35.5l6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="h-[38px] w-[38px]" fill="none" viewBox="0 0 48 48">
      <path d="M36 32H12c2.9-3.1 4-6.1 4-13a8 8 0 0 1 16 0c0 6.9 1.1 9.9 4 13Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.8" />
      <path d="M20.5 37a3.7 3.7 0 0 0 7 0M24 7V4" stroke="currentColor" strokeLinecap="round" strokeWidth="2.8" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="h-[54px] w-[54px]" fill="none" viewBox="0 0 64 64">
      <path
        d="M32 6 53 15v14.5c0 13.8-7.8 23.6-21 29.2C18.8 53.1 11 43.3 11 29.5V15z"
        fill="url(#shieldGradient)"
        stroke="#0b6d61"
        strokeWidth="2.2"
      />
      <path
        d="m21.5 31.8 7.2 7.3 15-16.2"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5.2"
      />
      <defs>
        <linearGradient id="shieldGradient" x1="16" x2="48" y1="8" y2="54">
          <stop stopColor="#eefcf8" />
          <stop offset="0.42" stopColor="#7bc7bb" />
          <stop offset="1" stopColor="#0c776a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ActionButton({ action }) {
  const actionClick = action.onClick;
  const Icon = action.icon;
  const isPrimary = action.tone === 'primary';
  const Element = isPrimary || action.href ? 'a' : 'button';

  return (
    <Element
      onClick={actionClick}
      className={[
        'group flex h-[112px] w-[130px] flex-col items-center justify-center rounded-[12px] border transition',
        isPrimary
          ? 'border-[#006d60] bg-gradient-to-br from-[#00836f] to-[#006354] text-white shadow-[0_14px_24px_rgba(0,93,80,0.24)]'
          : 'border-[#d7e5e2] bg-white text-[#006354] shadow-[0_7px_16px_rgba(21,65,68,0.12)] hover:border-[#94c9c0]',
      ].join(' ')}
      href={action.href || (isPrimary ? '/apply' : undefined)}
      type={isPrimary ? undefined : 'button'}
    >
      <Icon />
      <span className="mt-3 flex items-center gap-1 text-[16px] font-semibold leading-none tracking-normal">
        {action.label}
        <ChevronRightIcon />
      </span>
    </Element>
  );
}

function TrustCard() {
  return (
    <aside className="absolute right-[-202px] top-[103px] hidden h-[181px] w-[222px] rounded-[14px] border border-white/80 bg-white/90 px-5 py-[27px] text-[#004f46] shadow-[0_12px_26px_rgba(55,89,92,0.18)] backdrop-blur-xl 2xl:block">
      <div className="flex items-center justify-center gap-3">
        <ShieldIcon />
        <div className="text-[16px] font-semibold leading-none">依據已啓用:</div>
      </div>
      <div className="mt-[18px] space-y-4 text-center text-[15px] leading-none">
        <p className="whitespace-nowrap">
          <span className="font-semibold">章程</span>
          <span className="ml-2 text-[#5b6b6c]">v2026.05</span>
        </p>
        <p className="whitespace-nowrap">
          <span className="font-semibold">會費表</span>
          <span className="ml-2 text-[#5b6b6c]">v2026.03</span>
        </p>
      </div>
    </aside>
  );
}

export default function HeroSection() {
  const [showBenefits, setShowBenefits] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { user } = useAuth();

  const quickActions = [
    { label: '會員登錄', icon: UserIcon, href: user ? '/member' : '/login' },
    { label: '申請入會', tone: 'primary', icon: DocumentIcon },
    { label: '進度查詢', icon: SearchCircleIcon, href: '/track' },
    { label: '會員權益', icon: DiamondIcon },
    { label: '活動報名', icon: CalendarIcon, href: '/events' },
    { label: '重置密碼', icon: KeyIcon },
  ];

  return (
    <div className="mx-auto mt-[43px] max-w-[1196px]">
      <section className="relative h-auto w-full rounded-[18px] border border-[#8fc6bf]/75 bg-[linear-gradient(148deg,rgba(255,255,255,0.86)_0%,rgba(241,250,248,0.78)_45%,rgba(221,242,239,0.72)_100%)] px-[22px] py-[22px] text-[#004f46] shadow-[0_10px_28px_rgba(53,96,101,0.08)] backdrop-blur-md xl:h-[368px] xl:px-[24px] xl:py-0">
        <div className="absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_14%_44%,rgba(255,255,255,0.95)_0,rgba(255,255,255,0.7)_24%,rgba(255,255,255,0)_47%)]" />
        <div className="relative flex h-full flex-col items-center xl:flex-row">
          <div className="flex h-[300px] w-full shrink-0 items-center justify-center xl:h-full xl:w-[250px]">
            <img
              alt="AI 助手蓮花燈"
              className="h-[295px] w-auto select-none object-contain xl:h-[342px]"
              draggable="false"
              src="/lotus-assistant.png"
            />
          </div>

          <div className="w-full pb-2 text-center xl:ml-[26px] xl:pb-0 xl:text-left">
            <p className="font-serifCn text-[34px] leading-[1.08] tracking-normal xl:text-[32px]"><span className="font-bold">小揚同學</span> - 澳門直播協會</p>
            <p className="mt-3 font-serifCn text-[34px] leading-[1.08] tracking-normal xl:text-[32px]">時刻在線，爲您效勞</p>
            <p className="mt-7 text-[20px] font-semibold leading-none tracking-normal text-[#005d50] xl:text-[20px]">
              入會指導 ｜ 申請協助 ｜ 進度查詢 ｜ 活動報名
            </p>

            <div className="mt-[26px] grid grid-cols-2 justify-items-center gap-4 sm:flex xl:gap-[14px]">
              {quickActions.map((action) => {
                if (action.label === "會員權益") {
                  return <ActionButton action={{...action, onClick: () => setShowBenefits(true)}} key={action.label} />;
                }
                if (action.label === "重置密碼") {
                  return <ActionButton action={{...action, onClick: () => setShowResetPassword(true)}} key={action.label} />;
                }
                return <ActionButton action={action} key={action.label} />;
              })}
            </div>
          </div>
        </div>

      </section>
      {showBenefits && <PublicBenefitsModal onClose={() => setShowBenefits(false)} />}
      {showResetPassword && <ResetPasswordModal onClose={() => setShowResetPassword(false)} />}
    </div>
  );
}
