'use client';

import { useState } from 'react';

interface EditableCardProps {
  title: string;
  children: React.ReactNode;
  editForm: React.ReactNode;
  onSave: () => Promise<void>;
  onCancel?: () => void;
}

export default function EditableCard({
  title,
  children,
  editForm,
  onSave,
  onCancel,
}: EditableCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave();
      setEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditing(false);
    onCancel?.();
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      <div className="p-5">
        {editing ? editForm : children}
      </div>
    </div>
  );
}
