'use client';

import { useEffect, useState, useCallback } from 'react';
import type { RiskRewardQuestion, FourTypesQuestion, TieBreakerConfig, SurveyQuestionsData, NonScoredCategory, NonScoredQuestion } from '@/types/scoring';
import type { ScoringResult } from '@/types/scoring';
import type { HydratedFormConfig, HydratedFormQuestion } from '@/types/form-config';

interface ScoringConfig {
  riskQuestions: RiskRewardQuestion[];
  rewardQuestions: RiskRewardQuestion[];
  fourTypesQuestions: FourTypesQuestion[];
  tieBreakerConfig: TieBreakerConfig;
  surveyQuestions?: SurveyQuestionsData;
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: RiskRewardQuestion;
  value: string;
  onChange: (val: string) => void;
}) {
  if (question.type === 'binary') {
    return (
      <div className="flex gap-4">
        {Object.keys(question.pointMap).map((opt) => (
          <label key={opt} className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name={question.ref}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            <span>{question.optionLabels?.[opt] || opt}</span>
            <span className="text-gray-400 text-xs">({question.pointMap[opt]} pts)</span>
          </label>
        ))}
      </div>
    );
  }
  // Likert
  return (
    <div className="flex gap-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className="flex flex-col items-center gap-0.5 text-sm">
          <input
            type="radio"
            name={question.ref}
            value={String(n)}
            checked={value === String(n)}
            onChange={() => onChange(String(n))}
          />
          <span>{n}</span>
          {question.optionLabels?.[String(n)] && (
            <span className="text-[10px] text-gray-400 text-center max-w-[80px] leading-tight">
              {question.optionLabels[String(n)]}
            </span>
          )}
        </label>
      ))}
    </div>
  );
}

function TypeQuestionInput({
  question,
  value,
  onChange,
}: {
  question: FourTypesQuestion;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {['A', 'B', 'C', 'D'].map((letter) => (
        <label key={letter} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name={question.ref}
            value={letter}
            checked={value === letter}
            onChange={() => onChange(letter)}
            className="flex-shrink-0"
          />
          <span className="font-medium text-gray-500 w-5">{letter}.</span>
          <span>{question.optionLabels?.[letter] || question.optionToAnimal[letter]}</span>
          <span className="text-xs text-gray-400 ml-auto">({question.optionToAnimal[letter]})</span>
        </label>
      ))}
    </div>
  );
}

