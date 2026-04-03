interface OptionSelectorProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  demoId?: string;
}

export function OptionSelector({
  options,
  selected,
  onSelect,
  demoId,
}: OptionSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <button
            key={option}
            onClick={() => onSelect(option)}
            data-demo={demoId ? `${demoId}-${option}` : undefined}
            style={
              isSelected
                ? {
                    background: "#2D8B4E",
                    border: "1.5px solid #2D8B4E",
                    color: "#ffffff",
                    borderRadius: 10,
                    padding: "0.4rem 1rem",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }
                : {
                    background: "#ffffff",
                    border: "1.5px solid #e0e0e0",
                    color: "#444",
                    borderRadius: 10,
                    padding: "0.4rem 1rem",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }
            }
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
