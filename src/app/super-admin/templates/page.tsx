'use client'

import { useState } from 'react'

function DotsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-[#647a6b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

export default function SuperAdminTemplatesPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-[32px] font-medium text-[#07472e] tracking-[-0.96px] leading-[1.5]">Templates</h1>
        <button
          className="bg-[#c8f481] text-[#07472e] font-medium text-[16px] tracking-[-0.16px] rounded-xl px-6 h-12 hover:bg-[#b8e56e] transition"
        >
          Add new template
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-1 items-center gap-2 border border-[#07472e] rounded-xl px-4 py-3">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[16px] text-[#07472e] placeholder:text-[#647a6b] outline-none tracking-[-0.16px]"
          />
        </div>
      </div>

      {/* Templates board */}
      <div className="bg-[rgba(7,71,46,0.06)] rounded-2xl p-4 flex flex-col gap-2 flex-1">
        {/* Column headers */}
        <div className="flex items-center gap-2 px-4 h-10">
          <span className="flex-1 text-[16px] text-[#647a6b] tracking-[-0.16px]">Template name</span>
          <span className="w-48 text-[16px] text-[#647a6b] tracking-[-0.16px]">Creation date</span>
          <span className="w-10" />
        </div>

        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
          <svg className="w-24 h-24 text-[#07472e]/20" viewBox="0 0 96 96" fill="none">
            <rect x="16" y="8" width="64" height="80" rx="8" fill="currentColor" opacity="0.3"/>
            <rect x="28" y="28" width="40" height="4" rx="2" fill="currentColor"/>
            <rect x="28" y="40" width="32" height="4" rx="2" fill="currentColor"/>
            <rect x="28" y="52" width="36" height="4" rx="2" fill="currentColor"/>
            <rect x="4" y="4" width="48" height="60" rx="6" fill="currentColor" opacity="0.6"/>
            <rect x="12" y="20" width="32" height="3" rx="1.5" fill="white"/>
            <rect x="12" y="30" width="24" height="3" rx="1.5" fill="white"/>
            <rect x="12" y="40" width="28" height="3" rx="1.5" fill="white"/>
          </svg>
          <p className="text-[16px] font-medium text-[#07472e] text-center tracking-[-0.16px]">
            No templates yet. Click &quot;Add new template&quot;<br />to start the work.
          </p>
        </div>
      </div>
    </div>
  )
}
