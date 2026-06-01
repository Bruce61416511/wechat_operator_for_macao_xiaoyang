import { useState, useEffect } from "react";
import HeaderNav from "./HeaderNav.jsx";
import PageFooter from "./PageFooter.jsx";

const API = "/v1/events";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${m}月${day}日 ${h}:${min}`;
}

export default function EventCalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch events
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    setLoading(true);
    fetch(`${API}?page_size=50`, { headers })
      .then(r => r.json())
      .then(data => {
        const items = data.items || [];
        // Only active/open events
        const active = items.filter(e => e.registration_status === "開放");
        setEvents(active);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  // Calendar helpers
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Map: day number -> events on that day
  const eventsByDay = {};
  events.forEach(ev => {
    if (!ev.event_date) return;
    const d = new Date(ev.event_date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(ev);
    }
  });

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  // Build calendar grid
  const cells = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, key: `empty-${i}` });
  }
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const isToday = date.getTime() === today.getTime();
    const dayEvents = eventsByDay[d] || [];
    cells.push({ day: d, isToday, events: dayEvents, key: `day-${d}` });
  }

  return (
    <div className="min-h-screen bg-[#f8fbfb]">
      <HeaderNav />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#00473f] via-[#006252] to-[#00836f] px-8 py-16 text-center">
        <div className="absolute inset-0 bg-[url('/macau-page-bg.webp')] bg-cover bg-center opacity-15" />
        <div className="relative mx-auto max-w-[860px]">
          <p className="text-[14px] font-semibold tracking-[4px] text-[#8ed4c4] uppercase mb-4">
            Event Calendar
          </p>
          <h1 className="text-[44px] font-bold leading-tight text-white mb-5">
            活動日曆
          </h1>
          <p className="text-[17px] leading-relaxed text-[#c8e8df] max-w-[620px] mx-auto">
            查看本月所有協會活動安排，點擊日期查看活動詳情並報名參加。
          </p>
        </div>
      </section>

      {/* Calendar */}
      <section className="mx-auto max-w-[960px] px-6 py-12">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={prevMonth} className="grid h-10 w-10 place-items-center rounded-full border border-[#dde7e5] bg-white text-[#006252] hover:bg-[#f0faf4] transition text-[18px] font-bold">
            ‹
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-[24px] font-bold text-[#00473f]">
              {year} 年 {month + 1} 月
            </h2>
            <button
              onClick={goToday}
              className="rounded-full border border-[#006252] px-4 py-1.5 text-[13px] font-semibold text-[#006252] hover:bg-[#f0faf4] transition"
            >
              今天
            </button>
          </div>
          <button onClick={nextMonth} className="grid h-10 w-10 place-items-center rounded-full border border-[#dde7e5] bg-white text-[#006252] hover:bg-[#f0faf4] transition text-[18px] font-bold">
            ›
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#6a7679]">載入中...</div>
        ) : (
          <>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map(w => (
                <div key={w} className="text-center text-[13px] font-semibold text-[#6a7679] py-2">
                  {w}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 border-t border-l border-[#e2e8e5] rounded-t-[10px] overflow-hidden">
              {cells.map(cell => (
                <div
                  key={cell.key}
                  className={`min-h-[100px] border-r border-b border-[#e2e8e5] bg-white p-2 ${
                    cell.day ? "cursor-pointer hover:bg-[#f5faf7] transition-colors" : "bg-[#f9fbfa]"
                  }`}
                  onClick={() => {
                    if (cell.day && cell.events.length > 0) {
                      setSelectedEvents({ day: cell.day, events: cell.events });
                    }
                  }}
                >
                  {cell.day && (
                    <>
                      <div className={`text-[14px] font-bold mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                        cell.isToday
                          ? "bg-[#006252] text-white"
                          : "text-[#1b292b]"
                      }`}>
                        {cell.day}
                      </div>
                      {cell.events.map(ev => (
                        <div
                          key={ev.id}
                          className="mb-1 rounded-[4px] bg-[#e7f5f0] px-1.5 py-0.5 text-[11px] font-medium text-[#005d50] truncate hover:bg-[#c8e8df] transition-colors"
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-[13px] text-[#6a7679]">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-[3px] bg-[#e7f5f0]" />
            有活動
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[#006252]" />
            今天
          </div>
        </div>
      </section>

      {/* Event Detail Modal */}
      {selectedEvents && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedEvents(null)}
        >
          <div
            className="w-full max-w-[560px] max-h-[80vh] overflow-y-auto rounded-[14px] border border-[#dde7e5] bg-white shadow-[0_20px_50px_rgba(35,70,74,0.25)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-[#006252] to-[#00836f] px-6 py-5 rounded-t-[14px] text-white flex items-center justify-between">
              <div>
                <p className="text-[13px] opacity-80">{month + 1} 月 {selectedEvents.day} 日</p>
                <h3 className="text-[20px] font-bold mt-1">活動詳情</h3>
              </div>
              <button onClick={() => setSelectedEvents(null)} className="text-white/70 hover:text-white text-[24px]">×</button>
            </div>
            <div className="p-6 space-y-5">
              {selectedEvents.events.map(ev => (
                <div key={ev.id} className="rounded-[10px] border border-[#dde7e5] bg-[#f9fbfa] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-[17px] font-bold text-[#1b292b]">{ev.title}</h4>
                    {ev.price_normal > 0 && (
                      <span className="shrink-0 rounded-full bg-[#e7f5f0] px-3 py-1 text-[12px] font-bold text-[#006252]">
                        MOP {ev.price_normal}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-[14px] text-[#57696d]">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px]">🕐</span>
                      <span>{formatDateLabel(ev.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px]">📍</span>
                      <span>{ev.location || "待定"}</span>
                    </div>
                    {ev.description && (
                      <p className="mt-2 text-[13px] leading-relaxed">{ev.description}</p>
                    )}
                    {ev.max_participants && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[13px]">👥</span>
                        <span className="text-[12px]">已報名 {ev.registrations_count || 0} / {ev.max_participants} 人</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <a
                      href={`/events`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#006252] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#004d40] transition-colors"
                    >
                      前往報名
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <PageFooter />
    </div>
  );
}
