import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export function SessionManager() {
  const { isAuthenticated, token } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated || !token) return

    // Check token expiration
    const checkTokenExpiration = () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Date.now() / 1000
        const timeUntilExpiry = payload.exp - currentTime

        // Show warning 5 minutes before expiration
        if (timeUntilExpiry <= 300 && timeUntilExpiry > 0) {
          toast({
            title: "Session expiring soon",
            description: "Your session will expire in 5 minutes. Please save your work.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error checking token expiration:', error)
      }
    }

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60 * 1000)
    return () => clearInterval(interval)
  }, [isAuthenticated, token, toast])

  return null
}