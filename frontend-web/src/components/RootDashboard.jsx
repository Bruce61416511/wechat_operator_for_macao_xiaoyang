import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

const BACKEND = "http://localhost:8000";

/* ---- Ring Chart (reused pattern) ---- */
function RingChart({ segments, size = 120, stroke = 12 }) {
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

/* ---- Pipeline Step ---- */
function PipelineStep({ stage, count, max, isLast }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center flex-1 min-w-0">
      <div className="flex flex-col items-center flex-1">
        <div className="relative w-full h-3 bg-[#e8f0ed] rounded-full overflow-hidden mb-2">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#006252] to-[#00836f] transition-all duration-700"
            style={{ width: `${Math.max(pct, 0)}%` }} />
        </div>
        <span className="text-[12px] font-bold text-[#1b292b]">{count} 人</span>
        <span className="text-[11px] text-[#6c777b] mt-0.5">{stage}</span>
      </div>
      {!isLast && (
        <span className="text-[#b6d8d2] text-lg mx-1 shrink-0 mt-[-8px]">→</span>
      )}
    </div>
  );
}

export default function RootDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    fetch(`${BACKEND}/v1/admin/members/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  if (!user || user.role !== "root") return null;
  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[#82999e]">
          <span className="w-5 h-5 border-2 border-[#b6d8d2] border-t-[#006252] rounded-full animate-spin" />
          載入儀表板資料...
        </div>
      </div>
    );
  }

  const tierColors = {
    "個人會員": "#006252",
    "企業會員": "#1a6090",
    "高級會員": "#b7950b",
  };
  const tierSegments = Object.entries(data.tiers || {}).map(([name, count]) => ({
    name,
    value: count,
    color: tierColors[name] || "#6a7679",
  }));

  const healthColors = { active: "#006252", soon: "#e6a817", expired: "#c53030" };
  const healthLabels = { active: "有效", soon: "即將到期", expired: "已過期" };
  const healthSegments = Object.entries(data.health || {}).map(([key, count]) => ({
    name: healthLabels[key] || key,
    value: count,
    color: healthColors[key] || "#6a7679",
  }));

  const pipelineMax = Math.max(...(data.pipeline || []).map((p) => p.count), 1);

  return (
    <div className="flex-1 flex flex-col gap-5 w-full">
      {/* ---- Row 1: Stat Cards ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "會員總數", value: (data.total || 0).toLocaleString(), sub: `過期 ${(data.expired || 0).toLocaleString()} 人`, bg: "from-[#006252] to-[#00836f]" },
          { label: "活躍人數", value: (data.active || 0).toLocaleString(), sub: `佔比 ${data.total > 0 ? Math.round((data.active / data.total) * 100) : 0}%`, bg: "from-[#1a6090] to-[#2980b9]" },
          { label: "會費總收入", value: `MOP ${(data.fee_income || 0).toLocaleString()}`, sub: "年度總計", bg: "from-[#b7950b] to-[#d4a017]" },
          { label: "待處理事項", value: (data.pending_tasks || 0).toLocaleString(), sub: "待審批 / 待繳費", bg: data.pending_tasks > 0 ? "from-[#c53030] to-[#e74c3c]" : "from-[#4a7c6f] to-[#5e9e8f]" },
        ].map((card, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bg} p-5 text-white shadow-lg`}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
            <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-white/5" />
            <p className="text-[11px] font-medium text-white/60 uppercase tracking-wider">{card.label}</p>
            <p className="text-[26px] font-extrabold mt-1 tracking-tight">{card.value}</p>
            <p className="text-[11px] text-white/45 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ---- Row 2: Ring Charts ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#e2eeea] bg-white/70 backdrop-blur p-5 flex flex-col items-center shadow-sm">
          <h3 className="text-[13px] font-bold text-[#1b292b] self-start mb-3">等級分佈</h3>
          <RingChart segments={tierSegments} size={120} stroke={12} />
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            {tierSegments.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[#57696d]">{s.name}</span>
                <span className="font-bold text-[#142528]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#e2eeea] bg-white/70 backdrop-blur p-5 flex flex-col items-center shadow-sm">
          <h3 className="text-[13px] font-bold text-[#1b292b] self-start mb-3">會員健康度</h3>
          <RingChart segments={healthSegments} size={120} stroke={12} />
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            {healthSegments.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[#57696d]">{s.name}</span>
                <span className="font-bold text-[#142528]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Row 3: Application Pipeline ---- */}
      {data.pipeline && data.pipeline.length > 0 && (
        <div className="rounded-2xl border border-[#e2eeea] bg-white/70 backdrop-blur p-5 shadow-sm">
          <h3 className="text-[13px] font-bold text-[#1b292b] mb-4">審批流水線</h3>
          <div className="flex items-start gap-1 px-2">
            {data.pipeline.map((step, i) => (
              <PipelineStep key={step.stage} stage={step.stage} count={step.count} max={pipelineMax} isLast={i === data.pipeline.length - 1} />
            ))}
          </div>
        </div>
      )}

      {/* ---- Row 4: Company Distribution ---- */}
      {data.companies && data.companies.length > 0 && (
        <div className="rounded-2xl border border-[#e2eeea] bg-white/70 backdrop-blur p-5 shadow-sm">
          <h3 className="text-[13px] font-bold text-[#1b292b] mb-3">
            工作單位分佈
            <span className="ml-2 text-[11px] font-normal text-[#82999e]">共 {data.companies.length} 家企業</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#e2eeea] text-[#6c777b]">
                  <th className="pb-2.5 font-semibold">公司名稱</th>
                  <th className="pb-2.5 font-semibold text-center">總人數</th>
                  <th className="pb-2.5 font-semibold text-center">活躍</th>
                  <th className="pb-2.5 font-semibold text-center">個人</th>
                  <th className="pb-2.5 font-semibold text-center">企業</th>
                  <th className="pb-2.5 font-semibold text-center">高級</th>
                </tr>
              </thead>
              <tbody>
                {data.companies.slice(0, 15).map((c, i) => (
                  <tr key={i} className="border-b border-[#f2f7f5] hover:bg-[#f8fbf9] transition-colors">
                    <td className="py-2.5 font-semibold text-[#142528]">{c.company_name}</td>
                    <td className="py-2.5 text-center font-bold text-[#142528]">{c.total}</td>
                    <td className="py-2.5 text-center text-[#006252] font-semibold">{c.active}</td>
                    <td className="py-2.5 text-center text-[#57696d]">{c.tiers["個人會員"] || 0}</td>
                    <td className="py-2.5 text-center text-[#1a6090]">{c.tiers["企業會員"] || 0}</td>
                    <td className="py-2.5 text-center text-[#b7950b]">{c.tiers["高級會員"] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
