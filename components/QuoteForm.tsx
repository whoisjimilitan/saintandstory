"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

export default function QuoteForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("[QuoteForm] Submitted:", form);

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
    "w-full border border-[#0D0E17]/15 rounded-xl px-4 py-3.5 text-sm text-[#0D0E17] placeholder-[#0D0E17]/30 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8244A]/30 focus:border-[#E8244A] transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-[#0D0E17]/50 uppercase tracking-[0.3em] mb-1.5">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First name"
            className={field}
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#0D0E17]/50 uppercase tracking-[0.3em] mb-1.5">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last name"
            className={field}
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[#0D0E17]/50 uppercase tracking-[0.3em] mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className={field}
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[#0D0E17]/50 uppercase tracking-[0.3em] mb-1.5">
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+44 7700 000 000"
          className={field}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold py-4 rounded-xl transition-colors text-sm"
      >
        Request My Free Quote &rarr;
      </button>

      <p className="text-center text-[#0D0E17]/30 text-xs">
        We call within 1 minute. No spam, ever.
      </p>
    </form>
  );
}
