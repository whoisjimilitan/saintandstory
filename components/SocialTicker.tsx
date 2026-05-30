"use client";

const ITEMS = [
  "📦 James in Manchester booked an office move — 2 mins ago",
  "🚛 Rachel in London confirmed a same-day pickup — 5 mins ago",
  "✅ Damien in Birmingham got a fixed-price quote — 8 mins ago",
  "📦 Fiona in Edinburgh booked a home move — 11 mins ago",
  "🚛 Yemi in Bristol confirmed a fragile item move — 14 mins ago",
  "✅ Priya in Leeds got a quote in under 90 seconds — 17 mins ago",
  "📦 Tom in Sheffield booked a student move — 22 mins ago",
  "🚛 Anya in Glasgow confirmed a piano move — 25 mins ago",
  "✅ Marcus in Cardiff got a same-day crew — 28 mins ago",
  "📦 Sophie in Nottingham booked next-day removal — 31 mins ago",
];

export default function SocialTicker() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="bg-brand overflow-hidden py-3 select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="text-white text-xs font-medium px-8 shrink-0">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
