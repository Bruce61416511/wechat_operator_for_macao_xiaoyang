import { useState, useEffect } from "react";

const PAYMENT_STATUSES = ["待繳費", "已繳費"];

export default function PaymentModal({ profile, onClose }) {
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadDone, setUploadDone] = useState(false);

  useEffect(() => {
    const idNumber = profile?.id_number;
    if (!idNumber) {
      setError("無法獲取您的身份信息");
      setLoading(false);
      return;
    }

    const token = sessionStorage.getItem("token");
    fetch("/v1/applications?id_number=" + encodeURIComponent(idNumber), {
      headers: token ? { Authorization: "Bearer " + token } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.items || data.items.length === 0) {
          setError("未找到您的申請記錄");
        } else {
          // Prefer the latest application
          const items = data.items.sort(
            (a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0)
          );
          setApplication(items[0]);
        }
      })
      .catch((err) => setError(err.message || "查詢失敗"))
      .finally(() => setLoading(false));
  }, [profile?.id_number]);

  async function handleUpload() {
    if (!uploadFile || !application) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const token = sessionStorage.getItem("token");
      const res = await fetch("/v1/applications/" + application.id + "/payment-proof", {
        method: "POST",
        headers: token ? { Authorization: "Bearer " + token } : {},
        body: formData,
      });
      if (!res.ok) throw new Error("上傳失敗");
      const data = await res.json();
      setUploadMsg("繳費憑證已提交，等待審核");
      setUploadDone(true);
      setUploadFile(null);
      setApplication((prev) => ({
        ...prev,
        status: "已繳費",
        payment_proof_url: data.payment_proof_url,
      }));
    } catch (e) {
      setUploadMsg(e.message || "上傳失敗");
    } finally {
      setUploading(false);
    }
  }

  const canPay = application && (application.status === "待繳費" || application.status === "已繳費");
  const isPaid = application?.status === "已繳費" || uploadDone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[480px] rounded-[14px] border border-[#d4e8e3] bg-white p-8 shadow-[0_20px_60px_rgba(0,45,40,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#004f46]">繳費</h2>
          <button
            className="grid h-9 w-9 place-items-center rounded-full text-[#6a7679] transition hover:bg-[#f0f4f3]"
            onClick={onClose}
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className="mt-6">
          {loading && (
            <div className="py-10 text-center text-[14px] text-[#6a7679]">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#006252] border-t-transparent" />
              正在查詢您的申請狀態…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-[7px] border border-[#f5d0d0] bg-[#fff5f5] p-4 text-center">
              <p className="text-[14px] font-medium text-[#c53030]">{error}</p>
              <p className="mt-2 text-[12px] text-[#8b3a3a]">
                如需繳費，請前往
                <a className="mx-1 font-semibold text-[#006252] underline" href="/track">
                  進度查詢
                </a>
                頁面
              </p>
            </div>
          )}

          {!loading && !error && application && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between rounded-[7px] border border-[#d4e8e3] bg-[#f8fbfb] p-4">
                <span className="text-[14px] font-medium text-[#6a7679]">當前狀態</span>
                <span
                  className={
                    "rounded-[6px] px-4 py-1.5 text-[14px] font-bold " +
                    (isPaid
                      ? "bg-[#e7f5f0] text-[#006252]"
                      : application.status === "待繳費"
                      ? "bg-[#fff8e9] text-[#ad7b00]"
                      : "bg-[#e5eceb] text-[#57696d]")
                  }
                >
                  {isPaid ? "已繳費" : application.status}
                </span>
              </div>

              {/* Application Info */}
              <div className="space-y-2 rounded-[7px] border border-[#d4e8e3] bg-[#f8fbfb] p-4 text-[13px] text-[#6a7679]">
                <div className="flex justify-between">
                  <span>申請人</span>
                  <span className="font-medium text-[#27383a]">{application.applicant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>申請時間</span>
                  <span className="font-medium text-[#27383a]">
                    {application.submitted_at
                      ? new Date(application.submitted_at).toLocaleString("zh-CN")
                      : "-"}
                  </span>
                </div>
                {application.requested_tier && (
                  <div className="flex justify-between">
                    <span>申請級別</span>
                    <span className="font-medium text-[#27383a]">{application.requested_tier}</span>
                  </div>
                )}
              </div>

              {/* Payment Reject Reason */}
              {application.payment_reject_reason && (
                <div className="rounded-[7px] border border-[#f5d0d0] bg-[#fff5f5] p-3">
                  <p className="text-[13px] font-semibold text-[#c53030]">繳費退回理由</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#8b3a3a]">
                    {application.payment_reject_reason}
                  </p>
                </div>
              )}

              {/* Upload Section - only if 待繳費 */}
              {application.status === "待繳費" && !uploadDone && (
                <div className="rounded-[7px] border border-[#d4e8e3] bg-[#f4faf7] p-4">
                  <p className="text-[13px] font-semibold text-[#004f46]">提交繳費憑證</p>
                  <p className="mt-1 text-[12px] text-[#6a7679]">
                    請上傳繳費截圖或轉賬記錄
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="flex-1 rounded-[6px] border border-[#cfd9d7] bg-white px-3 py-2 text-[13px] file:mr-3 file:rounded-[4px] file:border-0 file:bg-[#e7f5f0] file:px-3 file:py-1 file:text-[12px] file:font-medium file:text-[#006252]"
                    />
                    <button
                      onClick={handleUpload}
                      disabled={!uploadFile || uploading}
                      className="shrink-0 rounded-[6px] bg-gradient-to-br from-[#00836f] to-[#006252] px-5 py-2 text-[13px] font-bold text-white disabled:opacity-50"
                    >
                      {uploading ? "上傳中..." : "提交"}
                    </button>
                  </div>
                  {uploadMsg && (
                    <p className={
                      "mt-2 text-[12px] font-medium " +
                      (uploadDone ? "text-[#006252]" : "text-[#c53030]")
                    }>
                      {uploadMsg}
                    </p>
                  )}
                </div>
              )}

              {/* Already Paid */}
              {isPaid && (
                <div className="rounded-[7px] border border-[#d4e8e3] bg-[#e7f5f0] p-4 text-center">
                  <p className="text-[14px] font-semibold text-[#006252]">
                    ✓ 繳費憑證已提交，等待審核
                  </p>
                  <p className="mt-1 text-[12px] text-[#476468]">
                    審核通過後即可成為正式會員
                  </p>
                </div>
              )}

              {/* Not in payment status */}
              {!canPay && application.status !== "待繳費" && !isPaid && (
                <div className="rounded-[7px] border border-[#f5d0d0] bg-[#fff5f5] p-4 text-center">
                  <p className="text-[14px] font-medium text-[#c53030]">
                    當前狀態為「{application.status}」，暫無需繳費
                  </p>
                  {application.status === "已入會" ? (
                    <p className="mt-2 text-[12px] text-[#8b3a3a]">
                      您已是正式會員，無需再次繳費
                    </p>
                  ) : (
                    <p className="mt-2 text-[12px] text-[#8b3a3a]">
                      請等待終審通過後再進行繳費
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-[#e5eceb] pt-4">
          <button
            className="w-full rounded-[8px] bg-[#eef7f5] py-2.5 text-[14px] font-semibold text-[#006252] transition hover:bg-[#dff3ef]"
            onClick={onClose}
            type="button"
          >
            {uploadDone || isPaid ? "完成" : "關閉"}
          </button>
        </div>
      </div>
    </div>
  );
}
