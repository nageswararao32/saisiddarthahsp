import clsx from 'clsx'
import { motion } from 'framer-motion'

export default function Card({ className, children, hover = false, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={hover ? { y: -3 } : undefined}
      className={clsx(
        'rounded-2xl border border-ink-100 bg-white shadow-[0_1px_2px_rgba(15,17,26,0.04)]',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
