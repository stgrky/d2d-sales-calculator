"use client";

import { useState, useEffect } from "react";
import { getQuotes, deleteQuote, type Quote } from "@/lib/supabase";

interface SavedQuotesListProps {
  onLoadQuote: (quote: Quote) => void;
  partnerId?: string;
}

export default function SavedQuotesList({ onLoadQuote, partnerId }: SavedQuotesListProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);

  const loadQuotes = async () => {
    console.log('Loading quotes for partner:', partnerId);
    setLoading(true);
    try {
      const data = await getQuotes(partnerId);
      console.log('Quotes loaded:', data);
      console.log('Number of quotes:', data.length);
      setQuotes(data);
    } catch (err) {
      console.error('Error loading quotes:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (showList) {
      console.log('Show list toggled, loading quotes...');
      loadQuotes();
    }
  }, [showList, partnerId]);

  const handleDelete = async (id: string, quoteNumber: string) => {
    if (!confirm(`Delete quote ${quoteNumber}? This cannot be undone.`)) return;
    
    const success = await deleteQuote(id);
    if (success) {
      alert("Quote deleted successfully");
      loadQuotes();
    } else {
      alert("Failed to delete quote");
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowList(!showList)}
        className="block w-full py-3 text-lg bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        {showList ? "Hide Saved Quotes" : "View Saved Quotes"}
      </button>

      {showList && (
        <div className="mt-4 border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Your Saved Quotes</h3>
            <button
              onClick={loadQuotes}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-2">
                Debug: Found {quotes.length} quote(s) | Partner: {partnerId || 'AQUARIA_HQ'}
              </p>
              {quotes.length === 0 ? (
                <p className="text-gray-500">No saved quotes yet.</p>
              ) : (
                <div className="space-y-3">
                  {quotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="border border-gray-200 rounded p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">
                            {quote.quote_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            {quote.customer_company || quote.customer_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {quote.service_street}, {quote.service_city}, {quote.service_state}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Model: {quote.quote_config.model || "None"} | 
                            Total: ${quote.final_total.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {new Date(quote.created_at!).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => onLoadQuote(quote)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDelete(quote.id!, quote.quote_number)}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}