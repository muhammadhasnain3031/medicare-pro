'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  href:  string;
  icon:  string;
  label: string;
}

const adminNav: NavItem[] = [
  { href: '/admin',              icon: '📊', label: 'Dashboard'    },
  { href: '/admin/doctors',      icon: '👨‍⚕️', label: 'Doctors'      },
  { href: '/admin/patients',     icon: '🤒', label: 'Patients'     },
  { href: '/admin/appointments', icon: '📅', label: 'Appointments' },
  { href: '/admin/add-user',     icon: '➕', label: 'Add User'     },
];

const doctorNav: NavItem[] = [
  { href: '/doctor',                       icon: '📊', label: 'Dashboard'      },
  { href: '/doctor/appointments',          icon: '📅', label: 'Appointments'   },
  { href: '/doctor/patients',              icon: '🤒', label: 'My Patients'    },
  { href: '/doctor/prescriptions',         icon: '💊', label: 'Prescriptions'  },
  { href: '/doctor/prescriptions/new',     icon: '✍️', label: 'New Rx'         },
];

const patientNav: NavItem[] = [
  { href: '/patient',                  icon: '📊', label: 'Dashboard'        },
  { href: '/patient/book',             icon: '📅', label: 'Book Appointment' },
  { href: '/patient/appointments',     icon: '🗓️', label: 'My Appointments'  },
  { href: '/patient/prescriptions',    icon: '💊', label: 'Prescriptions'    },
  { href: '/patient/records',          icon: '📋', label: 'Medical Records'  },
];

const receptionistNav: NavItem[] = [
  { href: '/receptionist',              icon: '📊', label: 'Dashboard'       },
  { href: '/receptionist/appointments', icon: '📅', label: 'Appointments'    },
  { href: '/receptionist/patients',     icon: '🤒', label: 'Patients'        },
  { href: '/receptionist/book',         icon: '➕', label: 'Book Appointment'},
  { href: '/receptionist/billing',      icon: '💰', label: 'Billing'         },
];

const nurseNav: NavItem[] = [
  { href: '/nurse',              icon: '📊', label: 'Dashboard'    },
  { href: '/nurse/patients',     icon: '🤒', label: 'Patients'     },
  { href: '/nurse/vitals',       icon: '💉', label: 'Vitals'       },
  { href: '/nurse/appointments', icon: '📅', label: 'Appointments' },
  { href: '/nurse/notes',        icon: '📝', label: 'Nurse Notes'  },
];

const labNav: NavItem[] = [
  { href: '/lab',           icon: '📊', label: 'Dashboard'   },
  { href: '/lab/tests',     icon: '🧪', label: 'Lab Tests'   },
  { href: '/lab/reports',   icon: '📋', label: 'Reports'     },
  { href: '/lab/pending',   icon: '⏳', label: 'Pending'     },
  { href: '/lab/completed', icon: '✅', label: 'Completed'   },
];

const navMap: Record<string, NavItem[]> = {
  admin:        adminNav,
  doctor:       doctorNav,
  patient:      patientNav,
  receptionist: receptionistNav,
  nurse:        nurseNav,
  lab:          labNav,
};

const roleConfig: Record<string, { gradient: string; label: string; emoji: string }> = {
  admin:        { gradient: 'from-purple-600 to-indigo-700', label: 'Admin',        emoji: '⚙️'  },
  doctor:       { gradient: 'from-blue-600 to-cyan-700',     label: 'Doctor',       emoji: '👨‍⚕️' },
  patient:      { gradient: 'from-green-600 to-emerald-700', label: 'Patient',      emoji: '🤒'  },
  receptionist: { gradient: 'from-pink-600 to-rose-700',     label: 'Receptionist', emoji: '💁'  },
  nurse:        { gradient: 'from-teal-600 to-cyan-700',     label: 'Nurse',        emoji: '👩‍⚕️' },
  lab:          { gradient: 'from-orange-600 to-amber-700',  label: 'Lab Staff',    emoji: '🔬'  },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  const [collapsed, setCollapsed]   = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const nav    = navMap[user.role]    || [];
  const config = roleConfig[user.role] || roleConfig.admin;

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-full' : ''}`}>

      {/* Brand Header */}
      <div className={`bg-gradient-to-br ${config.gradient} p-4 flex items-center justify-between`}>
  {!collapsed && (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0">
        M
      </div>
      <div className="min-w-0">
        <p className="text-white font-bold text-sm truncate">MediCare Pro</p>
        <p className="text-white/70 text-xs truncate">{config.emoji} {config.label} Portal</p>
      </div>
    </div>
  )}

        {/* 3-dot menu button */}
         <div className={`relative ${collapsed ? 'mx-auto' : 'flex-shrink-0'}`}>
    <button
      onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
    >
      <span className="text-white font-bold" style={{ letterSpacing: '2px', fontSize: '16px' }}>⋯</span>
    </button>

          {/* Dropdown Menu */}
          {menuOpen && (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
        <div className={`absolute top-10 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden ${
          collapsed ? 'left-0' : 'right-0'
        }`}>
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500">MENU OPTIONS</p>
          </div>
          <div className="p-2">
            <button
              onClick={() => { setCollapsed(!collapsed); setMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 font-medium transition-colors"
            >
              <span className="text-base">{collapsed ? '📂' : '📁'}</span>
              {collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            </button>
            <button
              onClick={() => { setMenuOpen(false); router.push(`/${user.role}`); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 font-medium transition-colors"
            >
              <span className="text-base">🏠</span>
                    Go to Dashboard
                   </button>
            <div className="my-1 border-t border-gray-100" />
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm text-red-500 font-medium transition-colors"
            >
              <span className="text-base">🚪</span>
                    Sign Out
                  </button>
          </div>
        </div>
      </>
    )}
  </div>
</div>
      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== `/${user.role}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed && !mobile ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl transition-all group ${
                collapsed && !mobile ? 'px-2 py-3 justify-center' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`text-base flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-transform`}>
                {item.icon}
              </span>
              {(!collapsed || mobile) && (
                <span className="text-sm truncate">{item.label}</span>
              )}
              {(!collapsed || mobile) && isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      {(!collapsed || mobile) && (
        <div className="p-3 border-t border-gray-100">
          <div className={`flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl`}>
            <div className={`w-8 h-8 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-md"
      >
        <span className="text-gray-700 font-bold text-xs tracking-widest">☰</span>
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed left-0 top-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300 md:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex justify-end p-3 border-b border-gray-100">
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-y-auto">
          <SidebarContent mobile />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-100 sticky top-0 h-screen transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}>
        <SidebarContent />
      </aside>
    </>
  );
}