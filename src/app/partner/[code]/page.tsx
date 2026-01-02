"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { getAllPartners, type Partner } from "@/lib/supabase";
import PartnerCalculator from "@/components/PartnerCalculator";

export default function PartnerPage() {
  const params = useParams();
  const pathname = usePathname();
  
  // Debug logging
  console.log('params:', params);
  console.log('pathname:', pathname);
  
  // Extract code from pathname as fallback
  const partnerCode = (params.code as string) || pathname.split('/').pop() || '';
  
  console.log('partnerCode:', partnerCode);
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPartner() {
      try {
        console.log('Loading partner with code:', partnerCode);
        
        // Block Aquaria from being accessed as a partner
        if (partnerCode === 'AQUARIA_HQ') {
          setError('Aquaria is not a partner. Please visit the main calculator at /');
          setLoading(false);
          return;
        }

        const partners = await getAllPartners();
        console.log('All partners:', partners);
        
        const found = partners.find(p => p.partner_code === partnerCode);
        console.log('Found partner:', found);
        
        if (!found) {
          setError(`Partner "${partnerCode}" not found`);
        } else if (found.partner_code === 'AQUARIA_HQ') {
          setError('Aquaria is not a partner. Please visit the main calculator at /');
        } else if (!found.can_create_quotes) {
          setError(`Partner "${partnerCode}" does not have quote creation enabled`);
        } else {
          setPartner(found);
        }
      } catch (err) {
        console.error('Error loading partner:', err);
        setError('Failed to load partner information');
      }
      setLoading(false);
    }
    
    if (partnerCode) {
      loadPartner();
    }
  }, [partnerCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading partner calculator...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <a 
            href="/" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Aquaria Calculator
          </a>
        </div>
      </div>
    );
  }

  return <PartnerCalculator partner={partner} />;
}