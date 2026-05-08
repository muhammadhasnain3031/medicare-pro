import Link from 'next/link';

const features = [
  { icon:'🏥', title:'Multi-Tenant SaaS',      desc:'Multiple hospitals, each with own data, branding & staff',                  color:'bg-violet-50 border-violet-200' },
  { icon:'🤖', title:'AI-Powered Features',    desc:'AI prescriptions, diagnosis notes, smart scheduling & chatbot support',     color:'bg-blue-50 border-blue-200'    },
  { icon:'📊', title:'Analytics Dashboard',    desc:'Real-time revenue, appointments, top doctors & KPI tracking',               color:'bg-green-50 border-green-200'   },
  { icon:'💊', title:'Pharmacy Module',        desc:'Medicine stock, expiry alerts, auto-billing & supplier management',         color:'bg-pink-50 border-pink-200'    },
  { icon:'🧪', title:'Lab Management',         desc:'Test booking, reports, PDF download & payment tracking',                    color:'bg-orange-50 border-orange-200' },
  { icon:'💰', title:'Complete Billing Suite', desc:'Invoices, partial payments, insurance claims & due tracking',               color:'bg-yellow-50 border-yellow-200' },
  { icon:'🛏️', title:'Bed & Room Management', desc:'ICU/Ward/Private rooms, admissions, discharge & daily charge auto-calc',    color:'bg-indigo-50 border-indigo-200' },
  { icon:'🔐', title:'Audit Logs & Security',  desc:'Login history, IP tracking, action logs & threat detection',                color:'bg-red-50 border-red-200'      },
  { icon:'📱', title:'WhatsApp Notifications', desc:'Auto appointment reminders, bill alerts & bulk messaging via WhatsApp/SMS', color:'bg-teal-50 border-teal-200'    },
];

const roles = [
  {
    role:'Super Admin', emoji:'👑', gradient:'from-violet-600 to-purple-700',
    badge:'Platform', desc:'Manage entire SaaS platform',
    features:['All hospitals management','Subscription plans','Revenue analytics','Activate/deactivate tenants'],
  },
  {
    role:'Hospital Admin', emoji:'⚙️', gradient:'from-blue-600 to-indigo-700',
    badge:'Admin', desc:'Manage your hospital',
    features:['Staff management','All appointments','Billing & revenue','Analytics dashboard'],
  },
  {
    role:'Doctor', emoji:'👨‍⚕️', gradient:'from-cyan-600 to-teal-700',
    badge:'Doctor', desc:'Manage your patients',
    features:['View appointments','AI prescriptions','Patient history','PDF reports'],
  },
  {
    role:'Receptionist', emoji:'💁', gradient:'from-pink-600 to-rose-700',
    badge:'Reception', desc:'Front desk management',
    features:['Book appointments','Patient queue','Billing','Confirm/cancel bookings'],
  },
  {
    role:'Nurse', emoji:'👩‍⚕️', gradient:'from-teal-600 to-emerald-700',
    badge:'Nurse', desc:'Patient care & vitals',
    features:['Record vitals','Nurse notes','Patient list','Bed management'],
  },
  {
    role:'Lab Staff', emoji:'🔬', gradient:'from-orange-600 to-amber-700',
    badge:'Lab', desc:'Laboratory management',
    features:['Add & manage tests','Upload results','Generate PDF reports','Track payments'],
  },
  {
    role:'Pharmacist', emoji:'💊', gradient:'from-green-600 to-emerald-700',
    badge:'Pharmacy', desc:'Medicine management',
    features:['Stock management','Expiry alerts','Pharmacy billing','Low stock alerts'],
  },
  {
    role:'Patient', emoji:'🤒', gradient:'from-slate-600 to-gray-700',
    badge:'Patient', desc:'Self-service portal',
    features:['Book appointments','View prescriptions','Pay online','Medical records'],
  },
];

const demos = [
  { role:'Super Admin',  email:'superadmin@medicare.com', pass:'super123',   gradient:'from-violet-600 to-purple-700' },
  { role:'Admin',        email:'admin@medicare.com',      pass:'admin123',   gradient:'from-blue-600 to-indigo-700'   },
  { role:'Doctor',       email:'doctor@medicare.com',     pass:'doctor123',  gradient:'from-cyan-600 to-teal-700'     },
  { role:'Patient',      email:'patient@medicare.com',    pass:'patient123', gradient:'from-slate-600 to-gray-700'    },
  { role:'Receptionist', email:'reception@medicare.com',  pass:'recep123',   gradient:'from-pink-600 to-rose-700'     },
  { role:'Lab Staff',    email:'lab@medicare.com',        pass:'lab123',     gradient:'from-orange-600 to-amber-700'  },
  { role:'Pharmacist',   email:'pharmacy@medicare.com',   pass:'pharma123',  gradient:'from-green-600 to-emerald-700' },
  { role:'Nurse',        email:'nurse@medicare.com',      pass:'nurse123',   gradient:'from-teal-600 to-cyan-700'     },
];

