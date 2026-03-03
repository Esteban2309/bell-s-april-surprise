import { useState } from "react";
import { Gift } from "@/data/gifts";
import { Heart, Lock, Gift as GiftIcon } from "lucide-react";

interface GiftBoxProps {
  day: number;
  gift: Gift;
  isAvailable: boolean;
  isToday: boolean;
}

const GiftBox = ({ day, gift, isAvailable, isToday }: GiftBoxProps) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    if (!isAvailable) return;
    if (isOpened) {
      setIsOpened(false);
      return;
    }
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setIsOpened(true);
    }, 500);
  };

  if (isOpened) {
    return (
      <button
        onClick={handleClick}
        className="animate-reveal relative flex flex-col items-center justify-center rounded-lg border border-primary/30 bg-gift-opened p-3 text-center min-h-[120px] sm:min-h-[140px] cursor-pointer transition-all hover:border-primary/50"
      >
        <span className="text-2xl mb-1">{gift.emoji}</span>
        <span className="text-xs font-bold text-primary mb-1">{gift.title}</span>
        <span className="text-[10px] sm:text-xs text-foreground/80 leading-tight">{gift.message}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isAvailable}
      className={`
        relative flex flex-col items-center justify-center rounded-lg border min-h-[120px] sm:min-h-[140px] transition-all duration-300
        ${isShaking ? "animate-gift-shake" : ""}
        ${isToday ? "border-primary bg-gift-available shadow-[0_0_20px_hsl(var(--gift-glow)/0.3)] animate-float" : ""}
        ${isAvailable && !isToday ? "border-primary/20 bg-gift-available cursor-pointer hover:border-primary/50 hover:shadow-[0_0_15px_hsl(var(--gift-glow)/0.2)]" : ""}
        ${!isAvailable ? "border-border/30 bg-gift-locked cursor-not-allowed opacity-50" : ""}
      `}
    >
      <span className="text-lg sm:text-2xl mb-1">
        {isAvailable ? (
          <GiftIcon className="w-6 h-6 text-primary" />
        ) : (
          <Lock className="w-5 h-5 text-muted-foreground" />
        )}
      </span>
      <span className={`text-lg font-bold ${isAvailable ? "text-primary" : "text-muted-foreground"}`}>
        {day}
      </span>
      {isToday && (
        <span className="absolute -top-1 -right-1">
          <Heart className="w-4 h-4 text-primary fill-primary animate-sparkle" />
        </span>
      )}
    </button>
  );
};

export default GiftBox;
