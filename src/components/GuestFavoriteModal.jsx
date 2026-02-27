import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

function GuestFavoriteModal({ open, onClose, onLogin, onCreateAccount }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Save Favorites
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label="Close notice"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm leading-6 text-slate-700">
              Please create an account to save your favorite prompts.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onLogin}
                className="rounded-xl bg-[#444444] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#363636]"
              >
                Login
              </button>
              <button
                type="button"
                onClick={onCreateAccount}
                className="rounded-xl border border-[#c9c9c9] bg-white px-4 py-2 text-sm font-semibold text-[#5f5f5f] transition hover:bg-[#f3f3f3]"
              >
                Create Account
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default GuestFavoriteModal;
