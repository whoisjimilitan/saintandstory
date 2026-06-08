"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string | number;
  customer_name: string;
  postcode_from: string;
  postcode_to: string;
  price: number | null;
  created_at: string | Date;
}

interface Props {
  awaitingJobs: Job[];
  confirmedJobs: Job[];
  inProgressJobs: Job[];
  driverId?: string;
}

export default function OpportunityFeed({
  awaitingJobs,
  confirmedJobs,
  inProgressJobs,
  driverId,
}: Props) {
  const [expandedSections, setExpandedSections] = useState({
    awaiting: false,
    confirmed: true,
    inProgress: true,
  });

  const toggleSection = (section: "awaiting" | "confirmed" | "inProgress") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderJobItem = (job: Job) => (
    <Link
      key={job.id}
      href={`/dashboard/driver/jobs?id=${job.id}`}
      className="block bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg p-4 hover:border-[#0D0D0D] transition-colors"
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <p className="font-semibold text-[#0D0D0D] text-sm">{job.customer_name || "Job"}</p>
        {job.price && (
          <p className="font-semibold text-[#0D0D0D] text-sm whitespace-nowrap">
            £{Number(job.price).toFixed(0)}
          </p>
        )}
      </div>
      {job.postcode_from && job.postcode_to && (
        <p className="text-[#888888] text-xs mb-1">
          {job.postcode_from} → {job.postcode_to}
        </p>
      )}
      {job.created_at && (
        <p className="text-[#888888] text-[10px]">
          {new Date(job.created_at).toLocaleDateString()} at{" "}
          {new Date(job.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </Link>
  );

  return (
    <div className="space-y-3">
      {/* In Progress Jobs */}
      {driverId && (
        <div className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("inProgress")}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors"
          >
            <div className="flex items-center gap-3">
              <p className="font-semibold text-[#0D0D0D]">In progress</p>
              <p className="bg-[#0D0D0D] text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                {inProgressJobs.length}
              </p>
            </div>
            <ChevronDown
              size={18}
              className={`text-[#888888] transition-transform ${
                expandedSections.inProgress ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedSections.inProgress && inProgressJobs.length > 0 && (
            <div className="border-t border-[#E8E8E8] px-4 py-3 space-y-2">
              {inProgressJobs.map(renderJobItem)}
            </div>
          )}
          {expandedSections.inProgress && inProgressJobs.length === 0 && (
            <div className="border-t border-[#E8E8E8] px-4 py-3 text-center">
              <p className="text-[#888888] text-sm">No jobs in progress.</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmed Jobs */}
      {driverId && (
        <div className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("confirmed")}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors"
          >
            <div className="flex items-center gap-3">
              <p className="font-semibold text-[#0D0D0D]">Confirmed jobs</p>
              <p className="bg-[#0D0D0D] text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                {confirmedJobs.length}
              </p>
            </div>
            <ChevronDown
              size={18}
              className={`text-[#888888] transition-transform ${
                expandedSections.confirmed ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedSections.confirmed && confirmedJobs.length > 0 && (
            <div className="border-t border-[#E8E8E8] px-4 py-3 space-y-2">
              {confirmedJobs.map(renderJobItem)}
            </div>
          )}
          {expandedSections.confirmed && confirmedJobs.length === 0 && (
            <div className="border-t border-[#E8E8E8] px-4 py-3 text-center">
              <p className="text-[#888888] text-sm">No confirmed jobs yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Opportunities */}
      <div className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection("awaiting")}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors"
        >
          <div className="flex items-center gap-3">
            <p className="font-semibold text-[#0D0D0D]">Opportunities</p>
            <p className="bg-[#0D0D0D] text-white text-[10px] font-semibold px-2 py-1 rounded-full">
              {awaitingJobs.length}
            </p>
          </div>
          <ChevronDown
            size={18}
            className={`text-[#888888] transition-transform ${
              expandedSections.awaiting ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.awaiting && awaitingJobs.length > 0 && (
          <div className="border-t border-[#E8E8E8] px-4 py-3 space-y-2">
            {awaitingJobs.map(renderJobItem)}
          </div>
        )}
        {expandedSections.awaiting && awaitingJobs.length === 0 && (
          <div className="border-t border-[#E8E8E8] px-4 py-3 text-center">
            <p className="text-[#888888] text-sm">No opportunities available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
