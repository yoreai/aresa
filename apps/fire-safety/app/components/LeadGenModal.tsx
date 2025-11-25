"use client";

import { useState } from "react";

export default function LeadGenModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Send to email/CRM when ready
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-500 hover:bg-red-600 px-8 py-4 rounded-lg font-bold text-lg transition"
      >
        Request Assessment →
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>

            {!submitted ? (
              <>
                <h3 className="text-2xl font-bold mb-4">Get Your Assessment</h3>
                <p className="text-gray-400 mb-6">
                  Reduce false alarms by 30-50% with AI-approved fire alarm systems
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Building Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your building name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Contact Email</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      className="w-full bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Current False Alarm Rate (if known)
                    </label>
                    <select className="w-full bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Not sure</option>
                      <option>Low ({"<"}10%)</option>
                      <option>Moderate (10-30%)</option>
                      <option>High ({">"}30%)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-lg font-bold transition"
                  >
                    Get Free Assessment
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✓</div>
                <h3 className="text-2xl font-bold mb-2">Request Received!</h3>
                <p className="text-gray-400">We'll contact you within 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}



