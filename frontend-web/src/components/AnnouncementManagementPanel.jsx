import { useState, useEffect } from "react";

var CATS = ["協會動態", "活動預告", "會員喜報", "合作公告", "制度更新", "行業快訊"];

function tk() { return sessionStorage.getItem("token"); }

export default function AnnouncementManagementPanel() {
  var _x = useState([]); var items = _x[0]; var setItems = _x[1];
  var _y = useState(true); var loading = _y[0]; var setLoading = _y[1];
  var _a = useState(false); var showForm = _a[0]; var setShowForm = _a[1];
  var _b = useState(null); var editing = _b[0]; var setEditing = _b[1];
  var _c = useState({ title: "", content: "", category: "協會動態", is_pinned: false }); var form = _c[0]; var setForm = _c[1];
  var _d = useState(""); var msg = _d[0]; var setMsg = _d[1];

  function load() {
    setLoading(true);
    fetch("/v1/announcements?page_size=50")
      .then(function(r) { return r.json(); })
      .then(function(d) { setItems(d.items || []); setLoading(false); })
      .catch(function() { setLoading(false); });
  }
  useEffect(function() { load(); }, []);

  function reset() { setForm({ title: "", content: "", category: "協會動態", is_pinned: false }); setEditing(null); setShowForm(false); }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    var t = tk();
    var url = editing ? "/v1/announcements/" + editing.id : "/v1/announcements";
    var method = editing ? "PUT" : "POST";
    try {
      var res = await fetch(url, { method: method, headers: { "Content-Type": "application/json", Authorization: "Bearer " + t }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("fail");
      setMsg(editing ? "已更新" : "已發佈");
      reset(); load();
      setTimeout(function() { setMsg(""); }, 3000);
    } catch(e) { setMsg("操作失敗"); }
  }

  async function del(id) {
    if (!confirm("確認刪除？")) return;
    try {
      await fetch("/v1/announcements/" + id, { method: "DELETE", headers: { Authorization: "Bearer " + tk() } });
      setMsg("已刪除"); load();
      setTimeout(function() { setMsg(""); }, 3000);
    } catch(e) { setMsg("刪除失敗"); }
  }

  function edit(a) { setEditing(a); setForm({ title: a.title, content: a.content, category: a.category, is_pinned: a.is_pinned }); setShowForm(true); }

  if (loading) return <div className="p-8"><h2 className="text-2xl font-bold text-[#00473f]">公告管理</h2><p className="text-gray-500 mt-2">加載中...</p></div>;

  return (
    <div className="min-h-screen bg-[#f8fbf9] p-8">
      {msg ? <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#006252] px-6 py-3 text-sm font-bold text-white shadow-lg">{msg}</div> : null}

      <div className="max-w-4xl mx-auto rounded-2xl border border-[#dde7e5] bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div><h2 className="text-2xl font-bold text-[#00473f]">公告管理</h2><p className="text-sm text-gray-500 mt-1">發佈、編輯、刪除公告（共 {items.length} 條）</p></div>
          {showForm ? null : <button onClick={function() { reset(); setShowForm(true); }} className="rounded-lg bg-[#006252] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#004d40]">+ 發佈公告</button>}
        </div>

        {showForm ? <form onSubmit={submit} className="mb-6 rounded-xl border border-[#d4e8e3] bg-[#f8fbfb] p-5">
          <h3 className="text-lg font-bold text-[#00473f] mb-4">{editing ? "編輯公告" : "發佈公告"}</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-semibold text-gray-600 mb-1">標題 *</label><input className="w-full rounded-lg border px-3 py-2 text-sm" value={form.title} onChange={function(e) { setForm({...form, title: e.target.value}); }} /></div>
            <div className="flex gap-4">
              <div className="flex-1"><label className="block text-sm font-semibold text-gray-600 mb-1">分類</label><select className="w-full rounded-lg border px-3 py-2 text-sm" value={form.category} onChange={function(e) { setForm({...form, category: e.target.value}); }}>{CATS.map(function(c) { return <option key={c} value={c}>{c}</option>; })}</select></div>
              <div className="flex items-end pb-2"><label className="flex items-center gap-2"><input type="checkbox" checked={form.is_pinned} onChange={function(e) { setForm({...form, is_pinned: e.target.checked}); }} className="rounded" /><span className="text-sm">置頂</span></label></div>
            </div>
            <div><label className="block text-sm font-semibold text-gray-600 mb-1">內容 *</label><textarea className="w-full rounded-lg border px-3 py-2 text-sm" rows={5} value={form.content} onChange={function(e) { setForm({...form, content: e.target.value}); }} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="rounded-lg bg-[#006252] px-6 py-2 text-sm font-bold text-white">{editing ? "保存" : "發佈"}</button>
            <button type="button" onClick={reset} className="rounded-lg border px-6 py-2 text-sm">取消</button>
          </div>
        </form> : null}

        {items.length === 0 ? <p className="text-center py-12 text-gray-500">暫無公告</p>
        : <div className="space-y-3">
          {items.map(function(a) { return (
            <div key={a.id} className="flex items-center justify-between rounded-xl border p-4 hover:bg-gray-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {a.is_pinned ? <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">置頂</span> : null}
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{a.category}</span>
                  <h4 className="font-bold text-gray-800 truncate">{a.title}</h4>
                </div>
                <p className="text-xs text-gray-400 mt-1 truncate">{a.content ? a.content.slice(0, 80) : ""}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={function() { edit(a); }} className="rounded border px-3 py-1 text-xs hover:bg-gray-100">編輯</button>
                <button onClick={function() { del(a.id); }} className="rounded border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50">刪除</button>
              </div>
            </div>
          ); })}
        </div>}
      </div>
    </div>
  );
}