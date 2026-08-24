import { AnimatePresence, motion } from "motion/react"

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "حذف",
  cancelLabel = "لغو",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#151814] p-6"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-black text-white">
              {title}
            </h3>

            <p className="mt-3 text-sm leading-7 text-white/55">
              {message}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="h-11 flex-1 rounded-xl border border-white/10 text-sm font-bold text-white/70 transition hover:border-white/20 hover:text-white"
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="h-11 flex-1 rounded-xl bg-red-500/90 font-bold text-white transition hover:bg-red-500"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
