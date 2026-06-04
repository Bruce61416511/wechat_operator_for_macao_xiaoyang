import React, { useState, useEffect } from "react";

const MEMBERS_API = "/v1/admin/members";
const APPS_API = "/v1/admin/members/applications";
const BACKEND = "http://localhost:8000";

/* ── Icons ──────────────────────────────── */
function ChevronIcon({ open }) {
  return (
    <svg aria-hidden="true" className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  );
}

/* ── Helpers ────────────────────────────── */
const MEMBER_TABS = ["全部會員", "個人會員", "企業會員", "高級會員", "理事"];
const APP_TABS = [
  { key: "初審通過",   label: "初審通過" },
  { key: "初審不通過", label: "初審不通過" },
  { key: "終審通過",   label: "終審通過" },
  { key: "終審不通過", label: "終審不通過" },
  { key: "待繳費",     label: "待繳費" },
  { key: "已繳費",     label: "已繳費" },
];

function tierBadge(tier) {
  const map = {
    "個人會員": "bg-[#e7f5f0] text-[#006252]",
    "企業會員": "bg-[#e8f0fb] text-[#1a6090]",
    "高級會員": "bg-[#fef9e7] text-[#b7950b]",
    "理事":     "bg-[#f4ecf7] text-[#7b2d8b]",
  };
  const cls = map[tier] || "bg-[#f0f3f3] text-[#6a7679]";
  return <span className={`inline-block rounded-[4px] px-2 py-0.5 text-[12px] font-bold ${cls}`}>{tier || "-"}</span>;
}

function statusBadge(status) {
  const map = {
    "初審通過":   "bg-[#eafaf1] text-[#0d7d4a]",
    "初審不通過": "bg-[#fdedec] text-[#c0392b]",
    "終審通過":   "bg-[#e8f4fd] text-[#1a6fb5]",
    "終審不通過": "bg-[#fdedec] text-[#c0392b]",
    "待繳費":     "bg-[#fef9e7] text-[#b7950b]",
    "已繳費":     "bg-[#f4ecf7] text-[#7b2d98]",
  };
  const cls = map[status] || "bg-[#f0f3f3] text-[#6a7679]";
  return <span className={`inline-block rounded-[4px] px-2 py-0.5 text-[12px] font-bold ${cls}`}>{status}</span>;
}

function statusDot(isActive) {
  return isActive
    ? <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0d7d4a]"><span className="h-2 w-2 rounded-full bg-[#0d7d4a]" />在籍</span>
    : <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#9ba8aa]"><span className="h-2 w-2 rounded-full bg-[#9ba8aa]" />停用</span>;
}

function maskId(idNum) {
  if (!idNum) return "-";
  if (idNum.length <= 6) return idNum;
  return idNum.slice(0, 4) + "****" + idNum.slice(-4);
}

function maskPhone(phone) {
  if (!phone) return "-";
  if (phone.length <= 7) return phone;
  return phone.slice(0, 4) + "****";
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function parseFiles(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return [raw]; }
}

function typeLabel(mt) {
  if (!mt || mt === "????") return <span className="text-[#c53030] text-[11px]">未設定</span>;
  const map = { individual: "個人", enterprise: "企業 / 機構" };
  return map[mt] || mt || "-";
}

