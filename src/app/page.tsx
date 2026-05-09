import Link from 'next/link';

const MODULES = [
  { icon:'🤖', title:'AI Prescriptions',      desc:'Groq AI se smart prescription generation aur diagnosis support',     color:'from-violet-500 to-purple-600'   },
  { icon:'💊', title:'Pharmacy Management',   desc:'Medicine stock, expiry alerts, auto-billing aur supplier tracking', color:'from-green-500 to-emerald-600'   },
  { icon:'🧪', title:'Laboratory Module',     desc:'Test booking, results upload, PDF reports aur payment tracking',    color:'from-orange-500 to-amber-600'    },
  { icon:'💰', title:'Complete Billing Suite',desc:'Professional invoices, partial payments, insurance claims',         color:'from-blue-500 to-indigo-600'     },
  { icon:'🛏️', title:'Bed & Room Management', desc:'ICU/Ward/Private rooms, real-time occupancy, discharge summary',   color:'from-indigo-500 to-violet-600'   },
  { icon:'📊', title:'Analytics Dashboard',   desc:'Revenue charts, KPIs, top doctors, appointment trends',            color:'from-teal-500 to-cyan-600'       },
  { icon:'📱', title:'WhatsApp Notifications',desc:'Auto appointment reminders, bill alerts, bulk messaging',           color:'from-emerald-500 to-teal-600'    },
  { icon:'🔐', title:'Security & Audit Logs', desc:'Login history, IP tracking, action logs, threat detection',         color:'from-red-500 to-rose-600'        },
  { icon:'📋', title:'EMR System',            desc:'Complete electronic medical records, AI health summary, visit history', color:'from-cyan-500 to-blue-600'   },
  { icon:'🌐', title:'Multi-Tenant SaaS',     desc:'Multiple hospitals, isolated data, custom branding per hospital',   color:'from-pink-500 to-rose-600'       },
  { icon:'🗓️', title:'Smart Scheduling',      desc:'AI-powered slot suggestions, doctor availability, queue management',color:'from-yellow-500 to-orange-600'   },
  { icon:'💬', title:'AI Chatbot',            desc:'Role-aware 24/7 assistant for doctors, patients and staff',         color:'from-purple-500 to-indigo-600'   },
];

const ROLES = [
  { emoji:'👑', role:'Super Admin',   gradient:'from-violet-600 to-purple-700', badge:'Platform',  features:['Manage all hospitals','Subscription plans','Revenue analytics','Tenant control']            },
  { emoji:'⚙️', role:'Hospital Admin',gradient:'from-blue-600 to-indigo-700',   badge:'Admin',     features:['Staff management','All departments','Analytics dashboard','System settings']              },
  { emoji:'👨‍⚕️', role:'Doctor',        gradient:'from-cyan-600 to-teal-700',    badge:'Doctor',    features:['AI prescriptions','Patient EMR','Appointment calendar','Smart scheduling']               },
  { emoji:'💁', role:'Receptionist',  gradient:'from-pink-600 to-rose-700',     badge:'Reception', features:['Book appointments','Patient queue','Invoice creation','Room booking']                      },
  { emoji:'👩‍⚕️', role:'Nurse',         gradient:'from-teal-600 to-emerald-700', badge:'Nurse',     features:['Record vitals','Nurse notes','Patient care','Bed management']                            },
  { emoji:'🔬', role:'Lab Staff',     gradient:'from-orange-500 to-amber-600',  badge:'Lab',       features:['Manage tests','Upload results','PDF reports','Payment tracking']                          },
  { emoji:'💊', role:'Pharmacist',    gradient:'from-green-600 to-emerald-700', badge:'Pharmacy',  features:['Medicine stock','Expiry alerts','Pharmacy billing','Low stock alerts']                    },
  { emoji:'🤒', role:'Patient',       gradient:'from-slate-600 to-gray-700',    badge:'Patient',   features:['Book appointments','View prescriptions','Pay online','Medical records']                   },
];

