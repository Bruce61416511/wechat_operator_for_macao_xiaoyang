import React, { useState, useEffect } from "react";

const APPS_API = "/v1/admin/members/applications-summary";

export default function MemberManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});

  const token = sessionStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(APPS_API, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.items || []);
      }
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  function openEdit(user) {
    setEditTarget(user.id);
    setEditForm({
      username: user.username || "",
      real_name: user.applicant_name || "",
      phone: user.applicant_phone || "",
      tier: user.requested_tier || "",
      career_history: user.career_history || "",
      qualifications: user.qualifications || "",
      qualification_files: user.qualification_files || "",
    });
  }

  function updateField(field, value) {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    const memberId = users.find(u => u.id === editTarget)?.member_id;
    if (!memberId) {
      setMsg("該用戶尚未創建會員記錄，無法編輯");
      return;
    }
    try {
      const res = await fetch(`/v1/admin/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "保存失敗");
      }
      setMsg("保存成功");
      setEditTarget(null);
      fetchData();
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function handleDelete(userId) {
    const user = users.find(u => u.id === userId);
    const memberId = user?.member_id;
    let deleteUrl;
    if (memberId) {
      deleteUrl = `/v1/admin/members/${memberId}`;
    } else {
      deleteUrl = `/v1/admin/members/applications/${userId}`;
    }
    if (!confirm("確定刪除該用戶？")) return;
    try {
      const res = await fetch(deleteUrl, { method: "DELETE", headers: authHeaders });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "刪除失敗");
      }
      setMsg("已刪除");
      fetchData();
    } catch (e) {
      setMsg(e.message);
    }
  }

  const STATUS_ORDER = [
    "已入會",
    "縈審通過",
    "縈審不通過",
    "縈審通過",
    "縈審不通過",
    "已入會",
    "已入會",
    "已入會",
    ];

  

  const STATUS_LABEL = {
    "已入會": "已入會",
    "縈審通過": "縈審通過",
    "縈審不通過": "縈審不通過",
  };
const sortedUsers = [...users].sort((a, b) => {
    const ai = STATUS_ORDER.indexOf(a.status);
    const bi = STATUS_ORDER.indexOf(b.status);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const totalUsers = users.length;

  const truncate = (s, n) => s && s.length > n ? s.slice(0, n) + "..." : s || "-";

  function parseFiles(raw) {
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return [raw]; }
  }

  const BACKEND = "http://localhost:8000";

  function statusBadge(status) {
    const col = {
      "待審核": "text-[#8b6914] bg-[#fef9e7]", "待審覈": "text-[#8b6914] bg-[#fef9e7]",
      "初審通過": "text-[#0d7d4a] bg-[#eafaf1]", "初審通過": "text-[#0d7d4a] bg-[#eafaf1]",
      "初審不通過": "text-[#c0392b] bg-[#fdedec]", "初審不通過": "text-[#c0392b] bg-[#fdedec]",
      "終審通過": "text-[#1a6fb5] bg-[#e8f4fd]", "終審通過": "text-[#1a6fb5] bg-[#e8f4fd]",
      "終審不通過": "text-[#c0392b] bg-[#fdedec]", "終審不通過": "text-[#c0392b] bg-[#fdedec]",
      "待繳費": "text-[#b7950b] bg-[#fef9e7]",
      "已繳費": "text-[#7d3c98] bg-[#f4ecf7]",
      "已入會": "text-[#0d7d4a] bg-[#eafaf1]",
    };
    const cls = col[status] || "text-[#6a7679] bg-[#f0f3f3]";
    return <span className={`inline-block rounded-[4px] px-2 py-0.5 text-[12px] font-bold ${cls}`}>{status}</span>;
  }

  function formatDate(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <div className="w-full mx-0 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold text-[#142528]">會員管理</h1>
            <p className="text-[14px] text-[#6a7679] mt-1">
              共 <b className="text-[#142528]">{totalUsers}</b> 名用戶，來自 applications 表
            </p>
          </div>
        </div>

        {msg && (
          <div className="mb-4 rounded-[8px] bg-[#e8f4fd] px-4 py-3 text-[14px] text-[#1a6fb5] flex justify-between items-center">
            <span>{msg}</span>
            <button onClick={() => setMsg("")} className="text-[20px]">×</button>
          </div>
        )}

        {loading ? (
          <p className="text-center text-[#9ba8aa] py-10">加載中...</p>
        ) : sortedUsers.length === 0 ? (
          <p className="text-center text-[#9ba8aa] py-10">暫無數據</p>
        ) : (
          <div className="rounded-[10px] border border-[#dde7e5] bg-white overflow-hidden">
            <table className="w-full text-[14px] table-fixed">
              <thead>
                <tr className="bg-[#f5f7f6] text-[#4a5c5e] text-[12px] font-semibold">
                  <th className="px-4 py-3 text-left">用戶名</th>
                  <th className="px-4 py-3 text-left">姓名</th>
                  <th className="pl-4 pr-4 py-3 text-left w-[150px]">身份證號</th>
                  <th className="pl-4 pr-4 py-3 text-left w-[150px]">手機</th>
                  <th className="px-4 py-3 text-left">等級</th>
                  <th className="px-4 py-3 text-left">狀態</th>
                  <th className="px-4 py-3 text-left">提交時間</th>
                  <th className="px-4 py-3 text-left">繳費憑證</th>
                  <th className="px-4 py-3 text-left">從業經歷</th>
                  <th className="px-4 py-3 text-left">資質</th>
                  <th className="px-4 py-3 text-left">資質文件</th>
                  <th className="px-4 py-3 text-center w-[110px]">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map(u => {
                  const files = parseFiles(u.qualification_files);
                  return (
                    <tr key={u.id} className="border-t border-[#eef3f1] hover:bg-[#fafbfb]">
                      <td className="px-4 py-3 font-medium text-[#142528]">{u.username}</td>
                      <td className="px-4 py-3">{truncate(u.applicant_name, 10)}</td>
                      <td className="px-4 py-3 text-[12px] text-[#6a7679] w-[150px]">{u.id_number || "-"}</td>
                      <td className="px-4 py-3 text-[12px] text-[#6a7679] w-[150px]">{u.applicant_phone || "-"}</td>
                      <td className="px-4 py-3">{u.requested_tier || "-"}</td>
                      <td className="px-4 py-3">{statusBadge(u.status)}</td>
                      <td className="px-4 py-3 text-[12px] text-[#6a7679]">{formatDate(u.submitted_at)}</td>
                      <td className="px-4 py-3">
                        {u.payment_proof_url ? (
                          <a href={BACKEND + u.payment_proof_url} target="_blank" rel="noreferrer" className="text-[#006252] underline text-[12px]">查看</a>
                        ) : (
                          <span className="text-[#9ba8aa]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#6a7679]">{truncate(u.career_history, 15)}</td>
                      <td className="px-4 py-3 text-[12px] text-[#6a7679]">{truncate(u.qualifications, 15)}</td>
                      <td className="px-4 py-3">
                        {files.length > 0 ? files.map((f, i) => (
                          <a key={i} href={BACKEND + f} target="_blank" rel="noreferrer" className="block text-[#006252] underline text-[12px]">文件{i+1}</a>
                        )) : <span className="text-[#9ba8aa]">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => openEdit(u)} className="text-[#006252] text-[13px] font-semibold hover:underline">編輯</button>
                          <button onClick={() => handleDelete(u.id)} className="text-[#c53030] text-[13px] font-semibold hover:underline">刪除</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {editTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditTarget(null)}>
            <div className="w-full max-w-[600px] max-h-[85vh] overflow-y-auto rounded-[12px] border border-[#dde7e5] bg-white p-6 shadow-[0_20px_50px_rgba(35,70,74,0.25)]" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] font-bold text-[#142528]">編輯會員</h2>
                <button onClick={() => setEditTarget(null)} className="text-[20px] text-[#9ba8aa]">×</button>
              </div>
              <div className="space-y-3">
                <Field label={"用戶名"} value={editForm.username} onChange={v => updateField("username", v)} />
                <Field label={"姓名"} value={editForm.real_name} onChange={v => updateField("real_name", v)} />
                <Field label={"手機"} value={editForm.phone} onChange={v => updateField("phone", v)} />
                <Field label={"等級"} value={editForm.tier} onChange={v => updateField("tier", v)} />
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-[#27383a]">從業經歷</label>
                  <textarea className="w-full rounded-[6px] border border-[#cfd9d7] bg-white px-3 py-2 text-[14px] h-20 resize-none" value={editForm.career_history} onChange={e => updateField("career_history", e.target.value)} />
                </div>
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-[#27383a]">資質</label>
                  <textarea className="w-full rounded-[6px] border border-[#cfd9d7] bg-white px-3 py-2 text-[14px] h-20 resize-none" value={editForm.qualifications} onChange={e => updateField("qualifications", e.target.value)} />
                </div>
                <Field label={"資質文件"} value={editForm.qualification_files} onChange={v => updateField("qualification_files", v)} />
              </div>
              <div className="flex gap-3 justify-end mt-5 pt-3 border-t border-[#eef3f1]">
                <button onClick={() => setEditTarget(null)} className="rounded-[6px] border border-[#cfd9d7] px-5 py-2 text-[14px] text-[#6a7679]">取消</button>
                <button onClick={handleSave} className="rounded-[6px] bg-gradient-to-br from-[#00836f] to-[#006252] px-5 py-2 text-[14px] font-bold text-white">保存</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block mb-1 text-[13px] font-semibold text-[#27383a]">{label}</label>
      <input
        type={type}
        className="w-full rounded-[6px] border border-[#cfd9d7] bg-white px-3 py-2 text-[14px] text-[#1b292b] focus:outline-none focus:ring-2 focus:ring-[#006252]/30"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
