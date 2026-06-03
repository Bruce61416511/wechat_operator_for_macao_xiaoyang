import { useState, useEffect } from "react";
import AIAssistantCard from "./apply/AIAssistantCard.jsx";
import BasicInfoForm from "./apply/BasicInfoForm.jsx";
import CareerForm from "./apply/CareerForm.jsx";
import QualificationForm from "./apply/QualificationForm.jsx";
import DeclarationForm from "./apply/DeclarationForm.jsx";
import { submitApplication } from "../services/api.js";

/* ── Icons ─────────────────────────────────── */

function UserIcon({ className = "h-7 w-7" }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.8" fill="currentColor" />
      <path d="M4.8 21c1-4.2 3.5-6.4 7.2-6.4s6.2 2.2 7.2 6.4" fill="currentColor" />
    </svg>
  );
}

function BriefcaseIcon({ className = "h-7 w-7" }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="13" rx="2" stroke="currentColor" strokeWidth="2" width="18" x="3" y="8" />
      <path d="M9 8V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V8M3 13h18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function FolderIcon({ className = "h-7 w-7" }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M3.5 7.5h6l2 2h9v9.5a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2z" fill="currentColor" />
      <path d="M8 15h8" stroke="#fff" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "h-7 w-7" }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M12 3 20 6.5v5.8c0 5.1-2.9 8.6-8 10.7-5.1-2.1-8-5.6-8-10.7V6.5z" fill="currentColor" />
      <path d="m8.6 12 2.2 2.2 4.7-5" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M4 12h16M13 5l7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <rect height="16" rx="2" stroke="currentColor" strokeWidth="2" width="14" x="5" y="4" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M4 14v3a3 3 0 0 0 3 3h1v-6H4zM20 14v3a3 3 0 0 1-3 3h-1v-6h4z" fill="currentColor" />
      <path d="M4 14a8 8 0 0 1 8-8v0a8 8 0 0 1 8 8" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  );
}

/* ── Config ─────────────────────────────────── */

const STEPS = [
  { title: "基本信息", desc: "完善機構/個人基本信息", icon: UserIcon, color: "bg-[#006252]" },
  { title: "從業經歷", desc: "填寫從業背景與主要方向", icon: BriefcaseIcon, color: "bg-[#087765]" },
  { title: "資質文件", desc: "上傳相關資質或證明材料", icon: FolderIcon, color: "bg-[#279b79]" },
  { title: "聲明與授權", desc: "閱讀並確認聲明與授權書", icon: ShieldCheckIcon, color: "bg-[#3db29b]" },
];

const INITIAL_FORM = {
  username: "",
  password: "",
  applicant_name: "",
  id_number: "",
  applicant_phone: "",
  applicant_address: "",
  requested_tier: "",
  career_history: "",
  qualifications: "",
  qualification_files: "",
  declaration_agreed: false,
};

/* ── Step Row ─────────────────────────────────── */

function StatusBadge({ step, active }) {
  const isDone = step.status === "done";
  const isWarning = step.status === "warn";
  const isDanger = step.status === "danger";

  let bg = "bg-[#e5eceb]";
  let textColor = "text-[#68777a]";
  let label = step.statusText;

  if (active) {
    bg = "bg-[#e7f5f0]";
    textColor = "text-[#006252]";
    label = "填寫中";
  } else if (isDone) {
    bg = "bg-[#e7f5f0]";
    textColor = "text-[#006252]";
  } else if (isWarning) {
    bg = "bg-[#fff8e9]";
    textColor = "text-[#ad7b00]";
  } else if (isDanger) {
    bg = "bg-[#fef0f0]";
    textColor = "text-[#c53030]";
  }

  return (
    <span className={`rounded-[6px] px-3 py-1 text-[12px] font-bold ${bg} ${textColor}`}>
      {label}
    </span>
  );
}

