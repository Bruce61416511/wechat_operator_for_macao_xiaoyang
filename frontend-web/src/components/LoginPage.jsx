import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("redirect") || "/member";
    }
  }, [isAuthenticated]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("請輸入郵箱和密碼");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || "登錄失敗");
    }
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fbfb] px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-[#00836f] to-[#006252] text-[36px] shadow-[0_8px_24px_rgba(0,93,80,0.25)]">
          🺧
        </div>
        <h1 className="font-serifCn text-[28px] font-bold text-[#004f46]">小揚同學</h1>
        <p className="mt-1 text-[13px] text-[#6c777b]">澳門直播協會 · 會員登錄</p>
      </div>

      <div className="w-full max-w-[380px] rounded-[16px] border border-[#dce6e4] bg-white p-6 shadow-[0_2px_20px_rgba(44,36,32,0.06)]">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-[13px] font-medium text-[#6b5e58]">郵箱地址</label>
            <input
              className="w-full rounded-[10px] border border-[#dce6e4] bg-[#fdfcfa] px-4 py-2.5 text-[14px] outline-none transition focus:border-[#00836f] focus:bg-white"
              placeholder="請輸入郵箱地址"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-[13px] font-medium text-[#6b5e58]">密碼</label>
            <input
              className="w-full rounded-[10px] border border-[#dce6e4] bg-[#fdfcfa] px-4 py-2.5 text-[14px] outline-none transition focus:border-[#00836f] focus:bg-white"
              type="password"
              placeholder="請輸入密碼"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="w-full rounded-[24px] bg-gradient-to-br from-[#00836f] to-[#006252] py-3 text-[15px] font-medium text-white shadow-[0_4px_16px_rgba(0,93,80,0.25)] transition hover:shadow-[0_6px_20px_rgba(0,93,80,0.35)] disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "登錄中..." : "登 錄"}
          </button>

          {error && (
            <div className="mt-3 rounded-[10px] bg-[#fdf0eb] px-4 py-2.5 text-center text-[13px] text-[#c86a4a]">
              {error}
            </div>
          )}
        </form>
      </div>

      <p className="mt-4 text-[13px] text-[#6b5e58]">
        還沒有賬號？<a className="font-medium text-[#00836f] hover:underline" href="/apply">申請入會</a>
      </p>
    </div>
  );
}
