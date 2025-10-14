interface HeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Bienvenido de nuevo
          </h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.email?.[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}