import { useState, useEffect } from "react";

export default function ConstitutionPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ rule_type: "", rule_key: "", description: "", operator: "", value: "" });
  const [msg, setMsg] = useState("");

  const token = sessionStorage.getItem("token");
  const authHeaders = token ? { "Content-Type": "application/json", Authorization: "Bearer " + token } : {};

  async function fetchRules() {
    setLoading(true);
    try {
      const res = await fetch("/v1/constitution-rules", { headers: authHeaders });
      if (res.ok) {
        const d = await res.json();
        setRules(d.items || []);
      }
    } catch (e) {} finally { setLoading(false); }
  }

  useEffect(() => { fetchRules(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ rule_type: "", rule_key: "", description: "", operator: "", value: "" });
    setShowForm(true);
    setMsg("");
  }

  function openEdit(rule) {
    setEditing(rule);
    setForm({
      rule_type: rule.rule_type,
      rule_key: rule.rule_key,
      description: rule.description || "",
      operator: (rule.rule_value && rule.rule_value.operator) || "",
      value: (rule.rule_value && rule.rule_value.value) || ""
    });
    setShowForm(true);
    setMsg("");
  }

  async function handleSave() {
    if (!form.description.trim()) { setMsg("請填寫描述"); return; }
    setMsg("");
    const body = {
      rule_type: form.rule_type || "入會條件",
      rule_key: form.rule_key || form.description.slice(0, 10),
      rule_value: { operator: form.operator || "contains", value: form.value || form.description },
      description: form.description
    };
    try {
      let res;
      if (editing) {
        res = await fetch("/v1/constitution-rules/" + editing.id, { method: "PATCH", headers: authHeaders, body: JSON.stringify(body) });
      } else {
        res = await fetch("/v1/constitution-rules", { method: "POST", headers: authHeaders, body: JSON.stringify(body) });
      }
      if (!res.ok) {
        const err = await res.json().catch(function() { return {}; });
        setMsg(err.detail || "發送失敗");
        return;
      }
      setShowForm(false);
      fetchRules();
    } catch (e) {
      setMsg("網絡錯誤，請重試");
    }
  }

  async function handleDelete(rule) {
    if (!confirm("確認刪除?")) return;
    try {
      await fetch("/v1/constitution-rules/" + rule.id, { method: "DELETE", headers: authHeaders });
      fetchRules();
    } catch (e) {}
  }

  return (
    <div className="min-h-screen bg-[#f8fbf9] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold text-[#004f46]">章程管理</h1>
            <p className="mt-1 text-[14px] text-[#6c777b]">入會條件與篩選標準管理</p>
          </div>
          <button onClick={openNew} className="rounded-[10px] bg-[#006252] px-5 py-2.5 text-[14px] font-bold text-white shadow-md hover:bg-[#004f46] transition">
            + 新建規則
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-[14px] border border-[#dbe6e4] bg-white p-6 shadow-sm">
            <h2 className="text-[16px] font-bold text-[#004f46] mb-4">{editing ? "編輯" : "新建規則"}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[12px] font-semibold text-[#4a5c5e] block mb-1">類型</label>
                <select className="w-full rounded-[8px] border border-[#dce6e4] bg-[#fdfcfa] px-3 py-2 text-[13px] outline-none focus:border-[#00836f]" value={form.rule_type} onChange={function(e) { setForm({ ...form, rule_type: e.target.value }); }}>
                  <option value="">請選擇類型</option>
                  <option value="入會條件">入會條件</option>
                  <option value="篩選標準">篩選標準</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#4a5c5e] block mb-1">標識</label>
                <input type="text" className="w-full rounded-[8px] border border-[#dce6e4] bg-[#fdfcfa] px-3 py-2 text-[13px] outline-none focus:border-[#00836f]" placeholder="規則標識" value={form.rule_key} onChange={function(e) { setForm({ ...form, rule_key: e.target.value }); }} />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[12px] font-semibold text-[#4a5c5e] block mb-1">描述</label>
              <input type="text" className="w-full rounded-[8px] border border-[#dce6e4] bg-[#fdfcfa] px-3 py-2 text-[13px] outline-none focus:border-[#00836f]" placeholder="規則描述" value={form.description} onChange={function(e) { setForm({ ...form, description: e.target.value }); }} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[12px] font-semibold text-[#4a5c5e] block mb-1">運算符</label>
                <input type="text" className="w-full rounded-[8px] border border-[#dce6e4] bg-[#fdfcfa] px-3 py-2 text-[13px] outline-none focus:border-[#00836f]" placeholder="運算符" value={form.operator} onChange={function(e) { setForm({ ...form, operator: e.target.value }); }} />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#4a5c5e] block mb-1">值</label>
                <input type="text" className="w-full rounded-[8px] border border-[#dce6e4] bg-[#fdfcfa] px-3 py-2 text-[13px] outline-none focus:border-[#00836f]" placeholder="值" value={form.value} onChange={function(e) { setForm({ ...form, value: e.target.value }); }} />
              </div>
            </div>
            {msg && <p className="text-[13px] text-red-500 mb-3">{msg}</p>}
            <div className="flex gap-3">
              <button onClick={handleSave} className="rounded-[8px] bg-[#006252] px-5 py-2 text-[13px] font-bold text-white hover:bg-[#004f46]">保存</button>
              <button onClick={function() { setShowForm(false); }} className="rounded-[8px] border border-[#dce6e4] px-5 py-2 text-[13px] text-[#6c777b] hover:bg-gray-50">取消</button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-[14px] text-[#8ba09c] py-10">加載中...</p>
        ) : rules.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-[48px] mb-2">📜</p>
            <p className="text-[14px] text-[#6c777b]">暫無規則</p>
          </div>
        ) : (
          <div className="rounded-[14px] border border-[#dbe6e4] bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#dbe6e4] bg-[#f4faf7] text-[12px] font-semibold text-[#4a5c5e]">
                  <th className="px-4 py-3">類型</th>
                  <th className="px-4 py-3">標識</th>
                  <th className="px-4 py-3">描述</th>
                  <th className="px-4 py-3">版本</th>
                  <th className="px-4 py-3 w-[120px]"></th>
                </tr>
              </thead>
              <tbody>
                {rules.map(function(r) {
                  return (
                    <tr key={r.id} className="border-b border-[#f0f5f3] hover:bg-[#fafdfc] text-[13px]">
                      <td className="px-4 py-3 text-[#006252] font-medium">{r.rule_type}</td>
                      <td className="px-4 py-3 text-[#2d383a]">{r.rule_key}</td>
                      <td className="px-4 py-3 text-[#57696d]">{r.description}</td>
                      <td className="px-4 py-3 text-[#8ba09c]">v{r.version}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={function() { openEdit(r); }} className="text-[12px] text-[#00836f] hover:underline">編輯</button>
                          <button onClick={function() { handleDelete(r); }} className="text-[12px] text-red-400 hover:underline">刪除</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <a href="/member" className="text-[13px] text-[#00836f] hover:underline">&larr; 返回</a>
        </div>
      </div>
    </div>
  );
}
