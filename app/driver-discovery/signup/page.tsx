'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function B2BDriverSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    postcode: '',
    radiusMiles: '10',
    vehicleType: 'Van',
    availableDays: [] as string[],
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/driver-discovery/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sign up');
      }

      // Success - redirect to B2B dashboard
      router.push('/dashboard/driver/b2b');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#FAF9F7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="font-sans font-black text-3xl text-[#0D0D0D] mb-2">B2B Lead Discovery</h1>
          <p className="text-[#888888]">Sign up to discover local businesses and earn standing orders</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[#E8E8E8] rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D0D0D]"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D0D0D]"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">Postcode</label>
            <input
              type="text"
              name="postcode"
              value={formData.postcode}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D0D0D]"
              placeholder="e.g., M1 5AE"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">Service Radius (miles)</label>
            <select
              name="radiusMiles"
              value={formData.radiusMiles}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D0D0D]"
            >
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
              <option value="15">15 miles</option>
              <option value="20">20 miles</option>
              <option value="25">25 miles</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">Vehicle Type</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D0D0D]"
            >
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Lorry">Lorry</option>
              <option value="Car">Car</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-3">Available Days</label>
            <div className="space-y-2">
              {days.map(day => (
                <label key={day} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.availableDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="w-4 h-4 rounded border-[#E8E8E8]"
                  />
                  <span className="text-sm text-[#0D0D0D]">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D0D0D] hover:bg-[#333333] disabled:bg-[#BDBDBD] text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Signing up...' : 'Sign up for lead discovery'}
          </button>

          <p className="text-center text-sm text-[#888888]">
            Already have a job dispatch account?{' '}
            <Link href="/dashboard/driver" className="text-[#0D0D0D] font-semibold hover:underline">
              Go to driver dashboard
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
