import type { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div className="text-[11px] uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-4 mt-6">
      {children}
    </div>
  );
}
