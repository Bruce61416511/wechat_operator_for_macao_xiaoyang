
import { useState } from "react";

function ChatIcon({ className = 'h-6 w-6' }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 17.5c-1.4-1.2-2.2-2.8-2.2-4.6C2.8 8.5 6.9 5 12 5s9.2 3.5 9.2 7.9S17.1 20.8 12 20.8c-1.2 0-2.4-.2-3.5-.6L4.2 21z" fill="currentColor" />
      <path d="M8 13h.1M12 13h.1M16 13h.1" stroke="#fff" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
  );
}


function CalendarSmallIcon({ className = 'h-6 w-6' }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="16" rx="2.4" stroke="currentColor" strokeWidth="2" width="17" x="3.5" y="5" />
      <path d="M8 3.5v4M16 3.5v4M3.5 10h17" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="m12 13 1 2 2.2.3-1.6 1.6.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.6 2.2-.3z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function BellSmallIcon({ className = 'h-6 w-6' }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M18.5 16H5.5c1.5-1.6 2-3.1 2-6.5a4.5 4.5 0 0 1 9 0c0 3.4.5 4.9 2 6.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M10 19a2.1 2.1 0 0 0 4 0M12 5V3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function UserIcon({ className = 'h-6 w-6' }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M5.5 20c.8-3.5 3-5.3 6.5-5.3s5.7 1.8 6.5 5.3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function BuildingIcon({ className = 'h-6 w-6' }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 21V8l8-4v17M13 10h6v11M8.5 11h1M8.5 15h1M8.5 19h1M16 14h1M16 18h1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="m5 12.8 13-7.2-5.8 13.2-2.3-5.4z" fill="currentColor" />
      <path d="m9.9 13.4 8.1-7.8" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <rect fill="currentColor" height="10" rx="2" width="14" x="5" y="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <circle cx="12" cy="15" fill="#fff" r="1.4" />
    </svg>
  );
}

function SidebarItem({ item }) {
  const Icon = item.icon;
  return (
    <button
      className={[
        'flex h-[52px] w-full items-center gap-3 rounded-[9px] px-[18px] text-left text-[16px] font-semibold transition',
        item.active ? 'bg-[#e6f2ef] text-[#005d50]' : 'text-[#5d696d] hover:bg-[#f2f7f6] hover:text-[#005d50]',
      ].join(' ')}
      type="button"
    >
      <Icon className="h-6 w-6 shrink-0 text-[#006b5f]" />
      {item.label}
    </button>
  );
}

function AvatarBadge({ large = false }) {
  return (
    <div
      className={[
        'grid shrink-0 place-items-center overflow-hidden rounded-full border border-[#b6d8d2] bg-white shadow-[0_5px_14px_rgba(0,93,80,0.18)]',
        large ? 'h-[61px] w-[61px]' : 'h-[58px] w-[58px]',
      ].join(' ')}
    >
      <img alt="" className="h-[96%] w-[96%] object-cover" src="/lotus-assistant.png" />
    </div>
  );
}

export default function AssistantPanel() {
  const [input, setInput] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!input.trim()) return;
    setSent(true);
    setInput("");
    setTimeout(() => setSent(false), 2000);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <section className="mx-auto mt-[12px] flex max-w-[1196px] overflow-hidden rounded-[10px] border border-white/70 bg-white/72 text-[#064f47] shadow-[0_18px_38px_rgba(38,74,78,0.18)] backdrop-blur-xl">
      <aside className="hidden w-[244px] shrink-0 border-r border-white/55 bg-white/58 px-[20px] py-[25px] backdrop-blur-xl md:block">
        {/* 頭像 + 在線狀態 */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <AvatarBadge large />
            <span className="absolute bottom-1 right-1 h-[14px] w-[14px] rounded-full border-2 border-white bg-[#2ecc71] shadow-[0_2px_6px_rgba(46,204,113,0.4)]" />
          </div>
          <h2 className="mt-4 text-[22px] font-bold leading-none tracking-normal text-[#004f46]">小揚同學</h2>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#2ecc71]" />
            <span className="text-[13px] font-medium text-[#4a9e8e]">在線</span>
          </div>
        </div>

        {/* 簡介 */}
        <p className="mt-4 text-center text-[15px] leading-relaxed whitespace-nowrap text-[#6c777b]">
          你的專屬 AI 助理
        </p>

        {/* 分割線 */}
        <div className="mx-auto mt-5 h-px w-[60px] rounded-full bg-gradient-to-r from-transparent via-[#b6d8d2] to-transparent" />


      </aside>

      <div className="min-h-[438px] flex-1 bg-white/28 px-[44px] py-[29px] backdrop-blur-xl">


        <div className="mt-[22px] flex items-start gap-[22px]">
          <AvatarBadge />
          <div className="relative rounded-[9px] border border-[#d9e2e1] bg-white px-[29px] py-[22px] shadow-[0_4px_10px_rgba(18,45,46,0.08)]">
            <span className="absolute left-[-9px] top-[18px] h-4 w-4 rotate-45 border-b border-l border-[#d9e2e1] bg-white" />
            <p className="relative text-[18px] font-medium leading-none text-[#1d2f31]">你好！我是小揚同學，澳門直播協會的 AI 助理。我可以協助你了解入會流程、會員權益，或者解答任何關於協會的問題。請問有什麼可以幫到你？</p>
            <p className="relative mt-5 text-[13px] font-medium leading-none text-[#9aa3a6]">10:24</p>
          </div>
        </div>



        <div className="mx-auto mt-[29px] flex h-[88px] max-w-[862px] items-center rounded-[14px] border border-[#d9e2e1] bg-white px-[33px] shadow-[0_4px_12px_rgba(32,61,65,0.08)]">
          <input
            className="flex-1 text-[16px] font-medium text-[#1b292b] placeholder:text-[#9aa3a6] bg-transparent outline-none"
            placeholder="請輸入你的問題..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSend} className="grid h-[47px] w-[47px] place-items-center rounded-full bg-gradient-to-br from-[#118370] to-[#006252] text-white shadow-[0_7px_14px_rgba(0,93,80,0.22)] hover:shadow-[0_9px_18px_rgba(0,93,80,0.3)] transition-shadow" type="button" aria-label="發送">
            <SendIcon />
          </button>
        </div>

        {sent && (
          <p className="mt-3 text-center text-[14px] font-medium text-[#006252]">✓ 已發送，小揚同學正在回覆中...</p>
        )}
        <p className="mt-[13px] flex items-center justify-center gap-2 text-[12px] font-medium text-[#7c898b]">
          <LockIcon />
          內容由 AI 生成，僅供參考，請以協會官方信息爲準。
        </p>
      </div>
    </section>
  );
}
