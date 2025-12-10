import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  ...props
}) => {
  return (
    <motion.div
      className={cn(
        "relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200",
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 dark:before:from-gray-800/20 before:to-transparent before:pointer-events-none",
        glow && "shadow-emerald-500/10 dark:shadow-emerald-400/10 shadow-2xl",
        className
      )}
      whileHover={hover ? {
        y: -8,
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
      } : undefined}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};