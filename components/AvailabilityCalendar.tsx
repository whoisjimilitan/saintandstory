"use client";

import { useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Convert Sunday=0 to Monday=0
  const offset = (firstDay + 6) % 7;
  return { offset, daysInMonth };
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface Props {
  driverId: string;
  initialDates: string[];
}

export default function AvailabilityCalendar({ driverId, initialDates }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Set<string>>(new Set(initialDates));
  const [saving, setSaving] = useState<string | null>(null);

  const { offset, daysInMonth } = getMonthDays(year, month);
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const monthLabel = new Date(year, month).toLocaleString("en-GB", { month: "long", year: "numeric" });

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  async function toggleDate(dateStr: string) {
    if (dateStr < todayStr) return;
    setSaving(dateStr);
    const wasSelected = selected.has(dateStr);

    setSelected(prev => {
      const next = new Set(prev);
      wasSelected ? next.delete(dateStr) : next.add(dateStr);
      return next;
    });

    try {
      await fetch("/api/drivers/availability", {
        method: wasSelected ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, date: dateStr }),
      });
    } catch {
      // revert on failure
      setSelected(prev => {
        const next = new Set(prev);
        wasSelected ? next.add(dateStr) : next.delete(dateStr);
        return next;
      });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E8]">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center text-[#888888] hover:text-[#0D0D0D] transition-colors rounded-full hover:bg-[#F5F5F5]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{monthLabel}</p>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center text-[#888888] hover:text-[#0D0D0D] transition-colors rounded-full hover:bg-[#F5F5F5]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-4 pt-3 pb-1">
        {DAYS.map(d => (
          <p key={d} className="text-center text-[10px] font-semibold text-[#888888] uppercase tracking-[0.1em]">{d}</p>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 px-4 pb-4">
        {Array.from({ length: offset }).map((_, i) => <div key={`pad-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = toDateStr(year, month, day);
          const isPast = dateStr < todayStr;
          const isSelected = selected.has(dateStr);
          const isToday = dateStr === todayStr;
          const isSaving = saving === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => toggleDate(dateStr)}
              disabled={isPast || isSaving}
              className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                isPast
                  ? "text-[#E8E8E8] cursor-not-allowed"
                  : isSelected
                  ? "bg-[#0D0D0D] text-white"
                  : isToday
                  ? "border-2 border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#F5F5F5]"
                  : "text-[#0D0D0D] hover:bg-[#F5F5F5]"
              } ${isSaving ? "opacity-50" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-[#E8E8E8] flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#0D0D0D]" />
          <p className="text-[#888888] text-xs">Available</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-[#0D0D0D]" />
          <p className="text-[#888888] text-xs">Today</p>
        </div>
      </div>
    </div>
  );
}
