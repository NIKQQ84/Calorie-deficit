import { useState, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  History, 
  TrendingUp, 
  Flame, 
  Utensils, 
  Sparkles, 
  RefreshCw, 
  Settings, 
  Plus, 
  ChevronRight,
  Info,
  Apple,
  Sliders,
  Scale
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CameraView from "./components/CameraView";
import ImageUpload from "./components/ImageUpload";
import AnalysisResult from "./components/AnalysisResult";
import HistoryList from "./components/HistoryList";
import { FoodAnalysis, ScanHistoryEntry } from "./types";

export default function App() {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // History & Goals State
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<ScanHistoryEntry | null>(null);
  const [dailyGoal, setDailyGoal] = useState<number>(2000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState<string>("2000");

  // Load history and daily goal from local storage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("calorie_scanner_history");
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
        if (parsed.length > 0) {
          // Set the latest scan as the initial preview
          setSelectedHistoryEntry(parsed[0]);
          setAnalysis(parsed[0].analysis);
          setCapturedImage(parsed[0].imageUrl);
        }
      }

      const savedGoal = localStorage.getItem("calorie_scanner_goal");
      if (savedGoal) {
        setDailyGoal(Number(savedGoal));
        setGoalInput(savedGoal);
      }
    } catch (err) {
      console.error("Error loading localStorage data:", err);
    }
  }, []);

  // Save history helper
  const saveHistoryToLocalStorage = (newHistory: ScanHistoryEntry[]) => {
    try {
      localStorage.setItem("calorie_scanner_history", JSON.stringify(newHistory));
    } catch (err) {
      console.error("Error saving history:", err);
    }
  };

  // Save goal helper
  const saveGoalToLocalStorage = (goalVal: number) => {
    try {
      localStorage.setItem("calorie_scanner_goal", goalVal.toString());
    } catch (err) {
      console.error("Error saving goal:", err);
    }
  };

  // Handle scanned image capture
  const handleImageCaptureOrSelect = async (base64Image: string) => {
    setCapturedImage(base64Image);
    setShowCamera(false);
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/scan-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Не удалось проанализировать изображение.");
      }

      const foodAnalysis: FoodAnalysis = resData.data;
      setAnalysis(foodAnalysis);

      // Only add to diary history if it's actually food
      if (foodAnalysis.isFood) {
        const newEntry: ScanHistoryEntry = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          analysis: foodAnalysis,
          imageUrl: base64Image,
        };

        const updatedHistory = [newEntry, ...history];
        setHistory(updatedHistory);
        setSelectedHistoryEntry(newEntry);
        saveHistoryToLocalStorage(updatedHistory);
      }
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Произошла неизвестная ошибка при подключении к ИИ.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset current view state to scan a new item
  const handleReset = () => {
    setCapturedImage(null);
    setAnalysis(null);
    setError(null);
    setSelectedHistoryEntry(null);
  };

  // Select historical entry to view
  const handleSelectHistoryEntry = (entry: ScanHistoryEntry) => {
    setSelectedHistoryEntry(entry);
    setAnalysis(entry.analysis);
    setCapturedImage(entry.imageUrl);
    setError(null);
  };

  // Clear all scan histories
  const handleClearHistory = () => {
    if (confirm("Вы уверены, что хотите очистить весь дневник питания?")) {
      setHistory([]);
      setSelectedHistoryEntry(null);
      setAnalysis(null);
      setCapturedImage(null);
      localStorage.removeItem("calorie_scanner_history");
    }
  };

  // Handle goal change
  const handleSaveGoal = () => {
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val > 0) {
      setDailyGoal(val);
      saveGoalToLocalStorage(val);
      setIsEditingGoal(false);
    }
  };

  // Calculate today's logged calories (since midnight)
  const getTodayCalories = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return history
      .filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= today;
      })
      .reduce((sum, entry) => sum + entry.analysis.calories, 0);
  };

  const todayCalories = getTodayCalories();
  const progressPercent = Math.min(Math.round((todayCalories / dailyGoal) * 100), 100);

  return (
    <div id="app" className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 text-slate-100 flex flex-col antialiased">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.12),rgba(0,0,0,0))] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Apple className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 bg-clip-text text-transparent flex items-center gap-1.5">
                Food Calorie Scanner
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-mono tracking-normal uppercase">
                  Gemini AI
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Мгновенный подсчёт калорий по фото</p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 rounded-2xl px-4 py-2 transition-all backdrop-blur-md">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold leading-none">
                Сегодня
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {todayCalories} <span className="text-[10px] font-normal text-slate-400">/ {dailyGoal} ккал</span>
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center font-bold text-xs font-mono text-emerald-400 relative">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="stroke-white/5"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="stroke-emerald-400 transition-all duration-500"
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - progressPercent / 100)}`}
                />
              </svg>
              <span className="relative z-10">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Scan Control Panel & Result Display */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Top Info Alert banner */}
          {!capturedImage && !showCamera && (
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-3xl p-5 flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-emerald-300">Как это работает?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Просто наведите камеру на тарелку с едой или загрузите готовую фотографию блюда. 
                  Искусственный интеллект распознает продукты, рассчитает вес порции, распределение белков, жиров, углеводов и предоставит подробную калорийность с советами нутрициолога.
                </p>
              </div>
            </div>
          )}

          {/* Core Interactive Scanner Sandbox Container */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6">
            
            {/* Header within Sandbox */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-400" />
                {analysis ? "Анализ блюда" : "Сканирование и загрузка"}
              </h2>
              
              {capturedImage && (
                <button
                  onClick={handleReset}
                  className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.15] text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Сканировать другое</span>
                </button>
              )}
            </div>

            {/* Sandbox View Swapping */}
            <div className="relative">
              {showCamera ? (
                <CameraView
                  onCapture={handleImageCaptureOrSelect}
                  onClose={() => setShowCamera(false)}
                />
              ) : isAnalyzing ? (
                /* Scanning loader screen */
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="relative">
                    {/* Glowing outer circles */}
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin flex items-center justify-center relative z-10">
                      <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1 z-10">
                    <h3 className="font-bold text-lg text-emerald-300">Анализируем ваше блюдо...</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Искусственный интеллект распознает ингредиенты, вычисляет примерную массу порции и взвешивает пищевую ценность.
                    </p>
                  </div>
                </div>
              ) : error ? (
                /* Error view */
                <div className="text-center py-12 px-6 flex flex-col items-center max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
                    <Info className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base text-slate-100 mb-2">Не удалось распознать</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{error}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Сбросить
                    </button>
                    {capturedImage && (
                      <button
                        onClick={() => handleImageCaptureOrSelect(capturedImage)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Повторить запрос
                      </button>
                    )}
                  </div>
                </div>
              ) : analysis ? (
                /* Successful Analysis Results Output */
                <AnalysisResult analysis={analysis} imageUrl={capturedImage || ""} />
              ) : (
                /* Initial landing: choice of camera scan or file upload */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  {/* Option 1: Live Camera Scan */}
                  <div 
                    onClick={() => setShowCamera(true)}
                    className="group border border-white/10 hover:border-emerald-500/40 bg-white/[0.02] hover:bg-emerald-500/[0.02] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[220px]"
                  >
                    <div className="p-4 bg-emerald-500/10 text-emerald-400 group-hover:text-emerald-300 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <Camera className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-slate-200 group-hover:text-white mb-1 text-base">
                      Использовать камеру
                    </h3>
                    <p className="text-xs text-slate-400 group-hover:text-slate-300 max-w-[200px] leading-relaxed">
                      Сделайте моментальное фото готового блюда с вашего устройства
                    </p>
                  </div>

                  {/* Option 2: Upload existing photo */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex items-center justify-center">
                    <ImageUpload onImageSelected={handleImageCaptureOrSelect} />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Brief Quick FAQ & Tips disclaimer card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[11px] text-slate-400/90 leading-relaxed flex items-start gap-3">
            <Info className="w-4.5 h-4.5 text-emerald-500/70 shrink-0 mt-0.5" />
            <p>
              Для получения максимально точных результатов делайте фото сверху под небольшим углом, чтобы ИИ мог визуально оценить объём блюда. Обеспечьте хорошее освещение и старайтесь, чтобы в кадр попадало только одно блюдо.
            </p>
          </div>

        </div>

        {/* Right Side: Diary History log & User nutritional goals */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Goal Tracker Card (Glassmorphism) */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-emerald-400" />
                Дневная цель
              </h3>
              
              {!isEditingGoal ? (
                <button
                  onClick={() => setIsEditingGoal(true)}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  Изменить
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveGoal}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    ОК
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingGoal(false);
                      setGoalInput(dailyGoal.toString());
                    }}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-300 cursor-pointer"
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>

            {/* Goal value representation */}
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Лимит калорий
                </span>
                {isEditingGoal ? (
                  <input
                    type="number"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="w-24 bg-slate-900 border border-emerald-500/50 rounded-lg px-2 py-1 text-sm text-emerald-400 font-bold mt-1 focus:outline-none"
                    min="500"
                    max="10000"
                  />
                ) : (
                  <span className="text-xl font-black text-slate-100 font-mono">
                    {dailyGoal}{" "}
                    <span className="text-xs font-medium text-slate-400">ккал</span>
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Осталось на сегодня
                </span>
                <span className={`text-xl font-black font-mono ${
                  dailyGoal - todayCalories < 0 ? "text-red-400" : "text-emerald-400"
                }`}>
                  {Math.max(0, dailyGoal - todayCalories)}{" "}
                  <span className="text-xs font-medium text-slate-400">ккал</span>
                </span>
              </div>
            </div>

            {/* Simple Daily Goal Progress bar */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium text-slate-300">
                <span>Прогресс</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-white/[0.05] border border-white/5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Calorie Scan History diary List */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 shadow-xl flex flex-col gap-4">
            <HistoryList
              history={history}
              onSelectEntry={handleSelectHistoryEntry}
              onClearHistory={handleClearHistory}
              selectedId={selectedHistoryEntry?.id}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500 mt-auto relative z-10 bg-slate-950/20 backdrop-blur-sm">
        <p>© 2026 Food Calorie Scanner. Работает на базе моделей Google Gemini 3.5 Flash.</p>
      </footer>

    </div>
  );
}