const DEMOS = [
  { role:'Super Admin',  email:'superadmin@medicare.com', pass:'super123',   g:'from-violet-600 to-purple-700' },
  { role:'Admin',        email:'admin@medicare.com',      pass:'admin123',   g:'from-blue-600 to-indigo-700'   },
  { role:'Doctor',       email:'doctor@medicare.com',     pass:'doctor123',  g:'from-cyan-600 to-teal-700'     },
  { role:'Patient',      email:'patient@medicare.com',    pass:'patient123', g:'from-slate-600 to-gray-700'    },
  { role:'Receptionist', email:'reception@medicare.com',  pass:'recep123',   g:'from-pink-600 to-rose-700'     },
  { role:'Lab Staff',    email:'lab@medicare.com',        pass:'lab123',     g:'from-orange-500 to-amber-600'  },
  { role:'Pharmacist',   email:'pharmacy@medicare.com',   pass:'pharma123',  g:'from-green-600 to-emerald-700' },
  { role:'Nurse',        email:'nurse@medicare.com',      pass:'nurse123',   g:'from-teal-600 to-cyan-700'     },
];

const TECH = [
  { name:'Next.js 14',   bg:'bg-black text-white'        },
  { name:'TypeScript',   bg:'bg-blue-600 text-white'     },
  { name:'MongoDB',      bg:'bg-green-600 text-white'    },
  { name:'Tailwind CSS', bg:'bg-cyan-500 text-white'     },
  { name:'Groq AI',      bg:'bg-purple-600 text-white'   },
  { name:'Twilio',       bg:'bg-red-500 text-white'      },
  { name:'JWT Auth',     bg:'bg-orange-600 text-white'   },
  { name:'jsPDF',        bg:'bg-rose-600 text-white'     },
  { name:'Recharts',     bg:'bg-indigo-600 text-white'   },
  { name:'Mongoose',     bg:'bg-emerald-600 text-white'  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
              M
            </div>
            <div>
              <span className="text-lg font-black text-gray-900">MediCare</span>
              <span className="text-lg font-black text-blue-600"> Pro</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {['Modules','Roles','Demo'].map(s => (
              <a key={s} href={`#${s.toLowerCase()}`}
                className="px-4 py-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-all">
                {s}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="px-3 py-2 text-xs md:text-sm text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all">
              Sign In
            </Link>
            <Link href="/register"
              className="px-3 py-2 text-xs md:text-sm bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-md">
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white pt-20 pb-28 px-4">
        {/* Blobs */}
        <div className="absolute top-20 right-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-white/90 text-xs md:text-sm px-4 py-2 rounded-full mb-8 font-semibold">
            🏥 Complete Hospital Management SaaS · 8 Roles · 12+ Modules
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight">
            Modern Healthcare
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Management Platform
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
            AI-powered hospital system with pharmacy, lab, billing, bed management,
            WhatsApp notifications and complete analytics — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Link href="/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25 text-sm md:text-base">
              🚀 Start Free Trial
            </Link>
            <Link href="/login"
              className="px-8 py-4 bg-white/10 border border-white/20 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-sm md:text-base">
              View Live Demo →
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { v:'8',     l:'User Roles',          icon:'👥' },
              { v:'12+',   l:'Core Modules',        icon:'⚡' },
              { v:'AI',    l:'Powered Features',    icon:'🤖' },
              { v:'Multi', l:'Tenant Architecture', icon:'🌐' },
            ].map(s => (
              <div key={s.l} className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-2xl font-black text-white">{s.v}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules ── */}
      <section id="modules" className="py-20 md:py-28 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-xs uppercase tracking-widest">Complete System</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-2 mb-3">12 Powerful Modules</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
              Every tool a modern hospital needs — from AI to bed management
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MODULES.map(m => (
              <div key={m.title}
                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className={`w-12 h-12 bg-gradient-to-br ${m.color} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md`}>
                  {m.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1.5 group-hover:text-blue-700 transition-colors">
                  {m.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="roles" className="py-20 md:py-28 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-xs uppercase tracking-widest">Role-Based Access</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-2 mb-3">8 Dedicated Dashboards</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
              Each role gets exactly the features they need — nothing more, nothing less
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map(r => (
              <div key={r.role}
                className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                <div className={`bg-gradient-to-br ${r.gradient} p-5 text-white relative overflow-hidden`}>
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
                  <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-white/10 rounded-full" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{r.emoji}</span>
                      <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">{r.badge}</span>
                    </div>
                    <h3 className="font-black text-lg">{r.role}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <ul className="space-y-2 mb-4">
                    {r.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login"
                    className={`block w-full py-2 text-center text-xs font-bold text-white rounded-xl bg-gradient-to-r ${r.gradient} hover:opacity-90 transition-opacity`}>
                    Login as {r.role.split(' ')[0]} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Multi-tenant Banner ── */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs px-3 py-1.5 rounded-full mb-6 font-semibold">
                🌐 Multi-Tenant Architecture
              </span>
              <h2 className="text-3xl md:text-5xl font-black mb-5">
                One Platform,<br />
                <span className="text-indigo-400">Many Hospitals</span>
              </h2>
              <p className="text-slate-300 text-sm md:text-base mb-8 leading-relaxed">
                Each hospital gets its own isolated environment — separate data, custom branding, independent billing and dedicated staff management.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  '🏥 Separate hospital data',
                  '🎨 Custom branding & colors',
                  '👥 Independent staff management',
                  '💰 Isolated billing & revenue',
                  '🔐 Complete data isolation',
                  '📊 Per-hospital analytics',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-green-400 flex-shrink-0">✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon:'🏥', name:'City Care Hospital',   slug:'citycare',  color:'bg-blue-500',   plan:'Pro',        stats:'12 doctors · 8 rooms' },
                { icon:'🏨', name:'Al-Shifa Medical',     slug:'alshifa',   color:'bg-green-500',  plan:'Enterprise', stats:'28 doctors · 20 rooms'},
                { icon:'🏪', name:'Your Hospital Here',   slug:'yourhospital',color:'bg-violet-500',plan:'Custom',    stats:'Join today →'         },
              ].map(h => (
                <div key={h.slug}
                  className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${h.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                      {h.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white">{h.name}</p>
                      <p className="text-slate-400 text-xs">/{h.slug}.medicare.pro</p>
                      <p className="text-slate-400 text-xs">{h.stats}</p>
                    </div>
                    <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-bold flex-shrink-0">
                      {h.plan}
                    </span>
                  </div>
                </div>
              ))}
              <Link href="/login"
                className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-center text-sm transition-colors">
                👑 Super Admin Panel →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-blue-600 font-semibold text-xs uppercase tracking-widest">Built With</span>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 mt-2 mb-8">Modern Tech Stack</h2>
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            {TECH.map(t => (
              <span key={t.name} className={`${t.bg} px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-sm`}>
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo Credentials ── */}
      <section id="demo" className="py-20 md:py-28 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-xs uppercase tracking-widest">Try It Now</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-3">
              Live Demo Accounts
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Login instantly — no signup required
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMOS.map(d => (
              <div key={d.role}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`bg-gradient-to-br ${d.g} p-4 text-white relative overflow-hidden`}>
                  <div className="absolute -right-3 -top-3 w-14 h-14 bg-white/10 rounded-full" />
                  <p className="font-black text-sm relative">{d.role}</p>
                </div>
                <div className="p-3 space-y-2">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{d.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-xs text-gray-400">Password</p>
                    <p className="text-xs font-semibold text-gray-800">{d.pass}</p>
                  </div>
                  <Link href="/login"
                    className={`block w-full py-2 text-center text-xs font-bold text-white rounded-xl bg-gradient-to-r ${d.g} hover:opacity-90 transition-opacity`}>
                    Login Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Ready to Transform<br />Your Hospital?
          </h2>
          <p className="text-blue-100 text-sm md:text-lg mb-10">
            Join hospitals already using MediCare Pro for smarter operations
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"
              className="px-8 py-4 bg-white text-blue-700 font-black rounded-2xl hover:bg-blue-50 transition-colors text-sm md:text-base shadow-lg">
              🚀 Start Free Trial
            </Link>
            <Link href="/login"
              className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors text-sm md:text-base">
              View Demo →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-lg">M</div>
              <div>
                <p className="font-black">MediCare Pro</p>
                <p className="text-slate-400 text-xs">Hospital Management SaaS · 8 Roles · 12+ Modules</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {ROLES.map(r => (
                <Link key={r.role} href="/login"
                  className="text-slate-400 hover:text-white text-xs transition-colors">
                  {r.emoji} {r.role}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-800 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-slate-500 text-xs text-center">
              © 2026 MediCare Pro — Built with Next.js 14 · TypeScript · MongoDB · Groq AI
            </p>
            <div className="flex gap-2">
              {['Next.js','TypeScript','MongoDB','Groq AI'].map(t => (
                <span key={t} className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}