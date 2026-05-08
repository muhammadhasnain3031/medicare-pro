"use client";
import { useState } from "react";

export default function AddHospital() {
  const [formData, setFormData] = useState({ name: "", slug: "", adminEmail: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch("/api/hospitals", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Hospital Added Successfully!");
      setFormData({ name: "", slug: "", adminEmail: "" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Add New Hospital
        </h2>
        <p className="text-slate-400 mb-8 text-sm">System mein naya tenant register karein.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Hospital Name</label>
            <input
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. City Care Hospital"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              value={formData.name}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">URL Slug (Unique)</label>
            <input
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. city-care"
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              value={formData.slug}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Admin Email</label>
            <input
              type="email"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="admin@hospital.com"
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              value={formData.adminEmail}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating..." : "Register Hospital"}
          </button>
        </form>
      </div>
    </div>
  );
}