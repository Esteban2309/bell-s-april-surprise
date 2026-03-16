import { useState, useRef, useCallback } from "react";
import { Gift } from "@/data/gifts";
import { RotateCw } from "lucide-react";

interface SpinWheelProps {
  availableGifts: Gift[];
  forcedGiftId: number | null;
  onResult: (gift: Gift) => void;
  disabled: boolean;
}

const SpinWheel = ({ availableGifts, forcedGiftId, onResult, disabled }: SpinWheelProps) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Gift | null>(null);
  const wheelRef = useRef<SVGSVGElement>(null);

  const segmentAngle = availableGifts.length > 0 ? 360 / availableGifts.length : 360;

  const spin = useCallback(() => {
    if (spinning || disabled || availableGifts.length === 0) return;

    setResult(null);
    setSpinning(true);

    let winnerIndex: number;
    if (forcedGiftId !== null) {
      winnerIndex = availableGifts.findIndex((g) => g.id === forcedGiftId);
      if (winnerIndex === -1) winnerIndex = Math.floor(Math.random() * availableGifts.length);
    } else {
      winnerIndex = Math.floor(Math.random() * availableGifts.length);
    }

    const segmentCenter = winnerIndex * segmentAngle + segmentAngle / 2;
    const targetAngle = 360 - segmentCenter;
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const totalRotation = rotation + fullSpins * 360 + ((targetAngle - (rotation % 360) + 360) % 360);

    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      const winner = availableGifts[winnerIndex];
      setResult(winner);
      onResult(winner);
    }, 4000);
  }, [spinning, disabled, availableGifts, forcedGiftId, onResult, rotation, segmentAngle]);

  const size = 360;
  const center = size / 2;
  const radius = size / 2 - 12;

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
    const textRadius = radius * 0.7;
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
        {/* Outer glow ring */}
        <div className="absolute inset-[-16px] rounded-full border-2 border-accent/30 pointer-events-none" />
        <div className="absolute inset-[-8px] rounded-full border border-primary/20 pointer-events-none" />

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div
            className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent"
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
            className="drop-shadow-[0_0_40px_hsl(280,40%,30%,0.4)]"
          >
            {/* Outer ring */}
            <circle
              cx={center}
              cy={center}
              r={radius + 6}
              fill="none"
              stroke="hsl(280, 40%, 35%)"
              strokeWidth="2"
              opacity="0.6"
            />

            {availableGifts.map((gift, i) => {
              const textPos = getTextPosition(i);
              const isEven = i % 2 === 0;
              return (
                <g key={gift.id}>
                  <path
                    d={getSegmentPath(i)}
                    fill={isEven ? "hsl(0, 0%, 8%)" : "hsl(0, 0%, 11%)"}
                    stroke="hsl(0, 0%, 18%)"
                    strokeWidth="0.5"
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                    fill="hsl(330, 10%, 50%)"
                    fontSize="12"
                    fontWeight="700"
                    style={{ fontFamily: "Quicksand, sans-serif" }}
                  >
                    {gift.id}
                  </text>
                </g>
              );
            })}

            {/* Crosshair lines */}
            <line x1={center} y1={12} x2={center} y2={size - 12} stroke="hsl(0, 0%, 20%)" strokeWidth="0.5" />
            <line x1={12} y1={center} x2={size - 12} y2={center} stroke="hsl(0, 0%, 20%)" strokeWidth="0.5" />

            {/* Center circle */}
            <circle cx={center} cy={center} r={28} fill="hsl(0, 0%, 7%)" stroke="hsl(330, 70%, 50%)" strokeWidth="2" />
            <text
              x={center}
              y={center}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="hsl(330, 70%, 60%)"
              fontSize="18"
            >
              ★
            </text>
          </svg>
        </div>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={disabled || spinning || availableGifts.length === 0}
        className={`
          flex items-center gap-3 px-12 py-4 rounded-full font-bold text-sm tracking-[0.15em] uppercase transition-all duration-300
          ${disabled || spinning || availableGifts.length === 0
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:scale-105 hover:shadow-[0_0_30px_hsl(330,70%,60%,0.4)] active:scale-95"
          }
        `}
      >
        {spinning ? "Girando..." : disabled ? "Vuelve mañana 💫" : availableGifts.length === 0 ? "¡Todos abiertos! 🎉" : (
          <>
            Girar Ruleta
            <RotateCw className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Result display */}
      {result && !spinning && (
        <div className="animate-reveal w-full max-w-sm rounded-xl border-2 border-primary/40 bg-card p-6 text-center">
          <span className="text-4xl block mb-3">{result.emoji}</span>
          <h3 className="text-lg font-bold text-primary mb-2">{result.title}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{result.message}</p>
        </div>
      )}
    </div>
  );
};

export default SpinWheel;
