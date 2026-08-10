"use client";

import { useRef, useState } from "react";

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

function formatRate(rate: number) {
  return rate === 1 ? "1×" : `${rate}×`;
}

/** Lecteur vidéo + bouton pour cycler la vitesse de lecture */
export default function VideoPlayer({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [rate, setRate] = useState(1);

  function cycleRate() {
    const idx = RATES.indexOf(rate as (typeof RATES)[number]);
    const next = RATES[(idx >= 0 ? idx + 1 : 1) % RATES.length];
    setRate(next);
    if (ref.current) ref.current.playbackRate = next;
  }

  return (
    <div className="video-player-wrap">
      <video
        ref={ref}
        key={src}
        src={src}
        controls
        playsInline
        preload="metadata"
        title={title}
        onLoadedMetadata={(e) => {
          e.currentTarget.playbackRate = rate;
        }}
      />
      <button
        type="button"
        className="video-speed-btn"
        onClick={cycleRate}
        aria-label={`Vitesse de lecture ${formatRate(rate)} — appuyer pour changer`}
        title="Vitesse de lecture"
      >
        {formatRate(rate)}
      </button>
    </div>
  );
}
