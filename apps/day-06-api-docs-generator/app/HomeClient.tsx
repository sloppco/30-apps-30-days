'use client';

import { useDocGenerator } from '@/hooks/useDocGenerator';
import Sidebar from '@/components/Sidebar';
import DocHeader from '@/components/DocHeader';
import DocRenderer from '@/components/DocRenderer';

interface HomeClientProps {
  isDemo: boolean;
}

export default function HomeClient({ isDemo }: HomeClientProps) {
  const {
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
  } = useDocGenerator(isDemo);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        input={input}
        format={format}
        isLoading={isLoading}
        onInputChange={setInput}
        onFormatChange={setFormat}
        onGenerate={generate}
      />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Empty state */}
        {!markdown && !isLoading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-10 h-10 rounded-xl bg-[#E6F1FB] flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[#185FA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">Paste your API definition</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Supports Express / Fastify routes, OpenAPI YAML/JSON specs, or plain English descriptions.
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <svg className="w-5 h-5 text-[#185FA5] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">Generating your docs…</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="h-full flex items-center justify-center px-8">
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 max-w-sm text-center">
              <p className="text-sm font-medium text-red-700 mb-1">Generation failed</p>
              <p className="text-xs text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* Doc output */}
        {markdown && !isLoading && (
          <>
            <DocHeader
              markdown={markdown}
              hasCopied={hasCopied}
              onCopy={copyMarkdown}
            />
            <div className="px-6 py-6 max-w-4xl">
              <DocRenderer markdown={markdown} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
