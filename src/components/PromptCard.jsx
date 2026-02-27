import { motion } from "framer-motion";
import { Copy, Pencil, Star, Trash2 } from "lucide-react";
import { getGravatarUrl } from "../utils/gravatar";

function PromptCard({
  prompt,
  onCopy,
  onToggleFavorite,
  onReadMore,
  onTagClick,
  onRequireAuth,
  onEdit,
  onDelete,
  readOnly = false,
}) {
  const owner = prompt.owner;
  const ownerAvatar = owner?.email ? getGravatarUrl(owner.email, 40) : "";

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#d8d8d8] bg-white shadow-[0_6px_16px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_10px_22px_rgba(0,0,0,0.1)]"
    >
      <div className="relative h-36 overflow-hidden border-b border-[#ececec] bg-[#f4f4f4]">
        <img
          src={prompt.headerImage}
          alt={prompt.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {owner ? (
          <img
            src={ownerAvatar}
            alt={owner.email || owner.name || "owner"}
            className="absolute left-3 top-3 h-8 w-8 rounded-full border border-[#bdbdbd] bg-white object-cover"
            loading="lazy"
          />
        ) : null}
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              readOnly ? onRequireAuth?.() : onToggleFavorite?.(prompt.id)
            }
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#bdbdbd] bg-white text-slate-700 transition hover:bg-[#f3f3f3]"
            aria-label="Toggle favorite"
          >
            <Star
              className={`h-4 w-4 transition-all ${
                !readOnly && prompt.isFavorite
                  ? "fill-amber-400 text-amber-500"
                  : "text-slate-500"
              }`}
            />
          </button>
          {!readOnly ? (
            <>
              <button
                type="button"
                onClick={() => onEdit?.(prompt)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#bdbdbd] bg-white text-slate-700 transition hover:bg-[#f3f3f3]"
                aria-label="Edit prompt"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(prompt)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#bdbdbd] bg-white text-slate-700 transition hover:bg-[#f3f3f3]"
                aria-label="Delete prompt"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-4 p-4">
        <div className="space-y-2">
          <h3 className="truncate text-[19px] font-semibold leading-tight text-[#171717]">
            {prompt.title}
          </h3>
          <p
            className="text-sm leading-6 text-[#6d6d6d]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {prompt.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {prompt.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick?.(tag)}
              className="rounded-full border border-[#d2d2d2] bg-[#f3f3f3] px-2.5 py-0.5 text-xs font-medium text-[#676767] transition hover:bg-[#ececec]"
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => onCopy(prompt.fullPrompt)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#c9c9c9] bg-transparent px-3 py-2 text-sm font-semibold text-[#5d5d5d] transition hover:bg-[#f3f3f3]"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
          <button
            type="button"
            onClick={() => onReadMore(prompt)}
            className="rounded-xl bg-[#444444] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#363636]"
          >
            Read More
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default PromptCard;
