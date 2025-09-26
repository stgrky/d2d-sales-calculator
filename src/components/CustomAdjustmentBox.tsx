// components/CustomAdjustmentBox.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";

export type CustomAdjustment = {
  enabled: boolean;
  label: string;
  amount: number; // can be negative
  notes: string;
};

type Props = {
  value: CustomAdjustment;
  onChange: (next: CustomAdjustment) => void;
  onDirty: () => void; // mark quote stale + hide financing
};

const CustomAdjustmentBox: React.FC<Props> = ({ value, onChange, onDirty }) => {
  // local buffer so users can type "-", "12.", etc.
  const [amountText, setAmountText] = useState(
    Number.isFinite(value.amount) ? String(value.amount) : ""
  );
  const committedRef = useRef(amountText);

  useEffect(() => {
    const next = Number.isFinite(value.amount) ? String(value.amount) : "";
    if (next !== committedRef.current) {
      setAmountText(next);
      committedRef.current = next;
    }
  }, [value.amount]);

  const commitAmount = () => {
    const raw = amountText.trim();

    // Treat empty / "-" / "." / "-." as zero
    if (raw === "" || raw === "-" || raw === "." || raw === "-.") {
      committedRef.current = "0";
      setAmountText("0");
      onChange({ ...value, amount: 0 });
      onDirty();
      return;
    }

    const num = Number(raw.replace(/,/g, "")); // allow pasted commas
    if (Number.isFinite(num)) {
      committedRef.current = String(num);
      setAmountText(String(num)); // normalize "12." -> "12"
      onChange({ ...value, amount: num });
      onDirty();
    } else {
      // revert to last good value
      setAmountText(committedRef.current);
    }
  };

  const onAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // triggers commit
    } else if (e.key === "Escape") {
      setAmountText(committedRef.current);
      e.currentTarget.blur();
    }
  };

  return (
    <fieldset className="border border-gray-300 rounded bg-gray-50 p-4">
      <legend className="font-semibold px-2">Custom Adjustment</legend>

      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) => {
              const next = { ...value, enabled: e.target.checked };
              onChange(next);
              onDirty();
            }}
          />
          <span>Enable custom line item</span>
        </label>
      </div>

      {value.enabled && (
        <div className="space-y-3">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Name / Label (e.g., “Custom Discount”, “Expedited Service”)
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={value.label}
              onChange={(e) => {
                onChange({ ...value, label: e.target.value });
                onDirty();
              }}
              placeholder="Enter a short label"
              maxLength={80}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Amount (use negative for discounts)
            </label>
            <input
              type="text"
              inputMode="decimal"                         // allows "-" on mobile too
              className="border border-gray-300 rounded px-3 py-2 w-full"
              placeholder="0.00"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)} // no filtering
              onBlur={commitAmount}
              onKeyDown={onAmountKeyDown}
            />
            <p className="text-xs text-gray-600 mt-1">
              This value is applied directly to the project total.
            </p>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Notes (optional)
            </label>
            <textarea
              className="border border-gray-300 rounded px-3 py-2 w-full"
              rows={3}
              value={value.notes}
              onChange={(e) => {
                onChange({ ...value, notes: e.target.value });
                onDirty();
              }}
              placeholder="Additional info for this adjustment"
              maxLength={280}
            />
          </div>
        </div>
      )}
    </fieldset>
  );
};

export default CustomAdjustmentBox;
