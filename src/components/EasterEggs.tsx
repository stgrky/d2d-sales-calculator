"use client";
import React from "react";


export interface Section {
  type: string;
  distance: number;
}

export interface CalcInputs {
  trenchingSections: Section[];
  ab_trenchingSections: Section[];
}

function anyFeet(arr: Section[], feet: number) {
  return (arr ?? []).some((s) => Number(s.distance) === feet);
}

/** Returns the first matching egg or null */
export function checkEasterEgg(
  inputs: CalcInputs
): { message: string; duration: number } | null {
  const { trenchingSections, ab_trenchingSections } = inputs;

  // Only trigger when ANY single section distance equals 404
  if (
    anyFeet(trenchingSections ?? [], 404) ||
    anyFeet(ab_trenchingSections ?? [], 404)
  ) {
    return { message: "Water Not Found", duration: 1100 };
  }

  return null;
}

export const EasterEggOverlay: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <div
      className="absolute inset-0 z-[9999] flex items-center justify-center
                 text-sm font-medium pointer-events-none
                 animate-eggFlash bg-black/60 text-white rounded"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
};
