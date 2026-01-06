'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plug, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { triggerHaptic } from '@/lib/telegram';

interface Step1WelcomeProps {
    direction: number;
    variants: any;
    platform: string;
    onNext: () => void;
    onOtherDevice: () => void;
}

export const Step1Welcome: React.FC<Step1WelcomeProps> = ({
    direction,
    variants,
    platform,
    onNext,
    onOtherDevice
}) => {
    return (
        <motion.div
            key="step1"
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col"
        >
            <div className="sticky top-0 z-50 flex items-center justify-between w-fit mb-4">
                <Link href="/" onClick={() => triggerHaptic('light')} className="p-2 bg-white/10 rounded-xl border border-white/10 active:scale-95 transition-all hover:bg-white/15">
                    <ChevronLeft size={24} className="text-white" />
                </Link>
            </div>

            <div className="relative flex-1 flex flex-col items-center justify-center px-6">
                <div className="relative w-32 h-32 flex items-center justify-center mb-12">
                    <div className="absolute inset-0 bg-[#F55128]/20 rounded-full blur-2xl" />
                    <div className="relative bg-white/5 p-8 rounded-[40px] border border-white/10 flex items-center justify-center rotate-45">
                        <Plug size={48} className="text-white" />
                    </div>
                </div>

                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-2xl font-medium text-white leading-tight">
                        Настройка на {platform}
                    </h1>
                    <p className="text-white/60 text-base leading-relaxed max-w-[280px] mx-auto">
                        Настройка VPN происходит в 3 шага и занимает пару минут
                    </p>
                </div>
            </div>

            <div className="relative z-10 p-6 space-y-3 pb-[calc(2rem+env(safe-area-inset-bottom))]">
                <button
                    onClick={onNext}
                    className="w-full h-fit bg-[#F55128] hover:bg-[#d43d1f] active:scale-[0.98] transition-all rounded-[10px] py-[14px] text-base font-medium text-white shadow-lg shadow-[#F55128]/20"
                >
                    Начать настройку на этом устройстве
                </button>

                <button
                    onClick={() => {
                        triggerHaptic('light');
                        onOtherDevice();
                    }}
                    className="w-full h-fit bg-transparent border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all rounded-[10px] py-[14px] text-base font-medium text-white"
                >
                    Установить на другом устройстве
                </button>
            </div>
        </motion.div>
    );
};
