import React from "react";

const toneMap = {
  primary: {
    wrapper: "bg-indigo-50 border border-indigo-100 text-indigo-900",
    chip: "bg-indigo-100 text-indigo-700"
  },
  success: {
    wrapper: "bg-emerald-50 border border-emerald-100 text-emerald-900",
    chip: "bg-emerald-100 text-emerald-700"
  },
  warning: {
    wrapper: "bg-amber-50 border border-amber-100 text-amber-900",
    chip: "bg-amber-100 text-amber-700"
  },
  neutral: {
    wrapper: "bg-white border border-slate-200 text-slate-900",
    chip: "bg-slate-100 text-slate-700"
  }
};

const StatCard = ({ label, value, sublabel, icon, tone = "primary" }) => {
  const palette = toneMap[tone] || toneMap.primary;

  return (
    <article
      className={`rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${palette.wrapper}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-black/60">{label}</p>
          <p className="text-3xl font-bold leading-tight">{value}</p>
          {sublabel && <p className="text-sm mt-1 opacity-75">{sublabel}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${palette.chip}`} aria-hidden>
            <span className="text-lg">{icon}</span>
          </div>
        )}
      </div>
    </article>
  );
};

export default StatCard;
