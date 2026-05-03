import Link from 'next/link';

const features = [
  { icon: '🏥', title: 'Multi-Tenant SaaS',        desc: 'Multiple hospitals, each with own data, branding & staff',          color: 'bg-violet-50 border-violet-200' },
  { icon: '🤖', title: 'AI-Powered Features',       desc: 'AI prescription generation, diagnosis notes & chatbot support',     color: 'bg-blue-50 border-blue-200'   },
  { icon: '📊', title: 'Analytics Dashboard',       desc: 'Real-time revenue, appointments, top doctors & occupancy rate',     color: 'bg-green-50 border-green-200'  },
  { icon: '💊', title: 'Digital Prescriptions',     desc: 'EMR, auto medicine search, PDF download & history',                color: 'bg-pink-50 border-pink-200'   },
  { icon: '🧪', title: 'Lab Management',            desc: 'Test booking, reports, PDF results & payment tracking',             color: 'bg-orange-50 border-orange-200'},
  { icon: '💰', title: 'Billing & Payments',        desc: 'Invoices, JazzCash, EasyPaisa, Stripe & payment history',          color: 'bg-yellow-50 border-yellow-200'},
  { icon: '📅', title: 'Smart Scheduling',          desc: 'Doctor schedules, queue tokens, calendar & SMS reminders',         color: 'bg-cyan-50 border-cyan-200'   },
  { icon: '📱', title: 'Mobile Responsive',         desc: 'Works perfectly on all devices — desktop, tablet & mobile',        color: 'bg-indigo-50 border-indigo-200'},
  { icon: '🔐', title: 'Role-Based Security',       desc: '6 roles: Owner, Doctor, Nurse, Receptionist, Lab, Patient',        color: 'bg-red-50 border-red-200'     },
];

const roles = [
  {
    role:     'Super Admin',
    emoji:    '👑',
    color:    'from-violet-600 to-purple-700',
    border:   'border-violet-200',
    bg:       'bg-violet-50',
    text:     'text-violet-700',
    desc:     'Manage entire SaaS platform',
    features: ['All hospitals management','Subscription plans','Revenue analytics','Activate/deactivate tenants','Platform-wide settings'],
    login:    '/login',
    badge:    'Platform Owner',
  },
  {
    role:     'Hospital Admin',
    emoji:    '⚙️',
    color:    'from-blue-600 to-indigo-700',
    border:   'border-blue-200',
    bg:       'bg-blue-50',
    text:     'text-blue-700',
    desc:     'Manage your hospital',
    features: ['Staff management','All appointments','Billing & revenue','Analytics dashboard','Add doctors & patients'],
    login:    '/login',
    badge:    'Admin',
  },
  {
    role:     'Doctor',
    emoji:    '👨‍⚕️',
    color:    'from-cyan-600 to-teal-700',
    border:   'border-cyan-200',
    bg:       'bg-cyan-50',
    text:     'text-cyan-700',
    desc:     'Manage your patients',
    features: ['View appointments','Write prescriptions','AI prescription generator','Patient medical history','Download PDF reports'],
    login:    '/login',
    badge:    'Doctor',
  },
  {
    role:     'Receptionist',
    emoji:    '💁',
    color:    'from-pink-600 to-rose-700',
    border:   'border-pink-200',
    bg:       'bg-pink-50',
    text:     'text-pink-700',
    desc:     'Front desk management',
    features: ['Book appointments','Manage patient queue','Billing & invoicing','Patient registration','Confirm/cancel bookings'],
    login:    '/login',
    badge:    'Receptionist',
  },
  {
    role:     'Nurse',
    emoji:    '👩‍⚕️',
    color:    'from-teal-600 to-emerald-700',
    border:   'border-teal-200',
    bg:       'bg-teal-50',
    text:     'text-teal-700',
    desc:     'Patient care & vitals',
    features: ['Record patient vitals','View doctor schedules','Nurse notes','Today\'s patient list','Medical observations'],
    login:    '/login',
    badge:    'Nurse',
  },
  {
    role:     'Lab Staff',
    emoji:    '🔬',
    color:    'from-orange-600 to-amber-700',
    border:   'border-orange-200',
    bg:       'bg-orange-50',
    text:     'text-orange-700',
    desc:     'Laboratory management',
    features: ['Add & manage tests','Upload test results','Generate PDF reports','Track payments','Urgent test alerts'],
    login:    '/login',
    badge:    'Lab',
  },
  {
    role:     'Patient',
    emoji:    '🤒',
    color:    'from-green-600 to-emerald-700',
    border:   'border-green-200',
    bg:       'bg-green-50',
    text:     'text-green-700',
    desc:     'Self-service portal',
    features: ['Book appointments','View prescriptions','Download invoices','Pay online (JazzCash/EasyPaisa)','Medical records access'],
    login:    '/login',
    badge:    'Patient',
  },
];

