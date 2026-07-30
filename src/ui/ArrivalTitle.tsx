import { useGame } from "../store";

/** Brand-forward arrival title — hero signal before any UI clutter. */
export default function ArrivalTitle() {
  const phase = useGame((s) => s.phase);
  const dialogue = useGame((s) => s.dialogue);
  const arrivalStep = useGame((s) => s.arrivalStep);

  if (phase !== "arrival" || dialogue) return null;

  const entering = arrivalStep === "enter";

  return (
    <div className={`arrival-title${entering ? " entering" : ""}`}>
      <p className="arrival-kicker">Walkable portfolio</p>
      <h1>Emmanuel&rsquo;s Loft</h1>
      <p className="arrival-sub">
        {entering
          ? "The door is open. Step inside when you are ready."
          : "Someone is waiting at the door."}
      </p>
    </div>
  );
}
