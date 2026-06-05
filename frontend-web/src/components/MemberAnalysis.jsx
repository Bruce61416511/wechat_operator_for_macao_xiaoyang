import { useState, useEffect } from "react";

const BACKEND = "http://localhost:8000";

function RingChart({ segments, size = 140, stroke = 14 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} className="-rotate-90">
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = circ * pct;
        const o = offset;
        offset += dash;
        return (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-o}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease" }}
          />
        );
      })}
    </svg>
  );
}

function BarItem({ label, value, max, color, idx }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2" style={{ animationDelay: `${idx * 80}ms` }}>
      <span className="w-[64px] text-[12px] font-semibold text-[#2a4448] shrink-0 text-right">{label}</span>
      <div className="flex-1 h-6 bg-[#f2f7f5] rounded-full overflow-hidden">
        <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700 ease-out"
          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}>
        </div>
      </div>
      <span className="w-8 text-right text-[12px] font-bold text-[#142528]">{value}</span>
    </div>
  );
}

export default function MemberAnalysis() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND}/v1/public/stats`)
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const tierColors = { "俩人會員": "#006252", "企業會員": "#1a6090", "高級會員": "#b7950b" };
  const tierSegments = Object.entries(stats.tiers || {}).map(([name, count]) => ({
    name, value: count,
    color: tierColors[name] || "#6a7679",
  }));

  const healthSegments = [
    { name: "有效", value: stats.health?.active || 0, color: "#006252" },
    { name: "臨期", value: stats.health?.soon || 0, color: "#e6a817" },
    { name: "過期", value: stats.health?.expired || 0, color: "#c53030" },
  ];

  const appFlow = [
    { label: "初審通過", value: stats.applications?.["初審通過"] || 0, color: "#0d7d4a" },
    { label: "終審通過", value: stats.applications?.["終審通過"] || 0, color: "#1a6fb5" },
    { label: "待繳費", value: stats.applications?.["待繳費"] || 0, color: "#b7950b" },
    { label: "已繳費", value: stats.applications?.["已繳費"] || 0, color: "#7b2d98" },
    { label: "已入會", value: stats.applications?.["已入會"] || 0, color: "#006252" },
  ];
  const appMax = Math.max(...appFlow.map(a => a.value), 1);

  const pendingItems = [
    { label: "待初審", value: stats.applications?.["初審通過"] || 0, color: "#eafaf1" },
    { label: "待終審", value: (stats.applications?.["終審通過"] || 0) + (stats.applications?.["待繳費"] || 0), color: "#e8f4fd" },
    { label: "待繳費", value: stats.applications?.["待繳費"] || 0, color: "#fef9e7" },
    { label: "待確認繳費", value: stats.applications?.["已繳費"] || 0, color: "#f4ecf7" },
    { label: "會費已過期", value: stats.health?.expired || 0, color: "#fdedec" },
  ];

  return (
    <section className="mx-auto mt-8 max-w-[1196px]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "會員總數", value: stats.total?.toLocaleString(), sub: "排除理事", bg: "from-[#006252] to-[#00836f]" },
          { label: "企業會員", value: stats.enterprise_count?.toLocaleString(), sub: "企業+高級", bg: "from-[#1a6090] to-[#2980b9]" },
          { label: "年費收入", value: `MOP ${(stats.fee_income || 0).toLocaleString()}`, sub: "年度總計", bg: "from-[#b7950b] to-[#d4a017]" },
          { label: "會員等級", value: stats.tier_count || 0, sub: "俩人 / 企業 / 高級", bg: "from-[#4a7c6f] to-[#5e9e8f]" },
        ].map((card, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bg} p-5 text-white shadow-lg transition-transform hover:scale-[1.02]`}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/5" />
            <p className="text-[12px] font-medium text-white/60 uppercase tracking-wider">{card.label}</p>
            <p className="text-[30px] font-extrabold mt-1 tracking-tight">{card.value}</p>
            <p className="text-[11px] text-white/45 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="rounded-2xl border border-[#e2eeea] bg-white/80 backdrop-blur p-6 shadow-sm flex flex-col items-center">
          <h3 className="text-[14px] font-bold text-[#1b292b] mb-4 self-start">等級分布</h3>
          <RingChart segments={tierSegments} size={130} stroke={12} />
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {tierSegments.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-[12px]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[#57696d]">{s.name}</span>
                <span className="font-bold text-[#142528]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2eeea] bg-white/80 backdrop-blur p-6 shadow-sm flex flex-col items-center">
          <h3 className="text-[14px] font-bold text-[#1b292b] mb-4 self-start">會費健康度</h3>
          <RingChart segments={healthSegments} size={130} stroke={12} />
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {healthSegments.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-[12px]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[#57696d]">{s.name}</span>
                <span className="font-bold text-[#142528]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2eeea] bg-white/80 backdrop-blur p-6 shadow-sm">
          <h3 className="text-[14px] font-bold text-[#1b292b] mb-4">待處理提醒</h3>
          <div className="space-y-2.5">
            {pendingItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px]"
                style={{ backgroundColor: item.color }}>
                <span className="font-semibold text-[#3a4a4d]">{item.label}</span>
                <span className="font-extrabold text-[16px] text-[#142528]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e2eeea] bg-white/80 backdrop-blur p-6 shadow-sm mb-6">
        <h3 className="text-[14px] font-bold text-[#1b292b] mb-5">申請审批流程</h3>
        <div className="space-y-3">
          {appFlow.map((item, i) => (
            <BarItem key={item.label} label={item.label} value={item.value} max={appMax} color={item.color} idx={i} />
          ))}
        </div>
      </div>

      {stats.recent_members?.length > 0 && (
        <div className="rounded-2xl border border-[#e2eeea] bg-white/80 backdrop-blur p-6 shadow-sm">
          <h3 className="text-[14px] font-bold text-[#1b292b] mb-4">最新加入會員</h3>
          <div className="flex flex-wrap gap-3">
            {stats.recent_members.map((m, i) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#f4f8f7] border border-[#e2eeea]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#006252] to-[#00a88f] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                  {m.name?.charAt(0)}
                </div>
                <span className="text-[13px] font-semibold text-[#142528]">{m.name?.charAt(0)}**</span>
                <span className="text-[11px] text-[#82999e] bg-[#e8f0ee] px-1.5 py-0.5 rounded">{m.tier}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}