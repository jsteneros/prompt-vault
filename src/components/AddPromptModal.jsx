import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";

const initialForm = {
  title: "",
  description: "",
  fullPrompt: "",
  headerImage: "",
  tags: "",
  isFavorite: false,
  visibility: "private",
};

function toFormState(initialPrompt) {
  if (!initialPrompt) return initialForm;
  return {
    title: initialPrompt.title || "",
    description: initialPrompt.description || "",
    fullPrompt: initialPrompt.fullPrompt || "",
    headerImage: initialPrompt.headerImage || "",
    tags: Array.isArray(initialPrompt.tags) ? initialPrompt.tags.join(", ") : "",
    isFavorite: Boolean(initialPrompt.isFavorite),
    visibility: initialPrompt.visibility === "public" ? "public" : "private",
  };
}

function AddPromptModal({
  open,
  onClose,
  onSubmit,
  initialPrompt = null,
  mode = "create",
}) {
  const [form, setForm] = useState(initialForm);
  const [imageName, setImageName] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(toFormState(initialPrompt));
    setImageName(initialPrompt?.headerImage ? "Current image" : "");
    setSubmitError("");
    setIsProcessingImage(false);
  }, [open, initialPrompt]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setSubmitError("Image is too large. Please use an image under 4MB.");
      return;
    }
    setSubmitError("");
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      updateField("headerImage", result);
      setImageName(file.name);
      setIsProcessingImage(false);
    };
    reader.onerror = () => {
      setSubmitError("Could not read image file. Please choose another image.");
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    if (isProcessingImage) {
      setSubmitError("Image is still processing. Please wait a moment.");
      return;
    }
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      fullPrompt: form.fullPrompt.trim(),
      headerImage: form.headerImage,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      visibility: form.visibility === "public" ? "public" : "private",
    };

    if (
      !payload.title ||
      !payload.description ||
      !payload.fullPrompt ||
      !payload.headerImage ||
      !payload.tags.length
    ) {
      setSubmitError("Please complete all fields before submitting.");
      return;
    }

    const result = await onSubmit(payload);
    if (result?.ok) {
      onClose();
      return;
    }
    setSubmitError(result?.error || "Could not save prompt. Please try again.");
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl md:p-8"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  New Entry
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  {mode === "edit" ? "Edit Prompt" : "Add Prompt"}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                aria-label="Close add prompt form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                  placeholder="Prompt title"
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  Description
                </span>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                  placeholder="Short summary (2-3 lines)"
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  Full Prompt
                </span>
                <textarea
                  required
                  rows={5}
                  value={form.fullPrompt}
                  onChange={(event) =>
                    updateField("fullPrompt", event.target.value)
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                  placeholder="Complete prompt text"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Header Image Upload
                </span>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <input
                    type="file"
                    accept="image/*"
                    required={!form.headerImage}
                    onChange={handleImageUpload}
                    className="w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                  />
                </div>
                {imageName ? (
                  <p className="text-xs text-slate-500">Selected: {imageName}</p>
                ) : null}
                {form.headerImage ? (
                  <img
                    src={form.headerImage}
                    alt="Header preview"
                    className="h-20 w-full rounded-lg object-cover"
                  />
                ) : null}
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Tags (comma separated)
                </span>
                <input
                  type="text"
                  required
                  value={form.tags}
                  onChange={(event) => updateField("tags", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                  placeholder="AI, Writing, Productivity"
                />
              </label>
            </div>

            <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isFavorite}
                onChange={(event) => updateField("isFavorite", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
              />
              Mark as favorite
            </label>

            <div className="mt-4 space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Prompt visibility
              </span>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={form.visibility === "private"}
                    onChange={(event) =>
                      updateField("visibility", event.target.value)
                    }
                    className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  Private (only me)
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={form.visibility === "public"}
                    onChange={(event) =>
                      updateField("visibility", event.target.value)
                    }
                    className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  Public (visible on homepage)
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              {submitError ? (
                <p className="mr-auto text-sm text-rose-600">{submitError}</p>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessingImage}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {mode === "edit" ? "Save Changes" : "Add Prompt"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default AddPromptModal;
