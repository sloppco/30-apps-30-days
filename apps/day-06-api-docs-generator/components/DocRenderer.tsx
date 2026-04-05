import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import SectionLabel from './SectionLabel';
import ParamTable from './ParamTable';
import CodeBlock from './CodeBlock';
import EndpointBlock from './EndpointBlock';

interface DocRendererProps {
  markdown: string;
}

const sharedComponents: Components = {
  // h1 suppressed — DocHeader handles the title
  h1: () => null,
  h2: ({ children }) => <SectionLabel>{children}</SectionLabel>,
  table: ({ children }) => <ParamTable>{children}</ParamTable>,
  code({ children, className }) {
    const match = /language-(\w+)/.exec(className || '');
    if (match) {
      return (
        <CodeBlock language={match[1]}>
          {String(children).replace(/\n$/, '')}
        </CodeBlock>
      );
    }
    return (
      <code
        className="text-[13px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-800"
        style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
      >
        {children}
      </code>
    );
  },
  p: ({ children }) => (
    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{children}</p>
  ),
  // Suppress the <pre> wrapper — CodeBlock provides its own container
  pre: ({ children }) => <>{children}</>,
  hr: () => <hr className="border-gray-200 my-6" />,
  strong: ({ children }) => (
    <strong className="font-medium text-gray-900">{children}</strong>
  ),
};

export default function DocRenderer({ markdown }: DocRendererProps) {
  // Split on newline-before-### to group each endpoint into its own card.
  // The preamble (title, overview, auth) is everything before the first ###.
  const [preamble, ...endpointChunks] = markdown.split(/\n(?=### )/);

  return (
    <div>
      {/* Preamble: title (suppressed), overview table, auth description */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={sharedComponents}>
        {preamble}
      </ReactMarkdown>

      {/* Endpoint cards */}
      {endpointChunks.map((chunk, i) => {
        const firstNewline = chunk.indexOf('\n');
        const headingLine =
          firstNewline === -1 ? chunk : chunk.slice(0, firstNewline);
        const body =
          firstNewline === -1 ? '' : chunk.slice(firstNewline + 1).trim();

        // headingLine is "### GET /users" — strip the ### prefix
        const heading = headingLine.replace(/^### /, '').trim();
        const spaceIdx = heading.indexOf(' ');
        const method = spaceIdx === -1 ? heading : heading.slice(0, spaceIdx);
        const path = spaceIdx === -1 ? '' : heading.slice(spaceIdx + 1);

        return (
          <EndpointBlock key={`${method}-${path}-${i}`} method={method} path={path}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={sharedComponents}>
              {body}
            </ReactMarkdown>
          </EndpointBlock>
        );
      })}
    </div>
  );
}
