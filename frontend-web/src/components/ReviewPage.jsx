const menuItems = [
  { label: '工作臺', icon: MenuIcon },
  { label: '申請管理', icon: FileListIcon, open: true },
  { label: '申請列表', active: true, indent: true },
  { label: '我的待辦', badge: 5, indent: true },
  { label: '補件管理', indent: true },
  { label: '歷史申請', indent: true },
  { label: '會員管理', icon: UserIcon, open: true },
  { label: '審覈管理', icon: ReviewIcon, open: true },
  { label: '規則與條款', icon: ClipboardIcon, open: true },
  { label: '知識庫', icon: KnowledgeIcon, open: true },
  { label: 'AI 助手', icon: BotIcon, open: true },
  { label: '報表中心', icon: ChartIcon, open: true },
  { label: '系統管理', icon: GearIcon, open: true },
];

function BaseIcon({ children, className = 'h-5 w-5' }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">{children}</g>
    </svg>
  );
}

function MenuIcon() {
  return <BaseIcon><path d="M4 7h16M4 12h16M4 17h16" /></BaseIcon>;
}

function FileListIcon() {
  return <BaseIcon><rect height="16" rx="2" width="14" x="5" y="4" /><path d="M8 8h8M8 12h8M8 16h5" /></BaseIcon>;
}

function UserIcon() {
  return <BaseIcon><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.9-3.8 3.2-5.7 7-5.7s6.1 1.9 7 5.7" /></BaseIcon>;
}

function ReviewIcon() {
  return <BaseIcon><path d="M6 4h12v16H6z" /><path d="m8.5 12 2 2 5-5M8.5 17h7" /></BaseIcon>;
}

function ClipboardIcon() {
  return <BaseIcon><path d="M8 5h8M9 3.5h6v3H9zM6 6h12v14H6z" /><path d="M9 11h6M9 15h4" /></BaseIcon>;
}

function KnowledgeIcon() {
  return <BaseIcon><rect height="14" rx="2" width="16" x="4" y="5" /><path d="M8 9h8M8 13h5" /></BaseIcon>;
}

function BotIcon() {
  return <BaseIcon><circle cx="12" cy="12" r="8" /><path d="M9 11h.1M15 11h.1M9 15h6M12 4V2" /></BaseIcon>;
}

function ChartIcon() {
  return <BaseIcon><path d="M4 20h16M7 17V9M12 17V5M17 17v-6" /></BaseIcon>;
}

function GearIcon() {
  return <BaseIcon><circle cx="12" cy="12" r="3.5" /><path d="M19 13.5v-3l-2-.5-.8-1.8 1-1.8-2.1-2.1-1.8 1-.8-.3-.7-2h-3l-.7 2-.8.3-1.8-1-2.1 2.1 1 1.8-.8 1.8-2 .5v3l2 .5.8 1.8-1 1.8 2.1 2.1 1.8-1 .8.3.7 2h3l.7-2 .8-.3 1.8 1 2.1-2.1-1-1.8.8-1.8z" /></BaseIcon>;
}

function BellIcon() {
  return <BaseIcon><path d="M18.5 16H5.5c1.5-1.6 2-3.1 2-6.5a4.5 4.5 0 0 1 9 0c0 3.4.5 4.9 2 6.5Z" /><path d="M10 19a2.1 2.1 0 0 0 4 0" /></BaseIcon>;
}

function LogoutIcon() {
  return <BaseIcon><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" /></BaseIcon>;
}

function HomeIcon() {
  return <BaseIcon><path d="m4 11 8-7 8 7v9h-5v-6H9v6H4z" /></BaseIcon>;
}

function CheckIcon() {
  return <BaseIcon className="h-8 w-8"><path d="m7 12 3.5 3.5L17 8" /></BaseIcon>;
}

function MiniCheckIcon() {
  return <BaseIcon className="h-3.5 w-3.5"><path d="m5 12 4 4 10-10" /></BaseIcon>;
}

function CrossIcon() {
  return <BaseIcon className="h-8 w-8"><path d="m8 8 8 8M16 8l-8 8" /></BaseIcon>;
}

