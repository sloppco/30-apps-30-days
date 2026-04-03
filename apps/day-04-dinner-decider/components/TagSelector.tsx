interface TagSelectorProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  demoId?: string;
}

export function TagSelector({ options, selected, onToggle, demoId }: TagSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            onClick={() => onToggle(option)}
            data-demo={demoId ? `${demoId}-${option}` : undefined}
            style={
              isSelected
                ? {
                    background: "#E8F5EE",
                    border: "1.5px solid #2D8B4E",
                    color: "#1A5C33",
                    borderRadius: 20,
                    padding: "0.35rem 0.85rem",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }
                : {
                    background: "#ffffff",
                    border: "1.5px solid #e0e0e0",
                    color: "#444",
                    borderRadius: 20,
                    padding: "0.35rem 0.85rem",
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
