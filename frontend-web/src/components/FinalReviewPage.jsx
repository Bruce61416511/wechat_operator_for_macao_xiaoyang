import React, { useState, useEffect } from "react";

const API = "/v1/applications";

/* ── Icons ──────────────────────────────── */
function ChevronIcon({ open }) {
  return (
    <svg aria-hidden="true" className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  );
}

/* ── Helpers ────────────────── */
function tierBadge(tier) {
  const map = {
    "個人會員": "bg-[#e7f5f0] text-[#006252]",
    "企業會員": "bg-[#e8f0fb] text-[#1a6090]",
    "高級會員": "bg-[#fef9e7] text-[#b7950b]",
  };
  const cls = map[tier] || "bg-[#f0f3f3] text-[#6a7679]";
  return <span className={`inline-block rounded-[4px] px-2 py-0.5 text-[12px] font-bold ${cls}`}>{tier || "-"}</span>;
}

function statusBadge(status) {
  const map = {
    "初審通過": "bg-[#eafaf1] text-[#0d7d4a]",
    "終審通過": "bg-[#e8f4fd] text-[#1a6fb5]",
    "終審不通過": "bg-[#fdedec] text-[#c0392b]",
  };
  const cls = map[status] || "bg-[#f0f3f3] text-[#6a7679]";
  return <span className={`inline-block rounded-[4px] px-2 py-0.5 text-[12px] font-bold ${cls}`}>{status}</span>;
}

function maskId(idNum) {
  if (!idNum) return "-";
  if (idNum.length <= 6) return idNum;
  return idNum.slice(0, 4) + "****" + idNum.slice(-4);
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function parseFiles(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return [raw]; }
}

const BACKEND = "http://localhost:8000";

const TABS = [
  { key: "初審通過", label: "待終審" },
  { key: "終審通過", label: "已通過" },
  { key: "終審不通過", label: "已駁回" },
  { key: "", label: "全部" },
];

