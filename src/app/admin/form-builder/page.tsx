'use client';

import { useState, useEffect, useCallback } from 'react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import type {
  FormConfigData,
  FormSectionConfig,
  FormQuestionConfig,
  FormResultsConfig,
  FormDisplayType,
} from '@/types/form-config';

const DISPLAY_TYPES: FormDisplayType[] = [
  'image-choice',
  'likert-boxes',
  'star-rating',
  'multiple-choice',
  'table-choice',
  'matrix',
  'rank-order',
  'email-input',
  'name-input',
  'free-text',
  'multi-option',
];

type TabKey = 'sections' | 'questions' | 'background' | 'results' | 'preview';

export default function FormBuilderPage() {
  const [config, setConfig] = useState<FormConfigData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('sections');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/form-config')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then((data: FormConfigData) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load form config');
        setLoading(false);
      });
  }, []);

  const save = useCallback(
    async (updates: Partial<FormConfigData>) => {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      try {
        const res = await fetch('/api/admin/form-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Save failed');
        }

        setSuccessMsg('Saved successfully');
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Save failed');
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const saveSections = useCallback(() => {
    if (!config) return;
    save({ sections: config.sections });
  }, [config, save]);

  const saveResults = useCallback(() => {
    if (!config) return;
    save({ resultsPage: config.resultsPage });
  }, [config, save]);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!config) return;
    const newSections = [...config.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSections.length) return;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    // Update order values
    newSections.forEach((s, i) => (s.order = i + 1));
    setConfig({ ...config, sections: newSections });
  };

  const updateSection = (key: string, field: keyof FormSectionConfig, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      sections: config.sections.map((s) =>
        s.key === key ? { ...s, [field]: value } : s
      ),
    });
  };

  const updateQuestionDisplayType = (
    sectionKey: string,
    questionRef: string,
    displayType: FormDisplayType
  ) => {
    if (!config) return;
    setConfig({
      ...config,
      sections: config.sections.map((s) =>
        s.key === sectionKey
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.questionRef === questionRef ? { ...q, displayType } : q
              ),
            }
          : s
      ),
    });
  };

  const updateQuestionField = (
    sectionKey: string,
    questionRef: string,
    field: keyof FormQuestionConfig,
    value: string
  ) => {
    if (!config) return;
    setConfig({
      ...config,
      sections: config.sections.map((s) =>
        s.key === sectionKey
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.questionRef === questionRef ? { ...q, [field]: value } : q
              ),
            }
          : s
      ),
    });
  };

  const updateQuestionOptionImage = (
    sectionKey: string,
    questionRef: string,
    optionKey: string,
    imageUrl: string | null
  ) => {
    if (!config) return;
    setConfig({
      ...config,
      sections: config.sections.map((s) =>
        s.key === sectionKey
          ? {
              ...s,
              questions: s.questions.map((q) => {
                if (q.questionRef !== questionRef) return q;
                const newImages = { ...(q.optionImages || {}) };
                if (imageUrl) {
                  newImages[optionKey] = imageUrl;
                } else {
                  delete newImages[optionKey];
                }
                return { ...q, optionImages: Object.keys(newImages).length > 0 ? newImages : undefined };
              }),
            }
          : s
      ),
    });
  };

  const handleOptionImageUpload = async (
    sectionKey: string,
    questionRef: string,
    optionKey: string,
    file: File
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'form');
    formData.append('filename', `${questionRef}_${optionKey}_${Date.now()}.${file.name.split('.').pop()}`);

    try {
      const res = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const imageUrl = `/api/uploads/${data.path}`;
      updateQuestionOptionImage(sectionKey, questionRef, optionKey, imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const updateResults = (field: keyof FormResultsConfig, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      resultsPage: { ...config.resultsPage, [field]: value },
    });
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'form-backgrounds');
    formData.append('filename', `background_${Date.now()}.${file.name.split('.').pop()}`);

    try {
      const res = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const bgUrl = `/api/uploads/${data.path}`;
      setConfig({ ...config, backgroundImage: bgUrl });
      await save({ backgroundImage: bgUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const clearBackground = async () => {
    if (!config) return;
    setConfig({ ...config, backgroundImage: undefined });
    await save({ backgroundImage: null as unknown as string });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-gray-500">Loading form configuration...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error || 'No form configuration found. Run the seed script first.'}</p>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'sections', label: 'Sections' },
    { key: 'questions', label: 'Questions' },
    { key: 'background', label: 'Background' },
    { key: 'results', label: 'Results Page' },
    { key: 'preview', label: 'Preview' },
  ];

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Form Builder</h1>

      {/* Status messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Sections */}
      {activeTab === 'sections' && (
        <div className="space-y-3">
          {config.sections
            .sort((a, b) => a.order - b.order)
            .map((section, idx) => (
              <div key={section.key} className="border border-gray-200 rounded-lg">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setExpandedSection(expandedSection === section.key ? null : section.key)
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm font-mono">{section.order}</span>
                    <span className="font-medium text-gray-900">{section.title}</span>
                    <span className="text-gray-400 text-xs">
                      ({section.questions.length} questions)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(idx, 'up');
                      }}
                      disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      &#8593;
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(idx, 'down');
                      }}
                      disabled={idx === config.sections.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      &#8595;
                    </button>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedSection === section.key ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedSection === section.key && (
                  <div className="p-4 border-t border-gray-100 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(section.key, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={section.subtitle || ''}
                        onChange={(e) => updateSection(section.key, 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Intro Text</label>
                      <textarea
                        value={section.introText || ''}
                        onChange={(e) => updateSection(section.key, 'introText', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={section.introButtonText}
                        onChange={(e) => updateSection(section.key, 'introButtonText', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

          <div className="pt-4">
            <button
              onClick={saveSections}
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Sections'}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {config.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div key={section.key}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.questions.map((q) => {
                    const hasImageSupport = ['image-choice', 'multiple-choice'].includes(q.displayType);
                    const optionKeys = q.optionImages ? Object.keys(q.optionImages) : [];

                    return (
                      <div
                        key={q.questionRef}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-mono text-gray-400 mb-1">
                              {q.questionRef}
                            </p>
                            <p className="text-sm text-gray-500 italic">
                              Edit question text in Scoring Rules
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <select
                              value={q.displayType}
                              onChange={(e) =>
                                updateQuestionDisplayType(
                                  section.key,
                                  q.questionRef,
                                  e.target.value as FormDisplayType
                                )
                              }
                              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
                            >
                              {DISPLAY_TYPES.map((dt) => (
                                <option key={dt} value={dt}>
                                  {dt}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs text-gray-500 mb-1">
                            Description (optional)
                          </label>
                          <input
                            type="text"
                            value={q.description || ''}
                            onChange={(e) =>
                              updateQuestionField(
                                section.key,
                                q.questionRef,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder="Subtitle text below question"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>

                        {/* Option Images Management */}
                        {hasImageSupport && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                              Option Images
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {(optionKeys.length > 0 ? optionKeys : ['A', 'B', 'C', 'D'].slice(0, q.displayType === 'image-choice' ? 2 : 4)).map((optKey) => (
                                <div key={optKey} className="text-center">
                                  <p className="text-xs text-gray-500 mb-1">Option {optKey}</p>
                                  {q.optionImages?.[optKey] ? (
                                    <div className="relative group">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={q.optionImages[optKey]}
                                        alt={`Option ${optKey}`}
                                        className="w-full h-16 object-cover rounded border border-gray-200"
                                      />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                                        <label className="p-1 bg-white rounded cursor-pointer hover:bg-gray-100">
                                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                          </svg>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleOptionImageUpload(section.key, q.questionRef, optKey, file);
                                            }}
                                          />
                                        </label>
                                        <button
                                          onClick={() => updateQuestionOptionImage(section.key, q.questionRef, optKey, null)}
                                          className="p-1 bg-white rounded hover:bg-gray-100"
                                        >
                                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <label className="block w-full h-16 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center">
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                      </svg>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleOptionImageUpload(section.key, q.questionRef, optKey, file);
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          <div className="pt-4">
            <button
              onClick={saveSections}
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Questions'}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Background */}
      {activeTab === 'background' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Background Image</h3>
            {config.backgroundImage ? (
              <div className="space-y-3">
                <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.backgroundImage}
                    alt="Form background"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={clearBackground}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove background
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-3">No background image set.</p>
            )}
            <div className="mt-4">
              <label className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-pointer hover:bg-gray-200">
                Upload Image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Results Page */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
            <RichTextEditor
              content={config.resultsPage.headingHtml}
              onChange={(html) => updateResults('headingHtml', html)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
            <RichTextEditor
              content={config.resultsPage.bodyHtml}
              onChange={(html) => updateResults('bodyHtml', html)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input
              type="text"
              value={config.resultsPage.buttonText}
              onChange={(e) => updateResults('buttonText', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button URL Template
            </label>
            <input
              type="text"
              value={config.resultsPage.buttonUrlTemplate}
              onChange={(e) => updateResults('buttonUrlTemplate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Use {'{email}'} as placeholder for the user&apos;s email
            </p>
          </div>

          {/* Live preview */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <div
                className="text-white text-xl font-bold mb-3"
                dangerouslySetInnerHTML={{ __html: config.resultsPage.headingHtml }}
              />
              <div
                className="text-white/70 mb-6"
                dangerouslySetInnerHTML={{ __html: config.resultsPage.bodyHtml }}
              />
              <span className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-medium text-sm">
                {config.resultsPage.buttonText}
              </span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={saveResults}
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Results Page'}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Click below to open the assessment form in a new tab.
          </p>
          <a
            href="/ep2-assessment"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            Open Assessment Preview
          </a>
          <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
            <iframe
              src="/ep2-assessment"
              className="w-full h-[600px]"
              title="Assessment Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
