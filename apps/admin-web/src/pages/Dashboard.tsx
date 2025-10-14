import { Card } from '../components/ui/Card'
import { Building2, Users, DollarSign, AlertCircle, TrendingUp, Clock } from 'lucide-react'
import { useDashboardStats } from '../../../../packages/shared/hooks/useDashboardStats'
import { useRecentActivity } from '../../../../packages/shared/hooks/useRecentActivity'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function Dashboard() {
  const { stats, isLoading } = useDashboardStats()
  const { activities, isLoading: loadingActivities } = useRecentActivity()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando estadísticas...</div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Edificios',
      value: stats.totalEdificios,
      icon: Building2,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Departamentos',
      value: stats.totalDepartamentos,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Residentes',
      value: stats.totalResidentes,
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Gastos Pendientes',
      value: `$${stats.montoGastosPendientes.toLocaleString()}`,
      subtitle: `${stats.totalGastosPendientes} departamentos`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={stat.textColor} size={28} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Alertas */}
      {(stats.gastosAtrasados > 0 || stats.avisosActivos > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.gastosAtrasados > 0 && (
            <Card className="border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Pagos Atrasados</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Hay {stats.gastosAtrasados} departamentos con pagos atrasados que requieren atención.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {stats.avisosActivos > 0 && (
            <Card className="border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <AlertCircle className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Avisos Activos</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Tienes {stats.avisosActivos} avisos activos publicados en tus edificios.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Actividad Reciente y Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-gray-600" size={20} />
            <h3 className="text-xl font-bold text-gray-800">
              Actividad Reciente
            </h3>
          </div>
          
          {loadingActivities ? (
            <p className="text-gray-500 text-center py-4">Cargando...</p>
          ) : activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                >
                  <div className={`${
                    activity.icon === 'dollar' ? 'bg-yellow-100' : 'bg-blue-100'
                  } p-2 rounded-lg`}>
                    {activity.icon === 'dollar' ? (
                      <DollarSign className="text-yellow-600" size={16} />
                    ) : (
                      <Users className="text-blue-600" size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.date), { 
                        addSuffix: true,
                        locale: es 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Resumen Rápido */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-gray-600" size={20} />
            <h3 className="text-xl font-bold text-gray-800">
              Resumen Rápido
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-gray-600">Tasa de ocupación</span>
              <span className="font-bold text-gray-800">
                {stats.totalDepartamentos > 0
                  ? Math.round((stats.totalResidentes / stats.totalDepartamentos) * 100)
                  : 0}%
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-gray-600">Promedio residentes/depto</span>
              <span className="font-bold text-gray-800">
                {stats.totalDepartamentos > 0
                  ? (stats.totalResidentes / stats.totalDepartamentos).toFixed(1)
                  : 0}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-gray-600">Departamentos/edificio</span>
              <span className="font-bold text-gray-800">
                {stats.totalEdificios > 0
                  ? Math.round(stats.totalDepartamentos / stats.totalEdificios)
                  : 0}
              </span>
            </div>

            {stats.totalGastosPendientes > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tasa de morosidad</span>
                <span className={`font-bold ${
                  stats.gastosAtrasados > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats.totalDepartamentos > 0
                    ? Math.round((stats.gastosAtrasados / stats.totalGastosPendientes) * 100)
                    : 0}%
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}