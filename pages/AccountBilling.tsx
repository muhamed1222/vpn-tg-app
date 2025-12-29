import React from 'react';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';

const MOCK_USAGE_DATA = [
  { day: 'Dec 14', value: 5 }, { day: 'Dec 15', value: 40 },
  { day: 'Dec 16', value: 100 }, { day: 'Dec 17', value: 10 },
  { day: 'Dec 18', value: 0 }, { day: 'Dec 19', value: 5 },
  { day: 'Dec 20', value: 20 }, { day: 'Dec 21', value: 0 },
  { day: 'Dec 22', value: 0 }, { day: 'Dec 23', value: 0 },
  { day: 'Dec 24', value: 0 }, { day: 'Dec 25', value: 0 },
  { day: 'Dec 26', value: 0 }, { day: 'Dec 27', value: 0 },
  { day: 'Dec 28', value: 0 },
];

export const AccountBilling: React.FC = () => {
  const { subscription } = useAuth();

  return (
    <div className="space-y-6 animate-fade">
      {/* Current Plan */}
      <div className="card-ref flex flex-col">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
             <span className="text-[13px] font-bold text-fg-4">Plan</span>
             <span className="text-[13px] text-fg-2">Free trial</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-fg-4">Traffic</span>
              <span className="text-fg-2">2 GB / Unlimited</span>
            </div>
            <div className="w-full h-1.5 bg-bg-2 rounded-full overflow-hidden">
               <div className="h-full bg-fg-4 w-[20%]" />
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border bg-[#FAFAFA] flex items-center justify-between rounded-b-xl">
          <span className="text-xs text-fg-2 font-medium">Your trial ends on Dec 29, 2025</span>
          <Link to="/pay" className="btn-footer bg-fg-4 text-white hover:bg-fg-4/90">
            Upgrade
          </Link>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="card-ref p-5">
        <h3 className="text-[15px] font-medium text-fg-4 mb-1">Usage</h3>
        <p className="text-sm text-fg-2 mb-8">A breakdown of your usage over your billing cycle.</p>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_USAGE_DATA}>
              <XAxis dataKey="day" hide />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                 {MOCK_USAGE_DATA.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#998DFF' : '#F0F0F0'} />
                 ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-8 space-y-1">
           <UsageItem label="Current usage" value="2 GB" color="#998DFF" />
           <UsageItem label="Average per day" value="0.13 GB" />
        </div>
      </div>
    </div>
  );
};

const UsageItem = ({ label, value, color }: { label: string, value: string, color?: string }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-bg-2 text-sm font-medium">
    <div className="flex items-center gap-3 text-fg-3">
      {color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
      <span>{label}</span>
    </div>
    <span className="text-fg-4">{value}</span>
  </div>
);