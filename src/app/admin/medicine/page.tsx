'use client';

import { useEffect, useState } from 'react';

export default function MedicinePanel() {
  const [meds, setMeds] = useState([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    company: ''
  });

  useEffect(() => {
    fetch('/api/medicine')
      .then(res => res.json())
      .then(data => setMeds(data.meds || []));
  }, []);

  const addMedicine = async () => {
    await fetch('/api/medicine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    location.reload();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">
        💰 Medicine Price Management
      </h1>

      {/* FORM */}
      <div className="bg-gray-50 p-4 rounded-xl space-y-3">

        <input
          placeholder="Medicine Name"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Price"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          placeholder="Company"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />

        <button
          onClick={addMedicine}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Add Medicine
        </button>

      </div>

      {/* LIST */}
      <div className="mt-6 space-y-2">

        {meds.map((m: any) => (
          <div
            key={m._id}
            className="bg-white p-3 rounded shadow flex justify-between"
          >
            <div>
              <p className="font-semibold">{m.name}</p>
              <p className="text-sm text-gray-500">{m.company}</p>
            </div>

            <p className="font-bold text-green-600">
              Rs {m.price}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}