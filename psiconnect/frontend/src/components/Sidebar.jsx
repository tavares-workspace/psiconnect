import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/authUtils';
import { getInitials } from '../utils/formatUtils';
import Logo from './Logo';

const menuItems = [
  { to: '/dashboard', icon: '▦',  label: 'Dashboard'     },
  { to: '/patients',  icon: '👤', label: 'Pacientes'      },
  { to: '/agenda',    icon: '📅', label: 'Agenda'         },
  { to: '/pipeline',  icon: '◈',  label: 'Pipeline'       },
  { to: '/reminders', icon: '🔔', label: 'Lembretes'      },
  { to: '/settings',  icon: '⚙',  label: 'Configurações'  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user     = getUser();

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Logo size={34} showText={true} />
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
          >
            <span className="w-5 text-center text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Usuário + Sair */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <span>→</span> Sair
        </button>
      </div>
    </aside>
  );
}
