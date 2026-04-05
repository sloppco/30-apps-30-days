import { useState } from 'react';
import { DEMO_INPUT, MOCK_MARKDOWN } from '@/lib/constants';
import type { Format } from '@/lib/types';

export interface DocGeneratorState {
  input: string;
  format: Format;
  markdown: string;
  isLoading: boolean;
  error: string | null;
  hasCopied: boolean;
}

export interface DocGeneratorActions {
  setInput: (value: string) => void;
  setFormat: (format: Format) => void;
  generate: () => Promise<void>;
  copyMarkdown: () => void;
  reset: () => void;
}

export function useDocGenerator(isDemo: boolean): DocGeneratorState & DocGeneratorActions {
  const [input, setInput] = useState(isDemo ? DEMO_INPUT : '');
  const [format, setFormat] = useState<Format>('code');
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setMarkdown('');
    setError(null);

    if (isDemo) {
      // Simulate a brief loading state so the UI transition is visible
      await new Promise((resolve) => setTimeout(resolve, 600));
      setMarkdown(MOCK_MARKDOWN);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, format }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const text = await response.text();
      setMarkdown(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const copyMarkdown = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to copy to clipboard');
    });
  };

  const reset = () => {
    setMarkdown('');
    setError(null);
    setHasCopied(false);
  };

  return {
    input,
    format,
    markdown,
    isLoading,
    error,
    hasCopied,
    setInput,
    setFormat,
    generate,
    copyMarkdown,
    reset,
  };
}