function DocumentAddIcon() {
  return <BaseIcon className="h-8 w-8"><path d="M6 3.5h8l4 4V20H6z" /><path d="M14 3.5v4h4M10 13h4M12 11v4" /></BaseIcon>;
}

function BuildingIcon() {
  return <BaseIcon className="h-8 w-8"><path d="M4 20h16M6 18V9l6-3 6 3v9M9 18v-6M12 18v-6M15 18v-6M5 9h14" /></BaseIcon>;
}

function FormStackIcon() {
  return <BaseIcon className="h-8 w-8"><rect height="16" rx="2" width="12" x="6" y="4" /><path d="M9 8h6M9 12h6M9 16h4M10 2h4" /></BaseIcon>;
}

function FolderWarnIcon() {
  return <BaseIcon className="h-8 w-8"><path d="M3.5 7.5h6l1.8 2H20v9.5H4z" /><path d="M12 12v3M12 18h.1" /></BaseIcon>;
}

function SparkIcon() {
  return <BaseIcon className="h-5 w-5"><path d="M12 3l1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8zM5 14l.7 2.1L8 17l-2.3.9L5 20l-.7-2.1L2 17l2.3-.9z" /></BaseIcon>;
}

function WarningIcon() {
  return <BaseIcon className="h-5 w-5"><path d="m12 4 9 16H3z" /><path d="M12 9v4M12 17h.1" /></BaseIcon>;
}

function SmallCrossIcon() {
  return <BaseIcon className="h-5 w-5"><circle cx="12" cy="12" r="8" /><path d="m9 9 6 6M15 9l-6 6" /></BaseIcon>;
}

function DownloadIcon() {
  return <BaseIcon className="h-4 w-4"><path d="M12 4v9M8 10l4 4 4-4M5 20h14" /></BaseIcon>;
}

function EyeIcon() {
  return <BaseIcon className="h-4 w-4"><path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" /><circle cx="12" cy="12" r="2.5" /></BaseIcon>;
}

function SearchDocIcon() {
  return <BaseIcon className="h-8 w-8"><path d="M6 4h8l4 4v12H6z" /><path d="M14 4v4h4M9 12h5M9 15h3" /><circle cx="15" cy="16" r="2.4" /><path d="m17 18 2 2" /></BaseIcon>;
}

function ReviewTopBar() {
  return (
    <header className="sticky top-0 z-50 h-[88px] bg-[linear-gradient(100deg,#00463d_0%,#005448_55%,#003f38_100%)] text-white shadow-[0_10px_26px_rgba(0,45,40,0.2)]">
      <div className="flex h-full items-center px-5">
        <div className="flex w-[278px] items-center gap-3 border-r border-white/35 pr-5">
          <img alt="" className="h-[58px] w-[58px] object-cover object-left" src="/apply-top-logo.png" />
          <div className="leading-tight">
            <p className="font-serifCn text-[20px] font-semibold tracking-[0.06em]">澳門直播行業協會</p>
            <p className="mt-1 text-[11px] font-semibold text-white/88">Macau Live Streaming Association</p>
          </div>
        </div>
        <h1 className="ml-6 flex-1 font-serifCn text-[32px] font-semibold tracking-[0.08em]">
          審覈駕駛艙 － 申請編號 A-2026-0518
        </h1>
        <div className="flex items-center gap-5 text-[14px] font-semibold">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/45 bg-white/12">
              <UserIcon />
            </span>
            <span>陳俾文<br /><span className="text-[12px] font-medium text-white/75">合規審覈專員</span></span>
          </div>
          <span className="h-8 w-px bg-white/35" />
          <span className="relative flex items-center gap-2">
            <HomeIcon />
            消息
            <span className="absolute -right-3 -top-4 grid h-5 min-w-5 place-items-center rounded-full bg-[#ef493d] px-1 text-[11px] text-white">12</span>
          </span>
          <span className="flex items-center gap-2">
            <LogoutIcon />
            退出
          </span>
        </div>
      </div>
    </header>
  );
}

