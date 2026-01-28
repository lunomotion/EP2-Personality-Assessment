'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import TabGroup from '@/components/admin/TabGroup';
import { showToast } from '@/components/admin/Toast';

interface IconSlot {
  category: string;
  filename: string;
  label: string;
  hasUpload: boolean;
}

function ImageGrid({
  slots,
  onReload,
}: {
  slots: IconSlot[];
  onReload: () => void;
}) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  async function handleUpload(slot: IconSlot, file: File) {
    setUploading(slot.filename);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', slot.category);
      formData.append('filename', slot.filename);

      const res = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      showToast('success', `${slot.label} updated`);
      onReload();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  }

  async function handleReset(slot: IconSlot) {
    try {
      const deletePath = slot.category === 'logo'
        ? slot.filename
        : `${slot.category}/${slot.filename}`;
      const res = await fetch(`/api/admin/images/${deletePath}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Reset failed');
      }

      showToast('success', `${slot.label} reset to default`);
      onReload();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Reset failed');
    }
  }

  function getImageSrc(slot: IconSlot): string {
    if (slot.category === 'logo') {
      return `/api/uploads/${slot.filename}`;
    }
    return `/api/uploads/${slot.category}/${slot.filename}`;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {slots.map((slot) => {
        const key = `${slot.category}/${slot.filename}`;
        return (
          <div key={key} className="bg-white rounded-lg border p-3 flex flex-col items-center gap-2">
            <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={`${getImageSrc(slot)}?t=${Date.now()}`}
                alt={slot.label}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <p className="text-xs font-medium text-gray-700 text-center leading-tight">{slot.label}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              slot.hasUpload
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {slot.hasUpload ? 'Custom' : 'Default'}
            </span>
            <div className="flex gap-1.5 mt-1">
              <input
                ref={(el) => { fileInputRefs.current[key] = el; }}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(slot, file);
                  e.target.value = '';
                }}
              />
              <button
                onClick={() => fileInputRefs.current[key]?.click()}
                disabled={uploading === slot.filename}
                className="text-xs px-2.5 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {uploading === slot.filename ? 'Uploading...' : 'Upload'}
              </button>
              {slot.hasUpload && (
                <button
                  onClick={() => handleReset(slot)}
                  className="text-xs px-2.5 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ImagesPage() {
  const [data, setData] = useState<Record<string, IconSlot[]>>({});
  const [error, setError] = useState('');

  const loadAll = useCallback(() => {
    fetch('/api/admin/images')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then(setData)
      .catch(() => setError('Failed to load image data'));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
  if (Object.keys(data).length === 0) return <div className="text-gray-500">Loading images...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Image Management</h1>
      <p className="text-sm text-gray-500 mb-6">
        Upload custom images to override defaults. Reset to revert to the original.
      </p>
      <TabGroup tabs={[
        {
          key: 'animals',
          label: 'Animals',
          content: <ImageGrid slots={data['animals'] || []} onReload={loadAll} />,
        },
        {
          key: 'risk-reward',
          label: 'Risk/Reward',
          content: <ImageGrid slots={data['risk-reward'] || []} onReload={loadAll} />,
        },
        {
          key: 'drivers',
          label: 'Drivers',
          content: <ImageGrid slots={data['drivers'] || []} onReload={loadAll} />,
        },
        {
          key: 'aoi',
          label: 'AOIs',
          content: <ImageGrid slots={data['aoi'] || []} onReload={loadAll} />,
        },
        {
          key: 'strategies',
          label: 'Strategies',
          content: <ImageGrid slots={data['strategies'] || []} onReload={loadAll} />,
        },
        {
          key: 'logo',
          label: 'Logo',
          content: <ImageGrid slots={data['logo'] || []} onReload={loadAll} />,
        },
      ]} />
    </div>
  );
}
