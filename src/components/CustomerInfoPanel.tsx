// components/CustomerInfoPanel.tsx



// components/CustomerInfoPanel.tsx
"use client";
import { useId } from "react";

export type CustomerInfo = {
  company?: string;
  contactName: string;
  email?: string;
  phone?: string;
  serviceStreet: string;
  serviceCity: string;
  serviceState: string;
  serviceZip: string;
  poNumber?: string;
};

type Props = {
  value: CustomerInfo;
  onChange: (next: CustomerInfo) => void;
  collapsed?: boolean;
};

export const REQUIRED_CUSTOMER_KEYS: (keyof CustomerInfo)[] = [
  "contactName",
  "serviceStreet",
  "serviceCity",
  "serviceState",
  "serviceZip",
];

export default function CustomerInfoPanel({ value, onChange }: Props) {
  const id = useId();
  const set = <K extends keyof CustomerInfo>(k: K, v: CustomerInfo[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
      <legend className="font-semibold px-2">Customer</legend>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-company`} className="text-sm text-gray-700">Company (optional)</label>
          <input id={`${id}-company`} className="w-full border rounded p-2"
                 value={value.company ?? ""} onChange={e => set("company", e.target.value)} />
        </div>

        <div>
          <label htmlFor={`${id}-contact`} className="text-sm text-gray-700">Contact Name *</label>
          <input id={`${id}-contact`} className="w-full border rounded p-2"
                 value={value.contactName} onChange={e => set("contactName", e.target.value)} />
        </div>

        <div>
          <label htmlFor={`${id}-email`} className="text-sm text-gray-700">Email</label>
          <input id={`${id}-email`} className="w-full border rounded p-2"
                 value={value.email ?? ""} onChange={e => set("email", e.target.value)} />
        </div>

        <div>
          <label htmlFor={`${id}-phone`} className="text-sm text-gray-700">Phone</label>
          <input id={`${id}-phone`} className="w-full border rounded p-2"
                 value={value.phone ?? ""} onChange={e => set("phone", e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <p className="font-medium text-gray-800 mb-2">Service Address *</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="Street"
                 value={value.serviceStreet} onChange={e => set("serviceStreet", e.target.value)} />
          <input className="border rounded p-2" placeholder="City"
                 value={value.serviceCity} onChange={e => set("serviceCity", e.target.value)} />
          <input className="border rounded p-2" placeholder="State"
                 value={value.serviceState} onChange={e => set("serviceState", e.target.value)} />
          <input className="border rounded p-2" placeholder="ZIP"
                 value={value.serviceZip} onChange={e => set("serviceZip", e.target.value)} />
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div>
          <label className="text-sm text-gray-700">PO / Project ID (optional)</label>
          <input className="w-full border rounded p-2"
                 value={value.poNumber ?? ""} onChange={e => set("poNumber", e.target.value)} />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Fields marked * are required to generate the PDF.
      </p>
    </fieldset>
  );
}
