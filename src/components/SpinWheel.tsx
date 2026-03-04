import { useState, useRef, useCallback } from "react";
import { Gift } from "@/data/gifts";

interface SpinWheelProps {
  availableGifts: Gift[];
  forcedGiftId: number | null; // The gift ID that MUST be selected this spin
  onResult: (gift: Gift) => void;
  disabled: boolean;
}

const COLORS = [
  "hsl(330, 70%, 35%)",
  "hsl(280, 40%, 30%)",
  "hsl(330, 60%, 25%)",
  "hsl(280, 30%, 25%)",
  "hsl(330, 50%, 40%)",
  "hsl(280, 50%, 35%)",
  "hsl(330, 40%, 30%)",
  "hsl(280, 35%, 28%)",
];

const SpinWheel = ({ availableGifts, forcedGiftId, onResult, disabled }: SpinWheelProps) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Gift | null>(null);
  const wheelRef = useRef<SVGSVGElement>(null);

  const segmentAngle = 360 / availableGifts.length;

  const spin = useCallback(() => {
    if (spinning || disabled || availableGifts.length === 0) return;

    setResult(null);
    setSpinning(true);

    // Determine which gift wins
    let winnerIndex: number;
    if (forcedGiftId !== null) {
      winnerIndex = availableGifts.findIndex((g) => g.id === forcedGiftId);
      if (winnerIndex === -1) winnerIndex = Math.floor(Math.random() * availableGifts.length);
    } else {
      winnerIndex = Math.floor(Math.random() * availableGifts.length);
    }

    // The wheel's "pointer" is at the top (270 degrees in standard SVG).
    // Each segment i occupies from i*segmentAngle to (i+1)*segmentAngle.
    // We want the center of segment winnerIndex to land at the top.
    const segmentCenter = winnerIndex * segmentAngle + segmentAngle / 2;
    // The top is 0 degrees of rotation, so we need to rotate so segmentCenter aligns with top
    // Since wheel rotates clockwise, target = 360 - segmentCenter
    const targetAngle = 360 - segmentCenter;
    const fullSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const totalRotation = rotation + fullSpins * 360 + ((targetAngle - (rotation % 360) + 360) % 360);

    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      const winner = availableGifts[winnerIndex];
      setResult(winner);
      onResult(winner);
    }, 4000);
  }, [spinning, disabled, availableGifts, forcedGiftId, onResult, rotation, segmentAngle]);

  const size = 320;
  const center = size / 2;
  const radius = size / 2 - 8;

  const getSegmentPath = (index: number) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArc = segmentAngle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (index: number) => {
    const midAngle = ((index + 0.5) * segmentAngle - 90) * (Math.PI / 180);
    const textRadius = radius * 0.65;
    return {
      x: center + textRadius * Math.cos(midAngle),
      y: center + textRadius * Math.sin(midAngle),
      rotation: (index + 0.5) * segmentAngle,
    };
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Wheel container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
          <div
            className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent"
            style={{ borderTopColor: "hsl(330, 70%, 60%)" }}
          />
        </div>

        {/* Wheel */}
        <div
          className="transition-transform ease-[cubic-bezier(0.17,0.67,0.12,0.99)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? "4s" : "0s",
          }}
        >
          <svg
            ref={wheelRef}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="drop-shadow-[0_0_30px_hsl(330,70%,60%,0.3)]"
          >
            {/* Outer ring */}
            <circle cx={center} cy={center} r={radius + 4} fill="none" stroke="hsl(330, 70%, 50%)" strokeWidth="3" />

            {availableGifts.map((gift, i) => {
              const textPos = getTextPosition(i);
              return (
                <g key={gift.id}>
                  <path
                    d={getSegmentPath(i)}
                    fill={COLORS[i % COLORS.length]}
                    stroke="hsl(0, 0%, 15%)"
                    strokeWidth="1.5"
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                    className="fill-foreground text-[11px] font-bold"
                    style={{ fontFamily: "Quicksand, sans-serif" }}
                  >
                    {gift.emoji}
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle cx={center} cy={center} r={24} fill="hsl(0, 0%, 10%)" stroke="hsl(330, 70%, 50%)" strokeWidth="2" />
            <text
              x={center}
              y={center}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-primary text-lg"
            >
              🎁
            </text>
          </svg>
        </div>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={disabled || spinning || availableGifts.length === 0}
        className={`
          px-8 py-3 rounded-full font-bold text-sm tracking-wide uppercase transition-all duration-300
          ${disabled || spinning || availableGifts.length === 0
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:scale-105 hover:shadow-[0_0_25px_hsl(330,70%,60%,0.4)] active:scale-95"
          }
        `}
      >
        {spinning ? "Girando..." : disabled ? "Vuelve mañana 💫" : availableGifts.length === 0 ? "¡Todos abiertos! 🎉" : "¡Girar la ruleta! 🎀"}
      </button>

      {/* Result display */}
      {result && !spinning && (
        <div className="animate-reveal w-full max-w-sm rounded-xl border border-primary/40 bg-card p-6 text-center">
          <span className="text-4xl block mb-3">{result.emoji}</span>
          <h3 className="text-lg font-bold text-primary mb-2">{result.title}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{result.message}</p>
        </div>
      )}
    </div>
  );
};

export default SpinWheel;
