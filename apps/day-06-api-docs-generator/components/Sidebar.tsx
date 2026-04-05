'use client';

import { FORMAT_OPTIONS } from '@/lib/constants';
import type { Format } from '@/lib/types';

interface SidebarProps {
  input: string;
  format: Format;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onFormatChange: (format: Format) => void;
  onGenerate: () => void;
}

export default function Sidebar({
  input,
  format,
  isLoading,
  onInputChange,
  onFormatChange,
  onGenerate,
}: SidebarProps) {
  return (
    <aside
      className="w-[340px] shrink-0 bg-white border-r border-gray-200 h-full flex flex-col"
      style={{ fontFamily: 'var(--font-ibm-plex-sans), sans-serif' }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-1">Day 06</p>
        <h1 className="text-[17px] font-medium text-gray-900">API docs generator</h1>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {/* Textarea */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Paste your API definition
          </label>
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Paste Express routes, OpenAPI YAML, or describe your API in plain English…"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5]"
            style={{
              fontFamily: 'var(--font-ibm-plex-mono), monospace',
              minHeight: '220px',
            }}
          />
        </div>

        {/* Format chips */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Format
          </label>
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onFormatChange(opt.id)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  format === opt.id
                    ? 'bg-[#0C447C] text-[#E6F1FB]'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button — pinned to bottom */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100">
        <button
          onClick={onGenerate}
          disabled={isLoading || !input.trim()}
          className="w-full bg-[#185FA5] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#0C447C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating…' : 'Generate docs →'}
        </button>
      </div>
    </aside>
  );
}
