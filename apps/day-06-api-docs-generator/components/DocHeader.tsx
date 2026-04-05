interface DocHeaderProps {
  markdown: string;
  hasCopied: boolean;
  onCopy: () => void;
}

function parseHeader(markdown: string): { name: string; baseUrl: string } {
  const nameMatch = markdown.match(/^# (.+)/m);
  const urlMatch = markdown.match(/\*\*Base URL:\*\*\s*`([^`]+)`/m);
  return {
    name: nameMatch ? nameMatch[1].trim() : 'API Documentation',
    baseUrl: urlMatch ? urlMatch[1].trim() : '',
  };
}

export default function DocHeader({ markdown, hasCopied, onCopy }: DocHeaderProps) {
  const { name, baseUrl } = parseHeader(markdown);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-[22px] font-medium text-gray-900" style={{ fontFamily: 'var(--font-ibm-plex-sans), sans-serif' }}>
          {name}
        </h1>
        {baseUrl && (
          <p
            className="text-sm text-gray-400 mt-0.5"
            style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
          >
            {baseUrl}
          </p>
        )}
      </div>
      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        {hasCopied ? (
          <>
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy markdown
          </>
        )}
      </button>
    </div>
  );
}