const stats = [
  { value:'8',    label:'User Roles',         icon:'👥' },
  { value:'15+',  label:'Core Modules',       icon:'⚡' },
  { value:'Multi',label:'Tenant Architecture',icon:'🌐' },
  { value:'AI',   label:'Powered Features',   icon:'🤖' },
];

const techStack = [
  { name:'Next.js 14', color:'bg-black text-white'           },
  { name:'TypeScript', color:'bg-blue-600 text-white'        },
  { name:'MongoDB',    color:'bg-green-600 text-white'       },
  { name:'Tailwind',   color:'bg-cyan-500 text-white'        },
  { name:'Groq AI',    color:'bg-purple-600 text-white'      },
  { name:'Twilio',     color:'bg-red-500 text-white'         },
  { name:'JWT Auth',   color:'bg-orange-600 text-white'      },
  { name:'jsPDF',      color:'bg-rose-600 text-white'        },
  { name:'Recharts',   color:'bg-indigo-600 text-white'      },
  { name:'Mongoose',   color:'bg-emerald-600 text-white'     },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-base md:text-lg">M</div>
            <div>
              <span className="text-lg md:text-xl font-black text-gray-900">MediCare</span>
              <span className="text-lg md:text-xl font-black text-blue-600"> Pro</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {['Features','Roles','Tech Stack'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ','-')}`}
                className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/login" className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-all">
              Sign In
            </Link>
            <Link href="/register" className="px-3 md:px-4 py-2 text-xs md:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-sm">
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 md:pt-20 pb-16 md:pb-24 px-4 md:px-6">
        <div className="absolute top-0 right-0 w-72 md:w-96 h-72 md:h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 md:w-96 h-72 md:h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 text-blue-700 text-xs md:text-sm px-4 py-2 rounded-full mb-6 md:mb-8 font-semibold">
            🏥 Complete Hospital Management SaaS Platform — 8 Roles · 15+ Modules
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-5 md:mb-6 leading-tight">
            Modern Healthcare
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Management Platform
            </span>
          </h1>

          <p className="text-base md:text-xl text-gray-500 mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
            AI-powered hospital management with multi-tenant architecture, bed management, pharmacy, lab, billing, WhatsApp notifications and complete analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-10 md:mb-14 px-4">
            <Link href="/register" className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-blue-200 transition-all text-sm md:text-base">
              Start Free Trial 🚀
            </Link>
            <Link href="/login" className="px-6 md:px-8 py-3 md:py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm md:text-base">
              View Demo →
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto px-4">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
                <p className="text-xl md:text-2xl mb-1">{s.icon}</p>
                <p className="text-xl md:text-2xl font-black text-blue-600">{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-blue-600 font-semibold text-xs md:text-sm uppercase tracking-widest mb-3">Everything Included</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Powerful Modules</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
              15+ modules covering every aspect of hospital management — from AI prescriptions to bed management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {features.map(f => (
              <div key={f.title} className={`${f.color} border rounded-2xl p-5 md:p-6 hover:shadow-md transition-all group`}>
                <div className="text-3xl mb-3 md:mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base mb-2 group-hover:text-blue-700 transition-colors">{f.title}</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-blue-600 font-semibold text-xs md:text-sm uppercase tracking-widest mb-3">Role-Based Access</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">8 Powerful Dashboards</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
              Each role gets a dedicated dashboard with exactly the features they need
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {roles.map(r => (
              <div key={r.role} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className={`bg-gradient-to-br ${r.gradient} p-4 md:p-5 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl md:text-3xl">{r.emoji}</span>
                    <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">{r.badge}</span>
                  </div>
                  <h3 className="font-black text-base md:text-lg">{r.role}</h3>
                  <p className="text-white/80 text-xs mt-1">{r.desc}</p>
                </div>
                <div className="p-4">
                  <ul className="space-y-1.5 mb-4">
                    {r.features.map(feat => (
                      <li key={feat} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>{feat}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login"
                    className={`block w-full py-2 text-center text-xs font-bold rounded-xl text-white bg-gradient-to-r ${r.gradient} hover:opacity-90 transition-opacity`}>
                    Login as {r.role.split(' ')[0]} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Tenant Banner */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-violet-600 to-purple-800 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-xs md:text-sm px-4 py-2 rounded-full mb-6 font-semibold">
                🌐 Multi-Tenant Architecture
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-5 md:mb-6">
                One Platform,<br />Many Hospitals
              </h2>
              <p className="text-violet-100 text-sm md:text-lg mb-6 md:mb-8 leading-relaxed">
                Each hospital gets its own isolated environment with custom branding, separate data, dedicated staff and independent billing.
              </p>
              <div className="space-y-3">
                {[
                  '🏥 Separate data per hospital',
                  '🎨 Custom branding & colors',
                  '👥 Independent staff management',
                  '💰 Isolated billing & revenue',
                  '🔐 Complete data isolation',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm md:text-base">
                    <span className="text-green-400">✓</span>
                    <span className="text-violet-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { icon:'🏥', name:'City Care Hospital',  slug:'citycare',     color:'bg-blue-500',   plan:'Pro'   },
                { icon:'🏨', name:'Al-Shifa Hospital',   slug:'alshifa',      color:'bg-green-500',  plan:'Basic' },
                { icon:'🏪', name:'Your Hospital',       slug:'yourhospital', color:'bg-pink-500',   plan:'Enterprise'},
              ].map(h => (
                <div key={h.slug} className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-4">
                  <div className={`w-12 h-12 ${h.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                    {h.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{h.name}</p>
                    <p className="text-violet-200 text-xs">/{h.slug}.medicare.com</p>
                  </div>
                  <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
                    {h.plan}
                  </span>
                </div>
              ))}
              <Link href="/login"
                className="bg-white text-violet-700 font-bold py-3 px-6 rounded-2xl text-center hover:bg-violet-50 transition-colors text-sm mt-2">
                👑 Super Admin Panel →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech-stack" className="py-16 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-600 font-semibold text-xs md:text-sm uppercase tracking-widest mb-3">Built With</p>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-6 md:mb-8">Modern Tech Stack</h2>
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            {techStack.map(t => (
              <span key={t.name} className={`${t.color} px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold`}>
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Credentials */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-3">Try Demo Accounts</h2>
            <p className="text-gray-500 text-sm md:text-base">Login instantly with these demo credentials — no signup required</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {demos.map(d => (
              <div key={d.role} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className={`bg-gradient-to-br ${d.gradient} p-3 md:p-4 text-white`}>
                  <p className="font-black text-sm md:text-base">{d.role}</p>
                </div>
                <div className="p-3 md:p-4">
                  <div className="space-y-2 mb-3">
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{d.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-xs text-gray-400">Password</p>
                      <p className="text-xs font-semibold text-gray-800">{d.pass}</p>
                    </div>
                  </div>
                  <Link href="/login"
                    className={`block w-full py-2 text-center text-xs font-bold rounded-xl text-white bg-gradient-to-r ${d.gradient} hover:opacity-90 transition-opacity`}>
                    Login Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6">
            Ready to Modernize<br />Your Hospital?
          </h2>
          <p className="text-blue-100 text-sm md:text-lg mb-8 md:mb-10">
            Join hospitals already using MediCare Pro — AI prescriptions, bed management, pharmacy, lab, billing and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link href="/register"
              className="px-6 md:px-8 py-3 md:py-4 bg-white text-blue-700 font-black rounded-2xl hover:bg-blue-50 transition-colors text-sm md:text-base">
              Start Free Trial 🚀
            </Link>
            <Link href="/login"
              className="px-6 md:px-8 py-3 md:py-4 border-2 border-white/50 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors text-sm md:text-base">
              View Demo →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-10 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-base md:text-lg">M</div>
              <div>
                <p className="font-black text-sm md:text-base">MediCare Pro</p>
                <p className="text-gray-400 text-xs">Hospital Management SaaS — 8 Roles · 15+ Modules</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
              {['Super Admin','Admin','Doctor','Patient','Receptionist','Lab','Pharmacist','Nurse'].map(r => (
                <Link key={r} href="/login" className="text-gray-400 hover:text-white text-xs transition-colors">{r}</Link>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-xs text-center md:text-left">
              © 2026 MediCare Pro — Next.js 14 + TypeScript + MongoDB + Groq AI
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Next.js 14','TypeScript','MongoDB','Groq AI','Twilio'].map(t => (
                <span key={t} className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
