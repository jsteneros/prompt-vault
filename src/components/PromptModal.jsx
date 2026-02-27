import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, X } from "lucide-react";

function PromptModal({ prompt, onClose, onCopy }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {prompt ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="grid max-h-[88vh] grid-cols-1 md:grid-cols-2">
              <div className="relative flex items-center justify-center bg-slate-100 p-4 md:p-6">
                <img
                  src={prompt.headerImage}
                  alt={prompt.title}
                  className="max-h-[76vh] w-full rounded-2xl object-contain"
                />
              </div>

              <div className="space-y-5 overflow-y-auto p-6 md:p-8">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {prompt.title}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {prompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative max-h-[52vh] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <button
                    type="button"
                    onClick={() => onCopy(prompt.fullPrompt)}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                    aria-label="Copy prompt"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <p className="whitespace-pre-line pr-12 text-sm leading-7 text-slate-700">
                    {prompt.fullPrompt}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default PromptModal;
