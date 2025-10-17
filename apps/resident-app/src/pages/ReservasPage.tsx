import { useResidentProfile } from '@deptocorp/shared/hooks/useResidentProfile'
import { 
  useResidentEspaciosComunes,
  useResidentReservas, 
  useReservasPorEspacio,
  useCreateReserva,
  useCancelReserva 
} from '@deptocorp/shared/hooks/useResidentReservas'
import { Calendar, Clock, MapPin, Plus, X, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { format, addDays, isBefore, startOfDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReservasPageProps {
  userId: string | undefined
}

export function ReservasPage({ userId }: ReservasPageProps) {
  const { data: profile } = useResidentProfile(userId)
  const { data: espacios, isLoading: loadingEspacios } = useResidentEspaciosComunes(
    profile?.departamento.edificio.id
  )
  const { data: reservas, isLoading: loadingReservas } = useResidentReservas(
    profile?.departamento.id
  )
  const { mutate: cancelReserva } = useCancelReserva()

  const [showModal, setShowModal] = useState(false)
  const [selectedEspacio, setSelectedEspacio] = useState<any>(null)

  const handleOpenModal = (espacio: any) => {
    setSelectedEspacio(espacio)
    setShowModal(true)
  }

  const handleCancelReserva = (reservaId: string) => {
    if (window.confirm('¿Seguro que deseas cancelar esta reserva?')) {
      cancelReserva(reservaId)
    }
  }

  if (loadingEspacios || loadingReservas) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!espacios || espacios.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Reservas</h2>
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-600 font-medium mb-2">Sin espacios disponibles</p>
          <p className="text-gray-400 text-sm">
            No hay espacios comunes configurados en tu edificio
          </p>
        </div>
      </div>
    )
  }

  const reservasActivas = reservas?.filter(r => 
    r.estado !== 'cancelada' && 
    isBefore(startOfDay(new Date()), parseISO(r.fecha_inicio))
  ) || []

  const reservasPasadas = reservas?.filter(r => 
    r.estado === 'cancelada' || 
    !isBefore(startOfDay(new Date()), parseISO(r.fecha_inicio))
  ) || []

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Reservas</h2>

      {/* Espacios Disponibles */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600 uppercase">Espacios Disponibles</h3>
        <div className="grid grid-cols-1 gap-3">
          {espacios.map((espacio) => (
            <button
              key={espacio.id}
              onClick={() => handleOpenModal(espacio)}
              className="bg-white rounded-2xl shadow-sm p-4 active:scale-95 transition text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="bg-green-100 p-3 rounded-xl mr-3">
                    <MapPin className="text-green-600" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800">{espacio.nombre}</h3>
                    {espacio.descripcion && (
                      <p className="text-sm text-gray-600 line-clamp-1">{espacio.descripcion}</p>
                    )}
                    {espacio.capacidad && (
                      <p className="text-xs text-gray-500 mt-1">
                        Capacidad: {espacio.capacidad} personas
                      </p>
                    )}
                  </div>
                </div>
                <Plus className="text-green-600 flex-shrink-0 ml-3" size={24} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mis Reservas Activas */}
      {reservasActivas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 uppercase">Mis Reservas</h3>
          {reservasActivas.map((reserva) => (
            <div key={reserva.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-xl mr-3">
                    <MapPin className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{reserva.espacio.nombre}</h3>
                    <p className="text-xs text-blue-600 font-medium">
                      {reserva.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCancelReserva(reserva.id)}
                  className="text-red-500 p-2"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  {format(new Date(reserva.fecha_inicio), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-2" />
                  {format(new Date(reserva.fecha_inicio), 'HH:mm')} - {format(new Date(reserva.fecha_fin), 'HH:mm')}
                </div>
              </div>

              {reserva.notas && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600">{reserva.notas}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Historial */}
      {reservasPasadas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Historial</h3>
          {reservasPasadas.slice(0, 3).map((reserva) => (
            <div key={reserva.id} className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`${
                    reserva.estado === 'cancelada' ? 'bg-red-100' : 'bg-gray-200'
                  } p-2 rounded-xl mr-3`}>
                    {reserva.estado === 'cancelada' ? (
                      <X className="text-red-600" size={20} />
                    ) : (
                      <CheckCircle className="text-gray-600" size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">{reserva.espacio.nombre}</h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(reserva.fecha_inicio), "dd/MM/yy • HH:mm")}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${
                  reserva.estado === 'cancelada' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {reserva.estado === 'cancelada' ? 'Cancelada' : 'Completada'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Nueva Reserva */}
      {showModal && selectedEspacio && (
        <ModalReserva
          espacio={selectedEspacio}
          edificioId={profile?.departamento.edificio.id || ''}
          departamentoId={profile?.departamento.id || ''}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

// Modal de Reserva
function ModalReserva({ 
  espacio, 
  edificioId, 
  departamentoId, 
  onClose 
}: { 
  espacio: any
  edificioId: string
  departamentoId: string
  onClose: () => void 
}) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [horaInicio, setHoraInicio] = useState('09:00')
  const [horaFin, setHoraFin] = useState('12:00')
  const [notas, setNotas] = useState('')

  const { data: reservasExistentes } = useReservasPorEspacio(espacio.id, selectedDate)
  const { mutate: createReserva, isPending } = useCreateReserva()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const fechaInicio = `${selectedDate}T${horaInicio}:00`
    const fechaFin = `${selectedDate}T${horaFin}:00`

    createReserva({
      edificio_id: edificioId,
      espacio_id: espacio.id,
      departamento_id: departamentoId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      notas: notas || undefined
    }, {
      onSuccess: () => onClose()
    })
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl p-6 w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>

        <h3 className="text-2xl font-bold text-gray-800 mb-2">{espacio.nombre}</h3>
        {espacio.descripcion && (
          <p className="text-gray-600 mb-6">{espacio.descripcion}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hora inicio
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hora fin
              </label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Cumpleaños de mi hijo"
            />
          </div>

          {/* Info de Reservas Existentes */}
          {reservasExistentes && reservasExistentes.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs text-yellow-800 font-medium mb-2">
                ⚠️ Reservas existentes este día:
              </p>
              <div className="space-y-1">
                {reservasExistentes.map((r: any, i: number) => (
                  <p key={i} className="text-xs text-yellow-700">
                    • {format(new Date(r.fecha_inicio), 'HH:mm')} - {format(new Date(r.fecha_fin), 'HH:mm')}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}