import { TagSelector } from "@/components/TagSelector";
import { OptionSelector } from "@/components/OptionSelector";
import { FridgeInput } from "@/components/FridgeInput";
import { SubmitButton } from "@/components/SubmitButton";
import type { useDinnerForm } from "@/hooks/useDinnerForm";

const MOODS = [
  "Comfort food",
  "Something light",
  "Adventurous",
  "Quick & easy",
  "Treat yourself",
];

const CUISINES = ["Italian", "Asian", "Mexican", "Mediterranean", "Surprise me"];

const TIME_OPTIONS = ["15 min", "30 min", "45 min", "1 hr+"];

const EFFORT_OPTIONS = ["Couch mode", "Normal", "Chef mode"];

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#888",
  marginBottom: "0.6rem",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  border: "0.5px solid #e0e0e0",
  padding: "1rem 1rem",
  marginBottom: "0.75rem",
};

interface InputFormProps {
  form: ReturnType<typeof useDinnerForm>;
  onSubmit: () => void;
  isLoading: boolean;
}

export function InputForm({ form, onSubmit, isLoading }: InputFormProps) {
  return (
    <div className="flex flex-col">
      <div style={cardStyle}>
        <p style={sectionLabelStyle}>Mood</p>
        <TagSelector
          options={MOODS}
          selected={form.moods}
          onToggle={form.toggleMood}
          demoId="mood"
        />
      </div>

      <div style={cardStyle}>
        <p style={sectionLabelStyle}>Cuisine vibe</p>
        <TagSelector
          options={CUISINES}
          selected={form.cuisines}
          onToggle={form.toggleCuisine}
          demoId="cuisine"
        />
      </div>

      <div style={cardStyle}>
        <p style={sectionLabelStyle}>Time available</p>
        <OptionSelector
          options={TIME_OPTIONS}
          selected={form.time}
          onSelect={form.setTime}
          demoId="time"
        />
      </div>

      <div style={cardStyle}>
        <p style={sectionLabelStyle}>Effort level</p>
        <OptionSelector
          options={EFFORT_OPTIONS}
          selected={form.effort}
          onSelect={form.setEffort}
          demoId="effort"
        />
      </div>

      <div style={cardStyle}>
        <p style={sectionLabelStyle}>What&apos;s in the fridge</p>
        <FridgeInput value={form.fridge} onChange={form.setFridge} />
      </div>

      <SubmitButton
        onClick={onSubmit}
        isLoading={isLoading}
        disabled={!form.isValid}
      />
    </div>
  );
}
