"use client";

export default function DashboardFooter() {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border-t-3 border-gray-600 text-center mt-8">
      <p className="text-gray-400 text-sm mb-2">
        <strong className="text-gray-300">📊 Data Source:</strong> Allegheny County 911 Dispatches (2015-2024) | Western Pennsylvania Regional Data Center
      </p>
      <p className="text-gray-500 text-xs italic">
        This interactive data story was created using techniques from "The Art of Data Visualization" course,
        emphasizing <strong className="text-gray-400">truthful, functional, beautiful, insightful, and ethically responsible</strong> data presentation.
      </p>
    </div>
  );
}

