import { Plus } from "lucide-react";

const FILTER_ALL = "All";
const FILTER_FAVORITES = "Favorites";

function FilterBar({
  tags,
  activeFilter,
  activeTag,
  onFilterChange,
  onTagSelect,
  onAddPrompt,
}) {
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onFilterChange(FILTER_ALL)}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              activeFilter === FILTER_ALL
                ? "bg-[#444444] text-white"
                : "border border-[#cdcdcd] bg-transparent text-[#3f3f3f] hover:bg-[#efefef]"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterChange(FILTER_FAVORITES)}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              activeFilter === FILTER_FAVORITES
                ? "bg-[#444444] text-white"
                : "border border-[#cdcdcd] bg-transparent text-[#3f3f3f] hover:bg-[#efefef]"
            }`}
          >
            Favorites
          </button>
        </div>

        <button
          type="button"
          onClick={onAddPrompt}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#ff861f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f37810]"
        >
          <Plus className="h-4 w-4" />
          Add Prompt
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagSelect(tag === activeTag ? null : tag)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium leading-none transition ${
              activeTag === tag
                ? "border border-[#666] bg-[#4b4b4b] text-white"
                : "border border-[#d2d2d2] bg-transparent text-[#666] hover:bg-[#ececec]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FilterBar;
