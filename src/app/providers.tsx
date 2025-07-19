'use client'

import { ReactNode } from 'react'
import { UserProvider } from './context/UserProvider'
import { Provider } from 'react-redux'
import { store } from './redux/store'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <UserProvider>
        {children}
      </UserProvider>
    </Provider>
  )
}
