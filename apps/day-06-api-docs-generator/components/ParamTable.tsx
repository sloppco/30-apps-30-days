interface ParamTableProps {
  children: React.ReactNode;
}

export default function ParamTable({ children }: ParamTableProps) {
  return (
    <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200">
      <table className="w-full text-sm border-collapse [&_th]:bg-gray-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-medium [&_th]:text-gray-600 [&_th]:border-b [&_th]:border-gray-200 [&_td]:px-3 [&_td]:py-2 [&_td]:text-gray-700 [&_td]:border-t [&_td]:border-gray-100 [&_tr:first-child_td]:border-0 [&_td:first-child]:font-mono [&_td:first-child]:text-xs [&_td:first-child]:text-gray-900">
        {children}
      </table>
    </div>
  );
}
