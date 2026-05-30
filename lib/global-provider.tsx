import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { getCurrentUser, supabase } from "./supabase"

interface User {
  $id: string
  name: string
  email: string
  avatar: string
}

interface GlobalContextType {
  isLogged: boolean
  user: User | null
  loading: boolean
  refetch: () => Promise<void>
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    setLoading(true)
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }

  useEffect(() => {
    fetchUser()

    // Listen for auth state changes (login/logout/token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUser()
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <GlobalContext.Provider
      value={{
        isLogged: !!user,
        user,
        loading,
        refetch: fetchUser,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => {
  const context = useContext(GlobalContext)
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider")
  return context
}
