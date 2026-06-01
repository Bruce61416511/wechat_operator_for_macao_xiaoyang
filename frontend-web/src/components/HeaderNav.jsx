import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

const menuItems = [
  '首頁',
  '協會介紹',
  '入會指南',
  '活動日曆',
  '資源中心',
  '公告資訊',
  '幫助中心',
];

const languages = ['繁中', 'Português', 'EN'];

function LogoPlaceholder() {
  return (
    <a className="block" href="#" aria-label="澳門直播協會 · 小揚同學">
      <img
        className="h-[64px] w-auto select-none object-contain"
        src="/logo-nav.png"
        alt="澳門直播協會 · 小揚同學"
        draggable="false"
      />
    </a>
  );
}

function NavLink({ children, active = false, href = "#" }) {
  return (
    <a
      className={[
        'relative flex h-full items-center px-[18px] text-[13.5px] leading-none tracking-normal transition-colors',
        active
          ? 'font-semibold text-[#005d50]'
          : 'font-semibold text-[#555f68] hover:text-[#004f46]',
      ].join(' ')}
      href={href}
    >
      {children}
      {active ? (
        <span className="absolute bottom-[17px] left-1/2 h-[3px] w-[42px] -translate-x-1/2 rounded-full bg-macau-deep shadow-[0_1px_0_rgba(0,93,80,0.12)]" />
      ) : null}
    </a>
  );
}


function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  return (
    <div className="relative ml-4" ref={ref}>
      <button
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <div className="h-9 w-9 rounded-full bg-[url('/lotus-assistant.png')] bg-cover bg-center" />
        <span className="text-[13.5px] font-semibold text-[#555f68]">{user.username || "小揚同學"}</span>
        <svg className="h-3 w-3 text-[#8b9298]" fill="none" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[200px] rounded-[10px] border border-[#dde7e5] bg-white p-3 shadow-[0_14px_30px_rgba(35,70,74,0.16)] text-[#1b292b]">
          <a className="block rounded-[6px] px-3 py-2 text-[13px] font-semibold hover:bg-[#eef7f5] transition" href="/member">會員中心</a>
          <button className="mt-1 w-full rounded-[6px] px-3 py-2 text-left text-[13px] font-semibold text-[#c53030] hover:bg-[#fef0f0] transition" onClick={logout} type="button">登出</button>
        </div>
      )}
    </div>
  );
}
function LanguageSwitch() {
  return (
    <div className="ml-auto flex h-full items-center whitespace-nowrap text-[13.5px] font-semibold leading-none tracking-normal text-[#555f68]">
      {languages.map((language, index) => (
        <span className="flex items-center" key={language}>
          <button
            className={[
              'px-[9px] transition-colors hover:text-[#004f46]',
              language === '繁中' ? 'font-semibold text-[#005d50]' : '',
            ].join(' ')}
            type="button"
          >
            {language}
          </button>
          {index < languages.length - 1 ? <span className="text-[#8b9298]">/</span> : null}
        </span>
      ))}
    </div>
  );
}

export default function HeaderNav() {
  const currentPath = window.location.pathname;

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="h-[92px] rounded-b-[9px] border border-white/90 bg-white px-[32px] shadow-nav">
        <div className="mx-auto flex h-full max-w-[1535px] items-center">
          <div className="shrink-0">
            <LogoPlaceholder />
          </div>

          <nav className="ml-[68px] hidden h-full items-center xl:flex" aria-label="主導航">
            {menuItems.map((item, index) => {
              const itemHrefs = {
                '首頁': '/',
                '協會介紹': '/about',
                '入會指南': '/guide',
                '活動日曆': '/calendar',
                '公告資訊': '/announcements',
                '幫助中心': '/help',
                '資源中心': '/resources',
              };
              const itemPath = itemHrefs[item] || "#";
              const isActive = itemPath !== "#" && currentPath === itemPath;
              return (
                <NavLink active={isActive} key={item} href={itemPath}>
                  {item}
                </NavLink>
              );
            })}
          </nav>

          <div className="hidden h-full flex-1 items-center xl:flex">
            <LanguageSwitch />
            <UserMenu />
          </div>

          <button
            className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-macau-line bg-white/80 text-macau-deep shadow-sm xl:hidden"
            type="button"
            aria-label="打開菜單"
          >
            <span className="flex w-5 flex-col gap-1.5">
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