/* ── Detail field groups ─────────────────── */
const MEMBER_FIELD_GROUPS = [
  {
    title: "基本信息",
    fields: [
      { key: "real_name",   label: "姓名" },
      { key: "username",    label: "用户名" },
      { key: "id_number",   label: "身份证", render: maskId },
      { key: "phone",       label: "手机",   render: maskPhone },
      { key: "address",     label: "地址" },
    ],
  },
  {
    title: "會員信息",
    fields: [
      { key: "tier",        label: "等級",   render: (v) => tierBadge(v) },
      { key: "member_type", label: "類型",   render: (v) => typeLabel(v) },
      { key: "annual_fee",  label: "年費",   render: v => v ? `MOP ${v.toLocaleString()}` : "-" },
      { key: "is_active",   label: "狀態",   render: (v) => statusDot(v) },
      { key: "joined_at",  label: "入會時間", render: formatDate },
      { key: "updated_at",  label: "最後更新", render: formatDate },
      { key: "payment_proof_url", label: "繳費憑證", render: (v) => v ? <a href={BACKEND+v} target="_blank" rel="noreferrer" className="text-[#006252] underline text-[13px] font-medium">查看憑證</a> : <span className="text-[#bcc7c5] text-[13px]">無</span> },
    ],
  },
  {
    title: "從業 & 資質",
    fields: [
      { key: "career_history",       label: "從業經歷" },
      { key: "qualifications",       label: "資質說明" },
      { key: "qualification_files",  label: "資質文件", render: (v) => {
        const files = parseFiles(v);
        if (!files.length) return "-";
        return files.map((f,i) => <a key={i} href={BACKEND+f} target="_blank" rel="noreferrer" className="text-[#006252] underline text-[13px] mr-2">文件{i+1}</a>);
      }},
    ],
  },
  {
    title: "機構專屬",
    enterpriseOnly: true,
    fields: [
      { key: "company_name",    label: "公司名稱" },
      { key: "business_reg_no", label: "商業登記號" },
    ],
  },
];

const APP_FIELD_GROUPS = [
  {
    title: "基本資訊",
    fields: [
      { key: "applicant_name", label: "姓名" },
      { key: "username",       label: "用戶名" },
      { key: "id_number",      label: "身份證", render: maskId },
      { key: "applicant_phone",label: "手機" },
      { key: "applicant_address", label: "地址" },
    ],
  },
  {
    title: "申請資訊",
    fields: [
      { key: "requested_tier",     label: "申請等級", render: (v) => tierBadge(v) },
      { key: "status",             label: "狀態",     render: (v) => statusBadge(v) },
      { key: "screening_result",   label: "初篩結果" },
      { key: "final_review_result",label: "終審結果" },
      { key: "submitted_at",       label: "提交時間", render: formatDate },
    ],
  },
  {
    title: "從業 & 資質",
    fields: [
      { key: "career_history",      label: "從業經歷" },
      { key: "qualifications",      label: "資質說明" },
      { key: "qualification_files", label: "資質文件", render: (v) => {
        const files = parseFiles(v);
        if (!files.length) return "-";
        return files.map((f,i) => <a key={i} href={BACKEND+f} target="_blank" rel="noreferrer" className="text-[#006252] underline text-[13px] mr-2">文件{i+1}</a>);
      }},
    ],
  },
  {
    title: "繳費",
    fields: [
      { key: "payment_proof_url", label: "繳費憑證", render: (v) => v ? <a href={BACKEND+v} target="_blank" rel="noreferrer" className="text-[#006252] underline text-[13px] font-medium">查看憑證</a> : <span className="text-[#bcc7c5] text-[13px]">無</span> },
    ],
  },
  {
    title: "機構資訊",
    enterpriseOnly: true,
    fields: [
      { key: "company_name",    label: "公司名稱" },
      { key: "business_reg_no", label: "商業登記號" },
    ],
  },
];

