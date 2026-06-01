import { useState } from "react";

export default function ResetPasswordModal({ onClose }) {
  const [username, setUsername] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!username.trim()) { setError("請輸入用戶名"); return; }
    if (!idNumber.trim()) { setError("請輸入身份證號"); return; }
    if (!newPassword || newPassword.length < 6) { setError("新密碼至少6位"); return; }
    if (newPassword !== confirmPassword) { setError("兩次密碼不一致"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_number: idNumber.trim(), new_password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "重置失敗");
      }
      setMessage("密碼重置成功，請使用新密碼登錄");
      setIdNumber("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[400px] rounded-[16px] border border-[#dce6e4] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#004f46]">重置密碼</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-[#8ba09c] hover:bg-[#f2f6f5] hover:text-[#004f46] transition" type="button">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <p className="mb-4 text-[13px] leading-relaxed text-[#6c777b]">
          請輸入您入會時登記的身份證號，即可重置登錄密碼。理事賬號不支持此方式重置。
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="mb-1 block text-[13px] font-medium text-[#6b5e58]">用戶名</label>
            <input
              className="w-full rounded-[10px] border border-[#dce6e4] bg-[#fdfcfa] px-4 py-2.5 text-[14px] outline-none transition focus:border-[#00836f] focus:bg-white"
              placeholder="請輸入用戶名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-[13px] font-medium text-[#6b5e58]">身份證號</label>
            <input
              className="w-full rounded-[10px] border border-[#dce6e4] bg-[#fdfcfa] px-4 py-2.5 text-[14px] outline-none transition focus:border-[#00836f] focus:bg-white"
              placeholder="請輸入身份證號"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-[13px] font-medium text-[#6b5e58]">新密碼</label>
            <input
              className="w-full rounded-[10px] border border-[#dce6e4] bg-[#fdfcfa] px-4 py-2.5 text-[14px] outline-none transition focus:border-[#00836f] focus:bg-white"
              type="password"
              placeholder="至少6位"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-[13px] font-medium text-[#6b5e58]">確認密碼</label>
            <input
              className="w-full rounded-[10px] border border-[#dce6e4] bg-[#fdfcfa] px-4 py-2.5 text-[14px] outline-none transition focus:border-[#00836f] focus:bg-white"
              type="password"
              placeholder="再次輸入新密碼"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            className="w-full rounded-[24px] bg-gradient-to-br from-[#00836f] to-[#006252] py-3 text-[15px] font-medium text-white shadow-[0_4px_16px_rgba(0,93,80,0.25)] transition hover:shadow-[0_6px_20px_rgba(0,93,80,0.35)] disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "重置中..." : "確認重置"}
          </button>

          {error && (
            <div className="mt-3 rounded-[10px] bg-[#fdf0eb] px-4 py-2.5 text-center text-[13px] text-[#c86a4a]">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-3 rounded-[10px] bg-[#e7f5f0] px-4 py-2.5 text-center text-[13px] text-[#006252]">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
