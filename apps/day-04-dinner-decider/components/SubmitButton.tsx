interface SubmitButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function SubmitButton({ onClick, isLoading, disabled }: SubmitButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      data-demo="submit-button"
      style={{
        width: "100%",
        background: isLoading || disabled ? "#7dbf96" : "#2D8B4E",
        color: "#ffffff",
        borderRadius: 14,
        border: "none",
        padding: "0.85rem 1rem",
        fontSize: "1rem",
        fontWeight: 600,
        cursor: isLoading || disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s",
      }}
    >
      {isLoading ? "Finding your dinner..." : "Find our dinner →"}
    </button>
  );
}
