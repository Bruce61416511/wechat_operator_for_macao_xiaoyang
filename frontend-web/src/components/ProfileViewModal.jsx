export default function ProfileViewModal({ profile, onClose }) {
  const fileUrls = (() => {
    try {
      const raw = profile?.qualification_files;
      if (!raw) return [];
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch { return []; }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[12px] border border-[#dde7e5] bg-white p-6 shadow-[0_20px_50px_rgba(35,70,74,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-bold text-[#142528]">當前資料</h2>
          <button onClick={onClose} className="text-[#9ba8aa] hover:text-[#57696d] text-[20px] leading-none" type="button">×</button>
        </div>

        <div className="space-y-3 text-[14px]">
          <Row label="用戶名" value={profile?.username} />
          <Row label="真實姓名" value={profile?.real_name} />
          <Row label="手機號" value={profile?.phone} />
          <Row label="郵箱" value={profile?.email || "-"} />
          <Row label="會員級別" value={profile?.tier || "-"} />
          <Row label="年費" value={profile?.annual_fee ? `${profile.annual_fee} 澳門元` : "-"} />
          <Row label="通訊地址" value={profile?.address || "-"} />
          <Row label="註冊時間" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString("zh-CN") : "-"} />

          <div className="pt-2 border-t border-[#e5eceb]">
            <span className="text-[#6a7679] text-[13px]">從業經歷</span>
            <p className="mt-1 text-[#1b292b] font-medium whitespace-pre-wrap">{profile?.career_history || "-"}</p>
          </div>

          <div className="pt-2 border-t border-[#e5eceb]">
            <span className="text-[#6a7679] text-[13px]">資質說明</span>
            <p className="mt-1 text-[#1b292b] font-medium whitespace-pre-wrap">{profile?.qualifications || "-"}</p>
          </div>

          {fileUrls.length > 0 && (
            <div className="pt-2 border-t border-[#e5eceb]">
              <span className="text-[#6a7679] text-[13px]">資質文件</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {fileUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block cursor-pointer group"><img src={url} alt={`資質 ${i + 1}`} className="w-full h-28 object-cover rounded-[4px] border border-[#dde7e5] group-hover:opacity-80 transition-opacity" /></a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[#6a7679]">{label}</span>
      <span className="font-medium text-[#1b292b]">{value}</span>
    </div>
  );
}
