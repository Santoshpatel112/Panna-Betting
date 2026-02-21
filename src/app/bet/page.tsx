/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useMemo, useState } from "react";
import { suggestionsForPrefix, sortPanna, type Digit } from "@/lib/panna";

type GameType = "single-digit" | "jodi" | "single-panna" | "double-panna" | "triple-panna";

export default function Bet() {
  const [type, setType] = useState<GameType>("single-panna");
  const [input, setInput] = useState("");
  const [amount, setAmount] = useState(100);
  const [wallet, setWallet] = useState(50000);
  const [placing, setPlacing] = useState(false);

  const suggestions = useMemo(() => {
    if (type === "single-panna") return suggestionsForPrefix(input);
    if (type === "double-panna") {
      const s = new Set<string>();
      for (let d = 0; d <= 9; d++) {
        for (let e = 0; e <= 9; e++) {
          const a = d as Digit, b = d as Digit, c = e as Digit;
          if (a === c) continue;
          s.add(sortPanna(a, b, c));
        }
      }
      return Array.from(s).slice(0, 20);
    }
    if (type === "triple-panna") {
      const s = [];
      for (let d = 0; d <= 9; d++) s.push(`${d}${d}${d}`);
      return s;
    }
    if (type === "single-digit") {
      const s = [];
      for (let d = 0; d <= 9; d++) s.push(`${d}`);
      return s;
    }
    if (type === "jodi") {
      const s = [];
      for (let d = 0; d <= 9; d++) for (let e = 0; e <= 9; e++) s.push(`${d}${e}`);
      return s.slice(0, 20);
    }
    return [];
  }, [input, type]);

  async function placeBet(sel: string) {
    if (wallet < amount) return;
    setPlacing(true);
    try {
      await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, selection: sel, amount }),
      });
      setWallet((w) => w - amount);
    } finally {
      setPlacing(false);
    }
  }

  useEffect(() => {
    const el = document.getElementById("wallet");
    if (!el) return;
    el.animate([{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }], {
      duration: 400,
    });
  }, [wallet]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <header className="flex items-center justify-between mb-4">
        <a href="/" className="text-sm text-zinc-300">Back</a>
        <div id="wallet" className="rounded-xl bg-zinc-800 px-3 py-1 text-sm">
          ₹{wallet.toLocaleString()}
        </div>
      </header>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {(["single-digit", "jodi", "single-panna", "double-panna", "triple-panna"] as GameType[]).map((gt) => (
            <button
              key={gt}
              onClick={() => setType(gt)}
              className={`rounded-xl px-3 py-2 text-xs ${
                type === gt ? "bg-green-500 text-black" : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {gt.replace("-", " ")}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-800 p-4 border border-zinc-700">
          <div className="flex items-center gap-3">
            <input
              placeholder="Type digits..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-green-500"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))}
              className="w-24 rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-3 outline-none focus:border-green-500"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => placeBet(s)}
                disabled={placing}
                className="rounded-xl bg-green-500 text-black py-2 font-mono"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
