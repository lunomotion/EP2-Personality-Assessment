'use client';

import { useEffect, useState, useCallback } from 'react';
import TabGroup from '@/components/admin/TabGroup';
import { showToast } from '@/components/admin/Toast';
import type { RiskRewardQuestion, FourTypesQuestion, TieBreakerConfig, ThresholdConfig, SurveyQuestionsData, NonScoredCategory, AnimalKey } from '@/types/scoring';

interface ScoringConfig {
  riskQuestions: RiskRewardQuestion[];
  rewardQuestions: RiskRewardQuestion[];
  fourTypesQuestions: FourTypesQuestion[];
  tieBreakerConfig: TieBreakerConfig;
  riskThresholds: ThresholdConfig;
  rewardThresholds: ThresholdConfig;
  surveyQuestions?: SurveyQuestionsData;
}

function RiskRewardQuestionsTab({
  questions,
  label,
  onSave,
}: {
  questions: RiskRewardQuestion[];
  label: string;
  onSave: (questions: RiskRewardQuestion[]) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<RiskRewardQuestion[]>(questions);
  const [saving, setSaving] = useState(false);

  function updateQuestion(index: number, field: keyof RiskRewardQuestion, value: unknown) {
    const updated = [...editData];
    updated[index] = { ...updated[index], [field]: value };
    setEditData(updated);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(editData);
      setEditing(false);
      showToast('success', `${label} questions saved`);
    } catch {
      showToast('error', 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">{label} Questions</h3>
        {!editing ? (
          <button onClick={() => { setEditData(questions); setEditing(true); }}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium">Edit</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="text-sm text-gray-500" disabled={saving}>Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Question</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Type</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Reversed</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Options</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(editing ? editData : questions).map((q, i) => (
              <tr key={q.ref}>
                <td className="px-3 py-2 text-gray-500">{q.order}</td>
                <td className="px-3 py-2 max-w-md">
                  {editing ? (
                    <textarea value={editData[i].text} onChange={(e) => updateQuestion(i, 'text', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm" rows={2} />
                  ) : (
                    <span className="text-gray-700">{q.text}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {editing ? (
                    <select value={editData[i].type} onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                      className="border rounded px-2 py-1 text-sm">
                      <option value="binary">Binary</option>
                      <option value="likert">Likert</option>
                    </select>
                  ) : (
                    <span className="capitalize">{q.type}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {editing ? (
                    <input type="checkbox" checked={editData[i].reversed}
                      onChange={(e) => updateQuestion(i, 'reversed', e.target.checked)} />
                  ) : (
                    q.reversed ? 'Yes' : 'No'
                  )}
                </td>
                <td className="px-3 py-2 text-xs max-w-xs">
                  {editing ? (
                    <div className="space-y-1">
                      {Object.keys(editData[i].pointMap).map((key) => (
                        <div key={key} className="flex items-center gap-1">
                          <span className="text-gray-500 w-6">{key}:</span>
                          <input
                            value={editData[i].optionLabels?.[key] || ''}
                            onChange={(e) => {
                              const updated = [...editData];
                              const labels = { ...(updated[i].optionLabels || {}) };
                              labels[key] = e.target.value;
                              updated[i] = { ...updated[i], optionLabels: labels };
                              setEditData(updated);
                            }}
                            className="flex-1 border rounded px-1.5 py-0.5 text-xs"
                            placeholder="Label"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    q.optionLabels ? (
                      <div className="space-y-0.5">
                        {Object.entries(q.optionLabels).map(([key, label]) => (
                          <div key={key} className="text-gray-600">
                            <span className="font-medium">{key}</span> = {label}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )
                  )}
                </td>
                <td className="px-3 py-2 text-gray-400 font-mono text-xs">{q.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ThresholdsTab({
  riskThresholds,
  rewardThresholds,
  onSave,
}: {
  riskThresholds: ThresholdConfig;
  rewardThresholds: ThresholdConfig;
  onSave: (risk: ThresholdConfig, reward: ThresholdConfig) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [risk, setRisk] = useState(riskThresholds);
  const [reward, setReward] = useState(rewardThresholds);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(risk, reward);
      setEditing(false);
      showToast('success', 'Thresholds saved');
    } catch {
      showToast('error', 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Level Thresholds</h3>
        {!editing ? (
          <button onClick={() => { setRisk(riskThresholds); setReward(rewardThresholds); setEditing(true); }}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium">Edit</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="text-sm text-gray-500" disabled={saving}>Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[{ label: 'Risk', data: editing ? risk : riskThresholds, setter: setRisk },
          { label: 'Reward', data: editing ? reward : rewardThresholds, setter: setReward }].map(({ label, data, setter }) => (
          <div key={label} className="bg-white rounded-lg border p-5">
            <h4 className="font-medium text-gray-900 mb-3">{label} Thresholds</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Low max (scores &lt;= this are Low)</label>
                {editing ? (
                  <input type="number" value={data.lowMax}
                    onChange={(e) => setter({ ...data, lowMax: parseInt(e.target.value) || 0 })}
                    className="block w-full mt-1 border rounded px-3 py-1.5 text-sm" />
                ) : (
                  <p className="font-mono text-lg">{data.lowMax}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Medium max (scores &lt;= this are Medium)</label>
                {editing ? (
                  <input type="number" value={data.mediumMax}
                    onChange={(e) => setter({ ...data, mediumMax: parseInt(e.target.value) || 0 })}
                    className="block w-full mt-1 border rounded px-3 py-1.5 text-sm" />
                ) : (
                  <p className="font-mono text-lg">{data.mediumMax}</p>
                )}
              </div>
              <p className="text-xs text-gray-400">Scores above Medium max are classified as High</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FourTypesTab({
  questions,
  tieBreakerConfig,
  onSave,
}: {
  questions: FourTypesQuestion[];
  tieBreakerConfig: TieBreakerConfig;
  onSave: (questions: FourTypesQuestion[], tieBreaker: TieBreakerConfig) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [editQuestions, setEditQuestions] = useState<FourTypesQuestion[]>(questions);
  const [editTieBreaker, setEditTieBreaker] = useState<TieBreakerConfig>(tieBreakerConfig);
  const [saving, setSaving] = useState(false);
  const animals: string[] = ['African Dog', 'Lion', 'Killer Whale', 'Tiger'];

  function updateQuestion(index: number, field: keyof FourTypesQuestion, value: unknown) {
    const updated = [...editQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setEditQuestions(updated);
  }

  function updateQuestionAnimal(index: number, letter: string, animal: string) {
    const updated = [...editQuestions];
    const mapping: Record<string, AnimalKey> = { ...updated[index].optionToAnimal, [letter]: animal as AnimalKey };
    updated[index] = { ...updated[index], optionToAnimal: mapping };
    setEditQuestions(updated);
  }

  function updateQuestionOptionLabel(index: number, letter: string, label: string) {
    const updated = [...editQuestions];
    const labels = { ...(updated[index].optionLabels || {}), [letter]: label };
    updated[index] = { ...updated[index], optionLabels: labels };
    setEditQuestions(updated);
  }

  function updateTieBreakerAnimal(letter: string, animal: string) {
    setEditTieBreaker((prev) => {
      const optionToAnimal: Record<string, AnimalKey> = { ...prev.optionToAnimal, [letter]: animal as AnimalKey };
      return { ...prev, optionToAnimal };
    });
  }

  function updateTieBreakerLabel(letter: string, label: string) {
    setEditTieBreaker((prev) => ({
      ...prev,
      optionLabels: { ...(prev.optionLabels || {}), [letter]: label },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(editQuestions, editTieBreaker);
      setEditing(false);
      showToast('success', 'Four Types config saved');
    } catch {
      showToast('error', 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const displayQuestions = editing ? editQuestions : questions;
  const displayTieBreaker = editing ? editTieBreaker : tieBreakerConfig;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Four Types Questions</h3>
        {!editing ? (
          <button onClick={() => { setEditQuestions(questions); setEditTieBreaker(tieBreakerConfig); setEditing(true); }}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium">Edit</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="text-sm text-gray-500" disabled={saving}>Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Question</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Letter Order</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">A</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">B</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">C</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">D</th>
              {editing && <th className="px-3 py-2 text-left font-medium text-gray-500">Option Labels</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayQuestions.map((q, i) => (
              <tr key={q.ref}>
                <td className="px-3 py-2 text-gray-500">{q.order}</td>
                <td className="px-3 py-2 max-w-xs">
                  {editing ? (
                    <textarea value={editQuestions[i].text} onChange={(e) => updateQuestion(i, 'text', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm" rows={2} />
                  ) : (
                    <span className="text-gray-700">{q.text}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {editing ? (
                    <input value={editQuestions[i].letterOrder} onChange={(e) => updateQuestion(i, 'letterOrder', e.target.value)}
                      className="w-20 border rounded px-2 py-1 text-sm font-mono" maxLength={4} />
                  ) : (
                    <span className="font-mono">{q.letterOrder}</span>
                  )}
                </td>
                {['A', 'B', 'C', 'D'].map((letter) => (
                  <td key={letter} className="px-3 py-2 text-xs">
                    {editing ? (
                      <select value={editQuestions[i].optionToAnimal[letter] || ''}
                        onChange={(e) => updateQuestionAnimal(i, letter, e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs w-full">
                        {animals.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    ) : (
                      q.optionToAnimal[letter] || '-'
                    )}
                  </td>
                ))}
                {editing && (
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      {['A', 'B', 'C', 'D'].map((letter) => (
                        <div key={letter} className="flex items-center gap-1">
                          <span className="text-gray-500 w-4 text-xs">{letter}:</span>
                          <input
                            value={editQuestions[i].optionLabels?.[letter] || ''}
                            onChange={(e) => updateQuestionOptionLabel(i, letter, e.target.value)}
                            className="flex-1 border rounded px-1.5 py-0.5 text-xs w-28"
                            placeholder="Label"
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-white rounded-lg border p-5">
        <h4 className="font-medium text-gray-900 mb-3">Tie-Breaker Config</h4>
        {editing ? (
          <textarea value={editTieBreaker.text} onChange={(e) => setEditTieBreaker((prev) => ({ ...prev, text: e.target.value }))}
            className="w-full border rounded px-3 py-2 text-sm mb-3" rows={4} />
        ) : (
          <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{displayTieBreaker.text}</p>
        )}
        <div className="space-y-2">
          {Object.entries(displayTieBreaker.optionToAnimal).map(([letter, animal]) => (
            <div key={letter} className="flex items-center gap-2 text-sm">
              <span className="bg-gray-100 px-2 py-1 rounded font-medium w-8 text-center">{letter}</span>
              {editing ? (
                <>
                  <select value={animal} onChange={(e) => updateTieBreakerAnimal(letter, e.target.value)}
                    className="border rounded px-2 py-1 text-sm">
                    {animals.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <input value={editTieBreaker.optionLabels?.[letter] || ''}
                    onChange={(e) => updateTieBreakerLabel(letter, e.target.value)}
                    className="border rounded px-2 py-1 text-sm flex-1" placeholder="Display label" />
                </>
              ) : (
                <>
                  <span className="text-gray-600">=</span>
                  <span className="text-gray-800">{displayTieBreaker.optionLabels?.[letter] || animal}</span>
                  <span className="text-gray-400">({animal})</span>
                </>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Tie-break logic: Exact match breaks tie. If selected letter is not a tie letter, moves UP to closest tie letter.
        </p>
      </div>
    </div>
  );
}

function SurveyQuestionsTab({
  surveyQuestions,
  onSave,
}: {
  surveyQuestions?: SurveyQuestionsData;
  onSave: (data: SurveyQuestionsData) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<SurveyQuestionsData | null>(surveyQuestions || null);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  if (!surveyQuestions && !editData) {
    return <p className="text-gray-500 text-sm">No survey questions configured. Run the seed script to populate.</p>;
  }

  const data = editing && editData ? editData : surveyQuestions!;
  const categories: NonScoredCategory[] = [
    data.big5Personality,
    data.personalityGames,
    data.personalityScales,
    data.howTools,
    data.openEnded,
  ];

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function updateQuestionText(catKey: string, qIndex: number, text: string) {
    if (!editData) return;
    const updated = { ...editData };
    const cat = { ...updated[catKey as keyof SurveyQuestionsData] };
    const questions = [...cat.questions];
    questions[qIndex] = { ...questions[qIndex], text };
    cat.questions = questions;
    (updated[catKey as keyof SurveyQuestionsData] as NonScoredCategory) = cat;
    setEditData(updated);
  }

  function updateOptionLabel(catKey: string, qIndex: number, optKey: string, label: string) {
    if (!editData) return;
    const updated = { ...editData };
    const cat = { ...updated[catKey as keyof SurveyQuestionsData] };
    const questions = [...cat.questions];
    const opts = { ...(questions[qIndex].options || {}) };
    opts[optKey] = label;
    questions[qIndex] = { ...questions[qIndex], options: opts };
    cat.questions = questions;
    (updated[catKey as keyof SurveyQuestionsData] as NonScoredCategory) = cat;
    setEditData(updated);
  }

  async function handleSave() {
    if (!editData) return;
    setSaving(true);
    try {
      await onSave(editData);
      setEditing(false);
      showToast('success', 'Survey questions saved');
    } catch {
      showToast('error', 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Survey Questions (Non-Scored)</h3>
        {!editing ? (
          <button onClick={() => { setEditData(surveyQuestions || null); setEditing(true); }}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium">Edit</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="text-sm text-gray-500" disabled={saving}>Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.key} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(cat.key)}
              className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
            >
              <div>
                <span className="font-medium text-gray-900">{cat.label}</span>
                <span className="ml-2 text-xs text-gray-400">({cat.questions.length} questions)</span>
              </div>
              <span className="text-gray-400">{expandedSections[cat.key] ? '▼' : '▶'}</span>
            </button>
            {expandedSections[cat.key] && (
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-3">{cat.description}</p>
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Question</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Type</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Options</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cat.questions.map((q, qi) => (
                      <tr key={q.ref}>
                        <td className="px-3 py-2 text-gray-500">{q.order}</td>
                        <td className="px-3 py-2 max-w-md">
                          {editing ? (
                            <textarea
                              value={(editData?.[cat.key as keyof SurveyQuestionsData]?.questions[qi]?.text) || q.text}
                              onChange={(e) => updateQuestionText(cat.key, qi, e.target.value)}
                              className="w-full border rounded px-2 py-1 text-sm" rows={2}
                            />
                          ) : (
                            <span className="text-gray-700">{q.text}</span>
                          )}
                          {q.construct && <span className="block text-xs text-purple-500 mt-0.5">{q.construct}</span>}
                        </td>
                        <td className="px-3 py-2 capitalize text-gray-600">{q.type}</td>
                        <td className="px-3 py-2 text-xs max-w-xs">
                          {q.options ? (
                            editing ? (
                              <div className="space-y-1">
                                {Object.keys(q.options).map((key) => (
                                  <div key={key} className="flex items-center gap-1">
                                    <span className="text-gray-500 w-6">{key}:</span>
                                    <input
                                      value={(editData?.[cat.key as keyof SurveyQuestionsData]?.questions[qi]?.options?.[key]) || ''}
                                      onChange={(e) => updateOptionLabel(cat.key, qi, key, e.target.value)}
                                      className="flex-1 border rounded px-1.5 py-0.5 text-xs"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                {Object.entries(q.options).map(([key, label]) => (
                                  <div key={key} className="text-gray-600">
                                    <span className="font-medium">{key}</span> = {label}
                                  </div>
                                ))}
                              </div>
                            )
                          ) : (
                            <span className="text-gray-400">{q.type === 'open-ended' ? 'Free text' : '—'}</span>
                          )}
                          {q.scaleMin !== undefined && q.scaleMax !== undefined && (
                            <div className="text-gray-400 mt-1">Scale: {q.scaleMin}–{q.scaleMax}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-400 font-mono text-xs">{q.ref}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScoringPage() {
  const [config, setConfig] = useState<ScoringConfig | null>(null);
  const [error, setError] = useState('');

  const loadConfig = useCallback(() => {
    fetch('/api/admin/scoring')
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(setConfig)
      .catch(() => setError('Failed to load scoring config. Run the seed script first.'));
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  async function saveQuestions(field: 'riskQuestions' | 'rewardQuestions', data: RiskRewardQuestion[]) {
    const res = await fetch('/api/admin/scoring', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: data }),
    });
    if (!res.ok) throw new Error('Save failed');
    loadConfig();
  }

  async function saveThresholds(risk: ThresholdConfig, reward: ThresholdConfig) {
    const res = await fetch('/api/admin/scoring', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riskThresholds: risk, rewardThresholds: reward }),
    });
    if (!res.ok) throw new Error('Save failed');
    loadConfig();
  }

  async function saveFourTypes(questions: FourTypesQuestion[], tieBreaker: TieBreakerConfig) {
    const res = await fetch('/api/admin/scoring', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fourTypesQuestions: questions, tieBreakerConfig: tieBreaker }),
    });
    if (!res.ok) throw new Error('Save failed');
    loadConfig();
  }

  async function saveSurveyQuestions(data: SurveyQuestionsData) {
    const res = await fetch('/api/admin/scoring', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ surveyQuestions: data }),
    });
    if (!res.ok) throw new Error('Save failed');
    loadConfig();
  }

  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
  if (!config) return <div className="text-gray-500">Loading scoring config...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Scoring Rules</h1>
      <TabGroup tabs={[
        {
          key: 'risk',
          label: 'Risk Questions',
          content: (
            <RiskRewardQuestionsTab
              questions={config.riskQuestions}
              label="Risk"
              onSave={(data) => saveQuestions('riskQuestions', data)}
            />
          ),
        },
        {
          key: 'reward',
          label: 'Reward Questions',
          content: (
            <RiskRewardQuestionsTab
              questions={config.rewardQuestions}
              label="Reward"
              onSave={(data) => saveQuestions('rewardQuestions', data)}
            />
          ),
        },
        {
          key: 'four-types',
          label: 'Four Types',
          content: (
            <FourTypesTab
              questions={config.fourTypesQuestions}
              tieBreakerConfig={config.tieBreakerConfig}
              onSave={saveFourTypes}
            />
          ),
        },
        {
          key: 'thresholds',
          label: 'Thresholds',
          content: (
            <ThresholdsTab
              riskThresholds={config.riskThresholds}
              rewardThresholds={config.rewardThresholds}
              onSave={saveThresholds}
            />
          ),
        },
        {
          key: 'survey-questions',
          label: 'Survey Questions',
          content: (
            <SurveyQuestionsTab
              surveyQuestions={config.surveyQuestions}
              onSave={saveSurveyQuestions}
            />
          ),
        },
      ]} />
    </div>
  );
}
