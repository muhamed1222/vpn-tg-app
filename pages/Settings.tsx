import React, { useState } from 'react';
import { useAuth } from '../App';
import { LogOut } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.username || '');

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tighter text-[#0A0A0A]">Settings</h1>
        <p className="text-[14px] text-[rgba(0,0,0,0.45)] font-medium">Manage your account preferences.</p>
      </div>

      {/* Full Name Section */}
      <div className="card-ref">
        <div className="p-8">
          <h3 className="text-[15px] font-bold mb-1">Full name</h3>
          <p className="text-[13px] text-[rgba(0,0,0,0.45)] mb-6">This is your name as it will be displayed on the platform.</p>
          
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-[rgba(0,0,0,0.6)]">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-[#F5F5F5] border border-transparent rounded-lg text-[14px] font-medium focus:bg-white focus:border-[rgba(0,0,0,0.1)] transition-all"
              placeholder="Muhamed Chalemat"
            />
          </div>
        </div>
        <div className="card-footer flex justify-between items-center">
          <span className="text-[12px] text-[rgba(0,0,0,0.45)]">Maximum of 30 characters</span>
          <button className="btn-black opacity-50 cursor-not-allowed">Save</button>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="card-ref">
        <div className="p-8">
          <h3 className="text-[15px] font-bold mb-1">Avatar</h3>
          <p className="text-[13px] text-[rgba(0,0,0,0.45)] mb-6">This is what you will look like on the platform.</p>
          
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-[#0A0A0A] rounded-lg flex items-center justify-center overflow-hidden">
               <img src={user?.avatar} alt="" className="w-full h-full object-cover grayscale" />
             </div>
             <button className="btn-white">Browse</button>
          </div>
        </div>
        <div className="card-footer flex justify-between items-center">
          <span className="text-[12px] text-[rgba(0,0,0,0.45)]">Square image recommended</span>
          <button className="btn-black opacity-50 cursor-not-allowed">Save</button>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="card-ref">
        <div className="p-8">
          <h3 className="text-[15px] font-bold mb-1">Delete account</h3>
          <p className="text-[13px] text-[rgba(0,0,0,0.45)] mb-6">Permanently delete your account and all associated data. This action is practically immediate, and cannot be undone.</p>
        </div>
        <div className="card-footer flex justify-between items-center">
          <span className="text-[12px] text-[rgba(0,0,0,0.45)]">Proceed with caution</span>
          <button className="bg-[#FF3B30] text-white px-4 py-2 rounded-md text-[13px] font-bold hover:opacity-90 transition-opacity">Delete</button>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-[13px] font-bold text-[rgba(0,0,0,0.3)] hover:text-[#0A0A0A] transition-colors"
        >
          <LogOut size={14} /> Log out
        </button>
      </div>
    </div>
  );
};