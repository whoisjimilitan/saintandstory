"use client";

import { useState, useRef, useEffect } from "react";

const inputCls =
  "w-full border border-[#E8E8E8] rounded-2xl px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors";

interface AddressData {
  postcode: string;
  address: string;
  city: string;
  county: string;
  latitude: number;
  longitude: number;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onEnter?: () => void;
  onAddressSelected?: (address: AddressData) => void;
}

export default function PostcodeSearch({
  value,
  onChange,
  placeholder = "e.g. SW1A 2AA",
  autoFocus = false,
  onEnter,
  onAddressSelected,
}: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPostcode, setSelectedPostcode] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = value.replace(/\s/g, "");
    if (q.length < 2) { setSuggestions([]); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.postcodes.io/postcodes/${encodeURIComponent(q)}/autocomplete`
        );
        const data = await res.json();
        setSuggestions(data.result ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value]);

  async function pick(postcode: string) {
    onChange(postcode);
    setSuggestions([]);
    setSelectedPostcode(postcode);
  }

  function selectAddress(address: AddressData) {
    onAddressSelected?.(address);
    setAddresses([]);
    setSelectedPostcode(null);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions.length === 0) onEnter?.();
          }}
          placeholder={placeholder}
          className={inputCls}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-4 h-4 rounded-full border-2 border-[#E8E8E8] border-t-[#0D0D0D] animate-spin" />
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="border border-[#E8E8E8] rounded-2xl overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
              onTouchStart={() => pick(s)}
              className="w-full text-left px-4 py-3 text-sm font-mono tracking-widest text-[#0D0D0D] hover:bg-[#F5F5F5] border-b border-[#E8E8E8] last:border-b-0 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}


    </div>
  );
}
