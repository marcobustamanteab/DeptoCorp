import { useState } from 'react'
import { useAuth } from '@deptocorp/shared/hooks/useAuth'
import { Building2, Mail, Lock } from 'lucide-react'

export function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const { error } = await signIn(email, password)
    
    if (error) {
      setError('Email o contraseña incorrectos')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-6">
            <Building2 size={40} className="text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            DeptoCorp
          </h1>
          <p className="text-blue-100 text-lg">
            Portal de Residentes
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-3xl shadow-2xl p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              ¿Problemas para ingresar?
            </p>
            <p className="text-sm text-gray-600 font-medium mt-1">
              Contacta a tu administración
            </p>
          </div>
        </div>

        {/* Versión */}
        <p className="text-center text-white text-sm mt-6 opacity-75">
          v1.0.0 - PWA
        </p>
      </div>
    </div>
  )
}