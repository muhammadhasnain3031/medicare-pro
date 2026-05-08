'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  plan: string;
  active: boolean;
  primaryColor: string;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // States for Tenants
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for Adding Hospital
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '', email: '', phone: '', address: '',
    plan: 'basic', primaryColor: '#2563eb',
  });

  // States for Adding Staff
  const [showStaff, setShowStaff] = useState(false);
  const [staffTenant, setStaffTenant] = useState<Tenant | null>(null);
  const [staffSaving, setStaffSaving] = useState(false);
  const [staffResult, setStaffResult] = useState<any>(null);
  const [staffForm, setStaffForm] = useState({
    name: '', email: '', password: '', role: 'admin', phone: '',
    specialization: '', fee: 0,
  });

  // Fetch Hospitals on Load
  useEffect(() => {
    fetch('/api/tenants')
      .then(r => r.json())
      .then(d => { setTenants(d.tenants || []); setLoading(false); });
  }, []);

  // Handlers for Hospitals
  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/tenants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    });
    const d = await res.json();
    if (d.tenant) {
      setTenants(prev => [d.tenant, ...prev]);
      setShowAdd(false);
      setAddForm({ name: '', email: '', phone: '', address: '', plan: 'basic', primaryColor: '#2563eb' });
    }
    setSaving(false);
  };

  // Handler for Creating Staff
  const handleCreateStaff = async () => {
    if (!staffTenant || !staffForm.name || !staffForm.email || !staffForm.password) return;
    setStaffSaving(true);
    try {
      const res = await fetch('/api/superadmin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: staffTenant.slug,
          ...staffForm,
        }),
      });
      const d = await res.json();
      if (d.success) setStaffResult(d.loginInfo);
      else alert(d.message || "Failed to create staff");
    } catch (err) {
      console.error(err);
    }
    setStaffSaving(false);
  };

  // Stats
  const active = tenants.filter(t => t.active).length;
  const inactive = tenants.filter(t => !t.active).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Super Admin Navbar */}
      <nav className="bg-gradient-to-r from-violet-700 to-purple-800 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-lg border border-white/10">S</div>
          <div>
            <p className="text-white font-bold text-base">MediCare Pro</p>
            <p className="text-purple-200 text-xs uppercase tracking-wider">Super Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/80 text-sm hidden md:block">{user?.name}</span>
          <button onClick={() => logout()} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-all">Sign Out</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hospital Management</h1>
            <p className="text-gray-500 text-sm mt-1">Global control of all registered hospitals</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95">+ Add New Hospital</button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Hospitals', value: tenants.length, icon: '🏥', color: 'bg-white border-gray-100' },
            { label: 'Active', value: active, icon: '✅', color: 'bg-green-50 border-green-100' },
            { label: 'Inactive', value: inactive, icon: '❌', color: 'bg-red-50 border-red-100' },
            { label: 'Pro Plans', value: tenants.filter(t => t.plan === 'pro').length, icon: '⭐', color: 'bg-yellow-50 border-yellow-100' },
          ].map(s => (
            <div key={s.label} className={`${s.color} border-2 rounded-2xl p-4 shadow-sm`}>
              <p className="text-2xl mb-2">{s.icon}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Hospitals Table/Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map(tenant => (
              <div key={tenant._id} className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-xl transition-all ${tenant.active ? 'border-gray-100' : 'border-red-100 grayscale-[0.5]'}`}>
                <div className="h-3" style={{ background: tenant.primaryColor }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner" style={{ background: tenant.primaryColor }}>
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{tenant.name}</p>
                        <p className="text-xs text-gray-500 font-mono tracking-tighter">/{tenant.slug}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${tenant.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{tenant.active ? 'Active' : 'Paused'}</span>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium"><span>📧</span> <span className="truncate">{tenant.email}</span></div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium"><span>📞</span> {tenant.phone || 'No Phone'}</div>
                    <div className="flex items-center justify-between mt-3">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${tenant.plan === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{tenant.plan.toUpperCase()}</span>
                       <span className="text-[10px] text-gray-400 font-mono">{tenant.slug}.medicare.com</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-50">
                    <button onClick={() => { setStaffTenant(tenant); setShowStaff(true); setStaffResult(null); }}
                      className="w-full py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                      👥 Add Staff Account
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleToggle(tenant._id, tenant.active)}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${tenant.active ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {tenant.active ? '⏸ Pause' : '▶ Resume'}
                      </button>
                      <button onClick={() => handleDelete(tenant._id, tenant.name)}
                        className="py-2 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl text-[10px] font-black uppercase transition-all">🗑 Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: ADD HOSPITAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-xl tracking-tight">Register Hospital</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-900 transition-colors text-2xl">✕</button>
            </div>
            <div className="space-y-4">
              {['name', 'email', 'phone', 'address'].map(key => (
                <div key={key}>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">{key} {key === 'name' || key === 'email' ? '*' : ''}</label>
                  <input type={key === 'email' ? 'email' : 'text'} 
                    value={(addForm as any)[key]}
                    onChange={e => setAddForm({ ...addForm, [key]: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-violet-500 transition-all" 
                    placeholder={`Enter ${key}...`} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Plan</label>
                  <select value={addForm.plan} onChange={e => setAddForm({ ...addForm, plan: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm">
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Brand Color</label>
                  <input type="color" value={addForm.primaryColor} onChange={e => setAddForm({ ...addForm, primaryColor: e.target.value })}
                    className="w-full h-[44px] p-1 bg-gray-50 border-none rounded-2xl cursor-pointer" />
                </div>
              </div>
              <button onClick={handleAdd} disabled={saving} className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold mt-4 shadow-lg hover:bg-violet-700 transition-all disabled:opacity-50">
                {saving ? 'Creating System...' : 'Launch Hospital System'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD STAFF */}
      {showStaff && staffTenant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-xl tracking-tight">Add Hospital Staff</h3>
                <p className="text-violet-600 text-[10px] font-bold uppercase mt-1">Target: {staffTenant.name}</p>
              </div>
              <button onClick={() => { setShowStaff(false); setStaffResult(null); }} className="text-gray-400 hover:text-gray-900 transition-colors text-2xl">✕</button>
            </div>

            {staffResult ? (
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="bg-green-50 border border-green-100 rounded-3xl p-6 text-center">
                  <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-green-200">✓</div>
                  <p className="font-black text-green-800 text-lg">Staff Account Active!</p>
                </div>
                <div className="space-y-2">
                  {[
                    ['Hospital URL', staffResult.url],
                    ['Login Email', staffResult.email],
                    ['Temp Password', staffResult.password],
                    ['Hospital Code', staffResult.hospitalCode]
                  ].map(([lbl, val]) => (
                    <div key={lbl} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{lbl}</p>
                      <p className="text-sm font-mono font-bold text-gray-900 break-all">{val}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => {
                  const txt = `Hospital: ${staffTenant.name}\nURL: ${staffResult.url}\nEmail: ${staffResult.email}\nPassword: ${staffResult.password}\nCode: ${staffResult.hospitalCode}`;
                  navigator.clipboard.writeText(txt);
                  alert('Credentials Copied!');
                }} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg hover:bg-green-700 transition-all">📋 Copy All Credentials</button>
                <button onClick={() => { setStaffResult(null); setStaffForm({ name: '', email: '', password: '', role: 'admin', phone: '', specialization: '', fee: 0 }); }}
                  className="w-full py-3 text-gray-500 font-bold hover:text-violet-600 transition-all">Create Another Account</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Full Name *</label>
                    <input value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-violet-500" placeholder="Ahmad Khan" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Role *</label>
                    <select value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm">
                      <option value="admin">Admin</option>
                      <option value="doctor">Doctor</option>
                      <option value="receptionist">Receptionist</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Email *</label>
                  <input type="email" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-violet-500" placeholder="staff@hospital.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Password *</label>
                  <input type="text" value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-violet-500" placeholder="Set password" />
                </div>
                {staffForm.role === 'doctor' && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-violet-50 rounded-2xl border border-violet-100">
                    <div>
                      <label className="block text-[10px] font-black text-violet-400 uppercase mb-1">Specialty</label>
                      <input value={staffForm.specialization} onChange={e => setStaffForm({ ...staffForm, specialization: e.target.value })} className="w-full px-3 py-2 bg-white border-none rounded-xl text-xs" placeholder="Surgeon" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-violet-400 uppercase mb-1">Fee (PKR)</label>
                      <input type="number" value={staffForm.fee || ''} onChange={e => setStaffForm({ ...staffForm, fee: Number(e.target.value) })} className="w-full px-3 py-2 bg-white border-none rounded-xl text-xs" placeholder="2000" />
                    </div>
                  </div>
                )}
                <button onClick={handleCreateStaff} disabled={staffSaving} className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold mt-4 shadow-lg hover:bg-violet-700 transition-all disabled:opacity-50">
                  {staffSaving ? 'Deploying Account...' : 'Generate Account'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}