import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { LOADING_TIPS } from "../data/content";

export default function LoadingScreen() {
  const { progress, active } = useProgress();
  const [tip, setTip] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTip((i) => (i + 1) % LOADING_TIPS.length), 1600);
    return () => clearInterval(t);
  }, []);

  // Done when every tracked asset is in, or when nothing is loading at all
  // (the scene is procedural — the loader may simply never activate).
  useEffect(() => {
    if (progress >= 100 || !active) {
      const t = setTimeout(() => setDone(true), 900);
      return () => clearTimeout(t);
    }
  }, [progress, active]);

  return (
    <div className={`loading${done ? " done" : ""}`}>
      <svg className="loading-plumbob" viewBox="0 0 46 66" aria-hidden="true">
        <path d="M23 1 44 26 23 65 2 26Z" fill="#4ade80" />
        <path d="M23 1 44 26 23 38Z" fill="#86efac" opacity="0.9" />
        <path d="M23 1 2 26 23 38Z" fill="#22c55e" opacity="0.9" />
      </svg>
      <h1>Emmanuel's Loft</h1>
      <div className="loading-bar">
        <span style={{ width: done ? "100%" : `${Math.max(12, progress)}%` }} />
      </div>
      <p className="loading-tip">{LOADING_TIPS[tip]}</p>
      <p className="loading-classic">
        Prefer a quieter visit? <a href="/classic/">Classic site</a>
      </p>
    </div>
  );
}
