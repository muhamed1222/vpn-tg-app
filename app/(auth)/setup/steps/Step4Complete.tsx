'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { triggerHaptic } from '@/lib/telegram';

interface Step4CompleteProps {
    direction: number;
    variants: any;
    onBack: () => void;
}

export const Step4Complete: React.FC<Step4CompleteProps> = ({
    direction,
    variants,
    onBack
}) => {
    return (
        <motion.div
            key="step4"
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col"
        >
            <div className="sticky top-0 z-50 flex items-center justify-between w-fit mb-4">
                <button
                    onClick={onBack}
                    className="p-2 bg-white/10 rounded-xl border border-white/10 active:scale-95 transition-all hover:bg-white/15"
                >
                    <ChevronLeft size={24} className="text-white" />
                </button>
            </div>

            <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="relative w-48 h-48 flex items-center justify-center mb-16">
                    <div className="absolute inset-0 bg-[#F55128] rounded-full" />
                    <Check size={80} className="text-white relative z-10" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-2xl font-medium text-white tracking-tight">Готово!</h1>
                    <p className="text-white/60 text-base leading-relaxed max-w-[300px] mx-auto">
                        Нажмите на кнопку включения VPN в приложении v2RayTun
                    </p>
                </div>
            </div>

            <div className="relative z-10 p-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
                <Link
                    href="/"
                    onClick={() => triggerHaptic('success')}
                    className="w-full h-fit bg-[#F55128] hover:bg-[#d43d1f] active:scale-[0.98] transition-all rounded-[10px] py-[14px] flex items-center justify-center text-white shadow-lg shadow-[#F55128]/20"
                >
                    <span className="text-base font-medium">Завершить настройку</span>
                </Link>
            </div>
        </motion.div>
    );
};
