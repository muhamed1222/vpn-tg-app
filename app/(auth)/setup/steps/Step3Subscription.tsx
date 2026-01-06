'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, CirclePlus, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '@/lib/telegram';

interface Step3SubscriptionProps {
    direction: number;
    variants: any;
    onBack: () => void;
    onNext: () => void;
    onAdd: () => void;
}

export const Step3Subscription: React.FC<Step3SubscriptionProps> = ({
    direction,
    variants,
    onBack,
    onNext,
    onAdd
}) => {
    return (
        <motion.div
            key="step3"
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col"
        >
            {/* Индикатор прогресса 66% */}
            <div className="sticky top-0 z-50 flex items-center justify-between w-fit mb-4">
                <button
                    onClick={onBack}
                    className="p-2 bg-white/10 rounded-xl border border-white/10 active:scale-95 transition-all hover:bg-white/15"
                >
                    <ChevronLeft size={24} className="text-white" />
                </button>
            </div>

            <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="relative w-40 h-40 flex items-center justify-center mb-16">
                    <div className="absolute inset-0 bg-white/5 rounded-full border border-white/10" />
                    <div className="relative z-10 w-24 h-24 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-white">
                            <circle
                                cx="50" cy="50" r="40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeDasharray="8 8"
                                className="opacity-20"
                            />
                            <path
                                d="M50 10 A40 40 0 0 1 50 90"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                className="opacity-90"
                            />
                        </svg>
                        <Plus size={48} className="text-white relative z-10" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-2xl font-medium text-white">Подписка</h1>
                    <p className="text-white/60 text-base leading-relaxed max-w-[300px] mx-auto">
                        Нажмите «Добавить», чтобы настройки применились автоматически
                    </p>
                </div>
            </div>

            <div className="relative z-10 p-6 flex flex-col gap-3 pb-[calc(2rem+env(safe-area-inset-bottom))]">
                <button
                    onClick={() => {
                        triggerHaptic('medium');
                        onAdd();
                    }}
                    className="w-full h-fit bg-[#F55128] hover:bg-[#d43d1f] active:scale-[0.98] transition-all rounded-[10px] py-[14px] flex items-center justify-center gap-2 text-white shadow-lg shadow-[#F55128]/20"
                >
                    <span className="text-lg font-medium">Добавить</span>
                    <CirclePlus size={24} />
                </button>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={onNext}
                        className="w-full h-fit bg-transparent hover:bg-white/5 active:scale-[0.98] transition-all rounded-[10px] py-[14px] flex items-center justify-center gap-2 text-white/40"
                    >
                        <span className="text-base font-medium">Далее</span>
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
