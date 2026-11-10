"use client";

import { useState } from "react";
import Image from "next/image";

type Member = {
  name: string;
  role: string;
  bio: string;
  image?: string;
  linkedin?: string;
};

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />
  </svg>
);

function Card({ member, onClick }: { member: Member; onClick: () => void }) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-36 sm:w-40 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden text-left hover:-translate-y-1 transition-transform"
    >
      <div className="relative aspect-[3/4] w-full bg-[#082552]">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            quality={95}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white tracking-wide">
              {initials}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#082552] truncate">
          {member.name}
        </p>
        <p className="text-[9px] font-semibold uppercase tracking-wider text-[#0067f5] truncate">
          {member.role}
        </p>
      </div>
    </button>
  );
}

export default function TeamOrbit({ rows }: { rows: Member[][] }) {
  const [active, setActive] = useState<Member | null>(null);

  return (
    <>
      <div className="space-y-6 my-10">
        {rows.map((row, ri) => (
          <div key={ri} className="flex flex-wrap justify-center gap-5">
            {row.map((member, i) => (
              <Card
                key={`${ri}-${i}`}
                member={member}
                onClick={() => setActive(member)}
              />
            ))}
          </div>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{
            background: "rgba(8,37,82,0.5)",
            animation: "fade-in 180ms ease-out",
          }}
          onClick={() => setActive(null)}
        >
          <div
            className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl text-center"
            style={{ animation: "orbit-modal-in 220ms ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-[#E5E7EB]">
              {active.image ? (
                <Image
                  src={active.image}
                  alt={active.name}
                  fill
                  sizes="96px"
                  quality={95}
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white bg-[#082552] w-full h-full flex items-center justify-center">
                  {active.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#082552] uppercase mb-1">
              {active.name}
            </h2>
            <p className="text-[#0067f5] font-bold text-xs uppercase tracking-wider mb-4">
              {active.role}
            </p>
            {active.bio && (
              <p className="text-[#6B7280] italic leading-relaxed mb-5 text-sm">
                {active.bio}
              </p>
            )}

            <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#E5E7EB]">
              {active.linkedin && (
                <a
                  href={active.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9CA3AF] hover:text-[#0067f5] transition-colors"
                >
                  <LinkedInIcon />
                </a>
              )}
              <button
                onClick={() => setActive(null)}
                className="text-sm font-semibold text-[#0067f5] hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
