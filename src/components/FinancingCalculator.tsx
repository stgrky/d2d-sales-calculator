'use client';

import { useState, useMemo } from 'react';

interface FinancingCalculatorProps {
  totalAmount: number;
}

const PLANS = {
  '45': {
    120: { factor: 0.0123, min: 7500, max: 100000 },
    180: { factor: 0.0097, min: 10000, max: 100000 },
    240: { factor: 0.0085, min: 12500, max: 100000 },
  },
  '180': {
    120: { factor: 0.0126, min: 7500, max: 100000 },
    180: { factor: 0.0099, min: 10000, max: 100000 },
    240: { factor: 0.0087, min: 12500, max: 100000 },
  },
};

export default function FinancingCalculator({ totalAmount }: FinancingCalculatorProps) {
  const [downPayment, setDownPayment] = useState(0);
  const [noPayment, setNoPayment] = useState<'45' | '180'>('45');
  const [term, setTerm] = useState<120 | 180 | 240>(120);

  const amountFinanced = Math.max(totalAmount - downPayment, 0);
  const plan = PLANS[noPayment][term];
  const isOutOfRange = amountFinanced < plan.min || amountFinanced > plan.max;

  const monthlyPayment = useMemo(() => {
    return isOutOfRange ? 0 : amountFinanced * plan.factor;
  }, [amountFinanced, plan, isOutOfRange]);

  return (
    <div className="border rounded p-6 bg-white shadow max-w-md w-full mx-auto mt-6">
      <h2 className="text-xl font-semibold text-center mb-4">Financing Calculator</h2>

      {/* Total Purchase Amount (readonly) */}
      <label className="block text-sm font-medium mb-1">Total Purchase Amount ($)</label>
      <input
        type="text"
        value={totalAmount.toFixed(2)}
        readOnly
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 bg-gray-100 text-gray-700"
      />

      {/* Down Payment */}
      <label className="block text-sm font-medium mb-1">Down Payment ($)</label>
      <input
        type="number"
        value={downPayment}
        onChange={(e) => setDownPayment(Number(e.target.value))}
        min={0}
        max={totalAmount}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
      />

      {/* No Payment Period */}
      <label className="block text-sm font-medium mb-2">No Payment Period</label>
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={noPayment === '45'}
            onChange={() => setNoPayment('45')}
          />
          45 Days
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={noPayment === '180'}
            onChange={() => setNoPayment('180')}
          />
          180 Days
        </label>
      </div>

      {/* Term Selection */}
      <label className="block text-sm font-medium mb-2">Select Term</label>
      <div className="flex gap-4 mb-4">
        {[120, 180, 240].map((t) => (
          <label key={t} className="flex items-center gap-2">
            <input
              type="radio"
              checked={term === t}
              onChange={() => setTerm(t as 120 | 180 | 240)}

            />
            {t} months
          </label>
        ))}
      </div>

      {/* Validation Message */}
      {isOutOfRange && (
        <p className="text-red-600 text-sm mb-4">
          Amount financed must be between ${plan.min.toLocaleString()} and ${plan.max.toLocaleString()} for this plan.
        </p>
      )}

      {/* Monthly Payment */}
      {!isOutOfRange && (
        <div className="text-green-700 text-sm font-medium mb-4">
          Estimated Monthly Payment: ${monthlyPayment.toFixed(2)}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-500">
        This tool is for demonstration purposes only. Values shown are based on published
        payment factors and do not constitute a financing offer.
      </p>
    </div>
  );
}
