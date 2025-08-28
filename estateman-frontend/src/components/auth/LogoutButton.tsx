import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  showIcon?: boolean
}

export function LogoutButton({ variant = "ghost", size = "default", showIcon = true }: LogoutButtonProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <Button variant={variant} size={size} onClick={handleLogout}>
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      Logout
    </Button>
  )
}