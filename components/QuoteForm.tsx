"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

export default function QuoteForm() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    posthog.identify(form.email, {
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.phone,
      email: form.email,
    });
    posthog.capture("quote_form_submitted", {
      first_name: form.firstName,
      last_name: form.lastName,
      has_email: form.email.length > 0,
      has_phone: form.phone.length > 0,
    });
    await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, page: window.location.pathname }),
    });
    router.push("/thank-you");
  }

  const field =
    "w-full border border-[#E8E8E8] rounded-xl px-4 py-3.5 text-sm text-[#0D0D0D] placeholder-[#888888] bg-white focus:outline-none focus:border-[#0D0D0D] transition-colors";

  const label = "block text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>First Name</label>
          <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" className={field} />
        </div>
        <div>
          <label className={label}>Last Name</label>
          <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" className={field} />
        </div>
      </div>

      <div>
        <label className={label}>Email Address</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className={field} />
      </div>

      <div>
        <label className={label}>Phone Number</label>
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+44 7700 000 000" className={field} />
      </div>

      <button
        type="submit"
        className="w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-4 rounded-full transition-colors text-sm"
      >
        Request a free quote →
      </button>

      <p className="text-center text-[#888888] text-xs">No obligation. We call within 1 minute.</p>
    </form>
  );
}
