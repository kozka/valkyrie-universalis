// A quest's difficulty as Valkyrie draws it: five marks, covered from the right by what is missing to 1
// (QuestDetailsScreen and QuestRenderDifficulity). The marks are the app's own, not the game font's.
export function Difficulty({ value }: { value: number }) {
  const lit = Math.max(0, Math.min(1, value));
  return (
    <span className="difficulty" role="img" aria-label={`${Math.round(lit * 5)}/5`}>
      <span className="marks">◆◆◆◆◆</span>
      <span className="marks lit" style={{ width: `${lit * 100}%` }}>
        ◆◆◆◆◆
      </span>
    </span>
  );
}
