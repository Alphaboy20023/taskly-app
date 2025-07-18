'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserCircle } from "react-icons/fa";
import { logout } from '../redux/authSlice';
import { useRouter } from 'next/navigation';
import type { RootState } from '../redux/store'

const UserProfile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <>
      <div className="flex items-center justify-between p-5 rounded-lg bg-gray-100 shadow shadow-md pt-7">
        <div>
          <p className="font-medium text-xl">
            Hello, {user?.username || user?.displayName || user?.email || "Welcome"}
          </p>

          <button
            onClick={() => setShowSettings(true)}
            className="font-medium text-orange-400 text-xl cursor-pointer"
          >
            My settings
          </button>
        </div>
        <FaUserCircle className="text-3xl text-gray-300" />
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} handleLogout={handleLogout} />}
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
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-xl font-semibold mb-4">My Settings</h2>

        <div className="space-y-4">
          <p className="font-medium text-xl">
            Hello, {user?.username || user?.name || user?.email || "Welcome"}
          </p>

          <p className='font-medium text-xl'>Change password</p>
          <button onClick={handleLogout} className="text-red-600 font-semibold cursor-pointer">Log Out</button>
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
