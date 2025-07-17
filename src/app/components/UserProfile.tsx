'use client'

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaUserCircle } from "react-icons/fa";

const UserProfile = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-5">
        <div>
          <p className="font-medium text-xl">
            Hello, {user?.username || user?.name || user?.email || "Welcome"}
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

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
};

type SettingsModalProps = {
  onClose: () => void;
};

const SettingsModal = ({ onClose }: SettingsModalProps) => {

  const { user } = useSelector((state: any) => state.auth);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-xl font-semibold mb-4">My Settings</h2>

        <div className="space-y-4">
           <p className="font-medium text-xl">
            Hello, {user?.username || user?.name || user?.email || "welcome"}
          </p>

          <p className='font-medium text-xl'>Change password</p>
          <p className="text-red-600 font-semibold cursor-pointer">Log Out</p>
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
