'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, getAuth } from 'firebase/auth'
// import { auth } from 'app/lib/firebase'

type UserProps = {
  id: string
  email: string
  authMethod: 'local' | 'firebase' | 'google'
  name?: string
  avatar?: string | Blob
  displayName: string
  username?: string
}

type UserContextType = {
  user: UserProps | null
  setUser: (user: UserProps | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProps | null>(null)

  useEffect(() => {
    const local = localStorage.getItem('taskly_user')
    let localUser: UserProps | null = null

    if (local) {
      try {
        localUser = JSON.parse(local)
        if (localUser) setUser(localUser)
      } catch (err) {
        console.error('Invalid localStorage user:', err)
      }
    }

    const unsubscribe = onAuthStateChanged(getAuth(), (firebaseUser) => {
      if (firebaseUser) {
        const { uid, email, displayName, photoURL } = firebaseUser

        const newUser: UserProps = {
          id: uid,
          email: email ?? '',
          authMethod: 'firebase',
          name: displayName ?? '',
          avatar: photoURL ?? '',
          displayName: displayName ?? email ?? 'Firebase User',
          username: localUser?.username, // 🟡 Pull from local if available
        }

        setUser(newUser)
        localStorage.setItem('taskly_user', JSON.stringify(newUser))
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within a UserProvider')
  return ctx
}
