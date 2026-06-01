import { useState, useEffect } from "react";

export default function NotificationModal({ onClose, onReadCount }) {
  const [tab, setTab] = useState("inbox");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recipients, setRecipients] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [msgTitle, setMsgTitle] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState("");

  const token = sessionStorage.getItem("token");
  const authHeaders = token ? { Authorization: "Bearer " + token } : {};
  let userRole = "member";
  try { const p = JSON.parse(atob(token.split(".")[0])); userRole = p.role || "member"; } catch (e) {}
  const isRoot = userRole === "root";

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/v1/notifications", { headers: authHeaders });
      if (res.ok) {
        const d = await res.json();
        setNotifications(d.items || []);
        setUnreadCount(d.unread_count || 0);
        if (onReadCount) onReadCount(d.unread_count || 0);
      }
    } catch (e) {} finally { setLoading(false); }
  }

  async function fetchRecipients() {
    try {
      const res = await fetch("/v1/notifications/recipients", { headers: authHeaders });
      if (res.ok) {
        const d = await res.json();
        setRecipients(d.items || []);
      }
    } catch (e) {}
  }

  useEffect(() => {
    fetchNotifications();
    if (isRoot) fetchRecipients();
  }, []);

  async function markAllRead() {
    try {
      const res = await fetch("/v1/notifications/read-all", { method: "POST", headers: authHeaders });
      if (!res.ok) throw new Error("FAIL");
      fetchNotifications();
    } catch (e) {
      setSendMsg('標記失敗，請重試');
    }
  }

  function toggleMember(id) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
    setSelectAll(next.size === recipients.length && recipients.length > 0);
  }

  function toggleSelectAll() {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(recipients.map(function(r) { return r.id; })));
      setSelectAll(true);
    }
  }

  async function handleSend() {
    if (!msgTitle.trim() || !msgContent.trim()) {
      setSendMsg("請填寫標題和內容");
      return;
    }
    if (selectedIds.size === 0) {
      setSendMsg("請至少選擇一個收件人");
      return;
    }
    setSending(true);
    setSendMsg("");
    try {
      const res = await fetch("/v1/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          member_ids: Array.from(selectedIds),
          title: msgTitle,
          content: msgContent,
          type: "system"
        })
      });
      if (!res.ok) throw new Error("發送失敗");
      const d = await res.json();
      setSendMsg("已發送給 " + d.notification_count + " 位會員");
      setMsgTitle("");
      setMsgContent("");
      setSelectedIds(new Set());
      setSelectAll(false);
    } catch (e) {
      setSendMsg(e.message || "發送失敗");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-[16px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#dbe6e4] px-6 py-4">
          <div className="flex items-center gap-4">
            <h2 className="text-[18px] font-bold text-[#004f46]">消息中心</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                {unreadCount} 條未讀
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isRoot && (
              <div className="flex rounded-[8px] border border-[#dce6e4] overflow-hidden">
                <button
                  onClick={function() { setTab("inbox"); }}
                  className={"px-3 py-1.5 text-[12px] font-semibold " + (tab === "inbox" ? "bg-[#006252] text-white" : "bg-white text-[#6c777b]")}
                >
                  收件箱
                </button>
                <button
                  onClick={function() { setTab("compose"); fetchRecipients(); }}
                  className={"px-3 py-1.5 text-[12px] font-semibold " + (tab === "compose" ? "bg-[#006252] text-white" : "bg-white text-[#6c777b]")}
                >
                  發送通知
                </button>
              </div>
            )}
            {!isRoot && (
              <span className="text-[13px] text-[#6c777b] font-medium">收件箱</span>
            )}
            <button onClick={onClose} className="text-[#8ba09c] hover:text-[#004f46] text-[20px] leading-none">&times;</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "inbox" && (
            <div className="p-6">
              {notifications.length > 0 && (
                <div className="mb-4 flex justify-end">
                  <button onClick={markAllRead} className="text-[12px] text-[#00836f] hover:underline">
                    全部標爲已讀
                  </button>
                </div>
              )}
              {loading ? (
                <p className="text-center text-[13px] text-[#8ba09c] py-10">加載中...</p>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[48px]">📬</p>
                  <p className="mt-2 text-[14px] text-[#6c777b]">暫無消息</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map(function(n) {
                    return (
                      <div key={n.id} className={"rounded-[10px] border p-4 " + (n.is_read ? "border-[#dce6e4] bg-white" : "border-[#b8d8cf] bg-[#f4faf7]")}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#006252] shrink-0" />}
                              <h3 className="text-[14px] font-bold text-[#004f46]">{n.title}</h3>
                            </div>
                            <p className="mt-1 text-[13px] text-[#57696d] leading-relaxed">{n.content}</p>
                          </div>
                          <span className="shrink-0 text-[11px] text-[#8ba09c]">{n.created_at ? new Date(n.created_at).toLocaleString("zh-CN") : ""}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "compose" && isRoot && (
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[13px] font-semibold text-[#4a5c5e]">選擇收件人</p>
                  <label className="flex items-center gap-1.5 text-[12px] text-[#6c777b] cursor-pointer">
                    <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="accent-[#006252]" />
                    全選 ({recipients.length})
                  </label>
                </div>
                <div className="max-h-[200px] overflow-y-auto rounded-[8px] border border-[#dce6e4] p-2 grid grid-cols-2 gap-1">
                  {recipients.map(function(r) {
                    return (
                      <label key={r.id} className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-[#f4faf7] cursor-pointer text-[13px]">
                        <input type="checkbox" checked={selectedIds.has(r.id)} onChange={function() { toggleMember(r.id); }} className="accent-[#006252]" />
                        <span className="text-[#2d383a]">{r.real_name || r.username}</span>
                        {r.tier && <span className="text-[11px] text-[#8ba09c]">({r.tier})</span>}
                      </label>
                    );
                  })}
                </div>
                {selectedIds.size > 0 && (
                  <p className="mt-1 text-[12px] text-[#00836f]">已選擇: {selectedIds.size} 人</p>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[13px] font-semibold text-[#4a5c5e] block mb-1">標題</label>
                  <input
                    type="text"
                    className="w-full rounded-[8px] border border-[#dce6e4] bg-[#fdfcfa] px-3 py-2 text-[13px] outline-none focus:border-[#00836f]"
                    placeholder="請輸入通知標題"
                    value={msgTitle}
                    onChange={function(e) { setMsgTitle(e.target.value); }}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-[#4a5c5e] block mb-1">內容</label>
                  <textarea
                    className="w-full rounded-[8px] border border-[#dce6e4] bg-[#fdfcfa] px-3 py-2 text-[13px] outline-none focus:border-[#00836f] min-h-[120px] resize-none"
                    placeholder="請輸入通知內容"
                    value={msgContent}
                    onChange={function(e) { setMsgContent(e.target.value); }}
                  />
                </div>
                {sendMsg && (
                  <p className={"text-[13px] font-medium " + (sendMsg.indexOf("失敗") >= 0 ? "text-red-500" : "text-[#006252]")}>
                    {sendMsg}
                  </p>
                )}
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full rounded-[10px] bg-gradient-to-r from-[#00836f] to-[#006252] py-2.5 text-[14px] font-bold text-white shadow-md shadow-[#006252]/15 hover:shadow-lg transition disabled:opacity-60"
                >
                  {sending ? "發送中..." : "發送通知"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