/* ── Main Component ──────────────────────── */
export default function MemberManagementPage() {
  const [members, setMembers] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("全部會員");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [appEditTarget, setAppEditTarget] = useState(null);

  const token = sessionStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const isAppTab = APP_TABS.some(t => t.key === activeTab);

  // Load counts on mount
  const [appCounts, setAppCounts] = useState({});
  useEffect(() => {
    async function loadCounts() {
      try {
        const res = await fetch(APPS_API + "?page_size=500", { headers: authHeaders });
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          const counts = {};
          APP_TABS.forEach(t => {
            counts[t.key] = items.filter(a => a.status === t.key).length;
          });
          setAppCounts(counts);
          setAllApps(items); // cache for client-side filter
        }
      } catch {}
    }
    loadCounts();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      if (isAppTab) {
        // Filter from cached data
        const items = allApps.filter(a => a.status === activeTab);
        setApplications(items);
      } else {
        const res = await fetch(MEMBERS_API + "?page_size=200", { headers: authHeaders });
        if (!res.ok) throw new Error("獲取數據失敗");
        const data = await res.json();
        setMembers(data.items || []);
      }
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [activeTab, allApps]);

  const isMemberTab = !isAppTab;

  // Filtered data
  const memberFiltered = members.filter(m => {
    const matchTab = activeTab === "全部會員" || m.tier === activeTab;
    if (!search.trim() || !isMemberTab) return matchTab;
    const q = search.toLowerCase();
    return matchTab && ((m.real_name||"").toLowerCase().includes(q) || (m.username||"").toLowerCase().includes(q) || (m.phone||"").toLowerCase().includes(q));
  });

  const appFiltered = applications.filter(app => {
    if (!search.trim() || !isAppTab) return true;
    const q = search.toLowerCase();
    return (app.applicant_name||"").toLowerCase().includes(q) || (app.username||"").toLowerCase().includes(q) || (app.applicant_phone||"").toLowerCase().includes(q);
  });

  const totalCount = isAppTab ? applications.length : members.length;

  // Edit (members only)
  function openEdit(member) {
    setEditTarget(member.id);
    setEditForm({
      real_name: member.real_name || "", username: member.username || "", phone: member.phone || "",
      address: member.address || "", career_history: member.career_history || "", qualifications: member.qualifications || "",
      tier: member.tier || "", annual_fee: member.annual_fee || 0,
      is_active: member.is_active, member_type: member.member_type || "",
      company_name: member.company_name || "", business_reg_no: member.business_reg_no || "",
      company_logo_url: member.company_logo_url || "", brand_description: member.brand_description || "",
      is_featured: member.is_featured || false, featured_expires_at: member.featured_expires_at || "",
    });
  }
  function updateField(field, value) { setEditForm(prev => ({ ...prev, [field]: value })); }
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${MEMBERS_API}/${editTarget}`, {
        method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) { const d = await res.json().catch(()=>({})); throw new Error(d.detail || "保存失敗"); }
      setMsg("保存成功"); setEditTarget(null); fetchData();
    } catch(e) { setMsg(e.message); } finally { setSaving(false); }
  }
  async function handleDelete(memberId) {
    if (!confirm("確定刪除該會員？此操作不可撤銷。")) return;
    try {
      const res = await fetch(`${MEMBERS_API}/${memberId}`, { method: "DELETE", headers: authHeaders });
      if (!res.ok) { const d = await res.json().catch(()=>({})); throw new Error(d.detail || "刪除失敗"); }
      setMsg("已刪除"); fetchData();
    } catch(e) { setMsg(e.message); }
  }


  // App edit
  function openAppEdit(app) {
    setAppEditTarget(app.id);
    setEditForm({
      applicant_name: app.applicant_name || "", applicant_phone: app.applicant_phone || "",
      applicant_address: app.applicant_address || "", career_history: app.career_history || "",
      qualifications: app.qualifications || "", requested_tier: app.requested_tier || "",
      company_name: app.company_name || "", business_reg_no: app.business_reg_no || "",
      status: app.status || "",
    });
  }
  async function handleAppSave() {
    setSaving(true);
    try {
      const res = await fetch(`${APPS_API}/${appEditTarget}`, {
        method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) { const d = await res.json().catch(()=>({})); throw new Error(d.detail || "保存失敗"); }
      setMsg("保存成功"); setAppEditTarget(null); fetchData();
    } catch(e) { setMsg(e.message); } finally { setSaving(false); }
  }
  async function handleAppDelete(appId) {
    if (!confirm("確定刪除該申請？此操作不可撤銷。")) return;
    try {
      const res = await fetch(`${APPS_API}/${appId}`, { method: "DELETE", headers: authHeaders });
      if (!res.ok) { const d = await res.json().catch(()=>({})); throw new Error(d.detail || "刪除失敗"); }
      setMsg("已刪除"); fetchData();
    } catch(e) { setMsg(e.message); }
  }
  const displayData = isAppTab ? appFiltered : memberFiltered;

  return (
    <main className="min-h-screen bg-[#f8fbf9] pl-[240px] text-[#004f46]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#dbe6e4] bg-white px-8 py-5">
        <div>
          <h1 className="text-[24px] font-bold">會員管理</h1>
          <p className="mt-0.5 text-[13px] text-[#8ba09c]">管理已入會會員與申請中記錄</p>
        </div>
        <span className="rounded-full bg-[#e7f5f0] px-4 py-1.5 text-[13px] font-semibold text-[#006252]">
          共 {totalCount} 筆
        </span>
      </div>

      {msg && (
        <div className="mx-8 mt-4 rounded-[10px] bg-[#e7f5f0] px-4 py-3 text-[13px] font-medium text-[#006252] flex items-center justify-between">
          {msg}
          <button className="text-[#00836f] underline text-[12px]" onClick={() => setMsg("")}>關閉</button>
        </div>
      )}

      <div className="px-8 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          {/* Member tabs */}
          {MEMBER_TABS.map(tab => {
            const cnt = tab === "全部會員" ? members.length : members.filter(m => m.tier === tab).length;
            return (
              <button key={tab} onClick={() => { setActiveTab(tab); setExpandedId(null); }}
                className={`px-4 py-2 rounded-[7px] text-[13px] font-semibold transition ${activeTab === tab ? "bg-[#e7f5f0] text-[#006252]" : "text-[#6a7679] hover:bg-[#f4f7f6]"}`}>
                {tab}
                <span className={`ml-1.5 text-[12px] ${activeTab === tab ? "text-[#006252]" : "text-[#bcc7c5]"}`}>{cnt}</span>
              </button>
            );
          })}
          {/* Separator */}
          <span className="mx-1.5 text-[#dce6e4] text-[18px] leading-none">|</span>
          {/* App status tabs */}
          {APP_TABS.map(tab => {
            const cnt = appCounts[tab.key];
            return (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setExpandedId(null); }}
                className={`px-4 py-2 rounded-[7px] text-[13px] font-semibold transition ${activeTab === tab.key ? "bg-[#fef9e7] text-[#b7950b]" : "text-[#6a7679] hover:bg-[#f4f7f6]"}`}>
                {tab.label}
                {cnt !== undefined && <span className={`ml-1.5 text-[12px] ${activeTab === tab.key ? "text-[#b7950b]" : "text-[#bcc7c5]"}`}>{cnt}</span>}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-4 mt-3">
          <input
            className="w-full max-w-[360px] rounded-[8px] border border-[#dce6e4] bg-white px-4 py-2.5 text-[14px] outline-none transition focus:border-[#00836f] focus:ring-1 focus:ring-[#00836f]/20"
            placeholder="搜索姓名 / 用户名 / 手机号"
            value={search} onChange={e => { setSearch(e.target.value); setExpandedId(null); }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#8ba09c]">加載中...</div>
        ) : displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-[48px] mb-3">📭</div>
            <p className="text-[16px] font-medium text-[#6c777b]">暫無數據</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[12px] border border-[#dce6e4] bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#eef3f1] bg-[#f9fbfa] text-left">
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">姓名</th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">用戶名</th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">{isAppTab ? "申請等級" : "等級"}</th>
                  {!isAppTab && <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">類型</th>}
                  <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">手機</th>
                  {!isAppTab && <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">年費</th>}
                  <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">狀態</th>
                  {isAppTab && <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">提交時間</th>}
                  {isAppTab && <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d]">繳費憑證</th>}
                  <th className="px-4 py-3 text-[13px] font-semibold text-[#57696d] text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map(item => {
                  const isOpen = expandedId === item.id;
                  const isEnterprise = isAppTab ? (item.requested_tier === "企業會員" || item.requested_tier === "高級會員") : (item.member_type === "enterprise" || item.tier === "企業會員" || item.tier === "高級會員");

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        className={`border-b border-[#f4f7f6] cursor-pointer transition hover:bg-[#f9fbfa] ${isOpen ? "bg-[#f4f8f7]" : ""}`}
                        onClick={() => setExpandedId(isOpen ? null : item.id)}
                      >
                        <td className="px-4 py-3.5"><ChevronIcon open={isOpen} /></td>
                        <td className="px-4 py-3.5 text-[14px] font-semibold text-[#142528]">{item.real_name || item.applicant_name || "-"}</td>
                        <td className="px-4 py-3.5 text-[13px] text-[#57696d]">{item.username || "-"}</td>
                        <td className="px-4 py-3.5">{tierBadge(isAppTab ? item.requested_tier : item.tier)}</td>
                        {!isAppTab && <td className="px-4 py-3.5 text-[13px] text-[#57696d]">{typeLabel(item.member_type)}</td>}
                        <td className="px-4 py-3.5 text-[13px] text-[#57696d]">{isAppTab ? (item.applicant_phone || "-") : maskPhone(item.phone)}</td>
                        {!isAppTab && <td className="px-4 py-3.5 text-[13px] font-medium text-[#27383a]">{item.annual_fee ? `MOP ${item.annual_fee.toLocaleString()}` : "-"}</td>}
                        <td className="px-4 py-3.5">{isAppTab ? statusBadge(item.status) : statusDot(item.is_active)}</td>
                        {isAppTab && <td className="px-4 py-3.5 text-[12px] text-[#6a7679]">{formatDate(item.submitted_at)}</td>}
                        {isAppTab && (
                          <td className="px-4 py-3.5">
                            {item.payment_proof_url
                              ? <a href={BACKEND+item.payment_proof_url} target="_blank" rel="noreferrer" className="text-[#006252] underline text-[13px] font-medium">查看</a>
                              : <span className="text-[#bcc7c5] text-[13px]">-</span>}
                          </td>
                        )}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-3" onClick={e => e.stopPropagation()}>
                            {!isAppTab && (
                              <>
                                <button onClick={() => openEdit(item)} className="text-[#006252] text-[13px] font-semibold hover:underline">編輯</button>
                                <button onClick={() => handleDelete(item.id)} className="text-[#c53030] text-[13px] font-semibold hover:underline">刪除</button>
                              </>
                            )}
                            {isAppTab && (
                              <>
                                <button onClick={() => openAppEdit(item)} className="text-[#006252] text-[13px] font-semibold hover:underline">編輯</button>
                                <button onClick={() => handleAppDelete(item.id)} className="text-[#c53030] text-[13px] font-semibold hover:underline">刪除</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail */}
                      {isOpen && (
                        <tr>
                          <td colSpan={isAppTab ? 9 : 9} className="bg-[#f9fbfa] border-b border-[#eef3f1]">
                            <div className="px-8 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                              {(isAppTab ? APP_FIELD_GROUPS : MEMBER_FIELD_GROUPS).map(group => {
                                if (group.enterpriseOnly && !isEnterprise) return null;
                                return (
                                  <div key={group.title} className={group.enterpriseOnly ? "md:col-span-2" : ""}>
                                    <h4 className="text-[12px] font-bold text-[#8ba09c] uppercase tracking-wider mb-3">{group.title}</h4>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                      {group.fields.map(f => {
                                        const value = f.render ? f.render(item[f.key], item) : (item[f.key] ?? "-");
                                        return (
                                          <div key={f.key} className="flex items-baseline gap-2">
                                            <span className="text-[12px] text-[#8ba09c] shrink-0">{f.label}</span>
                                            <span className="text-[13px] font-medium text-[#27383a]">{value}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
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

      {/* Edit Modal (members only) */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditTarget(null)}>
          <div className="w-full max-w-[600px] max-h-[85vh] overflow-y-auto rounded-[14px] border border-[#dde7e5] bg-white shadow-[0_20px_50px_rgba(35,70,74,0.25)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#eef3f1]">
              <h2 className="text-[18px] font-bold text-[#142528]">編輯會員</h2>
              <button onClick={() => setEditTarget(null)} className="text-[22px] text-[#9ba8aa] hover:text-[#142528]">×</button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="姓名" value={editForm.real_name} onChange={v => updateField("real_name", v)} />
              <Field label="手機" value={editForm.phone} onChange={v => updateField("phone", v)} />
              <Field label="郵箱地址" value={editForm.username} onChange={v => updateField("username", v)} />
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-[#27383a]">等級</label>
                <select className="w-full rounded-[7px] border border-[#cfd9d7] bg-white px-3 py-2.5 text-[14px] text-[#1b292b] focus:outline-none focus:ring-2 focus:ring-[#006252]/30" value={editForm.tier} onChange={e => updateField("tier", e.target.value)}>
                  <option value="個人會員">個人會員</option>
                  <option value="企業會員">企業會員</option>
                  <option value="高級會員">高級會員</option>
                  <option value="理事">理事</option>
                </select>
              </div>
              <Field label="年費" value={String(editForm.annual_fee)} onChange={v => updateField("annual_fee", parseInt(v) || 0)} type="number" />
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-[#27383a]">類型</label>
                <select className="w-full rounded-[7px] border border-[#cfd9d7] bg-white px-3 py-2.5 text-[14px] text-[#1b292b] focus:outline-none focus:ring-2 focus:ring-[#006252]/30" value={editForm.member_type || ""} onChange={e => updateField("member_type", e.target.value)}>
                  <option value="individual">個人會員</option>
                  <option value="enterprise">企業 / 機構</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[13px] font-semibold text-[#27383a]">在籍狀態</label>
                <input type="checkbox" checked={editForm.is_active} onChange={e => updateField("is_active", e.target.checked)} className="h-4 w-4 rounded accent-[#006252]" />
              </div>
              <Field label="地址" value={editForm.address} onChange={v => updateField("address", v)} />
              {(editForm.member_type === "enterprise" || editForm.tier === "企業會員" || editForm.tier === "高級會員") && (
              <div className="border-t border-[#eef3f1] pt-4">
                <p className="text-[12px] font-bold text-[#8ba09c] uppercase tracking-wider mb-3">機構專屬</p>
                <div className="space-y-3">
                  <Field label="公司名稱" value={editForm.company_name} onChange={v => updateField("company_name", v)} />
                  <Field label="商業登記號" value={editForm.business_reg_no} onChange={v => updateField("business_reg_no", v)} />
                  <Field label="品牌簡介" value={editForm.brand_description} onChange={v => updateField("brand_description", v)} />
                  <div className="flex items-center gap-3">
                    <label className="text-[13px] font-semibold text-[#27383a]">精選展示</label>
                    <input type="checkbox" checked={editForm.is_featured} onChange={e => updateField("is_featured", e.target.checked)} className="h-4 w-4 rounded accent-[#006252]" />
                  </div>
                </div>
              </div>
              )}
              <div className="border-t border-[#eef3f1] pt-4">
                <p className="text-[12px] font-bold text-[#8ba09c] uppercase tracking-wider mb-3">從業 & 資質</p>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-[13px] font-semibold text-[#27383a]">從業經歷</label>
                    <textarea className="w-full rounded-[7px] border border-[#cfd9d7] bg-white px-3 py-2 text-[14px] h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#006252]/30" value={editForm.career_history || ""} onChange={e => updateField("career_history", e.target.value)} />
                  </div>
                  <div>
                    <label className="block mb-1 text-[13px] font-semibold text-[#27383a]">資質說明</label>
                    <textarea className="w-full rounded-[7px] border border-[#cfd9d7] bg-white px-3 py-2 text-[14px] h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#006252]/30" value={editForm.qualifications || ""} onChange={e => updateField("qualifications", e.target.value)} />
                  </div>
                </div>
              </div>
            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button onClick={() => setEditTarget(null)} className="rounded-[7px] border border-[#cfd9d7] px-5 py-2.5 text-[14px] text-[#6a7679] hover:bg-[#f4f7f6]">取消</button>
              <button onClick={handleSave} disabled={saving} className="rounded-[7px] bg-gradient-to-br from-[#00836f] to-[#006252] px-6 py-2.5 text-[14px] font-bold text-white shadow-md disabled:opacity-60">{saving ? "保存中..." : "保存"}</button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* App Edit Modal */}
      {appEditTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setAppEditTarget(null)}>
          <div className="w-full max-w-[600px] max-h-[85vh] overflow-y-auto rounded-[14px] border border-[#dde7e5] bg-white shadow-[0_20px_50px_rgba(35,70,74,0.25)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#eef3f1]">
              <h2 className="text-[18px] font-bold text-[#142528]">編輯申請</h2>
              <button onClick={() => setAppEditTarget(null)} className="text-[22px] text-[#9ba8aa] hover:text-[#142528]">×</button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="姓名" value={editForm.applicant_name} onChange={v => updateField("applicant_name", v)} />
              <Field label="手機" value={editForm.applicant_phone} onChange={v => updateField("applicant_phone", v)} />
              <Field label="地址" value={editForm.applicant_address} onChange={v => updateField("applicant_address", v)} />
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-[#27383a]">申請等級</label>
                <select className="w-full rounded-[7px] border border-[#cfd9d7] bg-white px-3 py-2.5 text-[14px] text-[#1b292b] focus:outline-none focus:ring-2 focus:ring-[#006252]/30" value={editForm.requested_tier || ""} onChange={e => updateField("requested_tier", e.target.value)}>
                  <option value="個人會員">個人會員</option>
                  <option value="企業會員">企業會員</option>
                  <option value="高級會員">高級會員</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-[#27383a]">申請狀態</label>
                <select className="w-full rounded-[7px] border border-[#cfd9d7] bg-white px-3 py-2.5 text-[14px] text-[#1b292b] focus:outline-none focus:ring-2 focus:ring-[#006252]/30" value={editForm.status || ""} onChange={e => updateField("status", e.target.value)}>
                  <option value="初審通過">初審通過</option>
                  <option value="初審不通過">初審不通過</option>
                  <option value="終審通過">終審通過</option>
                  <option value="終審不通過">終審不通過</option>
                  <option value="待繳費">待繳費</option>
                  <option value="已繳費">已繳費</option>
                </select>
              </div>
              {(editForm.requested_tier === "企業會員" || editForm.requested_tier === "高級會員") && (
              <div className="border-t border-[#eef3f1] pt-4">
                <p className="text-[12px] font-bold text-[#8ba09c] uppercase tracking-wider mb-3">機構專屬</p>
                <div className="space-y-3">
                  <Field label="公司名稱" value={editForm.company_name} onChange={v => updateField("company_name", v)} />
                  <Field label="商業登記號" value={editForm.business_reg_no} onChange={v => updateField("business_reg_no", v)} />
                </div>
              </div>
              )}
              <div className="border-t border-[#eef3f1] pt-4">
                <p className="text-[12px] font-bold text-[#8ba09c] uppercase tracking-wider mb-3">從業 & 資質</p>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-[13px] font-semibold text-[#27383a]">從業經歷</label>
                    <textarea className="w-full rounded-[7px] border border-[#cfd9d7] bg-white px-3 py-2 text-[14px] h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#006252]/30" value={editForm.career_history || ""} onChange={e => updateField("career_history", e.target.value)} />
                  </div>
                  <div>
                    <label className="block mb-1 text-[13px] font-semibold text-[#27383a]">資質說明</label>
                    <textarea className="w-full rounded-[7px] border border-[#cfd9d7] bg-white px-3 py-2 text-[14px] h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#006252]/30" value={editForm.qualifications || ""} onChange={e => updateField("qualifications", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button onClick={() => setAppEditTarget(null)} className="rounded-[7px] border border-[#cfd9d7] px-5 py-2.5 text-[14px] text-[#6a7679] hover:bg-[#f4f7f6]">取消</button>
              <button onClick={handleAppSave} disabled={saving} className="rounded-[7px] bg-gradient-to-br from-[#00836f] to-[#006252] px-6 py-2.5 text-[14px] font-bold text-white shadow-md disabled:opacity-60">{saving ? "保存中..." : "保存"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block mb-1 text-[13px] font-semibold text-[#27383a]">{label}</label>
      <input type={type} className="w-full rounded-[7px] border border-[#cfd9d7] bg-white px-3 py-2.5 text-[14px] text-[#1b292b] focus:outline-none focus:ring-2 focus:ring-[#006252]/30" value={value || ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
