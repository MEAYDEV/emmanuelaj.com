import { useGame, stopBeat } from "../store";

export default function Hud() {
  const phase = useGame((s) => s.phase);
  const nowPlaying = useGame((s) => s.nowPlaying);

  return (
    <div className="hud">
      <div className="hud-brand">Emmanuel's Loft</div>
      <a className="hud-lite" href="/classic/">
        Lite site
      </a>

      <div className="hud-needs" aria-hidden="true">
        <div className="hud-need">
          <span>Fun</span>
          <i style={{ "--v": "100%" } as React.CSSProperties} />
        </div>
        <div className="hud-need">
          <span>Curiosity</span>
          <i style={{ "--v": "96%" } as React.CSSProperties} />
        </div>
        <div className="hud-need">
          <span>Coffee</span>
          <i style={{ "--v": "34%" } as React.CSSProperties} />
        </div>
      </div>

      {phase === "inside" && (
        <div className="hud-controls">
          <span>
            <span className="keycap">W</span>
            <span className="keycap">A</span>
            <span className="keycap">S</span>
            <span className="keycap">D</span>
            move
          </span>
          <span>
            <span className="keycap">X</span> interact
          </span>
          <span>drag to look</span>
        </div>
      )}

      {nowPlaying && (
        <div className="hud-nowplaying">
          <span className="disc" />
          <span>
            <strong>{nowPlaying.title}</strong> <em>· {nowPlaying.genre}</em>
          </span>
          <button aria-label="Stop the record" onClick={stopBeat}>
            ■
          </button>
        </div>
      )}
    </div>
  );
}
