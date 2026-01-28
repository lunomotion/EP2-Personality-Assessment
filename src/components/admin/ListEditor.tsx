'use client';

interface ListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export default function ListEditor({ items, onChange, placeholder = 'Add item...' }: ListEditorProps) {
  function handleChange(index: number, value: string) {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  }

  function handleAdd() {
    onChange([...items, '']);
  }

  function handleRemove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  }

  function handleMoveDown(index: number) {
    if (index >= items.length - 1) return;
    const updated = [...items];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-5 text-right">{i + 1}.</span>
          <input
            type="text"
            value={item}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleMoveUp(i)}
              disabled={i === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              title="Move up"
            >
              &uarr;
            </button>
            <button
              type="button"
              onClick={() => handleMoveDown(i)}
              disabled={i >= items.length - 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              title="Move down"
            >
              &darr;
            </button>
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="p-1 text-red-400 hover:text-red-600"
              title="Remove"
            >
              &times;
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
      >
        + Add item
      </button>
    </div>
  );
}
