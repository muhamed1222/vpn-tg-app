import React from 'react';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { SubscriptionStatus } from '../types';

const MOCK_USAGE_DATA = [
  { day: 'Dec 14', value: 0 },
  { day: 'Dec 15', value: 80 },
  { day: 'Dec 16', value: 100 },
  { day: 'Dec 17', value: 0 },
  { day: 'Dec 18', value: 0 },
  { day: 'Dec 19', value: 0 },
  { day: 'Dec 20', value: 0 },
  { day: 'Dec 21', value: 0 },
  { day: 'Dec 22', value: 0 },
  { day: 'Dec 23', value: 0 },
  { day: 'Dec 24', value: 0 },
  { day: 'Dec 25', value: 0 },
  { day: 'Dec 26', value: 0 },
  { day: 'Dec 27', value: 0 },
  { day: 'Dec 28', value: 0 },
];

export const Account: React.FC = () => {
  const { subscription, user } = useAuth();
  const isActive = subscription.status === SubscriptionStatus.ACTIVE;

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tighter text-[#0A0A0A]">Account</h1>
        <p className="text-[14px] text-[rgba(0,0,0,0.45)] font-medium">Manage your subscription and usage.</p>
      </div>

      {/* Subscription Card */}
      <div className="card-ref">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-[13px] font-bold">Plan</span>
             <span className="text-[13px] text-[rgba(0,0,0,0.45)]">Free trial</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[13px] font-medium">
              <span>Traffic</span>
              <span className="text-[rgba(0,0,0,0.45)]">2 GB / Unlimited</span>
            </div>
            <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
               <div className="h-full bg-[#0A0A0A] w-[15%]" />
            </div>
          </div>
        </div>
        
        <div className="card-footer flex justify-between items-center">
          <span className="text-[12px] text-[rgba(0,0,0,0.45)] font-medium">
            Your free trial ends on {subscription.activeUntil || 'December 29, 2025'}
          </span>
          <Link to="/pay" className="btn-black">Upgrade early</Link>
        </div>
      </div>

      {/* Usage Section */}
      <div className="card-ref">
        <div className="p-8">
          <h3 className="text-[15px] font-bold mb-1">Usage</h3>
          <p className="text-[13px] text-[rgba(0,0,0,0.45)] mb-8">A breakdown of your usage over your billing cycle.</p>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_USAGE_DATA} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: 'rgba(0,0,0,0.4)'}} 
                  interval={13}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                   {MOCK_USAGE_DATA.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#998DFF' : '#E5E5E5'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-1">
             <UsageItem label={user?.username || 'User'} value="0" color="#998DFF" />
             <UsageItem label="outlivion.space" value="2" color="#998DFF" />
             <UsageItem label="Total" value="2" isTotal />
          </div>
        </div>
      </div>
    </div>
  );
};

const UsageItem = ({ label, value, color, isTotal }: { label: string, value: string, color?: string, isTotal?: boolean }) => (
  <div className={`flex items-center justify-between p-3 rounded-md text-[13px] font-medium ${isTotal ? '' : 'bg-[#F5F5F5]'}`}>
    <div className="flex items-center gap-3">
      {color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
      {isTotal && <div className="w-2 h-2 rounded-full border border-[rgba(0,0,0,0.2)]" />}
      <span className={isTotal ? 'text-[rgba(0,0,0,0.4)]' : ''}>{label}</span>
    </div>
    <span className={isTotal ? 'text-[rgba(0,0,0,0.4)]' : ''}>{value}</span>
  </div>
);