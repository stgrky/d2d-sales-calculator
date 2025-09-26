// components/CustomAdjustmentsGroup.tsx
"use client";

import React from "react";
import CustomAdjustmentBox, { CustomAdjustment } from "@/components/CustomAdjustmentBox";

type Props = {
  items: CustomAdjustment[];
  onChange: (items: CustomAdjustment[]) => void;
  onDirty?: () => void;
};

const emptyItem: CustomAdjustment = { enabled: false, label: "", amount: 0, notes: "" };

const CustomAdjustmentsGroup: React.FC<Props> = ({ items, onChange, onDirty }) => {
  const updateItem = (idx: number, next: CustomAdjustment) => {
    const copy = [...items];
    copy[idx] = next;
    onChange(copy);
    onDirty?.();
  };

  const removeItem = (idx: number) => {
    const copy = items.filter((_, i) => i !== idx);
    onChange(copy.length ? copy : [emptyItem]); // keep at least one row
    onDirty?.();
  };

  const addItem = () => {
    onChange([...items, { ...emptyItem }]);
    onDirty?.();
  };

  return (
    <fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
      <legend className="font-semibold px-2">Custom Adjustments</legend>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="relative">
            <CustomAdjustmentBox
              value={item}
              onChange={(v) => updateItem(idx, v)}
              onDirty={onDirty ?? (() => {})}
            />
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="absolute top-2 right-2 text-sm text-red-600 hover:underline"
              aria-label={`Remove custom adjustment ${idx + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        + Add Another Custom Line
      </button>
    </fieldset>
  );
};

export default CustomAdjustmentsGroup;
