/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestOtp() {
    setLoading(true);
    setMessage("");
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    setLoading(false);
    if (error) {
      setMessage("Failed to send OTP");
      return;
    }
    setStep("otp");
    setMessage("OTP sent");
  }

  async function verifyOtp() {
    setLoading(true);
    setMessage("");
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) {
      setMessage("Invalid OTP");
      return;
    }
    if (data.session) {
      setMessage("Logged in");
      window.location.href = "/";
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-800 p-6 shadow-2xl">
        <div className="text-center mb-6">
          <img alt="logo" src="/vercel.svg" className="mx-auto h-8 w-8 invert" />
          <h1 className="mt-3 text-xl font-semibold">Login</h1>
          <p className="text-zinc-400 text-sm">Mobile number + OTP</p>
        </div>
        {step === "phone" ? (
          <div className="space-y-4">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-green-500"
            />
            <button
              onClick={requestOtp}
              disabled={loading || !phone}
              className="w-full rounded-xl bg-green-500 text-black font-semibold py-3 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-green-500"
            />
            <button
              onClick={verifyOtp}
              disabled={loading || !otp}
              className="w-full rounded-xl bg-green-500 text-black font-semibold py-3 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        )}
        {message && (
          <div className="mt-4 text-center text-sm text-zinc-300">{message}</div>
        )}
      </div>
    </div>
  );
}