/* ── Main ──────────────────── */
export default function FinalReviewPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("初審通過");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [commentMap, setCommentMap] = useState({});
  const [processing, setProcessing] = useState(null);

  const token = sessionStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab) params.set("status", activeTab);
      params.set("page_size", "200");
      const res = await fetch(API + "?" + params.toString(), { headers: authHeaders });
      if (!res.ok) throw new Error("獲取數據失敗");
      const data = await res.json();
      setApplications(data.items || []);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [activeTab]);

  async function handleReview(appId, result) {
    const comment = commentMap[appId] || "";
    setProcessing(appId);
    try {
      const res = await fetch(API + "/" + appId + "/final-review", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ result, comment }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const detail = d.detail;
        const errMsg = typeof detail === "object" && detail !== null ? detail.message || JSON.stringify(detail) : detail;
        throw new Error(errMsg || "操作失敗");
      }
      setMsg(result === "pass" ? "✓ 終審通過" : "✓ 已駁回");
      setCommentMap(prev => { const next = { ...prev }; delete next[appId]; return next; });
      setExpandedId(null);
      fetchData();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setProcessing(null);
    }
  }

  function setComment(appId, value) {
    setCommentMap(prev => ({ ...prev, [appId]: value }));
  }

  const filtered = applications.filter(app => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (app.applicant_name || "").toLowerCase().includes(q) ||
      (app.username || "").toLowerCase().includes(q) ||
      (app.applicant_phone || "").toLowerCase().includes(q)
    );
  });

  const tabCounts = {};
  TABS.forEach(t => {
    if (t.key === "" && activeTab === "") return;
    tabCounts[t.key] = t.key === activeTab ? applications.length : null;
  });
  // Compute counts by fetching all statuses once
  const [allCounts, setAllCounts] = useState({});
  useEffect(() => {
    async function loadCounts() {
      const counts = {};
      for (const t of TABS) {
        if (!t.key) { counts["全部"] = applications.length; continue; }
        try {
          const res = await fetch(API + "?status=" + encodeURIComponent(t.key) + "&page_size=1", { headers: authHeaders });
          if (res.ok) {
            const d = await res.json();
            counts[t.key] = d.total;
          }
        } catch {}
      }
      setAllCounts(counts);
    }
    loadCounts();
  }, [applications.length]);

  return (
    <main className="min-h-screen bg-[#f8fbf9] pl-[240px] text-[#004f46]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#dbe6e4] bg-white px-8 py-5">
        <div>
          <h1 className="text-[24px] font-bold">會員終審</h1>
          <p className="mt-0.5 text-[13px] text-[#8ba09c]">初審通過的申請 · 理事人工確認</p>
        </div>
        <span className="rounded-full bg-[#e7f5f0] px-4 py-1.5 text-[13px] font-semibold text-[#006252]">
          {filtered.length} 筆記錄
        </span>
      </div>

      {/* Message */}
      {msg && (
        <div className="mx-8 mt-4 rounded-[10px] bg-[#e7f5f0] px-4 py-3 text-[13px] font-medium text-[#006252] flex items-center justify-between">
          {msg}
          <button className="text-[#00836f] underline text-[12px]" onClick={() => setMsg("")}>關閉</button>
        </div>
      )}

      <div className="px-8 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setExpandedId(null); }}
              className={`relative px-5 py-2.5 rounded-[8px] text-[14px] font-semibold transition ${
                activeTab === tab.key
                  ? "bg-[#e7f5f0] text-[#006252]"
                  : "text-[#6a7679] hover:bg-[#f4f7f6]"
              }`}
            >
              {tab.label}
              {allCounts[tab.key] !== undefined && (
                <span className={`ml-2 text-[12px] ${activeTab === tab.key ? "text-[#006252]" : "text-[#bcc7c5]"}`}>
                  {allCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            className="w-full max-w-[360px] rounded-[8px] border border-[#dce6e4] bg-white px-4 py-2.5 text-[14px] outline-none transition focus:border-[#00836f] focus:ring-1 focus:ring-[#00836f]/20"
            placeholder="搜索姓名 / 用户名 / 手机号"
            value={search}
            onChange={e => { setSearch(e.target.value); setExpandedId(null); }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#8ba09c]">加載中...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-[48px] mb-3">✅</div>
            <p className="text-[16px] font-medium text-[#6c777b]">暫無記錄</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[12px] border border-[#dce6e4] bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#eef3f1] bg-[#f9fbfa] text-left">
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">姓名</th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">用戶名</th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">申請等級</th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">手機</th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">提交時間</th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">狀態</th>
                  {activeTab === "初審通過" && (
                    <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d] text-center">終審操作</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => {
                  const isOpen = expandedId === app.id;
                  const isPending = app.status === "初審通過";
                  return (
                    <React.Fragment key={app.id}>
                      <tr
                        className={`border-b border-[#f4f7f6] cursor-pointer transition hover:bg-[#f9fbfa] ${isOpen ? "bg-[#f4f8f7]" : ""}`}
                        onClick={() => setExpandedId(isOpen ? null : app.id)}
                      >
                        <td className="px-4 py-3.5"><ChevronIcon open={isOpen} /></td>
                        <td className="px-4 py-3.5 text-[14px] font-semibold text-[#142528]">{app.applicant_name || "-"}</td>
                        <td className="px-4 py-3.5 text-[13px] text-[#57696d]">{app.username || "-"}</td>
                        <td className="px-4 py-3.5">{tierBadge(app.requested_tier)}</td>
                        <td className="px-4 py-3.5 text-[13px] text-[#57696d]">{app.applicant_phone || "-"}</td>
                        <td className="px-4 py-3.5 text-[12px] text-[#6a7679]">{formatDate(app.submitted_at)}</td>
                        <td className="px-4 py-3.5">{statusBadge(app.status)}</td>
                        {isPending && (
                          <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <input
                                className="w-[140px] rounded-[6px] border border-[#dce6e4] bg-[#fdfcfa] px-2.5 py-1.5 text-[12px] outline-none transition focus:border-[#00836f]"
                                placeholder="備註(可選)"
                                value={commentMap[app.id] || ""}
                                onChange={e => setComment(app.id, e.target.value)}
                              />
                              <button
                                onClick={() => handleReview(app.id, "pass")}
                                disabled={processing === app.id}
                                className="rounded-[6px] bg-gradient-to-r from-[#00836f] to-[#006252] px-4 py-1.5 text-[12px] font-bold text-white shadow-sm disabled:opacity-60"
                              >
                                {processing === app.id ? "..." : "通過"}
                              </button>
                              <button
                                onClick={() => handleReview(app.id, "fail")}
                                disabled={processing === app.id}
                                className="rounded-[6px] border border-[#e8c0b0] bg-white px-4 py-1.5 text-[12px] font-semibold text-[#a08070] hover:bg-red-50 hover:border-red-300 hover:text-red-500 disabled:opacity-60"
                              >
                                駁回
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>

                      {/* Expanded detail */}
                      {isOpen && (
                        <tr>
                          <td colSpan={isPending ? 8 : 7} className="bg-[#f9fbfa] border-b border-[#eef3f1]">
                            <div className="px-8 py-5 grid grid-cols-2 gap-5">
                              <div>
                                <h4 className="text-[12px] font-bold text-[#8ba09c] uppercase tracking-wider mb-3">基本資訊</h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                  <KV label="姓名" value={app.applicant_name} />
                                  <KV label="用戶名" value={app.username} />
                                  <KV label="身份證" value={maskId(app.id_number)} />
                                  <KV label="手機" value={app.applicant_phone} />
                                  <KV label="地址" value={app.applicant_address || "-"} />
                                  <KV label="提交時間" value={formatDate(app.submitted_at)} />
                                </div>
                              </div>
                              <div>
                                <h4 className="text-[12px] font-bold text-[#8ba09c] uppercase tracking-wider mb-3">申請資訊</h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                  <KV label="申請等級" value={<span>{tierBadge(app.requested_tier)}</span>} />
                                  <KV label="狀態" value={<span>{statusBadge(app.status)}</span>} />
                                  <KV label="初篩結果" value={app.screening_result || "-"} />
                                  <KV label="終審結果" value={app.final_review_result || "-"} />
                                </div>
                              </div>
                              <div className="col-span-2">
                                <h4 className="text-[12px] font-bold text-[#8ba09c] uppercase tracking-wider mb-3">從業 & 資質</h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                  <KV label="從業經歷" value={app.career_history || "-"} />
                                  <KV label="資質說明" value={app.qualifications || "-"} />
                                  <KV label="資質文件" value={
                                    parseFiles(app.qualification_files).length > 0
                                      ? parseFiles(app.qualification_files).map((f,i) => <a key={i} href={BACKEND+f} target="_blank" rel="noreferrer" className="text-[#006252] underline text-[13px] mr-2">文件{i+1}</a>)
                                      : "-"
                                  } />
                                  <KV label="繳費憑證" value={
                                    app.payment_proof_url
                                      ? <a href={BACKEND+app.payment_proof_url} target="_blank" rel="noreferrer" className="text-[#006252] underline text-[13px] font-medium">查看憑證</a>
                                      : <span className="text-[#bcc7c5] text-[13px]">無</span>
                                  } />
                                </div>
                              </div>
                              <div className="col-span-2">
                                {(app.requested_tier === "企業會員" || app.requested_tier === "高級會員") && (
                                  <>
                                    <h4 className="text-[12px] font-bold text-[#8ba09c] uppercase tracking-wider mb-3">機構資訊</h4>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                      <KV label="公司名稱" value={app.company_name || "-"} />
                                      <KV label="商業登記號" value={app.business_reg_no || "-"} />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function KV({ label, value }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[12px] text-[#8ba09c] shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-[#27383a]">{value}</span>
    </div>
  );
}
