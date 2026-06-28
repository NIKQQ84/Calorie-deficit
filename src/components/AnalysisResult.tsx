import { FoodAnalysis } from "../types";
import { CheckCircle, AlertTriangle, Lightbulb, Flame, Scale, TrendingUp, Info } from "lucide-react";
import { motion } from "motion/react";

interface AnalysisResultProps {
  analysis: FoodAnalysis;
  imageUrl: string;
}

export default function AnalysisResult({ analysis, imageUrl }: AnalysisResultProps) {
  if (!analysis.isFood) {
    return (
      <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
          Еда не обнаружена
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 leading-relaxed">
          ИИ не смог распознать продукты питания или напитки на этом изображении. Пожалуйста, попробуйте сделать другой снимок при хорошем освещении, убедившись, что еда находится в фокусе.
        </p>
        {imageUrl && (
          <div className="w-40 h-40 mx-auto rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
            <img src={imageUrl} alt="Снимок" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
  }

  // Calculate macronutrient distribution in kcal for balance calculations
  // P: 4 kcal/g, C: 4 kcal/g, F: 9 kcal/g
  const proteinKcal = analysis.protein * 4;
  const carbsKcal = analysis.carbs * 4;
  const fatKcal = analysis.fat * 9;
  const totalMacrosKcal = proteinKcal + carbsKcal + fatKcal || 1;

  const proteinPct = Math.round((proteinKcal / totalMacrosKcal) * 100);
  const carbsPct = Math.round((carbsKcal / totalMacrosKcal) * 100);
  const fatPct = Math.round((fatKcal / totalMacrosKcal) * 100);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left column: Image & Quick Stats */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Scanned Image Preview */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg border border-stone-100 dark:border-stone-800">
          <img
            src={imageUrl}
            alt={analysis.foodName}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Распознано</span>
          </div>
          {analysis.confidence && (
            <div className="absolute bottom-4 right-4 bg-stone-900/80 backdrop-blur-md text-stone-200 border border-stone-800 px-2.5 py-1 rounded-lg text-[10px] font-mono">
              Точность: {Math.round(analysis.confidence * 100)}%
            </div>
          )}
        </div>

        {/* Calories Card */}
        <div className="bg-stone-50 dark:bg-stone-900/30 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
          <Flame className="w-7 h-7 text-rose-500 mb-2" />
          <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
            Энергетическая ценность
          </span>
          <h2 className="text-4xl font-extrabold text-stone-900 dark:text-stone-50 mt-1 flex items-baseline gap-1">
            {analysis.calories}{" "}
            <span className="text-lg font-medium text-stone-400 dark:text-stone-500">
              ккал
            </span>
          </h2>
          <div className="flex items-center gap-1.5 mt-3 text-stone-500 dark:text-stone-400 text-xs">
            <Scale className="w-4 h-4 text-stone-400" />
            <span>Вес порции: ~{analysis.portionWeight} г</span>
          </div>
        </div>
      </div>

      {/* Right column: Nutritional details */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Food Title & Confidence Warning */}
        <div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            Результат сканирования
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 dark:text-stone-50 mt-1 capitalize leading-tight">
            {analysis.foodName}
          </h1>
        </div>

        {/* Macronutrients breakdown */}
        <div className="bg-white dark:bg-stone-900/10 rounded-2xl p-6 border border-stone-150 dark:border-stone-800/60 shadow-sm">
          <h3 className="font-bold text-stone-800 dark:text-stone-200 text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Баланс БЖУ (белки, жиры, углеводы)
          </h3>

          <div className="flex flex-col gap-4">
            {/* Proteins */}
            <div>
              <div className="flex justify-between items-baseline text-xs mb-1">
                <span className="font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  Белки
                </span>
                <span className="font-mono text-stone-900 dark:text-stone-200">
                  <span className="font-bold">{analysis.protein} г</span>{" "}
                  <span className="text-stone-400 dark:text-stone-500">
                    ({proteinKcal} ккал / {proteinPct}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${proteinPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-blue-500 h-full rounded-full"
                />
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="flex justify-between items-baseline text-xs mb-1">
                <span className="font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  Жиры
                </span>
                <span className="font-mono text-stone-900 dark:text-stone-200">
                  <span className="font-bold">{analysis.fat} г</span>{" "}
                  <span className="text-stone-400 dark:text-stone-500">
                    ({fatKcal} ккал / {fatPct}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fatPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-amber-500 h-full rounded-full"
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between items-baseline text-xs mb-1">
                <span className="font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  Углеводы
                </span>
                <span className="font-mono text-stone-900 dark:text-stone-200">
                  <span className="font-bold">{analysis.carbs} г</span>{" "}
                  <span className="text-stone-400 dark:text-stone-500">
                    ({carbsKcal} ккал / {carbsPct}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${carbsPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-emerald-500 h-full rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Multi-item breakdown if present */}
        {analysis.items && analysis.items.length > 0 && (
          <div className="bg-white dark:bg-stone-900/10 rounded-2xl p-6 border border-stone-150 dark:border-stone-800/60 shadow-sm">
            <h3 className="font-bold text-stone-800 dark:text-stone-200 text-sm mb-3">
              Ингредиенты блюда (покомпонентно)
            </h3>
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {analysis.items.map((item, index) => (
                <div key={index} className="py-2.5 flex justify-between items-center text-xs">
                  <span className="font-medium text-stone-700 dark:text-stone-300 capitalize">
                    {item.name}
                  </span>
                  <span className="font-mono text-stone-500 dark:text-stone-400">
                    <span className="text-stone-800 dark:text-stone-200 font-semibold">{item.calories} ккал</span>
                    {" • "}{item.weight}г
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detected Ingredients list */}
        <div>
          <h3 className="font-bold text-stone-800 dark:text-stone-200 text-sm mb-2.5">
            Обнаруженные продукты
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.ingredients.map((ing, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-medium border border-stone-200/50 dark:border-stone-800 capitalize"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Dietary Advice Tips */}
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-stone-800 dark:text-stone-200 text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Советы нутрициолога
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {analysis.tips.map((tip, i) => (
              <div
                key={i}
                className="p-4 bg-emerald-50/40 dark:bg-emerald-950/5 border border-emerald-50 dark:border-emerald-950/20 rounded-2xl flex gap-3 text-xs leading-relaxed text-stone-700 dark:text-stone-300"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold font-mono">
                  {i + 1}
                </div>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Note disclaimer */}
        <div className="p-3 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-100 dark:border-stone-800 flex gap-2 text-[10px] text-stone-400 dark:text-stone-500 leading-normal">
          <Info className="w-4 h-4 shrink-0 text-stone-400" />
          <span>
            Расчёт калорийности и веса порции является оценочным и основан на визуальном распознавании блюда искусственным интеллектом Gemini. Реальная калорийность может отличаться в зависимости от используемых соусов, специй, точного рецепта и способов приготовления.
          </span>
        </div>
      </div>
    </div>
  );
}
