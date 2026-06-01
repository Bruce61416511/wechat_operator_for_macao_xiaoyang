import { useState } from "react";

const chips = ["文化教育", "科技與互聯網", "專業服務", "商貿及零售", "其他領域"];

function SparkleIcon() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 32 32">
      <path d="M15 3.5 17.5 11 25 13.5 17.5 16 15 23.5 12.5 16 5 13.5 12.5 11z" fill="currentColor" />
      <path d="m25 3 1.3 3.7L30 8l-3.7 1.3L25 13l-1.3-3.7L20 8l3.7-1.3zM7 22l1.1 3.1L11 26l-2.9.9L7 30l-1.1-3.1L3 26l2.9-.9z" fill="currentColor" opacity=".85" />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M4 9.5h4l5-4v13l-5-4H4z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M16 9a5 5 0 0 1 0 6M19 6.5a9 9 0 0 1 0 11" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function LotusAvatar() {
  return (
    <div className="grid h-[58px] w-[58px] shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#087765] to-[#005345] shadow-[0_8px_14px_rgba(0,79,70,0.22)]">
      <img alt="" className="h-[48px] w-[48px] rounded-full object-cover" src="/lotus-assistant.png" />
    </div>
  );
}

export default function AIAssistantCard() {
  const [activeChip, setActiveChip] = useState(null);

  return (
    <div className="flex h-full flex-col rounded-[14px] border border-[#c8dfdb] bg-white/78 px-[18px] py-[18px] shadow-[0_12px_26px_rgba(35,70,74,0.1)] backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <LotusAvatar />
        <div>
          <p className="text-[20px] font-bold text-[#005d50]">小揚助手</p>
          <p className="mt-1 text-[13px] font-medium text-[#68777a]">AI 輔助填寫，隨時問我</p>
        </div>
      </div>

      <div className="mt-7">
        <div className="flex items-center gap-3 rounded-[9px] bg-[#f0faf4] px-5 py-4">
          <span className="text-[#009978]"><SparkleIcon /></span>
          <p className="text-[15px] font-bold leading-snug text-[#1b292b]">
            歡迎來到申請頁面！<br />請按左側步驟完成資訊填寫。
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[13px] font-semibold text-[#6a7679]">快速選擇領域</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(activeChip === chip ? null : chip)}
              className={[
                "rounded-[20px] border px-4 py-2 text-[13px] font-semibold transition-all",
                activeChip === chip
                  ? "border-[#006252] bg-[#e7f5f0] text-[#005d50]"
                  : "border-[#cfd9d7] bg-white text-[#555f68] hover:border-[#006252] hover:text-[#004f46]",
              ].join(" ")}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-start gap-3 rounded-[9px] bg-[#f5f7f6] px-5 py-4">
          <span className="mt-0.5 text-[#6f7d80]"><SoundIcon /></span>
          <p className="text-[13px] font-medium leading-relaxed text-[#57696d]">
            也可通過語音輸入，我會幫你整理成結構化內容。
          </p>
        </div>
      </div>

      <p className="mt-auto pt-6 text-[12px] font-medium text-[#9ba8aa]">
        小揚 AI 助手生成內容僅供參考，請以實際提交資訊為準。
      </p>
    </div>
  );
}
