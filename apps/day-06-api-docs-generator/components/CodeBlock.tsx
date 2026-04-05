'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language: string;
  children: string;
}

export default function CodeBlock({ language, children }: CodeBlockProps) {
  return (
    <div className="rounded-lg overflow-hidden mb-4" style={{ background: '#0F1117' }}>
      <SyntaxHighlighter
        language={language === 'http' ? 'bash' : language}
        style={nightOwl}
        customStyle={{
          margin: 0,
          padding: '16px',
          background: '#0F1117',
          fontSize: '12px',
          fontFamily: 'var(--font-ibm-plex-mono), monospace',
          lineHeight: '1.6',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
          },
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