function NonScoredQuestionInput({
  question,
  value,
  onChange,
  matrixColumns,
}: {
  question: NonScoredQuestion;
  value: string;
  onChange: (val: string) => void;
  matrixColumns?: string[];
}) {
  if (question.type === 'binary' && question.options) {
    return (
      <div className="flex gap-4">
        {Object.entries(question.options).map(([key, label]) => (
          <label key={key} className="flex items-center gap-1.5 text-sm">
            <input type="radio" name={question.ref} value={key} checked={value === key} onChange={() => onChange(key)} />
            {label}
          </label>
        ))}
      </div>
    );
  }
  if (question.type === 'scale') {
    const min = question.scaleMin ?? 1;
    const max = question.scaleMax ?? 7;
    const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return (
      <div className="flex gap-6 items-start">
        {nums.map((n) => (
          <label key={n} className="flex flex-col items-center gap-1 text-sm cursor-pointer min-w-[60px]">
            <input type="radio" name={question.ref} value={String(n)} checked={value === String(n)} onChange={() => onChange(String(n))} />
            <span className="font-medium">{n}</span>
            {question.options?.[String(n)] && (
              <span className="text-[10px] text-gray-400 text-center max-w-[80px] leading-tight">{question.options[String(n)]}</span>
            )}
          </label>
        ))}
      </div>
    );
  }
  if (question.type === 'multi-option' && question.options) {
    return (
      <div className="flex flex-wrap gap-3">
        {Object.entries(question.options).map(([key, label]) => (
          <label key={key} className="flex items-center gap-1.5 text-sm">
            <input type="radio" name={question.ref} value={key} checked={value === key} onChange={() => onChange(key)} />
            {label}
          </label>
        ))}
      </div>
    );
  }
  if (question.type === 'rank' && question.options) {
    return (
      <div className="space-y-2">
        {Object.entries(question.options).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            <select
              value={value.split(',').indexOf(key) >= 0 ? value.split(',').indexOf(key) + 1 : ''}
              onChange={(e) => {
                const rank = parseInt(e.target.value);
                const current = value ? value.split(',') : [];
                const filtered = current.filter((k) => k !== key);
                if (rank > 0) filtered.splice(rank - 1, 0, key);
                onChange(filtered.join(','));
              }}
              className="border rounded px-2 py-1 text-sm w-16"
            >
              <option value="">—</option>
              {Object.keys(question.options!).map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <span>{label}</span>
          </div>
        ))}
      </div>
    );
  }
  if (question.type === 'matrix' && question.options) {
    const columns = matrixColumns || ['Not Interested', 'Somewhat Interested', 'Very Interested'];
    const rows = Object.entries(question.options);
    const selections: Record<string, string> = value ? (() => { try { return JSON.parse(value); } catch { return {}; } })() : {};

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500 border-b"></th>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-center font-medium text-gray-500 border-b min-w-[120px]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([key, label]) => (
              <tr key={key} className="border-b border-gray-100">
                <td className="px-3 py-2 text-gray-700 font-medium">{label}</td>
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 text-center">
                    <input
                      type="radio"
                      name={`${question.ref}_${key}`}
                      checked={selections[key] === col}
                      onChange={() => {
                        const updated = { ...selections, [key]: col };
                        onChange(JSON.stringify(updated));
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  // open-ended
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded px-3 py-2 text-sm"
      rows={3}
      placeholder="Type your response..."
    />
  );
}

function NonScoredCategoryCard({
  category,
  answers,
  onAnswer,
  formQuestions,
}: {
  category: NonScoredCategory;
  answers: Record<string, string>;
  onAnswer: (ref: string, value: string) => void;
  formQuestions?: HydratedFormQuestion[];
}) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
        {category.label}
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">(not scored)</span>
      </h2>
      <p className="text-xs text-gray-500 mb-4">{category.description}</p>
      <div className="space-y-4">
        {category.questions.map((q) => {
          const formQ = formQuestions?.find((fq) => fq.questionRef === q.ref);
          return (
            <div key={q.ref} className="border-b border-gray-100 pb-3">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium text-gray-500">Q{q.order}.</span> {q.text}
                {q.construct && <span className="ml-1 text-xs text-purple-500">({q.construct})</span>}
              </p>
              <NonScoredQuestionInput question={q} value={answers[q.ref] || ''} onChange={(v) => onAnswer(q.ref, v)} matrixColumns={formQ?.matrixColumns} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TestPreset {
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  rewardLevel: 'low' | 'medium' | 'high';
  animal: 'Tiger' | 'Lion' | 'African Dog' | 'Killer Whale';
  tieBreaker: string;
}

const TEST_PRESETS: TestPreset[] = [
  { name: 'Tiger — High Risk / High Reward', description: 'Bold risk-taker, individual achiever', riskLevel: 'high', rewardLevel: 'high', animal: 'Tiger', tieBreaker: 'A' },
  { name: 'Lion — Medium Risk / Medium Reward', description: 'Balanced, purposeful approach', riskLevel: 'medium', rewardLevel: 'medium', animal: 'Lion', tieBreaker: 'B' },
  { name: 'African Dog — Low Risk / Low Reward', description: 'Steady, team-oriented, cautious', riskLevel: 'low', rewardLevel: 'low', animal: 'African Dog', tieBreaker: 'C' },
  { name: 'Killer Whale — Low Risk / High Reward', description: 'Strategic planner, high ambition', riskLevel: 'low', rewardLevel: 'high', animal: 'Killer Whale', tieBreaker: 'D' },
  { name: 'Tiger/Lion Tie (test tie-breaker)', description: 'Even split Tiger/Lion — tie-breaker decides', riskLevel: 'high', rewardLevel: 'medium', animal: 'Tiger', tieBreaker: 'B' },
  { name: 'All Animals Tied (test tie-breaker)', description: 'Even 2-2-2-2 split — tie-breaker decides', riskLevel: 'medium', rewardLevel: 'medium', animal: 'Lion', tieBreaker: 'D' },
];

function generatePresetAnswers(preset: TestPreset, config: ScoringConfig): Record<string, string> {
  const answers: Record<string, string> = {};

  // Risk answers: low=all A (1pt), medium=mix, high=all B (5pt)
  config.riskQuestions.forEach((q) => {
    if (q.type === 'binary') {
      answers[q.ref] = preset.riskLevel === 'low' ? 'A' : preset.riskLevel === 'high' ? 'B' : (q.order % 2 === 0 ? 'B' : 'A');
    } else {
      answers[q.ref] = preset.riskLevel === 'low' ? '1' : preset.riskLevel === 'high' ? '5' : '3';
    }
  });

  // Reward answers: same pattern
  config.rewardQuestions.forEach((q) => {
    if (q.type === 'binary') {
      answers[q.ref] = preset.rewardLevel === 'low' ? 'A' : preset.rewardLevel === 'high' ? 'B' : (q.order % 2 === 0 ? 'B' : 'A');
    } else {
      answers[q.ref] = preset.rewardLevel === 'low' ? '1' : preset.rewardLevel === 'high' ? '5' : '3';
    }
  });

  // Four Types answers: map animal to letter using optionToAnimal
  const targetAnimal = preset.animal;

  if (preset.name.includes('Tiger/Lion Tie')) {
    config.fourTypesQuestions.forEach((q, i) => {
      const target = i < 5 ? 'Tiger' : 'Lion';
      const letter = Object.entries(q.optionToAnimal).find(([, a]) => a === target)?.[0] || 'A';
      answers[q.ref] = letter;
    });
  } else if (preset.name.includes('All Animals Tied')) {
    const animals = ['African Dog', 'Lion', 'Killer Whale', 'Tiger'];
    config.fourTypesQuestions.forEach((q, i) => {
      const target = animals[i % 4];
      const letter = Object.entries(q.optionToAnimal).find(([, a]) => a === target)?.[0] || 'A';
      answers[q.ref] = letter;
    });
  } else {
    config.fourTypesQuestions.forEach((q) => {
      const letter = Object.entries(q.optionToAnimal).find(([, a]) => a === targetAnimal)?.[0] || 'A';
      answers[q.ref] = letter;
    });
  }

  // Tie-breaker
  answers[config.tieBreakerConfig.ref] = preset.tieBreaker;

  // Survey questions: fill with sensible defaults
  if (config.surveyQuestions) {
    const cats: NonScoredCategory[] = [
      config.surveyQuestions.big5Personality,
      config.surveyQuestions.personalityGames,
      config.surveyQuestions.personalityScales,
      config.surveyQuestions.howTools,
      config.surveyQuestions.openEnded,
    ];
    cats.forEach((cat) => {
      cat.questions.forEach((q) => {
        if (q.type === 'binary' && q.options) {
          answers[q.ref] = Object.keys(q.options)[0];
        } else if (q.type === 'scale') {
          const mid = Math.ceil(((q.scaleMin ?? 1) + (q.scaleMax ?? 5)) / 2);
          answers[q.ref] = String(mid);
        } else if (q.type === 'multi-option' && q.options) {
          answers[q.ref] = Object.keys(q.options)[0];
        } else if (q.type === 'matrix' && q.options) {
          const rows = Object.keys(q.options);
          const selections: Record<string, string> = {};
          rows.forEach((row) => { selections[row] = 'Somewhat Interested'; });
          answers[q.ref] = JSON.stringify(selections);
        } else if (q.type === 'rank' && q.options) {
          answers[q.ref] = Object.keys(q.options).join(',');
        }
        // open-ended: leave empty
      });
    });
  }

  return answers;
}

export default function ScoreTesterPage() {
  const [config, setConfig] = useState<ScoringConfig | null>(null);
  const [formConfig, setFormConfig] = useState<HydratedFormConfig | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [error, setError] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedAoi1, setSelectedAoi1] = useState('');
  const [selectedAoi2, setSelectedAoi2] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('');

  // Extract options from form config (single source of truth)
  const allFormQuestions = formConfig?.sections.flatMap((s) => s.questions) || [];
  const driverQ = allFormQuestions.find((q) => q.questionRef === 'select_driver');
  const aoiQ = allFormQuestions.find((q) => q.questionRef === 'select_aoi1');
  const strategyQ = allFormQuestions.find((q) => q.questionRef === 'select_strategy');

  const driverOptions = driverQ?.options ? Object.keys(driverQ.options) : [];
  const aoiOptions = aoiQ?.options ? Object.keys(aoiQ.options) : [];
  const strategyOptions = strategyQ?.options ? Object.keys(strategyQ.options) : [];

  const loadConfig = useCallback(() => {
    Promise.all([
      fetch('/api/admin/scoring').then((r) => { if (!r.ok) throw new Error('Not found'); return r.json(); }),
      fetch('/api/assessment/config').then((r) => { if (!r.ok) throw new Error('Not found'); return r.json(); }),
    ])
      .then(([scoringData, formData]) => {
        setConfig(scoringData);
        setFormConfig(formData);
        // Set defaults from form config
        const allQ = formData.sections?.flatMap((s: { questions: HydratedFormQuestion[] }) => s.questions) || [];
        const dQ = allQ.find((q: HydratedFormQuestion) => q.questionRef === 'select_driver');
        const aQ = allQ.find((q: HydratedFormQuestion) => q.questionRef === 'select_aoi1');
        const sQ = allQ.find((q: HydratedFormQuestion) => q.questionRef === 'select_strategy');
        if (dQ?.options) setSelectedDriver(Object.keys(dQ.options)[0]);
        if (aQ?.options) { setSelectedAoi1(Object.keys(aQ.options)[0]); setSelectedAoi2(Object.keys(aQ.options)[1] || Object.keys(aQ.options)[0]); }
        if (sQ?.options) setSelectedStrategy(Object.keys(sQ.options)[0]);
      })
      .catch(() => setError('Failed to load config'));
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  function setAnswer(ref: string, value: string) {
    setAnswers((prev) => ({ ...prev, [ref]: value }));
  }

  function applyPreset(preset: TestPreset) {
    if (!config) return;
    const presetAnswers = generatePresetAnswers(preset, config);
    setAnswers(presetAnswers);
    setResult(null);
  }

  async function handleCalculate() {
    setCalculating(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/score-tester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error('Scoring failed');
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Scoring failed');
    } finally {
      setCalculating(false);
    }
  }

  if (error && !config) return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
  if (!config) return <div className="text-gray-500">Loading config...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Score Tester</h1>

      {/* Test Presets */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-amber-900 mb-2">Quick Test Presets</h2>
        <p className="text-xs text-amber-700 mb-3">Pre-fill all scored questions to quickly test different scenarios. You can still modify individual answers after loading a preset.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {TEST_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="text-left px-3 py-2 bg-white border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900 block">{preset.name}</span>
              <span className="text-xs text-gray-500">{preset.description}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => { setAnswers({}); setResult(null); }}
          className="mt-2 text-xs text-amber-700 hover:text-amber-900 underline"
        >
          Clear all answers
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Questions form */}
        <div className="xl:col-span-2 space-y-6">
          {/* Risk questions */}
          <div className="bg-white rounded-lg border p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Risk Questions</h2>
            <div className="space-y-4">
              {config.riskQuestions.map((q) => (
                <div key={q.ref} className="border-b border-gray-100 pb-3">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium text-gray-500">Q{q.order}.</span> {q.text}
                    {q.reversed && <span className="ml-1 text-xs text-orange-500">(reversed)</span>}
                  </p>
                  <QuestionInput question={q} value={answers[q.ref] || ''} onChange={(v) => setAnswer(q.ref, v)} />
                </div>
              ))}
            </div>
          </div>

          {/* Reward questions */}
          <div className="bg-white rounded-lg border p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Reward Questions</h2>
            <div className="space-y-4">
              {config.rewardQuestions.map((q) => (
                <div key={q.ref} className="border-b border-gray-100 pb-3">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium text-gray-500">Q{q.order}.</span> {q.text}
                    {q.reversed && <span className="ml-1 text-xs text-orange-500">(reversed)</span>}
                  </p>
                  <QuestionInput question={q} value={answers[q.ref] || ''} onChange={(v) => setAnswer(q.ref, v)} />
                </div>
              ))}
            </div>
          </div>

          {/* Four Types questions */}
          <div className="bg-white rounded-lg border p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Four Types Questions</h2>
            <div className="space-y-4">
              {config.fourTypesQuestions.map((q) => (
                <div key={q.ref} className="border-b border-gray-100 pb-3">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium text-gray-500">Q{q.order}.</span> {q.text}
                  </p>
                  <TypeQuestionInput question={q} value={answers[q.ref] || ''} onChange={(v) => setAnswer(q.ref, v)} />
                </div>
              ))}

            </div>
          </div>

          {/* Tie-Breaker (separate section) */}
          <div className="bg-white rounded-lg border p-5">
            <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              Tie-Breaker
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">4 Types tie-break</span>
            </h2>
            <div className="text-sm text-gray-700 mb-4 whitespace-pre-line">{config.tieBreakerConfig.text}</div>
            <div className="space-y-2">
              {Object.entries(config.tieBreakerConfig.optionToAnimal).map(([letter, animal]) => (
                <label key={letter} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="tiebreaker"
                    value={letter}
                    checked={answers[config.tieBreakerConfig.ref] === letter}
                    onChange={() => setAnswer(config.tieBreakerConfig.ref, letter)}
                  />
                  <span className="font-medium">{config.tieBreakerConfig.optionLabels?.[letter] || `${letter} (${animal})`}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              If tied: selects the exact match. If selected letter is not a tie letter, moves UP to the closest tie letter.
            </p>
          </div>

          {/* Non-scored question categories */}
          {config.surveyQuestions && (
            <>
              {([
                config.surveyQuestions.big5Personality,
                config.surveyQuestions.personalityGames,
                config.surveyQuestions.personalityScales,
                config.surveyQuestions.howTools,
                config.surveyQuestions.openEnded,
              ] as NonScoredCategory[]).map((cat) => (
                <NonScoredCategoryCard
                  key={cat.key}
                  category={cat}
                  answers={answers}
                  onAnswer={setAnswer}
                  formQuestions={allFormQuestions}
                />
              ))}
            </>
          )}

          {/* Report Selections */}
          <div className="bg-white rounded-lg border p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Report Selections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Driver</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  {driverOptions.map((d) => (
                    <option key={d} value={d}>{driverQ?.options?.[d] || d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">AOI 1</label>
                <select
                  value={selectedAoi1}
                  onChange={(e) => setSelectedAoi1(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  {aoiOptions.map((a) => (
                    <option key={a} value={a}>{aoiQ?.options?.[a] || a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">AOI 2</label>
                <select
                  value={selectedAoi2}
                  onChange={(e) => setSelectedAoi2(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  {aoiOptions.map((a) => (
                    <option key={a} value={a}>{aoiQ?.options?.[a] || a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Strategy</label>
                <select
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  {strategyOptions.map((s) => (
                    <option key={s} value={s}>{strategyQ?.options?.[s] || s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
          >
            {calculating ? 'Calculating...' : 'Calculate Score'}
          </button>
        </div>

        {/* Results panel */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg border p-5 sticky top-6">
            <h2 className="font-semibold text-gray-900 mb-4">Results</h2>
            {!result ? (
              <p className="text-sm text-gray-500">Fill in the questions and click Calculate to see results.</p>
            ) : (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 font-medium">Animal Type</p>
                  <p className="text-2xl font-bold text-purple-900">{result.animalType}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium">Risk Score</p>
                    <p className="text-xl font-bold text-blue-900">{result.riskScore}</p>
                    <p className="text-sm text-blue-700">{result.riskLevel}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium">Reward Score</p>
                    <p className="text-xl font-bold text-green-900">{result.rewardScore}</p>
                    <p className="text-sm text-green-700">{result.rewardLevel}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Vote Breakdown</p>
                  <div className="space-y-1">
                    {Object.entries(result.voteBreakdown).map(([animal, count]) => (
                      <div key={animal} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-28">{animal}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4">
                          <div
                            className="bg-purple-500 rounded-full h-4"
                            style={{ width: `${(count / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <hr className="border-gray-200" />
                <p className="text-sm font-medium text-gray-700">Report Selections</p>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-orange-600 font-medium">Driver</p>
                  <p className="text-lg font-bold text-orange-900">{selectedDriver}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-teal-50 rounded-lg p-3">
                    <p className="text-xs text-teal-600 font-medium">AOI 1</p>
                    <p className="text-sm font-bold text-teal-900">{selectedAoi1}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-3">
                    <p className="text-xs text-teal-600 font-medium">AOI 2</p>
                    <p className="text-sm font-bold text-teal-900">{selectedAoi2}</p>
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-xs text-indigo-600 font-medium">Strategy</p>
                  <p className="text-lg font-bold text-indigo-900">{selectedStrategy}</p>
                </div>

                {config.surveyQuestions && (() => {
                  const cats: NonScoredCategory[] = [
                    config.surveyQuestions!.big5Personality,
                    config.surveyQuestions!.personalityGames,
                    config.surveyQuestions!.personalityScales,
                    config.surveyQuestions!.howTools,
                    config.surveyQuestions!.openEnded,
                  ];
                  const hasAny = cats.some((cat) => cat.questions.some((q) => answers[q.ref]));
                  if (!hasAny) return null;
                  return (
                    <>
                      <hr className="border-gray-200" />
                      <p className="text-sm font-medium text-gray-700">Survey Responses</p>
                      {cats.map((cat) => {
                        const answered = cat.questions.filter((q) => answers[q.ref]);
                        if (answered.length === 0) return null;
                        return (
                          <div key={cat.key} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 font-medium mb-1">{cat.label}</p>
                            <div className="space-y-1">
                              {answered.map((q) => {
                                const val = answers[q.ref];
                                const label = q.options?.[val] || val;
                                return (
                                  <p key={q.ref} className="text-xs text-gray-700">
                                    <span className="font-medium">{q.construct || q.ref}:</span>{' '}
                                    {q.type === 'open-ended' ? (
                                      <span className="italic">&ldquo;{val}&rdquo;</span>
                                    ) : (
                                      <span>{label}</span>
                                    )}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
