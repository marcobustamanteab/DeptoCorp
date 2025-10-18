import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Building2, 
  Users, 
  DollarSign, 
  FileText, 
  Calendar,
  LogOut, 
  FileDown,
  CheckSquare
} from 'lucide-react'

interface SidebarProps {
  onLogout: () => void
}

export function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/edificios', icon: Building2, label: 'Edificios' },
    { path: '/departamentos', icon: Users, label: 'Departamentos' },
    { path: '/residentes', icon: Users, label: 'Residentes' },
    { path: '/gastos', icon: DollarSign, label: 'Gastos Comunes' },
    { path: '/pagos', icon: DollarSign, label: 'Historial Pagos' },
    { path: '/validar-comprobantes', icon: CheckSquare, label: 'Validar Comprobantes' },
    { path: '/avisos', icon: FileText, label: 'Avisos' },
    { path: '/reservas', icon: Calendar, label: 'Reservas' },
    { path: '/reportes', icon: FileDown, label: 'Reportes' },
  ]

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">DeptoCorp</h1>
        <p className="text-gray-400 text-sm">Admin Panel</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 w-full transition-colors"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}