function StepRow({ step, index, activeStep, onClick }) {
  const Icon = step.icon;
  const active = index === activeStep;

  return (
    <button
      onClick={() => onClick(index)}
      className={[
        "grid w-full grid-cols-[72px_1fr_auto_38px] items-center border-b border-[#e5eceb] px-[18px] py-[14px] text-left",
        "transition-colors hover:bg-[#f8fbfb]",
        active ? "bg-[#f0faf4]" : "",
        "last:border-b-0",
      ].join(" ")}
      type="button"
    >
      <span className={`grid h-[50px] w-[50px] place-items-center rounded-full text-white ${step.color}`}>
        <Icon />
      </span>
      <span>
        <span className="block text-[20px] font-bold leading-none text-[#1b292b]">{step.title}</span>
        <span className="mt-2 block text-[14px] font-medium text-[#6a7679]">{step.desc}</span>
      </span>
      <StatusBadge active={active} step={step} />
      <span className="text-[#57696d]"><ChevronIcon /></span>
    </button>
  );
}

/* ── Progress ─────────────────────────────────── */

function ProgressBar({ pct }) {
  return (
    <div className="mt-4 h-[8px] rounded-full bg-[#e1e2df]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#279b79] to-[#006252] transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ── Form Renderer ─────────────────────────────────── */

function StepForm({ stepIndex, formData, onFormChange, errors }) {
  if (stepIndex === 0) {
    return <BasicInfoForm data={formData} onChange={onFormChange} errors={errors} />;
  }
  if (stepIndex === 1) {
    return <CareerForm data={formData} onChange={onFormChange} errors={errors} />;
  }
  if (stepIndex === 2) {
    return <QualificationForm data={formData} onChange={onFormChange} errors={errors} />;
  }
  if (stepIndex === 3) {
    return <DeclarationForm data={formData} onChange={onFormChange} errors={errors} />;
  }

  return (
    <div className="flex h-64 items-center justify-center rounded-[9px] border border-dashed border-[#cfd9d7] bg-[#f8fbfb]">
      <p className="text-[16px] font-medium text-[#9ba8aa]">此步驟表單即將上線</p>
    </div>
  );
}

/* ── Main ─────────────────────────────────── */

export default function ApplyWorkspace({ onProgressChange }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function validateStep(stepIndex) {
    const errs = {};
    if (stepIndex === 0) {
      if (!formData.username || formData.username.length < 6) errs.username = "請輸入有效的郵箱地址";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) errs.username = "請輸入有效的郵箱格式";
      if (!formData.password || formData.password.length < 6) errs.password = "密碼至少 6 位";
      if (!formData.applicant_name) errs.applicant_name = "請輸入姓名";
      if (!formData.id_number || formData.id_number.length < 15) errs.id_number = "請輸入有效證件號碼";
      if (!formData.applicant_phone || formData.applicant_phone.length < 5) errs.applicant_phone = "請輸入聯繫電話";
    }
    if (stepIndex === 1) {
      if (!formData.career_history || formData.career_history.trim().length < 10) {
        errs.career_history = "請至少填寫10個字的從業經歷";
      }
    }
    if (stepIndex === 2) {
      const files = (() => {
        try {
          const raw = formData.qualification_files;
          return raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : [];
        } catch { return []; }
      })();
      if (files.length === 0) errs.qualification_files = "請至少上傳一張資質文件";
    }
    if (stepIndex === 3) {
      if (!formData.declaration_agreed) errs.declaration_agreed = "請閱讀並勾選聲明與授權";
    }
    return errs;
  }

  function handleNext() {
    const errs = validateStep(activeStep);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (activeStep < STEPS.length - 1) {
      setActiveStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  }

  function handleSaveDraft() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const { declaration_agreed, ...payload } = formData;
      await submitApplication(payload);
      alert("申請已成功提交！");
      window.location.href = "/";
    } catch (err) {
      setSubmitError(err.message || "提交失敗，請重試");
    } finally {
      setSubmitting(false);
    }
  }

  function parseFiles(raw) {
    try {
      if (!raw) return [];
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch { return []; }
  }

  function getStepStatus(index) {
    if (index === 0) {
      const hasData = formData.username || formData.applicant_name || formData.id_number;
      if (!hasData) return { status: "danger", statusText: "未填寫" };
      const errs = validateStep(0);
      if (Object.keys(errs).length > 0) return { status: "warn", statusText: "待完善" };
      return { status: "done", statusText: "已完成" };
    }
    if (index === 1) {
      if (!formData.career_history || formData.career_history.trim().length < 10) {
        return { status: "danger", statusText: "未填寫" };
      }
      return { status: "done", statusText: "已完成" };
    }
    if (index === 2) {
      if (parseFiles(formData.qualification_files).length === 0) {
        return { status: "danger", statusText: "未上傳" };
      }
      return { status: "done", statusText: "已完成" };
    }
    if (index === 3) {
      if (!formData.declaration_agreed) return { status: "danger", statusText: "未確認" };
      return { status: "done", statusText: "已確認" };
    }
    return { status: index < activeStep ? "done" : "danger", statusText: index < activeStep ? "已完成" : "未填寫" };
  }

  const stepsWithStatus = STEPS.map((s, i) => ({ ...s, ...getStepStatus(i) }));
  const doneCount = stepsWithStatus.filter(s => s.status === "done").length;
  const pct = Math.round((doneCount / STEPS.length) * 100);

  useEffect(() => {
    onProgressChange?.(pct);
  }, [pct, onProgressChange]);

  return (
    <div className="mx-auto mt-5 grid max-w-[1290px] grid-cols-[606px_1fr] items-stretch gap-[28px]">
      <AIAssistantCard />

      <div className="flex h-full flex-col gap-4">
        <section className="flex-1 rounded-[14px] border border-[#dde7e5] bg-white/88 px-[30px] py-[28px] shadow-[0_16px_34px_rgba(35,70,74,0.13)] backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <h2 className="text-[30px] font-bold leading-none text-[#142528]">結構化申請卡</h2>
            <span className="rounded-[7px] border border-[#cfd9d7] bg-white px-4 py-2 text-[13px] font-medium text-[#68777a]">
              申請編號：APP-20250527-00123
            </span>
          </div>

          <div className="mt-9">
            <div className="flex items-end justify-between">
              <span className="text-[16px] font-semibold text-[#1b292b]">當前進度</span>
              <span className="text-[38px] font-bold leading-none text-[#006252]">{pct}%</span>
            </div>
            <ProgressBar pct={pct} />
          </div>

          <div className="mt-6 overflow-hidden rounded-[12px] border border-[#dbe4e2]">
            {stepsWithStatus.map((step, index) => (
              <StepRow
                key={step.title}
                step={step}
                index={index}
                activeStep={activeStep}
                onClick={(i) => {
                  if (i <= activeStep) setActiveStep(i);
                }}
              />
            ))}
          </div>

          <div className="mt-7">
            <h3 className="mb-5 text-[22px] font-bold text-[#142528]">
              步驟 {activeStep + 1}：{STEPS[activeStep].title}
            </h3>
            <StepForm
              stepIndex={activeStep}
              formData={formData}
              onFormChange={setFormData}
              errors={errors}
            />
          </div>

          <p className="mt-6 flex items-center gap-2 text-[14px] font-medium text-[#667477]">
            <ClockIcon />
            可隨時保存草稿，預計還需
            <span className="font-bold text-[#006252]">5 分鐘</span>
          </p>

          {submitError && (
            <p className="mb-4 text-center text-[14px] font-medium text-red-500">{submitError}</p>
          )}
          <div className="mt-7 grid grid-cols-[164px_1fr_164px] gap-5">
            <button
              onClick={handleSaveDraft}
              className="flex h-[56px] items-center justify-center gap-3 rounded-[7px] border border-[#006252] bg-white text-[18px] font-bold text-[#006252]"
              type="button"
            >
              <NoteIcon />
              {saved ? "已保存 ✓" : "保存草稿"}
            </button>
            <button onClick={handleNext} disabled={submitting}
              className="flex h-[56px] items-center justify-center gap-5 rounded-[7px] bg-gradient-to-br from-[#00836f] to-[#006252] text-[22px] font-bold text-white shadow-[0_10px_20px_rgba(0,93,80,0.24)]"
              type="button"
            >
              {submitting ? "提交中..." : activeStep === STEPS.length - 1 ? "提交申請" : "繼續填寫"}
              <ArrowRightIcon />
            </button>
            <button
              className="flex h-[56px] items-center justify-center gap-3 rounded-[7px] border border-[#006252] bg-white text-[18px] font-bold text-[#006252]"
              type="button"
            >
              <HeadsetIcon />
              轉人工諮詢
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}