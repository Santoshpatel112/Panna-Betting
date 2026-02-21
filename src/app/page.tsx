/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

type MarketDef = {
  name: string;
  start: [number, number];
  end: [number, number];
};

const MARKETS: MarketDef[] = [
  { name: "Laxmi Morning", start: [9, 0], end: [12, 0] },
  { name: "Shridevi Morning", start: [13, 0], end: [15, 0] },
  { name: "Karnatak Day", start: [16, 0], end: [19, 0] },
];

function todayAt([h, m]: [number, number]) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function msToClock(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((x) => String(x).padStart(2, "0")).join(":");
}

export default function Home() {
  const now = useNow();
  const markets = useMemo(() => {
    return MARKETS.map((m) => {
      const openAt = todayAt(m.start);
      const closeAt = todayAt(m.end);
      const isOpen = now >= openAt && now <= closeAt;
      const timeLeft = closeAt.getTime() - now.getTime();
      return { ...m, openAt, closeAt, isOpen, timeLeft };
    });
  }, [now]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Panna Betting</h1>
        <a
          className="rounded-xl bg-zinc-800 px-4 py-2 text-sm"
          href="/(auth)/login"
        >
          Login
        </a>
      </header>
      <main className="px-4 pb-16">
        <section className="grid grid-cols-1 gap-4">
          {markets.map((m) => (
            <div
              key={m.name}
              className={`rounded-2xl p-4 border ${
                m.isOpen ? "border-green-400 shadow-[0_0_30px_#22c55e33]" : "border-zinc-700"
              } bg-gradient-to-b from-zinc-900 to-zinc-800`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">{m.name}</h2>
                  <p className="text-xs text-zinc-400">
                    {format(m.openAt, "hh:mm a")} - {format(m.closeAt, "hh:mm a")}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    m.isOpen ? "bg-green-500 text-black" : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {m.isOpen ? "Open" : "Closed"}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-zinc-300">
                  Time Left to Bet
                </div>
                <div className="font-mono text-lg">
                  {m.isOpen ? msToClock(m.timeLeft) : "00:00:00"}
                </div>
              </div>
              <div className="mt-4">
                <a
                  className={`w-full inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm ${
                    m.isOpen ? "bg-green-500 text-black" : "bg-zinc-700 text-zinc-300"
                  }`}
                  href="/bet"
                >
                  {m.isOpen ? "Place Bet" : "Bet Closed"}
                </a>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
