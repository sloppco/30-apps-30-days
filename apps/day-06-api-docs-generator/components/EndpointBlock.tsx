import type { ReactNode } from 'react';
import MethodBadge from './MethodBadge';

interface EndpointBlockProps {
  method: string;
  path: string;
  children: ReactNode;
}

export default function EndpointBlock({ method, path, children }: EndpointBlockProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <MethodBadge method={method} />
        <code
          className="text-sm text-gray-800 font-medium"
          style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
        >
          {path}
        </code>
      </div>
      {/* Body */}
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
