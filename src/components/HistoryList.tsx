import { ScanHistoryEntry } from "../types";
import { Clock, Flame, Calendar, Trash2, ChevronRight, Scale } from "lucide-react";

interface HistoryListProps {
  history: ScanHistoryEntry[];
  onSelectEntry: (entry: ScanHistoryEntry) => void;
  onClearHistory: () => void;
  selectedId?: string;
}

export default function HistoryList({
  history,
  onSelectEntry,
  onClearHistory,
  selectedId
}: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-stone-50/50 dark:bg-stone-900/10 rounded-2xl border border-stone-100 dark:border-stone-850">
        <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">История сканирований пуста</p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 max-w-xs mx-auto">
          Здесь будут отображаться ваши просканированные блюда с их калорийностью.
        </p>
      </div>
    );
  }

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) + " - " + date.toLocaleDateString("ru-RU", { month: "short", day: "numeric" });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-stone-800 dark:text-stone-200 text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          Дневник питания ({history.length})
        </h3>
        <button
          onClick={onClearHistory}
          className="text-red-500 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Очистить
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
        {history.map((entry) => {
          const isSelected = selectedId === entry.id;
          return (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className={`w-full p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm"
                  : "border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900/20 hover:border-stone-300 dark:hover:border-stone-700"
              }`}
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200 dark:border-stone-800">
                <img
                  src={entry.imageUrl}
                  alt={entry.analysis.foodName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200 truncate capitalize">
                  {entry.analysis.foodName}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                  <span>{formatTimestamp(entry.timestamp)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Scale className="w-3 h-3" />
                    {entry.analysis.portionWeight}г
                  </span>
                </div>
              </div>

              {/* Calorie Pill */}
              <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
                <Flame className="w-3.5 h-3.5" />
                <span>{entry.analysis.calories}</span>
              </div>

              <ChevronRight className={`w-4 h-4 text-stone-300 ${isSelected ? "text-emerald-500" : ""}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
