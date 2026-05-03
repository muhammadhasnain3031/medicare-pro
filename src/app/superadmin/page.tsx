'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Tenant {
  _id:          string;
  name:         string;
  slug:         string;
  email:        string;
  phone:        string;
  plan:         string;
  active:       boolean;
  primaryColor: string;
  createdAt:    string;
}

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const router           = useRouter();
  const [tenants, setTenants]         = useState<Tenant[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showAdd, setShowAdd]         = useState(false);
  const [addForm, setAddForm]         = useState({
    name: '', email: '', phone: '', address: '',
    plan: 'basic', primaryColor: '#2563eb',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/tenants')
      .then(r => r.json())
      .then(d => { setTenants(d.tenants || []); setLoading(false); });
  }, []);

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/tenants/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ active: !active }),
    });
    setTenants(prev => prev.map(t => t._id === id ? { ...t, active: !active } : t));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its data?`)) return;
    await fetch(`/api/tenants/${id}`, { method: 'DELETE' });
    setTenants(prev => prev.filter(t => t._id !== id));
  };

  const handleAdd = async () => {
    if (!addForm.name || !addForm.email) return;
    setSaving(true);
    const res = await fetch('/api/tenants', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(addForm),
    });
    const d = await res.json();
    if (d.tenant) {
      setTenants(prev => [d.tenant, ...prev]);
      setShowAdd(false);
      setAddForm({ name:'', email:'', phone:'', address:'', plan:'basic', primaryColor:'#2563eb' });
    }
    setSaving(false);
  };

  const active   = tenants.filter(t => t.active).length;
  const inactive = tenants.filter(t => !t.active).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Super Admin Navbar */}
      <nav className="bg-gradient-to-r from-violet-700 to-purple-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-lg">
            S
          </div>
          <div>
            <p className="text-white font-bold text-base">MediCare Pro</p>
            <p className="text-purple-200 text-xs">Super Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/80 text-sm">{user?.name}</span>
          <button onClick={() => { logout(); }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hospital Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage all hospitals on the platform</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition-colors">
            + Add Hospital
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Hospitals', value:tenants.length,           icon:'🏥', color:'bg-violet-50 border-violet-200' },
            { label:'Active',          value:active,                   icon:'✅', color:'bg-green-50 border-green-200'   },
            { label:'Inactive',        value:inactive,                 icon:'❌', color:'bg-red-50 border-red-200'       },
            { label:'Pro Plans',       value:tenants.filter(t=>t.plan==='pro').length, icon:'⭐', color:'bg-yellow-50 border-yellow-200'},
          ].map(s => (
            <div key={s.label} className={`${s.color} border rounded-2xl p-4`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Hospitals Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tenants.map(tenant => (
              <div key={tenant._id} className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-lg transition-shadow ${
                tenant.active ? 'border-gray-100' : 'border-red-100 opacity-70'
              }`}>

                {/* Color Header */}
                <div className="h-3" style={{ background: tenant.primaryColor }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl"
                        style={{ background: tenant.primaryColor }}>
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{tenant.name}</p>
                        <p className="text-xs text-gray-500">/{tenant.slug}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      tenant.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {tenant.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    {[
                      ['📧', tenant.email],
                      ['📞', tenant.phone || 'N/A'],
                      ['📅', new Date(tenant.createdAt).toLocaleDateString()],
                    ].map(([icon, val]) => (
                      <div key={icon as string} className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{icon}</span>
                        <span className="truncate">{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Plan Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                      tenant.plan==='enterprise' ? 'bg-purple-100 text-purple-700' :
                      tenant.plan==='pro'        ? 'bg-blue-100 text-blue-700'     :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {tenant.plan === 'pro' ? '⭐ Pro' : tenant.plan === 'enterprise' ? '💎 Enterprise' : '🆓 Basic'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {tenant.slug}.medicare.com
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleToggle(tenant._id, tenant.active)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-colors ${
                        tenant.active
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}>
                      {tenant.active ? '⏸ Deactivate' : '▶ Activate'}
                    </button>
                    <button onClick={() => handleDelete(tenant._id, tenant.name)}
                      className="py-2 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-xl text-xs font-semibold transition-colors">
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {tenants.length === 0 && (
              <div className="col-span-3 text-center py-20 text-gray-400">
                <p className="text-4xl mb-3">🏥</p>
                <p>No hospitals yet</p>
                <button onClick={() => setShowAdd(true)}
                  className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700">
                  Add First Hospital
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Hospital Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Add New Hospital</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              {[
                { key:'name',    label:'Hospital Name *', type:'text',  placeholder:'City Care Hospital' },
                { key:'email',   label:'Email *',         type:'email', placeholder:'info@hospital.com'  },
                { key:'phone',   label:'Phone',           type:'text',  placeholder:'+92-42-1234567'      },
                { key:'address', label:'Address',         type:'text',  placeholder:'City, Country'       },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={addForm[f.key as keyof typeof addForm]}
                    onChange={e => setAddForm({...addForm, [f.key]: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Plan</label>
                  <select value={addForm.plan} onChange={e => setAddForm({...addForm, plan: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Brand Color</label>
                  <input type="color" value={addForm.primaryColor}
                    onChange={e => setAddForm({...addForm, primaryColor: e.target.value})}
                    className="w-full h-10 px-2 border border-gray-200 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={saving}
                  className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Hospital'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}