import { useState, useEffect, useCallback } from "react";

const API = "/v1/events";

const EVENT_ICONS = ["🎯", "🎪", "🎨", "🏆", "🌟", "💡", "🎭", "🎵", "🏛", "📚", "🌿", "⚡", "🎉", "🏅", "💎", "🔥"];

function getEventIcon(title) {
  let hash = 0;
  for (let i = 0; i < (title || "").length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return EVENT_ICONS[Math.abs(hash) % EVENT_ICONS.length];
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const weekdays = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
  return `${month}月${day}日 ${weekdays[d.getDay()]} ${hours}:${minutes}`;
}

export default function EventCenterPage({ role }) {
  const isRoot = role === "root";
  const [events, setEvents] = useState([]);
  const [myEventIds, setMyEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", event_date: "", location: "", description: "", price_normal: 0, max_participants: "" });
  const [msg, setMsg] = useState("");
  const [animatingCard, setAnimatingCard] = useState(null);

  const token = sessionStorage.getItem("token");
  const isLoggedIn = !!token;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, myRes] = await Promise.all([
        fetch(API + "?page_size=50"),
        token ? fetch(API + "/my", { headers: authHeaders }) : Promise.resolve(null)
      ]);
      if (evRes.ok) {
        const data = await evRes.json();
        const items = data.items || [];
        items.sort((a, b) => {
          const aOpen = a.registration_status === "開放";
          const bOpen = b.registration_status === "開放";
          if (aOpen && !bOpen) return -1;
          if (!aOpen && bOpen) return 1;
          return new Date(a.event_date) - new Date(b.event_date);
        });
        setEvents(isRoot ? items : items.filter(e => e.registration_status === "開放"));
      }
      if (myRes && myRes.ok) {
        const myData = await myRes.json();
        const ids = new Set((myData.items || []).map(e => e.id));
        setMyEventIds(ids);
      }
    } catch {} finally { setLoading(false); }
  }, [token, isRoot]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleRegister(eventId) {
    setAnimatingCard(eventId);
    try {
      const res = await fetch(`${API}/${eventId}/register`, { method: "POST", headers: { ...authHeaders } });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || "報名失敗"); }
      setMsg("🎉 報名成功！");
      setMyEventIds(prev => new Set([...prev, eventId]));
      fetchData();
    } catch (e) { setMsg(e.message); }
    finally { setTimeout(() => setAnimatingCard(null), 600); }
  }

  async function handleCancel(eventId) {
    setAnimatingCard(eventId);
    try {
      const res = await fetch(`${API}/${eventId}/register`, { method: "DELETE", headers: { ...authHeaders } });
      if (!res.ok) throw new Error("取消失敗");
      setMsg("已取消報名");
      setMyEventIds(prev => { const next = new Set(prev); next.delete(eventId); return next; });
      fetchData();
    } catch (e) { setMsg(e.message); }
    finally { setTimeout(() => setAnimatingCard(null), 600); }
  }

  async function handleDelete(eventId) {
    if (!confirm("確認刪除該活動？")) return;
    try {
      const res = await fetch(`${API}/${eventId}`, { method: "DELETE", headers: { ...authHeaders } });
      if (!res.ok) throw new Error("刪除失敗");
      setMsg("活動已刪除"); fetchData();
    } catch (e) { setMsg(e.message); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const body = { ...form, max_participants: form.max_participants ? parseInt(form.max_participants) : null, price_normal: parseInt(form.price_normal) || 0 };
      const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(typeof d.detail === "object" ? d.detail.message : d.detail || "創建失敗"); }
      setMsg("🎉 活動創建成功！"); setShowCreate(false); setForm({ title: "", event_date: "", location: "", description: "", price_normal: 0, max_participants: "" }); fetchData();
    } catch (e) { setMsg(e.message); }
  }

  const openEvents = events.filter(e => e.registration_status === "開放");
  const closedEvents = events.filter(e => e.registration_status !== "開放");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2f8f5] via-[#f8fbf9] to-[#f0f5f3] pl-[240px]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-[88px] items-center justify-between border-b border-white/60 bg-white/70 px-11 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00836f] to-[#00473f] text-xl shadow-lg shadow-[#006252]/20">
            🎪
          </div>
          <div>
            <h1 className="font-serifCn text-[30px] font-bold leading-none text-[#00473f] tracking-tight">協會活動</h1>
            <p className="mt-0.5 text-[12px] text-[#8ba09c]">{isRoot ? "活動管理 · 創建與維護" : "精彩活動 · 等你參與"}</p>
          </div>
        </div>
        <a href="/member" className="group flex items-center gap-1.5 rounded-full border border-[#d0ded9] px-4 py-2 text-[13px] font-medium text-[#55716a] transition-all hover:border-[#006252] hover:text-[#00473f] hover:bg-[#f2f8f5]">
          <svg className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          會員中心
        </a>
      </header>

      <div className="px-11 py-8 max-w-[1200px]">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[22px] font-bold text-[#142528] tracking-tight">
              {isRoot ? "📋 活動管理" : "📅 可報名活動"}
            </h2>
            <p className="mt-1 text-[13px] text-[#8ba09c]">
              {events.length === 0 ? "暫未發佈活動" : `共 ${events.length} 場活動 · ${openEvents.length} 場開放中`}
            </p>
          </div>
          {isRoot && (
            <button
              onClick={() => setShowCreate(true)}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00836f] to-[#006252] px-5 py-3 text-[14px] font-bold text-white shadow-lg shadow-[#006252]/20 transition-all hover:shadow-xl hover:shadow-[#006252]/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              創建活動
            </button>
          )}
        </div>

        {/* Message Toast */}
        {msg && (
          <div className="mb-6 animate-[fadeIn_0.3s_ease]">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-[#c5ddd3] px-5 py-2.5 text-[13px] font-semibold text-[#006252] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#006252] animate-pulse" />
              {msg}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-[#d0ded9] border-t-[#006252]" />
              <div className="absolute inset-0 flex items-center justify-center text-lg">🎪</div>
            </div>
            <p className="mt-4 text-[14px] font-medium text-[#8ba09c]">加載活動中...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#e7f5f0] to-[#d0ede3] text-5xl shadow-inner">
              📭
            </div>
            <h3 className="mt-5 text-[18px] font-bold text-[#3d5a55]">暫無活動</h3>
            <p className="mt-1 text-[14px] text-[#8ba09c]">{isRoot ? "點擊上方按鈕創建第一個活動" : "敬請期待更多精彩活動"}</p>
          </div>
        )}

        {/* Open Events Section */}
        {openEvents.length > 0 && (
          <div className="mb-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-1 w-7 rounded-full bg-gradient-to-r from-[#00836f] to-[#006252]" />
              <h3 className="text-[16px] font-bold text-[#00473f] tracking-tight">開放報名</h3>
              <span className="rounded-full bg-[#e7f5f0] px-2.5 py-0.5 text-[11px] font-bold text-[#006252]">{openEvents.length}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {openEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRoot={isRoot}
                  isLoggedIn={isLoggedIn}
                  isRegistered={myEventIds.has(event.id)}
                  animating={animatingCard === event.id}
                  onRegister={handleRegister}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Closed Events Section */}
        {closedEvents.length > 0 && (
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="h-1 w-7 rounded-full bg-gradient-to-r from-[#c5a890] to-[#a08070]" />
              <h3 className="text-[16px] font-bold text-[#6d5d50] tracking-tight">已截止</h3>
              <span className="rounded-full bg-[#fef7f2] px-2.5 py-0.5 text-[11px] font-bold text-[#a08070]">{closedEvents.length}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 opacity-70">
              {closedEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRoot={isRoot}
                  isLoggedIn={isLoggedIn}
                  isRegistered={myEventIds.has(event.id)}
                  animating={animatingCard === event.id}
                  onRegister={handleRegister}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-[500px] animate-[scaleIn_0.25s_ease] rounded-2xl border border-[#dde7e5] bg-white p-7 shadow-[0_25px_60px_rgba(0,66,63,0.15)]" onClick={e => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00836f] to-[#006252] text-lg shadow-md shadow-[#006252]/15">
                    ✨
                  </div>
                  <h2 className="text-[19px] font-bold text-[#142528]">創建新活動</h2>
                </div>
                <button onClick={() => setShowCreate(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#9ba8aa] transition-all hover:bg-[#f2f5f4] hover:text-[#3d5a55]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <Field label="活動標題" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} required placeholder="請輸入活動標題" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="活動時間" type="datetime-local" value={form.event_date} onChange={v => setForm(p => ({ ...p, event_date: v }))} required />
                  <Field label="地點" value={form.location} onChange={v => setForm(p => ({ ...p, location: v }))} required placeholder="活動地點" />
                </div>
                <Field label="活動描述" value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} placeholder="簡要描述活動內容" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="價格（澳門元）" type="number" value={form.price_normal} onChange={v => setForm(p => ({ ...p, price_normal: v }))} />
                  <Field label="人數上限" type="number" value={form.max_participants} onChange={v => setForm(p => ({ ...p, max_participants: v }))} placeholder="不限則留空" />
                </div>
                <div className="flex gap-3 justify-end pt-3">
                  <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-[#cfd9d7] px-6 py-2.5 text-[14px] font-medium text-[#6a7679] transition-all hover:bg-[#f5f7f6] hover:border-[#b0c0bb]">
                    取消
                  </button>
                  <button type="submit" className="rounded-xl bg-gradient-to-r from-[#00836f] to-[#006252] px-6 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-[#006252]/20 transition-all hover:shadow-xl hover:shadow-[#006252]/30 hover:-translate-y-0.5">
                    確認創建
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes cardPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(0,98,82,0.3); } 50% { box-shadow: 0 0 0 8px rgba(0,98,82,0); } }
      `}</style>
    </div>
  );
}

function EventCard({ event, isRoot, isLoggedIn, isRegistered, animating, onRegister, onCancel, onDelete }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
      event.registration_status === "開放"
        ? "border-[#d0e8df] hover:border-[#a0d4c0] hover:shadow-[#006252]/8"
        : "border-[#e8e0d8]"
    } ${animating ? "animate-[cardPulse_0.6s_ease]" : ""}`}>
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1.5 ${
        event.registration_status === "開放"
          ? "bg-gradient-to-b from-[#00836f] to-[#00473f]"
          : "bg-gradient-to-b from-[#c5a890] to-[#9a8070]"
      }`} />

      <div className="flex items-stretch">
        {/* Icon area */}
        <div className="flex w-[100px] shrink-0 items-center justify-center bg-gradient-to-br from-[#f8fbf9] to-[#eef7f3]">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110 ${
            event.registration_status === "開放" ? "bg-white shadow-md shadow-[#006252]/8" : "bg-[#faf7f4]"
          }`}>
            {getEventIcon(event.title)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 pl-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-1.5">
                <h3 className="text-[16px] font-bold text-[#142528] group-hover:text-[#00473f] transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${
                  event.registration_status === "開放"
                    ? "bg-[#e7f5f0] text-[#006252]"
                    : "bg-[#fef7f2] text-[#a08070]"
                }`}>
                  {event.registration_status}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-[#6a7679]">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-[#00836f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {formatDate(event.event_date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-[#00836f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {event.location}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <span className={`inline-flex items-center gap-1.5 text-[14px] font-bold ${
                  event.price_normal > 0 ? "text-[#c56a2a]" : "text-[#00836f]"
                }`}>
                  {event.price_normal > 0 ? `MOP ${event.price_normal}` : "🆓 免費"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-[#8ba09c]">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {event.registrations_count || 0}{event.max_participants ? `/${event.max_participants} 人` : " 人已報名"}
                </span>
              </div>

              {event.description && (
                <p className="mt-2.5 text-[13px] leading-relaxed text-[#9ba8aa] line-clamp-2">{event.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
              {isRoot ? (
                <button
                  onClick={() => onDelete(event.id)}
                  className="group/btn flex items-center gap-1 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-red-500 transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  刪除
                </button>
              ) : !isLoggedIn ? (
                <a
                  href="/login"
                  className="rounded-xl border-2 border-[#006252]/20 bg-white px-4 py-2.5 text-[13px] font-bold text-[#006252] transition-all hover:bg-[#006252] hover:text-white hover:border-[#006252] hover:shadow-lg hover:shadow-[#006252]/20"
                >
                  登錄報名
                </a>
              ) : isRegistered ? (
                <button
                  onClick={() => onCancel(event.id)}
                  className="rounded-xl border-2 border-[#f0d0c0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#a08070] transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-500"
                >
                  取消報名
                </button>
              ) : event.registration_status === "開放" ? (
                <button
                  onClick={() => onRegister(event.id)}
                  className="rounded-xl bg-gradient-to-r from-[#00836f] to-[#006252] px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-[#006252]/15 transition-all hover:shadow-lg hover:shadow-[#006252]/25 hover:-translate-y-0.5 active:translate-y-0"
                >
                  立即報名
                </button>
              ) : (
                <span className="rounded-xl bg-[#faf7f4] px-4 py-2.5 text-[13px] font-medium text-[#b0a090]">
                  已截止
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-[#27383a]">{label}</label>
      <input
        type={type}
        className="w-full rounded-xl border border-[#cfd9d7] bg-[#fafcfb] px-4 py-2.5 text-[14px] text-[#1b292b] placeholder:text-[#bfcdc8] transition-all focus:border-[#00836f] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#006252]/8"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}
