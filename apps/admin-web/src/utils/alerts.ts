import Swal from 'sweetalert2'

// Configuración por defecto con estilos corregidos
const defaultConfig = {
  confirmButtonColor: '#3b82f6',
  cancelButtonColor: '#ef4444',
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar',
  customClass: {
    confirmButton: 'swal-button-confirm',
    cancelButton: 'swal-button-cancel',
  },
  buttonsStyling: false, // Desactivar estilos por defecto
}

// ✅ Alert de éxito
export const showSuccess = (message: string, title = '¡Éxito!') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: defaultConfig.confirmButtonText,
    customClass: {
      confirmButton: 'swal-button-confirm',
    },
    buttonsStyling: false,
  })
}

// ❌ Alert de error
export const showError = (message: string, title = 'Error') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: defaultConfig.confirmButtonText,
    customClass: {
      confirmButton: 'swal-button-confirm',
    },
    buttonsStyling: false,
  })
}

// ⚠️ Alert de advertencia
export const showWarning = (message: string, title = 'Atención') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: defaultConfig.confirmButtonText,
    customClass: {
      confirmButton: 'swal-button-confirm',
    },
    buttonsStyling: false,
  })
}

// ℹ️ Alert de información
export const showInfo = (message: string, title = 'Información') => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonText: defaultConfig.confirmButtonText,
    customClass: {
      confirmButton: 'swal-button-confirm',
    },
    buttonsStyling: false,
  })
}

// ❓ Confirmación (Sí/No)
export const showConfirm = async (
  message: string,
  title = '¿Estás seguro?',
  confirmText = 'Sí, continuar',
  cancelText = 'No, cancelar'
) => {
  const result = await Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      confirmButton: 'swal-button-confirm',
      cancelButton: 'swal-button-cancel',
    },
    buttonsStyling: false,
  })
  
  return result.isConfirmed
}

// 🗑️ Confirmación de eliminación
export const showDeleteConfirm = async (itemName: string) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: '¿Eliminar?',
    html: `¿Estás seguro de eliminar <strong>${itemName}</strong>?<br><span style="color: #ef4444;">Esta acción no se puede deshacer.</span>`,
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    customClass: {
      confirmButton: 'swal-button-danger',
      cancelButton: 'swal-button-cancel',
    },
    buttonsStyling: false,
  })
  
  return result.isConfirmed
}

// 📝 Input de texto
export const showInputText = async (
  title: string,
  placeholder = '',
  defaultValue = ''
) => {
  const result = await Swal.fire({
    title,
    input: 'text',
    inputPlaceholder: placeholder,
    inputValue: defaultValue,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    customClass: {
      confirmButton: 'swal-button-confirm',
      cancelButton: 'swal-button-cancel',
    },
    buttonsStyling: false,
    inputValidator: (value) => {
      if (!value) {
        return 'Este campo es requerido'
      }
    },
  })
  
  if (result.isConfirmed) {
    return result.value
  }
  return null
}

// 📋 Select / Dropdown
export const showSelect = async (
  title: string,
  options: Record<string, string>,
  defaultValue = ''
) => {
  const result = await Swal.fire({
    title,
    input: 'select',
    inputOptions: options,
    inputValue: defaultValue,
    showCancelButton: true,
    confirmButtonText: 'Seleccionar',
    cancelButtonText: 'Cancelar',
    customClass: {
      confirmButton: 'swal-button-confirm',
      cancelButton: 'swal-button-cancel',
    },
    buttonsStyling: false,
    inputValidator: (value) => {
      if (!value) {
        return 'Debes seleccionar una opción'
      }
    },
  })
  
  if (result.isConfirmed) {
    return result.value
  }
  return null
}

// ⏳ Loading / Procesando
export const showLoading = (message = 'Procesando...') => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })
}

// ✅ Cerrar loading
export const closeLoading = () => {
  Swal.close()
}

// 🎉 Toast (notificación pequeña)
export const showToast = (message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
  })

  Toast.fire({
    icon,
    title: message,
  })
}