function ReviewSidebar() {
  return (
    <aside className="fixed bottom-0 left-0 top-[88px] z-40 flex w-[188px] flex-col overflow-hidden rounded-tr-[12px] bg-[linear-gradient(180deg,#005548_0%,#00483f_55%,#005548_100%)] text-white shadow-[10px_0_24px_rgba(0,45,40,0.18)]">
      <nav className="flex-1 overflow-y-auto px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={[
                'mb-1 flex h-[39px] w-full items-center gap-3 rounded-[7px] px-4 text-[14px] font-semibold text-white/92 transition',
                item.indent ? 'pl-[50px] text-[13px]' : '',
                item.active ? 'bg-white/16' : 'hover:bg-white/9',
              ].join(' ')}
              key={item.label}
              type="button"
            >
              {Icon ? <Icon /> : null}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#ef493d] px-1 text-[11px]">{item.badge}</span> : null}
              {item.open && !item.indent ? <span className="text-white/75">⌄</span> : null}
            </button>
          );
        })}
      </nav>

      <div className="mx-3 mb-6 rounded-[10px] border border-white/16 bg-white/6 p-4 text-center">
        <p className="text-[14px] font-bold">審覈進度</p>
        <div className="mx-auto mt-4 grid h-[88px] w-[88px] place-items-center rounded-full border-[9px] border-[#78c9b7] bg-[#005448] text-white">
          <span className="text-[28px] font-bold">3/5</span>
        </div>
        <p className="mt-2 text-[12px] text-white/75">當前節點</p>
        <p className="text-[15px] font-bold">合規審覈</p>
        <button className="mt-4 h-[36px] w-full rounded-[6px] border border-white/22 text-[12px] font-semibold" type="button">查看流程圖</button>
      </div>
    </aside>
  );
}

function PanelShell({ children, title }) {
  return (
    <div className="relative rounded-[12px] border border-[#d9e4e2] bg-white/82 p-3 shadow-sm">
      <div className="pointer-events-none absolute left-1/2 top-[-3px] h-12 w-32 -translate-x-1/2 rounded-b-full border-x border-b border-[#d4c6aa] opacity-70" />
      <h2 className="mt-6 text-center font-serifCn text-[24px] font-semibold text-[#004f46]">{title}</h2>
      {children}
    </div>
  );
}

