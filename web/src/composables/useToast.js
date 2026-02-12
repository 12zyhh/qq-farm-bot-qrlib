export const useToast = () => {
  return {
    success: (message, duration) => window.showToast(message, 'success', duration),
    error: (message, duration) => window.showToast(message, 'error', duration),
    warning: (message, duration) => window.showToast(message, 'warning', duration),
    info: (message, duration) => window.showToast(message, 'info', duration)
  }
}
