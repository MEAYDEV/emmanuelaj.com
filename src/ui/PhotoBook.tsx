import { useEffect, useState } from "react";
import { useGame } from "../store";
import { PLACEHOLDER_PHOTOS, type Photo } from "../data/library";
import { fetchPhotos, supabaseConfigured } from "../lib/supabase";

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #2f6e4f, #173626)",
  "linear-gradient(135deg, #1d1d30, #3a2b52)",
  "linear-gradient(135deg, #b26a2f, #5c3416)",
  "linear-gradient(135deg, #8f4032, #401a13)",
  "linear-gradient(135deg, #2b4a66, #12212f)",
  "linear-gradient(135deg, #4a3b63, #1c1530)",
];

export default function PhotoBook() {
  const focus = useGame((s) => s.focus);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (focus !== "photos" || loaded) return;
    fetchPhotos().then((p) => {
      setPhotos(p.length ? p : PLACEHOLDER_PHOTOS);
      setLoaded(true);
    });
  }, [focus, loaded]);

  useEffect(() => {
    if (focus !== "photos") return;
    setPage(0);
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape" || e.code === "KeyX") {
        e.preventDefault();
        useGame.getState().setFocus(null);
      } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        turn(-1);
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        turn(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  function turn(dir: number) {
    setPage((p) => {
      const total = photosLength();
      const next = Math.min(Math.max(p + dir, 0), Math.max(total - 1, 0));
      if (next !== p) {
        setFlipping(true);
        setTimeout(() => setFlipping(false), 260);
      }
      return next;
    });
  }

  function photosLength() {
    return photos.length || PLACEHOLDER_PHOTOS.length;
  }

  if (focus !== "photos") return null;

  const list = photos.length ? photos : PLACEHOLDER_PHOTOS;
  const photo = list[Math.min(page, list.length - 1)];
  const isPlaceholder = !photo?.url;

  return (
    <div className="photobook-backdrop" onClick={() => useGame.getState().setFocus(null)}>
      <div className="photobook" onClick={(e) => e.stopPropagation()}>
        <p className="focus-kicker">The photo book · {page + 1}/{list.length}</p>
        <div className={`photobook-page${flipping ? " flip" : ""}`}>
          {isPlaceholder ? (
            <div
              className="photobook-placeholder"
              style={{ background: PLACEHOLDER_GRADIENTS[page % PLACEHOLDER_GRADIENTS.length] }}
            >
              <span>✦</span>
            </div>
          ) : (
            <img src={photo.url} alt={photo.caption || "Photo"} />
          )}
        </div>
        <p className="photobook-caption">{photo?.caption}</p>
        {!supabaseConfigured && (
          <p className="photobook-note">
            Real photos appear here once the photo admin is connected.
          </p>
        )}
        <div className="vinyl-controls">
          <button aria-label="Previous photo" onClick={() => turn(-1)} disabled={page === 0}>
            ←
          </button>
          <button className="vinyl-play" onClick={() => useGame.getState().setFocus(null)}>
            Close
          </button>
          <button
            aria-label="Next photo"
            onClick={() => turn(1)}
            disabled={page >= list.length - 1}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