function AiSummaryPanel() {
  return (
    <PanelShell title="AI 摘要">
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center gap-4 rounded-[9px] border border-[#e0e5e3] bg-white p-3.5 shadow-[0_8px_18px_rgba(38,74,78,0.06)]">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e4f1ef] text-[#006253]">
            <BuildingIcon />
          </span>
          <div>
            <p className="text-[14px] text-[#5d686a]">個人/機構類型</p>
            <p className="mt-1 text-[26px] font-semibold text-[#1c2f32]">機構</p>
          </div>
        </div>

        <div className="rounded-[9px] border border-[#e0e5e3] bg-white p-3.5 shadow-[0_8px_18px_rgba(38,74,78,0.06)]">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#dff0ed] text-[#00715f]">
              <FormStackIcon />
            </span>
            <div className="flex-1">
              <p className="text-[14px] text-[#5d686a]">材料完整度</p>
              <p className="mt-1 text-[30px] font-bold leading-none text-[#00806c]">82%</p>
              <div className="mt-3 h-2 rounded-full bg-[#d9dddc]">
                <div className="h-full w-[82%] rounded-full bg-[linear-gradient(90deg,#16a085,#007965)]" />
              </div>
              <p className="mt-2 text-[12px] text-[#667274]">已收集 23 / 28 項</p>
            </div>
          </div>
        </div>

        <button className="flex w-full items-center gap-4 rounded-[9px] border border-[#f3c879] bg-[#fff8eb] p-3.5 text-left shadow-[0_8px_18px_rgba(232,144,15,0.08)]" type="button">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[10px] bg-[#f5aa2d] text-white">
            <FolderWarnIcon />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-semibold text-[#9a620e]">需補件</span>
            <span className="mt-1 block text-[17px] font-bold text-[#503614]">從業成果證明 1 份</span>
          </span>
          <span className="text-[26px] text-[#9a620e]">›</span>
        </button>

        <div className="rounded-[9px] border border-[#e0e5e3] bg-white p-3.5 text-center shadow-[0_8px_18px_rgba(38,74,78,0.06)]">
          <p className="font-semibold text-[#006253]">AI 置信度</p>
          <div className="relative mx-auto mt-1 h-[94px] w-[170px] overflow-hidden">
            <div className="absolute left-1/2 top-4 h-[130px] w-[130px] -translate-x-1/2 rounded-full border-[13px] border-[#dde1df]" />
            <div className="absolute left-1/2 top-4 h-[130px] w-[130px] -translate-x-1/2 rounded-full border-[13px] border-transparent border-l-[#16a06f] border-t-[#16a06f] [transform:translateX(-50%)_rotate(24deg)]" />
            <div className="absolute bottom-0 left-0 text-[11px] text-[#697476]">0%</div>
            <div className="absolute bottom-0 right-0 text-[11px] text-[#697476]">100%</div>
            <div className="absolute inset-x-0 top-[38px]">
              <p className="text-[28px] font-bold leading-none text-[#00715f]">76%</p>
              <p className="mt-1 text-[14px] font-bold text-[#00806c]">中高</p>
            </div>
          </div>
        </div>

        <div className="rounded-[9px] border border-[#e0e5e3] bg-white p-3.5 shadow-[0_8px_18px_rgba(38,74,78,0.06)]">
          <div className="flex items-center gap-2 font-semibold text-[#006253]">
            <SparkIcon />
            <span>AI 結論摘要</span>
          </div>
          <p className="mt-2 text-[13px] leading-6 text-[#334548]">
            申請機構基本符合協會入會要求，部分條款證據不足，建議要求補件以完善材料。
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#7a8587]">
            <span>生成時間：2026-05-18 10:26:58</span>
            <span className="rounded bg-[#ddf2e9] px-2 py-1 font-semibold text-[#00715f]">AI 生成</span>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

const matrixRows = [
  {
    clause: '條款 1.2',
    desc: '合法存續要求',
    status: '已滿足',
    statusType: 'ok',
    evidence: ['營業資料.pdf', '說明函.docx'],
    extra: '+1',
    confidence: '高置信',
    score: '91%',
  },
  {
    clause: '條款 2.1',
    desc: '從業經驗要求',
    status: '證據不足',
    statusType: 'warn',
    evidence: ['從業成果證明（缺失）', '說明函.docx'],
    confidence: '中等置信',
    score: '48%',
  },
  {
    clause: '條款 2.4',
    desc: '合規經營要求',
    status: '已滿足',
    statusType: 'ok',
    evidence: ['資格證書.jpg', '說明函.docx'],
    extra: '+2',
    confidence: '高置信',
    score: '88%',
  },
];

function StatusBadge({ type, children }) {
  const isWarn = type === 'warn';
  return (
    <span className={['inline-flex items-center gap-1.5 text-[13px] font-bold', isWarn ? 'text-[#e88900]' : 'text-[#008466]'].join(' ')}>
      <span className={['grid h-5 w-5 place-items-center rounded-full text-white', isWarn ? 'bg-[#f39a11]' : 'bg-[#16a06f]'].join(' ')}>
        {isWarn ? <WarningIcon /> : <MiniCheckIcon />}
      </span>
      {children}
    </span>
  );
}

function EvidenceTag({ warn, children }) {
  return (
    <span className={[
      'inline-flex max-w-full items-center rounded-[5px] border px-2 py-1 text-[12px] font-semibold',
      warn ? 'border-[#f4b76e] bg-[#fff4e7] text-[#d36c00]' : 'border-[#a9d8d0] bg-[#eaf8f5] text-[#00715f]',
    ].join(' ')}>
      <span className="truncate">{children}</span>
    </span>
  );
}

function ClauseMatrixPanel() {
  return (
    <PanelShell title="條款矩陣">
      <div className="mt-5 overflow-hidden rounded-[10px] border border-[#dde5e3] bg-white shadow-[0_10px_24px_rgba(38,74,78,0.05)]">
        <div className="grid grid-cols-[1.05fr_1fr_1.45fr_0.8fr] border-b border-[#dde5e3] bg-[#fbfcfc] text-center text-[13px] font-semibold text-[#334548]">
          <div className="px-2 py-3">條款</div>
          <div className="border-l border-[#dde5e3] px-2 py-3">合規狀態</div>
          <div className="border-l border-[#dde5e3] px-2 py-3">證據（關鍵材料）</div>
          <div className="border-l border-[#dde5e3] px-2 py-3">AI 評估</div>
        </div>

        {matrixRows.map((row) => (
          <div className="grid min-h-[126px] grid-cols-[1.05fr_1fr_1.45fr_0.8fr] border-b border-[#e6ecea] last:border-b-0" key={row.clause}>
            <div className="flex flex-col justify-center px-3">
              <p className="text-[17px] font-semibold text-[#273b3e]">{row.clause}</p>
              <p className="mt-2 text-[12px] leading-5 text-[#586668]">{row.desc}</p>
            </div>
            <div className="flex items-center justify-center border-l border-[#e6ecea] px-2">
              <StatusBadge type={row.statusType}>{row.status}</StatusBadge>
            </div>
            <div className="flex flex-col justify-center gap-2 border-l border-[#e6ecea] px-3">
              <div className="flex items-center gap-2">
                <EvidenceTag warn={row.statusType === 'warn'}>{row.evidence[0]}</EvidenceTag>
                {row.extra ? <span className="text-[13px] text-[#6e797b]">{row.extra}</span> : null}
              </div>
              <EvidenceTag>{row.evidence[1]}</EvidenceTag>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-[#e6ecea] px-2 text-center">
              <p className={['text-[14px] font-bold', row.statusType === 'warn' ? 'text-[#e88900]' : 'text-[#008466]'].join(' ')}>{row.confidence}</p>
              <p className="mt-2 text-[17px] font-bold text-[#00715f]">{row.score}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-[7px] border border-[#f2d4a2] bg-[#fff8eb] px-3 py-2 text-[12px] leading-5 text-[#8b5a10]">
        AI 建議：需補充從業成果證明（如項目合同、平臺流水、合作證明等）以驗證實際從業經驗。
      </div>

      <div className="mt-5 flex items-center gap-5 rounded-[8px] border border-[#e2e9e7] bg-white px-4 py-3 text-[12px] text-[#566466]">
        <span>狀態說明：</span>
        <span className="inline-flex items-center gap-1.5"><span className="grid h-4 w-4 place-items-center rounded-full bg-[#16a06f] text-white"><MiniCheckIcon /></span>已滿足</span>
        <span className="inline-flex items-center gap-1.5"><span className="grid h-4 w-4 place-items-center rounded-full bg-[#f39a11] text-white"><WarningIcon /></span>證據不足</span>
        <span className="inline-flex items-center gap-1.5"><span className="grid h-4 w-4 place-items-center rounded-full bg-[#d84a43] text-white"><SmallCrossIcon /></span>不符合</span>
      </div>
    </PanelShell>
  );
}

const evidenceFiles = [
  { name: '營業資料.pdf', type: 'PDF', size: '1.24 MB', time: '2026-05-18 10:12', badge: 'P', color: 'bg-[#d94135]' },
  { name: '資格證書.jpg', type: 'JPG', size: '842 KB', time: '2026-05-18 10:12', badge: 'I', color: 'bg-[#57a947]' },
  { name: '說明函.docx', type: 'DOCX', size: '156 KB', time: '2026-05-18 10:12', badge: 'W', color: 'bg-[#1f75bb]' },
];

function FileBadge({ color, label }) {
  return (
    <span className={['relative grid h-9 w-8 shrink-0 place-items-center rounded-[4px] text-[15px] font-bold text-white shadow-sm', color].join(' ')}>
      <span className="absolute right-0 top-0 h-0 w-0 border-l-[8px] border-t-[8px] border-l-white/55 border-t-white/0" />
      {label}
    </span>
  );
}

function EvidencePanel() {
  return (
    <PanelShell title="證據與附件">
      <div className="mt-5 overflow-hidden rounded-[10px] border border-[#dde5e3] bg-white shadow-[0_10px_24px_rgba(38,74,78,0.05)]">
        <div className="grid grid-cols-[1.65fr_0.5fr_0.58fr_0.95fr_54px] items-center border-b border-[#dde5e3] bg-[#fbfcfc] px-3 py-3 text-[12px] font-semibold text-[#566466]">
          <span>文件名</span>
          <span>類型</span>
          <span>大小</span>
          <span>上傳時間</span>
          <button className="flex items-center justify-end gap-0.5 text-[11px] leading-tight text-[#334548]" type="button">
            <DownloadIcon />
            <span>全部下載</span>
          </button>
        </div>

        {evidenceFiles.map((file) => (
          <div className="grid min-h-[74px] grid-cols-[1.65fr_0.5fr_0.58fr_0.95fr_54px] items-center border-b border-[#e8eeec] px-3 text-[12px] text-[#26393c] last:border-b-0" key={file.name}>
            <div className="flex min-w-0 items-center gap-2.5">
              <FileBadge color={file.color} label={file.badge} />
              <span className="truncate font-semibold">{file.name}</span>
            </div>
            <span>{file.type}</span>
            <span>{file.size}</span>
            <span className="text-[12px] text-[#6b7678]">{file.time}</span>
            <span className="flex justify-end gap-2 text-[#26393c]">
              <button type="button"><EyeIcon /></button>
              <button type="button"><DownloadIcon /></button>
            </span>
          </div>
        ))}

        <button className="flex h-12 w-full items-center justify-center gap-1 border-t border-[#e8eeec] text-[13px] font-semibold text-[#006253]" type="button">
          查看全部 12 個附件
          <span className="text-[18px] leading-none">⌄</span>
        </button>
      </div>

      <div className="mt-8 rounded-[10px] border border-[#abdcd3] bg-[linear-gradient(135deg,#e8f8f5,#f9fffe)] p-3 shadow-[0_10px_24px_rgba(0,113,95,0.08)]">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#cfeee7] text-[#008466]">
            <SearchDocIcon />
          </span>
          <h3 className="text-[18px] font-bold text-[#006253]">關鍵證據片段</h3>
        </div>

        <div className="mt-3 rounded-[8px] border border-[#c7e3df] bg-white/86 p-4 text-[13px] leading-7 text-[#314447]">
          <p className="font-semibold text-[#006253]">說明函.docx（第 2 頁）</p>
          <p className="mt-2">
            “本公司自 2023 年起在澳門從事直播相關業務，主要與本地品牌及中小企業合作，提供直播策劃、主播經紀及內容運營服務。
          </p>
          <p className="mt-1">
            截至 2026 年 4 月，累計執行直播項目 68 場，累計觀看人次超過 210 萬，合作客戶包括澳門本地文旅、零售及會展等領域。”
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-[#d8e9e6] pt-3 text-[12px] text-[#7a8587]">
            <span>—— 摘錄時間：2026-05-18 10:13</span>
            <button className="rounded-[5px] border border-[#aedbd4] bg-white px-3 py-1.5 font-semibold text-[#00715f]" type="button">定位原文</button>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

const auditSteps = [
  { title: '提交申請', time: '2026-05-18 10:24', note: '申請人', done: true },
  { title: '形式審查通過', time: '2026-05-18 10:35', note: '系統自動', done: true },
  { title: '分派審覈', time: '2026-05-18 10:36', note: '系統', done: true },
  { title: '合規審覈中', time: '2026-05-18 10:40', note: '陳俾文', current: true },
  { title: '理監事會評審', note: '待處理' },
  { title: '結果公示', note: '待處理' },
  { title: '完成', note: '待處理' },
];

function AuditTimelinePanel() {
  return (
    <PanelShell title="審覈審計軌跡">
      <div className="mt-7 px-1">
        <div className="relative">
          <div className="absolute bottom-6 left-[15px] top-3 w-px bg-[#dfe7e5]" />
          <div className="space-y-4">
            {auditSteps.map((step) => (
              <div
                className={[
                  'relative flex gap-3 rounded-[8px] px-2 py-2.5',
                  step.current ? 'bg-[linear-gradient(90deg,#e9f7f5,#ffffff)] shadow-[0_8px_18px_rgba(0,113,95,0.06)]' : '',
                ].join(' ')}
                key={step.title}
              >
                <span
                  className={[
                    'relative z-10 mt-1 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2',
                    step.done || step.current ? 'border-[#9cd7ca] bg-[#16a06f]' : 'border-[#b7c1bf] bg-white',
                  ].join(' ')}
                >
                  {step.done || step.current ? <span className="h-2.5 w-2.5 rounded-full bg-white/95" /> : null}
                </span>
                <div className="min-w-0">
                  <p className={[
                    'text-[14px] font-bold leading-5',
                    step.current ? 'text-[#006253]' : step.done ? 'text-[#2d3f42]' : 'text-[#637073]',
                  ].join(' ')}
                  >
                    {step.title}
                  </p>
                  {step.time ? <p className="mt-1 text-[12px] leading-5 text-[#647174]">{step.time}</p> : null}
                  <p className="text-[12px] leading-5 text-[#647174]">{step.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

function PlaceholderPanel({ title }) {
  return (
    <PanelShell title={title}>
      <div className="mt-6 rounded-[10px] border border-dashed border-[#b9d2ce] bg-[#f5fbfa] p-8 text-center text-[14px] font-semibold text-[#6d7c7f]">
        {title}內容區待復刻
      </div>
    </PanelShell>
  );
}

function ReviewMainContent() {
  return (
    <main className="ml-[188px] min-h-[calc(100vh-88px)] bg-[#f8fbfb] bg-[url('/macau-page-bg.webp')] bg-cover bg-bottom px-4 pb-[96px] pt-4">
      <section className="grid min-h-[650px] grid-cols-[1.05fr_1.4fr_1.3fr_170px] gap-3 rounded-[14px] bg-white/70 p-4 shadow-[0_18px_38px_rgba(38,74,78,0.14)] backdrop-blur-xl">
        <AiSummaryPanel />
        <ClauseMatrixPanel />
        <EvidencePanel />
        <AuditTimelinePanel />
      </section>
    </main>
  );
}

function ReviewBottomBar() {
  return (
    <div className="fixed bottom-0 left-[188px] right-0 z-50 border-t border-[#dbe6e4] bg-white/90 px-12 py-3 shadow-[0_-10px_28px_rgba(38,74,78,0.12)] backdrop-blur-xl">
      <div className="grid grid-cols-[1fr_1fr_1fr_180px] gap-4">
        <button className="flex h-[62px] items-center justify-center gap-5 rounded-[7px] bg-gradient-to-br from-[#00836f] to-[#006252] text-[20px] font-bold text-white shadow-[0_8px_18px_rgba(0,93,80,0.22)]" type="button">
          <CheckIcon />
          <span>通過進入理監事會<br /><span className="text-[12px] font-medium">確認符合要求，提交理監事會評審</span></span>
        </button>
        <button className="flex h-[62px] items-center justify-center gap-5 rounded-[7px] bg-gradient-to-br from-[#f6a11a] to-[#e98b00] text-[20px] font-bold text-white shadow-[0_8px_18px_rgba(231,139,0,0.22)]" type="button">
          <DocumentAddIcon />
          <span>要求補件<br /><span className="text-[12px] font-medium">向申請人發起補件要求</span></span>
        </button>
        <button className="flex h-[62px] items-center justify-center gap-5 rounded-[7px] bg-gradient-to-br from-[#d7453f] to-[#b92727] text-[20px] font-bold text-white shadow-[0_8px_18px_rgba(185,39,39,0.22)]" type="button">
          <CrossIcon />
          <span>不符合明確條款<br /><span className="text-[12px] font-medium">駁回申請並說明不符合條款</span></span>
        </button>
        <button className="h-[62px] rounded-[7px] border border-[#d4dfdd] bg-white text-[18px] font-bold text-[#334548]" type="button">更多操作 ›</button>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <div className="min-h-screen">
      <ReviewTopBar />
      <ReviewSidebar />
      <ReviewMainContent />
      <ReviewBottomBar />
    </div>
  );
}