const stats = [
  { value: '7',     label: 'User Roles',          icon: '👥' },
  { value: '50+',   label: 'Features',             icon: '⚡' },
  { value: '100%',  label: 'Mobile Responsive',    icon: '📱' },
  { value: 'SaaS',  label: 'Multi-Tenant Ready',   icon: '🌐' },
];

const techStack = [
  { name: 'Next.js 14',   color: 'bg-black text-white'         },
  { name: 'TypeScript',   color: 'bg-blue-600 text-white'      },
  { name: 'MongoDB',      color: 'bg-green-600 text-white'     },
  { name: 'Tailwind CSS', color: 'bg-cyan-500 text-white'      },
  { name: 'Groq AI',      color: 'bg-purple-600 text-white'    },
  { name: 'JWT Auth',     color: 'bg-orange-600 text-white'    },
  { name: 'jsPDF',        color: 'bg-red-600 text-white'       },
  { name: 'Recharts',     color: 'bg-indigo-600 text-white'    },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-lg">
              M
            </div>
            <div>
              <span className="text-xl font-black text-gray-900">MediCare</span>
              <span className="text-xl font-black text-blue-600"> Pro</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {['Features','Roles','Tech Stack'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ','-')}`}
                className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-all">
              Sign In
            </Link>
            <Link href="/register"
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-sm">
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-24 px-6">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-full mb-8 font-semibold">
            🏥 Complete Hospital Management SaaS Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Modern Healthcare
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Management Platform
            </span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-3xl mx-auto leading-relaxed">
            AI-powered hospital management with multi-tenant architecture.
            Built with Next.js 14, TypeScript & MongoDB.
            Supports <strong className="text-gray-700">7 user roles</strong>, lab management,
            billing & more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link href="/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-blue-200 transition-all text-base">
              Start Free Trial 🚀
            </Link>
            <Link href="/login"
              className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all text-base">
              View Demo →
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-2xl font-black text-blue-600">{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Everything Included</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Everything a modern hospital needs — from AI prescriptions to multi-tenant management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className={`${f.color} border rounded-2xl p-6 hover:shadow-md transition-all group`}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-blue-700 transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Role-Based Access</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              7 Powerful Dashboards
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Each role gets a dedicated dashboard with exactly the features they need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {roles.map(r => (
              <div key={r.role}
                className={`bg-white rounded-2xl border-2 ${r.border} overflow-hidden hover:shadow-xl transition-all duration-300 group`}>

                {/* Gradient Header */}
                <div className={`bg-gradient-to-br ${r.color} p-5 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{r.emoji}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.bg} ${r.text}`}>
                      {r.badge}
                    </span>
                  </div>
                  <h3 className="font-black text-lg">{r.role}</h3>
                  <p className="text-white/80 text-xs mt-1">{r.desc}</p>
                </div>

                {/* Features */}
                <div className="p-4">
                  <ul className="space-y-2 mb-4">
                    {r.features.map(feat => (
                      <li key={feat} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link href={r.login}
                    className={`block w-full py-2.5 text-center text-xs font-bold rounded-xl text-white bg-gradient-to-r ${r.color} hover:opacity-90 transition-opacity`}>
                    Login as {r.role.split(' ')[0]} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Tenant Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-violet-600 to-purple-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-sm px-4 py-2 rounded-full mb-8 font-semibold">
            🌐 Multi-Tenant Architecture
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            One Platform,
            <br />Many Hospitals
          </h2>
          <p className="text-violet-100 text-lg mb-10 max-w-2xl mx-auto">
            Each hospital gets its own isolated environment with custom branding,
            separate data and dedicated staff management.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: '🏥', name: 'City Care Hospital',   slug: 'citycare', color: 'bg-blue-500'  },
              { icon: '🏨', name: 'Al-Shifa Hospital',    slug: 'alshifa',  color: 'bg-green-500' },
              { icon: '🏪', name: 'Your Hospital',        slug: 'yourhospital', color: 'bg-pink-500'  },
            ].map(h => (
              <div key={h.slug} className="bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
                <div className={`w-12 h-12 ${h.color} rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto`}>
                  {h.icon}
                </div>
                <p className="font-bold text-white">{h.name}</p>
                <p className="text-violet-200 text-xs mt-1">/{h.slug}.medicare.com</p>
                <div className="mt-3 space-y-1">
                  {['Own data & branding','Separate staff','Custom billing','Isolated access'].map(f => (
                    <p key={f} className="text-xs text-violet-200 flex items-center gap-1">
                      <span className="text-green-400">✓</span> {f}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Link href="/superadmin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-700 font-bold rounded-2xl hover:bg-violet-50 transition-colors text-base">
            👑 Super Admin Panel →
          </Link>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech-stack" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Built With</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8">Modern Tech Stack</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {techStack.map(t => (
              <span key={t.name} className={`${t.color} px-4 py-2 rounded-xl text-sm font-bold`}>
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Login Demo Cards */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Try Demo Accounts</h2>
            <p className="text-gray-500">Login instantly with these demo credentials</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { role:'Super Admin',   email:'superadmin@medicare.com', pass:'super123',   gradient:'from-violet-600 to-purple-700', emoji:'👑', hospital:''          },
              { role:'Hospital Admin',email:'admin@medicare.com',      pass:'admin123',   gradient:'from-blue-600 to-indigo-700',   emoji:'⚙️', hospital:''         },
              { role:'Doctor',        email:'doctor@medicare.com',     pass:'doctor123',  gradient:'from-cyan-600 to-teal-700',     emoji:'👨‍⚕️', hospital:''       },
              { role:'Patient',       email:'patient@medicare.com',    pass:'patient123', gradient:'from-green-600 to-emerald-700', emoji:'🤒', hospital:''         },
              { role:'Receptionist',  email:'reception@medicare.com',  pass:'recep123',   gradient:'from-pink-600 to-rose-700',     emoji:'💁', hospital:''         },
              { role:'Lab Staff',     email:'lab@medicare.com',        pass:'lab123',     gradient:'from-orange-600 to-amber-700',  emoji:'🔬', hospital:''         },
            ].map(d => (
              <div key={d.role} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className={`bg-gradient-to-br ${d.gradient} p-4 text-white`}>
                  <span className="text-2xl">{d.emoji}</span>
                  <p className="font-bold mt-1">{d.role}</p>
                </div>
                <div className="p-4">
                  <div className="space-y-2 mb-3">
                    <div className="bg-gray-50 rounded-xl p-2.5">
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{d.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5">
                      <p className="text-xs text-gray-400">Password</p>
                      <p className="text-xs font-semibold text-gray-800">{d.pass}</p>
                    </div>
                  </div>
                  <Link href="/login"
                    className={`block w-full py-2.5 text-center text-xs font-bold rounded-xl text-white bg-gradient-to-r ${d.gradient} hover:opacity-90 transition-opacity`}>
                    Login Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to Modernize<br />Your Hospital?
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Join hospitals already using MediCare Pro to streamline operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="px-8 py-4 bg-white text-blue-700 font-black rounded-2xl hover:bg-blue-50 transition-colors text-base">
              Start Free Trial 🚀
            </Link>
            <Link href="/login"
              className="px-8 py-4 border-2 border-white/50 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors text-base">
              View Demo →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-lg">M</div>
              <div>
                <p className="font-black text-base">MediCare Pro</p>
                <p className="text-gray-400 text-xs">Hospital Management SaaS</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {['Super Admin','Hospital Admin','Doctor','Patient','Receptionist','Lab Staff','Nurse'].map(r => (
                <Link key={r} href="/login"
                  className="text-gray-400 hover:text-white text-xs transition-colors">
                  {r}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-xs">
              © 2026 MediCare Pro — Built with Next.js 14 + TypeScript + MongoDB
            </p>
            <div className="flex gap-3">
              <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400">Next.js 14</span>
              <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400">TypeScript</span>
              <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400">MongoDB</span>
              <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400">Groq AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
