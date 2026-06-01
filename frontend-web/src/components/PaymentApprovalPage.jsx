import { useState, useEffect } from "react";

const API = "/v1/applications";

export default function PaymentApprovalPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [processing, setProcessing] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const token = sessionStorage.getItem("token");
  const authHeaders = token ? { Authorization: "Bearer " + token } : {};

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(API + "?status=" + encodeURIComponent("已繳費") + "&page_size=100", { headers: authHeaders });
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

  async function handleVerify(appId) {
    setProcessing(appId);
    try {
      const res = await fetch(API + "/" + appId + "/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ action: "verify" }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d.detail && d.detail.message) || "操作失敗");
      }
      setMsg("✔ 繳費審批通過，已入會");
      fetchData();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setProcessing(null);
    }
  }

  function openRejectModal(appId, appName) {
    setRejectModal({ appId, appName });
    setRejectReason("");
  }

  async function handleReject() {
    if (!rejectModal) return;
    const { appId } = rejectModal;
    setProcessing(appId);
    setRejectModal(null);
    try {
      const res = await fetch(API + "/" + appId + "/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ action: "reject", reject_reason: rejectReason }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d.detail && d.detail.message) || "操作失敗");
      }
      setMsg("✔ 已駁回，會員需重新上傳繳費憑證");
      fetchData();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setProcessing(null);
    }
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
          <h1 className="text-[24px] font-bold">繳費審批</h1>
          <p className="mt-0.5 text-[13px] text-[#8ba09c]">審覈會員提交的繳費憑證附件</p>
        </div>
        <span className="rounded-full bg-[#e7f5f0] px-4 py-1.5 text-[13px] font-semibold text-[#006252]">
          {applications.length} 條待審批
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
            <div className="text-[48px]">✔</div>
            <p className="mt-3 text-[16px] font-medium text-[#6c777b]">暫無待審批的繳費</p>
            <p className="mt-1 text-[13px] text-[#8ba09c]">所有繳費記錄已處理完畢</p>
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
                      <p className="text-[#6c777b]">用戶名<span className="font-medium text-[#2d383a] ml-1">{app.username}</span></p>
                      <p className="text-[#6c777b]">身份證<span className="font-medium text-[#2d383a] ml-1">{maskIdNumber(app.id_number)}</span></p>
                      <p className="text-[#6c777b]">手機<span className="font-medium text-[#2d383a] ml-1">{app.applicant_phone}</span></p>
                      <p className="text-[#6c777b]">提交時間<span className="font-medium text-[#2d383a] ml-1">
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleString("zh-CN") : "-"}
                      </span></p>
                    </div>

                    {app.payment_proof_url && (
                      <div className="mt-4">
                        <p className="text-[13px] font-semibold text-[#4a5c5e] mb-2">繳費憑證附件</p>
                        <a
                          href={app.payment_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-[10px] border border-[#dce6e4] bg-[#fdfcfa] px-4 py-3 text-[13px] text-[#00836f] hover:bg-[#e7f5f0] transition"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                          查看繳費憑證
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleVerify(app.id)}
                      disabled={processing === app.id}
                      className="rounded-xl bg-gradient-to-r from-[#00836f] to-[#006252] px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-[#006252]/15 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      {processing === app.id ? "處理中..." : "✔ 通過"}
                    </button>
                    <button
                      onClick={() => openRejectModal(app.id, app.applicant_name)}
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

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <h2 className="text-[18px] font-bold text-[#004f46]">駁回繳費審批</h2>
            <p className="mt-2 text-[13px] text-[#6c777b]">
              會員<span className="font-semibold text-[#2d383a]"> {rejectModal.appName} </span>的繳費憑證將被駁回，請填寫駁回理由
            </p>
            <textarea
              className="mt-4 w-full rounded-[10px] border border-[#dce6e4] bg-[#fdfcfa] px-4 py-3 text-[13px] outline-none transition focus:border-[#c56a2a] min-h-[100px] resize-none"
              placeholder="請輸入駁回理由（必填）"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="rounded-[10px] border border-[#dce6e4] bg-white px-5 py-2 text-[13px] font-semibold text-[#6c777b] hover:bg-[#f5f7f6] transition"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="rounded-[10px] bg-[#c56a2a] px-5 py-2 text-[13px] font-bold text-white hover:bg-[#a05822] transition disabled:opacity-40"
              >
                確認駁回
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
