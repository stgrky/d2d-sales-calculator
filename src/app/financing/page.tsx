"use client";

import { useState } from "react";
import Head from "next/head";

const FinancingPortal: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [downPayment, setDownPayment] = useState<string>("");
  const [planType, setPlanType] = useState<"45" | "180">("45");
  const [selectedTerm, setSelectedTerm] = useState<number>(120);

  const termOptions = [120, 180, 240];

  const plans: Record<"45" | "180", Partial<Record<number, { paymentFactor: number; apr: number; min: number; max: number }>>> = {
    "45": {
      120: { paymentFactor: 0.0123, apr: 7.99, min: 7500, max: 100000 },
      180: { paymentFactor: 0.0097, apr: 7.99, min: 10000, max: 100000 },
      240: { paymentFactor: 0.0085, apr: 7.99, min: 12500, max: 100000 },
    },
    "180": {
      120: { paymentFactor: 0.0126, apr: 7.99, min: 7500, max: 100000 },
      180: { paymentFactor: 0.0099, apr: 7.99, min: 10000, max: 100000 },
      240: { paymentFactor: 0.0087, apr: 7.99, min: 12500, max: 100000 },
    },
  };

  const parsedAmount = parseFloat(amount) || 0;
  const parsedDownPayment = parseFloat(downPayment) || 0;
  const effectiveAmount = Math.max(parsedAmount - parsedDownPayment, 0);
  const currentPlan = plans[planType][selectedTerm];
  const isWithinRange = currentPlan && effectiveAmount >= currentPlan.min && effectiveAmount <= currentPlan.max;
  const monthlyPayment = currentPlan ? effectiveAmount * currentPlan.paymentFactor : 0;

  return (
    <>
      <Head>
        <title>Financing Portal</title>
      </Head>
      <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Financing Calculator</h1>

        <label className="block mb-2 font-medium">Total Purchase Amount ($)</label>
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/^0+(?=\d)/, ""))}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <label className="block mb-2 font-medium">Down Payment ($)</label>
        <input
          type="text"
          inputMode="numeric"
          value={downPayment}
          onChange={(e) => setDownPayment(e.target.value.replace(/^0+(?=\d)/, ""))}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <label className="block mb-2 font-medium">No Payment Period</label>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="planType"
              value="45"
              checked={planType === "45"}
              onChange={() => setPlanType("45")}
            />
            45 Days
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="planType"
              value="180"
              checked={planType === "180"}
              onChange={() => setPlanType("180")}
            />
            180 Days
          </label>
        </div>

        <label className="block mb-2 font-medium">Select Term</label>
        <div className="flex gap-3 flex-wrap mb-4">
          {termOptions.map((term) => (
            <label key={term} className="flex items-center gap-2">
              <input
                type="radio"
                name="term"
                value={term}
                checked={selectedTerm === term}
                onChange={() => setSelectedTerm(term)}
              />
              {term} months
            </label>
          ))}
        </div>

        {currentPlan && isWithinRange ? (
          <p className="text-lg font-semibold mb-2">
            Estimated Monthly Payment: ${monthlyPayment.toFixed(2)} @ {currentPlan.apr.toFixed(2)}% APR
          </p>
        ) : currentPlan ? (
          <p className="text-sm text-red-600 mb-2">
            Amount financed must be between ${currentPlan.min.toLocaleString()} and ${currentPlan.max.toLocaleString()} for this plan.
          </p>
        ) : (
          <p className="text-sm text-red-600 mb-2">Invalid plan selected.</p>
        )}

        <p className="text-sm text-gray-600">
          This tool is for demonstration purposes only. Values shown are based on published payment factors and do not constitute a financing offer.
        </p>
      </div>
    </>
  );
};

export default FinancingPortal;
