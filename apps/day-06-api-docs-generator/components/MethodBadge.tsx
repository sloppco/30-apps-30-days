const METHOD_STYLES: Record<string, { bg: string; color: string }> = {
  GET:    { bg: '#EAF3DE', color: '#27500A' },
  POST:   { bg: '#E6F1FB', color: '#0C447C' },
  PUT:    { bg: '#FAEEDA', color: '#633806' },
  PATCH:  { bg: '#FAEEDA', color: '#633806' },
  DELETE: { bg: '#FCEBEB', color: '#791F1F' },
};

const DEFAULT_STYLE = { bg: '#F3F4F6', color: '#374151' };

interface MethodBadgeProps {
  method: string;
}

export default function MethodBadge({ method }: MethodBadgeProps) {
  const upper = method.toUpperCase();
  const { bg, color } = METHOD_STYLES[upper] ?? DEFAULT_STYLE;

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide"
      style={{ backgroundColor: bg, color }}
    >
      {upper}
    </span>
  );
}
