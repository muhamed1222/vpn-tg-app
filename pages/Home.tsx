import React from 'react';
import { useAuth } from '../App';
import { Logo } from '../components/Logo';

export const Home: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
      {/* Background World Map Pattern (Simplified) */}
      <div className="absolute bottom-0 w-full h-[300px] opacity-[0.05] pointer-events-none">
         <svg viewBox="0 0 1000 300" className="w-full h-full">
            <path d="M0,150 Q250,50 500,150 T1000,150" fill="none" stroke="currentColor" strokeWidth="1" />
         </svg>
      </div>

      <div className="w-full max-w-[400px] flex flex-col items-center gap-8 animate-fade z-10">
        <Logo className="w-10 h-10 text-[#0A0A0A]" />
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">Log in to Outlivion</h1>
          <p className="text-[14px] text-[rgba(0,0,0,0.45)] font-medium">Simple, beautiful VPN dashboard.</p>
        </div>

        <div className="w-full space-y-4">
          <input 
            type="email" 
            placeholder="Email address" 
            className="w-full p-3.5 bg-[#F5F5F5] border border-transparent rounded-xl text-[14px] font-medium focus:bg-white focus:border-[rgba(0,0,0,0.1)] transition-all"
            disabled
          />
          <button
            onClick={login}
            className="w-full bg-[#998DFF]/20 text-[#998DFF] py-3.5 rounded-xl font-bold text-[14px] transition-all hover:bg-[#998DFF]/30"
          >
            Continue with Telegram
          </button>
        </div>

        <div className="flex items-center gap-4 w-full">
          <div className="h-[1px] flex-1 bg-[rgba(0,0,0,0.05)]" />
          <span className="text-[11px] font-bold text-[rgba(0,0,0,0.2)] uppercase">or</span>
          <div className="h-[1px] flex-1 bg-[rgba(0,0,0,0.05)]" />
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <SocialButton icon="Google" />
          <SocialButton icon="GitHub" />
        </div>

        <p className="text-[12px] text-[rgba(0,0,0,0.4)] font-medium mt-4">
          Don't have an account? <span className="text-[#998DFF] cursor-pointer font-bold">Register</span>
        </p>
      </div>
    </div>
  );
};

const SocialButton = ({ icon }: { icon: string }) => (
  <button className="flex items-center justify-center gap-2 p-3 bg-[#F5F5F5] rounded-xl text-[13px] font-bold hover:bg-[#EDEDED] transition-all">
    <span className="w-4 h-4 bg-white rounded-sm border border-[rgba(0,0,0,0.05)] text-[10px] flex items-center justify-center">{icon[0]}</span>
    {icon}
  </button>
);