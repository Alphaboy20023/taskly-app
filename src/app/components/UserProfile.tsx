'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserCircle } from 'react-icons/fa';
import { logout, setUser } from '../redux/authSlice';
import { useRouter } from 'next/navigation';
import type { RootState } from '../redux/store';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Link from 'next/link';

const UserProfile = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Restore user from localStorage on reload
    const storedUser = localStorage.getItem('taskly_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (!user) dispatch(setUser(parsedUser));
      } catch (err) {
        console.error('Failed to parse user from storage', err);
      }
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    dispatch(logout());
    localStorage.removeItem('taskly_token');
    localStorage.removeItem('taskly_user');
    localStorage.removeItem('token');
    sessionStorage.clear();

    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase logout error:', err);
    }

    router.push('/login');
  };

  return (
    <>
      <div className="flex items-center shadow shadow-lg justify-between p-5 rounded-lg  pt-7">
        <div className='flex flex-col gap-4'>
          <p className="font-semibold text-xl text-black">
            Hello, {user?.username || user?.displayName || user?.email || 'Welcome'}
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="font-semibole text-orange-500 text-xl cursor-pointer border border-orange-400 px-1 p-1 rounded-lg"
          >
            My settings
          </button>
        </div>
        <FaUserCircle className="text-3xl text-gray-300" />
      </div>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} handleLogout={handleLogout} />
      )}
    </>
  );
};

type SettingsModalProps = {
  onClose: () => void;
  handleLogout: () => void;
};

const SettingsModal = ({ onClose, handleLogout }: SettingsModalProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[95%] max-w-md relative">
        <h2 className="text-xl font-semibold mb-4">My Settings</h2>

        <div className="space-y-4">
          <p className="font-medium text-xl">
            Hello, {user?.username || user?.name || user?.email || 'Welcome'}
          </p>

          {/* <p className="font-medium text-xl">Change password</p> */}

          <div className="block">
            {user ? (
              <>
                <button onClick={handleLogout} className="text-red-600 font-semibold cursor-pointer border border-red px-3 p-1 rounded-lg">Logout</button>
              </>
            ) : (
              <Link href="/login" className='text-red-600 font-semibold text-xl border border-red px-3 p-1 rounded-lg cursor-pointer'>Login</Link>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
