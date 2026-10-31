import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

function getRole() {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[0])).role;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const role = getRole();
      if (role === "root" || role === "admin") {
        window.location.href = "/admin/members";
      } else {
        // 非管理員誤用後台登錄頁，導向會員中心
        window.location.href = "/member";
      }
    }
  }, [isAuthenticated]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("請輸入管理員賬號和密碼");
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1f1c] px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-[#00836f] to-[#006252] text-[36px] shadow-[0_8px_24px_rgba(0,93,80,0.25)]">
          🛡
        </div>
        <h1 className="font-serifCn text-[28px] font-bold text-white">澳門直播協會</h1>
        <p className="mt-1 text-[13px] text-[#9fb4af]">管理後台 · 員工專用</p>
      </div>

      <div className="w-full max-w-[380px] rounded-[16px] border border-[#1f3a35] bg-[#14211e] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-[13px] font-medium text-[#9fb4af]">管理員賬號（郵箱）</label>
            <input
              className="w-full rounded-[10px] border border-[#1f3a35] bg-[#0f1f1c] px-4 py-2.5 text-[14px] text-white outline-none transition focus:border-[#00836f] focus:bg-[#14211e]"
              placeholder="請輸入管理員郵箱"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-[13px] font-medium text-[#9fb4af]">密碼</label>
            <input
              className="w-full rounded-[10px] border border-[#1f3a35] bg-[#0f1f1c] px-4 py-2.5 text-[14px] text-white outline-none transition focus:border-[#00836f] focus:bg-[#14211e]"
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
            {submitting ? "登錄中..." : "登 錄 後 台"}
          </button>

          {error && (
            <div className="mt-3 rounded-[10px] bg-[#3a1f1a] px-4 py-2.5 text-center text-[13px] text-[#e08a6a]">
              {error}
            </div>
          )}
        </form>
      </div>

      <p className="mt-4 text-[13px] text-[#6f8480]">本頁僅供協會管理人員登錄，會員請使用會員登錄入口</p>
    </div>
  );
}
