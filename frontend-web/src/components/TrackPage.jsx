import { useState } from "react";

const STATUS_MAP = {
  "待審覈": { label: "待審覈", color: "text-[#ad7b00]", bg: "bg-[#fff8e9]", desc: "您的申請已提交，正在等待審覈" },
  "初審通過": { label: "初審通過", color: "text-[#006252]", bg: "bg-[#e7f5f0]", desc: "初審已通過，等待終審" },
  "初審不通過": { label: "初審不通過", color: "text-[#c53030]", bg: "bg-[#fef0f0]", desc: "初審未通過，可修改後重新提交" },
  "終審通過": { label: "終審通過", color: "text-[#006252]", bg: "bg-[#e7f5f0]", desc: "終審已通過，請完成繳費" },
  "終審不通過": { label: "終審不通過", color: "text-[#c53030]", bg: "bg-[#fef0f0]", desc: "終審未通過，30天後可重新申請" },
  "待繳費": { label: "待繳費", color: "text-[#ad7b00]", bg: "bg-[#fff8e9]", desc: "審覈已通過，請儘快完成繳費" },
  "已繳費": { label: "已繳費", color: "text-[#006252]", bg: "bg-[#e7f5f0]", desc: "繳費已提交，等待確認" },
  "已入會": { label: "已入會", color: "text-[#006252]", bg: "bg-[#e7f5f0]", desc: "恭喜！您已是正式會員" },
};

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m21 21-4.3-4.3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export default function TrackPage() {
  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadDone, setUploadDone] = useState(false);

  async function handleQuery(e) {
    e.preventDefault();
    const trimmed = idNumber.trim();
    if (trimmed.length < 15) {
      setError("請輸入有效的證件號碼（15-18位）");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/v1/applications?id_number=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error("查詢失敗");
      const data = await res.json();
      if (!data.items || data.items.length === 0) {
        setError("未找到該證件號碼對應的申請記錄");
      } else {
        const item = data.items[0];
        if (item.status) item.status = item.status.replace(/\u5be9/g, '\u5ba1');
        setResult(item);
      }
    } catch (err) {
      setError(err.message || "網絡錯誤，請重試");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(appId) {
    if (!uploadFile) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetch(`/v1/applications/${appId}/payment-proof`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("上傳失敗");
      const data = await res.json();
      setUploadMsg("繳費憑證已提交，等待審覈");
      setUploadDone(true);
      setUploadFile(null);
      // Refresh result
      setResult(prev => ({ ...prev, status: "已繳費", payment_proof_url: data.payment_proof_url }));
    } catch (e) {
      setUploadMsg(e.message || "上傳失敗");
    } finally {
      setUploading(false);
    }
  }

  const statusInfo = result ? STATUS_MAP[result.status] || { label: result.status, color: "text-[#57696d]", bg: "bg-[#e5eceb]", desc: "" } : null;

  return (
    <main className="min-h-screen bg-[#f8fbfb] bg-[url('/macau-page-bg.webp')] bg-cover bg-top bg-no-repeat pb-10">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 h-[78px] w-full rounded-b-[10px] bg-[linear-gradient(110deg,#003d36_0%,#005548_45%,#00483f_100%)] px-[42px] text-white shadow-[0_12px_30px_rgba(0,45,40,0.24)]">
        <div className="mx-auto flex h-full max-w-[900px] items-center justify-between">
          <a className="flex items-center gap-3 text-[16px] font-medium text-white/92 transition hover:text-white" href="/">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path d="m4 11 8-7 8 7v8a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
            返回首頁
          </a>
          <h1 className="text-[22px] font-bold tracking-[0.05em]">入會進度查詢</h1>
          <span className="w-[80px]" />
        </div>
      </header>

      <div className="mx-auto mt-10 max-w-[600px] px-4">
        <div className="rounded-[14px] border border-[#dde7e5] bg-white/90 px-8 py-8 shadow-[0_16px_34px_rgba(35,70,74,0.13)] backdrop-blur-xl">
          <h2 className="text-center text-[20px] font-bold text-[#142528]">查詢申請進度</h2>
          <p className="mt-2 text-center text-[14px] text-[#6a7679]">輸入您申請時使用的證件號碼</p>

          <form onSubmit={handleQuery} className="mt-6">
            <div className="flex gap-3">
              <input
                className="flex-1 rounded-[7px] border border-[#cfd9d7] bg-white px-4 py-3 text-[15px] font-medium text-[#1b292b] placeholder:text-[#a0acaf] focus:outline-none focus:ring-2 focus:ring-[#006252]/30"
                placeholder="身份證 / 護照號碼"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                maxLength={18}
              />
              <button
                type="submit"
                disabled={loading}
                className="flex h-[48px] w-[100px] items-center justify-center gap-2 rounded-[7px] bg-gradient-to-br from-[#00836f] to-[#006252] text-[16px] font-bold text-white shadow-[0_6px_14px_rgba(0,93,80,0.24)] disabled:opacity-60"
              >
                <SearchIcon />
                {loading ? "查詢中" : "查詢"}
              </button>
            </div>
          </form>

          {error && (
            <p className="mt-5 text-center text-[14px] font-medium text-red-500">{error}</p>
          )}

          {result && statusInfo && (
            <div className="mt-6 rounded-[9px] border border-[#d4e8e3] bg-[#f8fbfb] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#6a7679]">當前狀態</span>
                <span className={`rounded-[6px] px-4 py-1.5 text-[14px] font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="mt-3 text-[14px] text-[#57696d]">{statusInfo.desc}</p>

              <div className="mt-4 space-y-2 border-t border-[#dde7e5] pt-4 text-[13px] text-[#6a7679]">
                <div className="flex justify-between">
                  <span>申請人</span>
                  <span className="font-medium text-[#27383a]">{result.applicant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>申請時間</span>
                  <span className="font-medium text-[#27383a]">
                    {result.submitted_at ? new Date(result.submitted_at).toLocaleString("zh-CN") : "-"}
                  </span>
                </div>
                {result.requested_tier && (
                  <div className="flex justify-between">
                    <span>申請級別</span>
                    <span className="font-medium text-[#27383a]">{result.requested_tier}</span>
                  </div>
                )}
              </div>
              {(result.status === "初審不通過" || result.status === "終審不通過") && (
                <div className="mt-4 rounded-[7px] border border-[#f5d0d0] bg-[#fff5f5] p-3">
                  <p className="text-[13px] font-semibold text-[#c53030]">駁回理由</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#8b3a3a]">
                    {result.final_review_result || result.screening_result || "無"}
                  </p>
                </div>
              )}
              {result.payment_reject_reason && (
                <div className="mt-4 rounded-[7px] border border-[#f5d0d0] bg-[#fff5f5] p-3">
                  <p className="text-[13px] font-semibold text-[#c53030]">繳費駁回理由</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#8b3a3a]">
                    {result.payment_reject_reason}
                  </p>
                </div>
              )}
              {result.status === "待繳費" && !uploadDone && (
                <div className="mt-4 rounded-[7px] border border-[#d4e8e3] bg-[#f4faf7] p-4">
                  <p className="text-[13px] font-semibold text-[#004f46]">提交繳費憑證</p>
                  <p className="mt-1 text-[12px] text-[#6a7679]">請上傳繳費截圖或轉賬記錄</p>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="flex-1 rounded-[6px] border border-[#cfd9d7] bg-white px-3 py-2 text-[13px] file:mr-3 file:rounded-[4px] file:border-0 file:bg-[#e7f5f0] file:px-3 file:py-1 file:text-[12px] file:font-medium file:text-[#006252]"
                    />
                    <button
                      onClick={() => handleUpload(result.id)}
                      disabled={!uploadFile || uploading}
                      className="shrink-0 rounded-[6px] bg-gradient-to-br from-[#00836f] to-[#006252] px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
                    >
                      {uploading ? "上傳中..." : "提交"}
                    </button>
                  </div>
                  {uploadMsg && (
                    <p className="mt-2 text-[12px] font-medium text-[#006252]">{uploadMsg}</p>
                  )}
                </div>
              )}
              {result.status === "已繳費" && (
                <div className="mt-4 rounded-[7px] border border-[#d4e8e3] bg-[#e7f5f0] p-3 text-center">
                  <p className="text-[13px] font-semibold text-[#006252]">✓ 繳費憑證已提交，等待審覈</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
