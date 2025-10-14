import { Card } from '../components/ui/Card'
import { Building2, Users, DollarSign, AlertCircle } from 'lucide-react'

export function Dashboard() {
  // Datos de ejemplo (después vendrán de Supabase)
  const stats = [
    {
      title: 'Edificios',
      value: '0',
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      title: 'Departamentos',
      value: '0',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Gastos Pendientes',
      value: '$0',
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      title: 'Avisos Activos',
      value: '0',
      icon: AlertCircle,
      color: 'bg-red-500',
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Actividad Reciente
          </h3>
          <p className="text-gray-500">No hay actividad reciente</p>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Próximos Vencimientos
          </h3>
          <p className="text-gray-500">No hay gastos próximos a vencer</p>
        </Card>
      </div>
    </div>
  )
}