"use client";

export default function GradientHeader() {
  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-600/30">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white text-center">
        🔥 The Hidden Fire Safety Crisis in Allegheny County
      </h1>
      <h2 className="text-base md:text-lg lg:text-xl text-slate-300 text-center mt-3 italic font-light">
        A Data-Driven Call for Smarter Emergency Response and Prevention
      </h2>
    </div>
  );
}
