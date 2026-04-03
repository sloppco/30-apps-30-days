interface FridgeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function FridgeInput({ value, onChange }: FridgeInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-demo="fridge"
      placeholder="e.g. chicken, cherry tomatoes, pasta, leftover rice..."
      rows={3}
      style={{
        width: "100%",
        background: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: 10,
        padding: "0.65rem 0.75rem",
        fontSize: "0.9rem",
        color: "#333",
        resize: "none",
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "inherit",
      }}
    />
  );
}
