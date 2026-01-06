'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
            className="flex-1 flex flex-col h-full"
        >
            {children}
        </motion.div>
    );
}
