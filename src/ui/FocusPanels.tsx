import { useEffect } from "react";
import { BEATS, playBeat, useGame } from "../store";

export default function FocusPanels() {
  const focus = useGame((s) => s.focus);
  const selectedBook = useGame((s) => s.selectedBook);
  const vinylIndex = useGame((s) => s.vinylIndex);
  const nowPlaying = useGame((s) => s.nowPlaying);

  useEffect(() => {
    if (!focus || focus === "photos") return;
    const onKey = (e: KeyboardEvent) => {
      const g = useGame.getState();
      if (e.code === "Escape" || e.code === "KeyX") {
        e.preventDefault();
        if (g.selectedBook) g.setSelectedBook(null);
        else g.setFocus(null);
        return;
      }
      if (g.focus === "vinyl") {
        if (e.code === "ArrowLeft" || e.code === "KeyA") {
          e.preventDefault();
          g.setVinylIndex(Math.max(0, g.vinylIndex - 1));
        } else if (e.code === "ArrowRight" || e.code === "KeyD") {
          e.preventDefault();
          g.setVinylIndex(Math.min(BEATS.length - 1, g.vinylIndex + 1));
        } else if (e.code === "Enter" || e.code === "Space") {
          e.preventDefault();
          playBeat(BEATS[g.vinylIndex]);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus]);

  if (focus === "library") {
    return (
      <>
        {selectedBook ? (
          <div className="focus-panel book-panel">
            <p className="focus-kicker">
              {selectedBook.status === "reading" ? "Currently reading" : "From the shelf"}
            </p>
            <h2>{selectedBook.title}</h2>
            <p className="book-author">{selectedBook.author}</p>
            <p className="book-notes">{selectedBook.notes}</p>
            {selectedBook.buyUrl && (
              <a href={selectedBook.buyUrl} target="_blank" rel="noopener" className="focus-cta">
                Get the book
              </a>
            )}
            <p className="focus-hint">
              <span className="keycap">X</span> put it back
            </p>
          </div>
        ) : (
          <div className="focus-hintbar">
            Click a book to pull it out · <span className="keycap">X</span> step back
          </div>
        )}
      </>
    );
  }

  if (focus === "vinyl") {
    const beat = BEATS[vinylIndex];
    const isPlaying = nowPlaying?.id === beat.id;
    return (
      <div className="focus-panel vinyl-panel">
        <p className="focus-kicker">The crate · {vinylIndex + 1}/{BEATS.length}</p>
        <h2>{beat.title}</h2>
        <p className="book-author">{beat.genre}</p>
        <div className="vinyl-controls">
          <button
            aria-label="Previous record"
            onClick={() => useGame.getState().setVinylIndex(Math.max(0, vinylIndex - 1))}
            disabled={vinylIndex === 0}
          >
            ←
          </button>
          <button className="vinyl-play" onClick={() => playBeat(beat)}>
            {isPlaying ? "Playing…" : "Put it on"}
          </button>
          <button
            aria-label="Next record"
            onClick={() =>
              useGame.getState().setVinylIndex(Math.min(BEATS.length - 1, vinylIndex + 1))
            }
            disabled={vinylIndex === BEATS.length - 1}
          >
            →
          </button>
        </div>
        <p className="focus-hint">
          <span className="keycap">←</span>
          <span className="keycap">→</span> flip · <span className="keycap">↵</span> play ·{" "}
          <span className="keycap">X</span> step back
        </p>
      </div>
    );
  }

  return null;
}
