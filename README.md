# 🏢 DeptoCorpApp

Sistema completo de gestión de edificios y condominios con administración de gastos comunes, pagos, avisos y reportes.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)

---

## 🚀 Características

### ✅ Gestión Completa
- **Edificios**: CRUD completo con ubicación y datos
- **Departamentos**: Gestión por edificio con % de gastos comunes
- **Residentes**: Propietarios y arrendatarios con datos de contacto

### 💰 Sistema de Gastos Comunes
- Creación de gastos mensuales por edificio
- **Distribución automática** a departamentos según porcentaje
- Estados: pendiente, pagado, atrasado
- Cálculo automático de montos
- Estadísticas en tiempo real

### 💳 Registro de Pagos
- Registro manual de pagos por departamento
- Múltiples métodos: transferencia, efectivo, cheque, depósito
- Referencias y notas
- Historial completo con filtros
- Cambio automático de estados

### 📢 Sistema de Avisos
- Comunicados y anuncios por edificio
- 4 niveles de prioridad (baja, normal, alta, urgente)
- Activar/desactivar avisos
- Fecha de expiración opcional

### 📅 Reservas
- Gestión de espacios comunes
- Sistema de reservas con horarios
- Control de disponibilidad

### 📊 Reportes Excel
- Estado de cuenta por departamento
- Reporte de morosidad
- Lista de residentes
- Reporte completo multi-hoja

### 📈 Dashboard Inteligente
- Estadísticas en tiempo real
- Alertas automáticas de morosidad
- Actividad reciente
- Métricas calculadas
- Auto-refresh cada 30 segundos

---

## 🏗️ Arquitectura

### Backend
- **Supabase** (PostgreSQL + Auth + Storage)
- **11 tablas relacionadas** con Row Level Security
- **Triggers automáticos** para timestamps
- **Types TypeScript** generados automáticamente

### Frontend
- **React 19** con TypeScript
- **Vite 7** como bundler
- **Tailwind CSS 4** para estilos
- **React Query** para estado del servidor
- **Zustand** para estado global
- **React Router** para navegación

### Estructura (Monorepo)
```
deptocorp-app/
├── apps/
│   └── admin-web/          # App de administración
├── packages/
│   ├── shared/             # Hooks y utilidades compartidas
│   └── supabase-client/    # Cliente y servicios de Supabase
└── supabase/
    └── migrations/         # Migraciones de base de datos
```

---

## 🛠️ Instalación

### Prerrequisitos
- Node.js 18+ 
- pnpm 8+
- Cuenta en Supabase

### 1. Clonar repositorio
```bash
git clone https://github.com/TU-USUARIO/deptocorp-app.git
cd deptocorp-app
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar Supabase

#### Crear proyecto en Supabase
1. Ve a https://supabase.com
2. Crea un nuevo proyecto
3. Copia las credenciales

#### Configurar variables de entorno
```bash
# En packages/supabase-client/src/client.ts
# Reemplaza con tus credenciales
```

#### Ejecutar migraciones
```bash
cd supabase
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

### 4. Ejecutar datos de prueba (Opcional)
```sql
-- Ejecuta el script en Supabase SQL Editor
-- (Script incluido en /docs/seed-data.sql)
```

### 5. Iniciar desarrollo
```bash
cd apps/admin-web
pnpm dev
```

Abre http://localhost:5173

---

## 👤 Usuario por Defecto
```
Email: admin@deptocorp.cl
Password: [configura en Supabase Auth]
```

---

## 📦 Tecnologías

### Core
- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS 4

### Estado
- React Query (TanStack Query)
- Zustand

### UI/UX
- Lucide React (iconos)
- React Hot Toast (notificaciones)
- date-fns (manejo de fechas)

### Backend
- Supabase (PostgreSQL)
- Row Level Security
- Edge Functions ready

### Reportes
- XLSX (exportación Excel)

---

## 🗂️ Tablas de Base de Datos

1. `edificios` - Edificios y condominios
2. `departamentos` - Unidades habitacionales
3. `residentes` - Propietarios y arrendatarios
4. `user_roles` - Roles de usuarios
5. `gastos_comunes` - Gastos mensuales
6. `gastos_departamento` - Distribución de gastos
7. `pagos` - Registro de pagos
8. `avisos` - Comunicados
9. `espacios_comunes` - Áreas compartidas
10. `reservas` - Reservas de espacios
11. `visitas` - Control de visitas

---

## 🚀 Roadmap

### ✅ Completado
- [x] Sistema de autenticación
- [x] CRUD edificios, departamentos, residentes
- [x] Gastos comunes con distribución automática
- [x] Registro de pagos
- [x] Sistema de avisos
- [x] Reservas de espacios comunes
- [x] Reportes Excel
- [x] Dashboard en tiempo real

### 🔜 Próximas funcionalidades
- [ ] App PWA para residentes
- [ ] Integración Mercado Pago
- [ ] Notificaciones por email
- [ ] Subir comprobantes (Supabase Storage)
- [ ] Sistema de tickets/reclamos
- [ ] Chat en tiempo real
- [ ] Gráficos y analytics avanzados

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles

---

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@ejemplo.com

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## ⭐ Agradecimientos

- [Supabase](https://supabase.com) por el increíble BaaS
- [Tailwind CSS](https://tailwindcss.com) por el framework CSS
- [Lucide](https://lucide.dev) por los iconos

---

**⭐ Si te gustó este proyecto, dale una estrella en GitHub!**