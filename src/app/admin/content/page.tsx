'use client';

import { useEffect, useState, useCallback } from 'react';
import TabGroup from '@/components/admin/TabGroup';
import EditableCard from '@/components/admin/EditableCard';
import ListEditor from '@/components/admin/ListEditor';
import { showToast } from '@/components/admin/Toast';

interface ContentItem {
  key: string;
  title: string;
  description: string;
  traits?: string[];
  questions?: string[];
  businesses?: string[];
  actions?: string[];
}

function ContentCards({
  type,
  items,
  listField,
  listLabel,
  onReload,
}: {
  type: string;
  items: ContentItem[];
  listField?: 'traits' | 'questions' | 'businesses' | 'actions';
  listLabel?: string;
  onReload: () => void;
}) {
  const [editStates, setEditStates] = useState<Record<string, ContentItem>>({});

  function getEditState(key: string, original: ContentItem): ContentItem {
    return editStates[key] || { ...original };
  }

  function setEditState(key: string, item: ContentItem) {
    setEditStates((prev) => ({ ...prev, [key]: item }));
  }

  async function handleSave(key: string) {
    const data = editStates[key];
    if (!data) return;

    const res = await fetch(`/api/admin/content/${type}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Save failed');
    showToast('success', `${data.title} updated`);
    setEditStates((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    onReload();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {items.map((item) => {
        const editItem = getEditState(item.key, item);
        return (
          <EditableCard
            key={item.key}
            title={`${item.title} (${item.key})`}
            onSave={() => handleSave(item.key)}
            onCancel={() => setEditStates((prev) => {
              const next = { ...prev };
              delete next[item.key];
              return next;
            })}
            editForm={
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Title</label>
                  <input
                    type="text"
                    value={editItem.title}
                    onChange={(e) => setEditState(item.key, { ...editItem, title: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <textarea
                    value={editItem.description}
                    onChange={(e) => setEditState(item.key, { ...editItem, description: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 border rounded text-sm"
                    rows={4}
                  />
                </div>
                {listField && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">{listLabel}</label>
                    <div className="mt-1">
                      <ListEditor
                        items={(editItem[listField] as string[]) || []}
                        onChange={(newItems) => setEditState(item.key, { ...editItem, [listField]: newItems })}
                      />
                    </div>
                  </div>
                )}
              </div>
            }
          >
            <div className="space-y-2">
              <p className="text-sm text-gray-700">{item.description}</p>
              {listField && (item[listField] as string[])?.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">{listLabel}:</p>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {(item[listField] as string[]).map((val, i) => (
                      <li key={i}>- {val}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </EditableCard>
        );
      })}
    </div>
  );
}

export default function ContentPage() {
  const [data, setData] = useState<Record<string, ContentItem[]>>({});
  const [error, setError] = useState('');

  const loadAll = useCallback(() => {
    const types = ['animals', 'risk-levels', 'reward-levels', 'drivers', 'aois', 'strategies'];
    Promise.all(
      types.map((t) =>
        fetch(`/api/admin/content/${t}`)
          .then((r) => r.json())
          .then((items) => [t, items] as [string, ContentItem[]])
      )
    )
      .then((results) => {
        setData(Object.fromEntries(results));
      })
      .catch(() => setError('Failed to load content'));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
  if (Object.keys(data).length === 0) return <div className="text-gray-500">Loading content...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Content Management</h1>
      <TabGroup tabs={[
        {
          key: 'animals',
          label: 'Animals',
          content: <ContentCards type="animals" items={data['animals'] || []} listField="traits" listLabel="Traits" onReload={loadAll} />,
        },
        {
          key: 'risk-reward',
          label: 'Risk/Reward Levels',
          content: (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900">Risk Levels</h3>
              <ContentCards type="risk-levels" items={data['risk-levels'] || []} onReload={loadAll} />
              <h3 className="font-semibold text-gray-900 mt-6">Reward Levels</h3>
              <ContentCards type="reward-levels" items={data['reward-levels'] || []} onReload={loadAll} />
            </div>
          ),
        },
        {
          key: 'drivers',
          label: 'Drivers',
          content: <ContentCards type="drivers" items={data['drivers'] || []} listField="questions" listLabel="Questions" onReload={loadAll} />,
        },
        {
          key: 'aois',
          label: 'AOIs',
          content: <ContentCards type="aois" items={data['aois'] || []} listField="businesses" listLabel="Business Suggestions" onReload={loadAll} />,
        },
        {
          key: 'strategies',
          label: 'Strategies',
          content: <ContentCards type="strategies" items={data['strategies'] || []} listField="actions" listLabel="Action Items" onReload={loadAll} />,
        },
      ]} />
    </div>
  );
}
