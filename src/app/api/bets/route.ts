import { NextResponse } from "next/server";

type Body = {
  type: "single-digit" | "jodi" | "single-panna" | "double-panna" | "triple-panna";
  selection: string;
  amount: number;
};

function marketWindows() {
  const d = new Date();
  const mk = (h: number, m: number) => {
    const t = new Date(d);
    t.setHours(h, m, 0, 0);
    return t;
  };
  return [
    { name: "Laxmi Morning", open: mk(9, 0), close: mk(12, 0) },
    { name: "Shridevi Morning", open: mk(13, 0), close: mk(15, 0) },
    { name: "Karnatak Day", open: mk(16, 0), close: mk(19, 0) },
  ];
}

function isAnyMarketOpen(now: Date) {
  return marketWindows().some((m) => now >= m.open && now <= m.close);
}

function validateSelection(type: Body["type"], s: string) {
  if (type === "single-digit") return /^[0-9]$/.test(s);
  if (type === "jodi") return /^[0-9]{2}$/.test(s);
  if (type === "triple-panna") return /^([0-9])\\1\\1$/.test(s);
  if (type === "double-panna") {
    if (!/^[0-9]{3}$/.test(s)) return false;
    const a = s[0], b = s[1], c = s[2];
    const set = new Set([a, b, c]);
    return set.size === 2;
  }
  if (type === "single-panna") {
    if (!/^[0-9]{3}$/.test(s)) return false;
    const a = s[0], b = s[1], c = s[2];
    const set = new Set([a, b, c]);
    return set.size === 3;
  }
  return false;
}

export async function POST(req: Request) {
  const now = new Date();
  if (!isAnyMarketOpen(now)) {
    return NextResponse.json({ error: "Market closed" }, { status: 400 });
  }

  const body = (await req.json()) as Body;
  if (!validateSelection(body.type, body.selection)) {
    return NextResponse.json({ error: "Invalid selection" }, { status: 400 });
  }
  if (!body.amount || body.amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
