import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/authUtils';
import { getInitials } from '../utils/formatUtils';
import Logo from './Logo';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard'    },
  { to: '/patients',  label: 'Pacientes'    },
  { to: '/agenda',    label: 'Agenda'       },
  { to: '/pipeline',  label: 'Pipeline'     },
  { to: '/reminders', label: 'Lembretes'    },
  { to: '/settings',  label: 'Configurações'},
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user     = getUser();

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="px-5 py-5 border-b border-gray-100">
        <Logo size={32} showText={true} />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
