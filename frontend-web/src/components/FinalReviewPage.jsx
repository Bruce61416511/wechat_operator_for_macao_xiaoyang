import { useState, useEffect } from "react";

const API = "/v1/applications";

export default function FinalReviewPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [commentMap, setCommentMap] = useState({});
  const [processing, setProcessing] = useState(null);

  const token = sessionStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(API + "?status=" + encodeURIComponent("初審通過") + "&page_size=100", { headers: authHeaders });
      if (!res.ok) throw new Error("獲取數據失敗");
      const data = await res.json();
      setApplications(data.items || []);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

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
      setMsg(result === "pass" ? "✓ 終審通過" : "✗ 已駁回");
      setCommentMap(prev => { const next = { ...prev }; delete next[appId]; return next; });
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

  function maskIdNumber(idNum) {
    if (!idNum) return "-";
    if (idNum.length <= 6) return idNum;
    return idNum.slice(0, 4) + "****" + idNum.slice(-4);
  }

  return (
    <main className="min-h-screen bg-[#f8fbf9] pl-[240px] text-[#004f46]">
      <div className="flex items-center justify-between border-b border-[#dbe6e4] bg-white px-8 py-5">
        <div>
          <h1 className="text-[24px] font-bold">會員終審</h1>
          <p className="mt-0.5 text-[13px] text-[#8ba09c]">初審通過的申請 · 理事人工確認</p>
        </div>
        <span className="rounded-full bg-[#e7f5f0] px-4 py-1.5 text-[13px] font-semibold text-[#006252]">
          {applications.length} 條待終審
        </span>
      </div>

      {msg && (
        <div className="mx-8 mt-4 rounded-[10px] bg-[#e7f5f0] px-4 py-3 text-[13px] font-medium text-[#006252]">
          {msg}
          <button className="ml-3 text-[#00836f] underline" onClick={() => setMsg("")}>關閉</button>
        </div>
      )}

      <div className="px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#8ba09c]">加載中...</div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-[48px]">✅</div>
            <p className="mt-3 text-[16px] font-medium text-[#6c777b]">暫無待終審的申請</p>
            <p className="mt-1 text-[13px] text-[#8ba09c]">所有初審通過的申請已處理完畢</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-[14px] border border-[#dce6e4] bg-white p-6 shadow-[0_4px_16px_rgba(44,36,32,0.04)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[17px] font-bold text-[#004f46]">{app.applicant_name}</h3>
                      <span className="rounded-full bg-[#e7f5f0] px-3 py-0.5 text-[12px] font-semibold text-[#006252]">
                        {app.status}
                      </span>
                      {app.requested_tier && (
                        <span className="rounded-full bg-[#fef7f2] px-2.5 py-0.5 text-[12px] font-semibold text-[#c56a2a]">
                          {app.requested_tier}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1.5 text-[13px]">
                      <p className="text-[#6c777b]">用戶名：<span className="font-medium text-[#2d383a]">{app.username}</span></p>
                      <p className="text-[#6c777b]">身份證：<span className="font-medium text-[#2d383a]">{maskIdNumber(app.id_number)}</span></p>
                      <p className="text-[#6c777b]">手機：<span className="font-medium text-[#2d383a]">{app.applicant_phone}</span></p>
                      <p className="text-[#6c777b]">提交時間：<span className="font-medium text-[#2d383a]">
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleString("zh-CN") : "-"}
                      </span></p>
                    </div>

                    <div className="mt-3">
                      <input
                        className="w-full max-w-[420px] rounded-[8px] border border-[#dce6e4] bg-[#fdfcfa] px-3 py-2 text-[13px] outline-none transition focus:border-[#00836f]"
                        placeholder="終審備註（可選）"
                        value={commentMap[app.id] || ""}
                        onChange={(e) => setComment(app.id, e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ml-6 flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleReview(app.id, "pass")}
                      disabled={processing === app.id}
                      className="rounded-xl bg-gradient-to-r from-[#00836f] to-[#006252] px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-[#006252]/15 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      {processing === app.id ? "處理中..." : "✓ 通過"}
                    </button>
                    <button
                      onClick={() => handleReview(app.id, "fail")}
                      disabled={processing === app.id}
                      className="rounded-xl border-2 border-[#f0d0c0] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#a08070] transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-500 disabled:opacity-60"
                    >
                      駁回
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
