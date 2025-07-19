'use client'

import { FaUserCircle } from 'react-icons/fa'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { useUser } from '../context/UserProvider'

export default function UserProfile() {
  const [showModal, setShowModal] = useState(false)

  
  const { user, setUser } = useUser()

  const handleLogout = async () => {
    localStorage.removeItem('taskly_token')
    localStorage.removeItem('taskly_user')
    if (user?.authMethod && user.authMethod !== 'local') await signOut(auth)
    setUser(null)
    window.location.href = '/login'
  }

  const avatarUrl = useMemo(() => {
    if (!user?.avatar) return null
    return typeof user.avatar === 'string' ? user.avatar : URL.createObjectURL(user.avatar)
  }, [user?.avatar])

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
      <div>
        <p className="font-bold"> Hello, {user?.username || user?.displayName || user?.name || 'Guest User'}</p>
        <button
          onClick={() => setShowModal(true)}
          className="text-lg text-orange-500 hover:underline"
        >
          My Account
        </button>
      </div>

      {avatarUrl ? (
        <img src={avatarUrl} className="w-10 h-10 rounded-full" alt="Profile" />
      ) : (
        <FaUserCircle className="text-3xl text-gray-300" />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">My Account</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black text-xl">&times;</button>
            </div>
            <div className="flex flex-col items-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full mb-2" />
              ) : (
                <FaUserCircle className="text-5xl text-gray-300 mb-2" />
              )}
              <p className="font-medium text-black">{user?.name || user?.email || 'Guest User'}</p>
              {user?.authMethod === 'local' && (
                <Link href="/change-password" className="text-blue-500 hover:underline mt-2 text-sm">
                  Change Password
                </Link>
              )}
            </div>
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition"
              >
                Logout
              </button>
            ) : (
              <Link href="/login">
                <div className="w-full py-2 text-center text-white bg-blue-500 rounded-md hover:bg-blue-600 transition">
                  Login
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
