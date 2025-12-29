import React, { useState } from 'react';
import { useAuth } from '../App';

export const AccountGeneral: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.username || '');

  return (
    <div className="space-y-6 animate-fade">
      {/* Name Card */}
      <div className="card-ref flex flex-col">
        <div className="p-5 space-y-1">
          <h3 className="text-[15px] font-medium text-fg-4">Full name</h3>
          <p className="text-sm text-fg-2">This is your name as it will be displayed on the platform.</p>
          <div className="pt-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-4 bg-bg-2 border-none rounded-lg text-sm font-medium"
              placeholder="Enter your name"
            />
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border bg-[#FAFAFA] flex items-center justify-between rounded-b-xl">
          <span className="text-xs text-fg-2 font-medium">Maximum of 30 characters</span>
          <button className="btn-footer bg-fg-4 text-white hover:bg-fg-4/90 disabled:opacity-50" disabled={name === user?.username}>
            Save
          </button>
        </div>
      </div>

      {/* Avatar Card */}
      <div className="card-ref flex flex-col">
        <div className="p-5 space-y-1">
          <h3 className="text-[15px] font-medium text-fg-4">Avatar</h3>
          <p className="text-sm text-fg-2">This is what you will look like on the platform.</p>
          <div className="pt-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-bg-3">
              <img src={user?.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <button className="btn-footer bg-bg-2 text-fg-4 border border-border hover:bg-bg-3">
              Browse
            </button>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border bg-[#FAFAFA] flex items-center justify-between rounded-b-xl">
          <span className="text-xs text-fg-2 font-medium">Square image recommended</span>
          <button className="btn-footer bg-fg-4 text-white opacity-50 cursor-not-allowed">
            Save
          </button>
        </div>
      </div>

      {/* Delete Card */}
      <div className="card-ref flex flex-col border-red-100">
        <div className="p-5 space-y-1">
          <h3 className="text-[15px] font-medium text-fg-4">Delete account</h3>
          <p className="text-sm text-fg-2">Permanently delete your account and all associated projects. This action is practically immediate, and cannot be undone.</p>
        </div>
        <div className="px-5 py-3 border-t border-border bg-[#FAFAFA] flex items-center justify-between rounded-b-xl">
          <span className="text-xs text-fg-2 font-medium">Proceed with caution</span>
          <button className="btn-footer bg-[#FF3B30] text-white hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};