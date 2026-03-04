import { useMemo, useState, useEffect, useCallback } from "react";
import { Gift, getAllGifts } from "@/data/gifts";
import SpinWheel from "@/components/SpinWheel";
import patternBg from "@/assets/pattern-bg.png";
import { Heart, Star, Sparkles, Clock } from "lucide-react";

const STORAGE_KEY = "bell-april-spins"; // ordered list of gift IDs won
const LAST_SPIN_KEY = "bell-april-last-spin-date";

function getSpinResults(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSpinResults(results: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

function getLastSpinDate(): string {
  return localStorage.getItem(LAST_SPIN_KEY) || "";
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

const Index = () => {
  const now = new Date();
  const isApril = now.getMonth() === 3;

  const allGifts = useMemo(() => getAllGifts(), []);
  const [spinResults, setSpinResults] = useState<number[]>(getSpinResults);
  const [lastSpinDate, setLastSpinDate] = useState(getLastSpinDate);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  const today = getTodayString();
  const alreadySpunToday = lastSpinDate === today;
  const spinCount = spinResults.length; // how many spins have been done (1-indexed for next)

  // Determine which gifts are still available on the wheel
  const availableGifts = useMemo(() => {
    return allGifts.filter((g) => !spinResults.includes(g.id));
  }, [allGifts, spinResults]);

  // Determine if a forced gift is needed for next spin
  const nextSpinNumber = spinCount + 1; // 1-indexed
  let forcedGiftId: number | null = null;
  if (nextSpinNumber === 1) forcedGiftId = 1; // Gift 1 on first spin
  else if (nextSpinNumber === 8) forcedGiftId = 8; // Gift 8 on 8th spin

  // Won gifts for history display
  const wonGifts = useMemo(() => {
    return spinResults.map((id) => allGifts.find((g) => g.id === id)!).filter(Boolean);
  }, [spinResults, allGifts]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const canSpin = isApril ? !alreadySpunToday && availableGifts.length > 0 : availableGifts.length > 0;

  const handleResult = useCallback((gift: Gift) => {
    const newResults = [...getSpinResults(), gift.id];
    saveSpinResults(newResults);
    setSpinResults(newResults);

    const todayStr = getTodayString();
    localStorage.setItem(LAST_SPIN_KEY, todayStr);
    setLastSpinDate(todayStr);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "200px" }}
      />

      {/* Floating decorations */}
      <div className="fixed top-10 left-10 text-primary/20 animate-float">
        <Heart className="w-8 h-8" />
      </div>
      <div className="fixed top-20 right-16 text-accent/30 animate-float" style={{ animationDelay: "1s" }}>
        <Star className="w-6 h-6" />
      </div>
      <div className="fixed bottom-20 left-20 text-primary/15 animate-float" style={{ animationDelay: "2s" }}>
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="relative z-10 container max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-10">
          <h1 className="font-script text-5xl sm:text-7xl text-primary mb-2">
            Para Bell
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            30 días de abril, 30 sorpresas para ti 💕
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="h-px w-12 bg-primary/30" />
            <Heart className="w-3 h-3 text-primary fill-primary" />
            <span className="h-px w-12 bg-primary/30" />
          </div>
        </header>

        {/* Status / Countdown */}
        {isApril && (
          <div className="text-center mb-6 rounded-lg border border-primary/20 bg-card p-4">
            {alreadySpunToday ? (
              <>
                <p className="text-sm text-primary font-semibold mb-2">
                  🎁 Ya giraste la ruleta hoy
                </p>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm">
                    Próximo giro en{" "}
                    <span className="text-primary font-mono font-bold">
                      {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
                    </span>
                  </p>
                </div>
              </>
            ) : availableGifts.length === 0 ? (
              <p className="text-sm text-primary font-semibold">
                🎉 ¡Abriste todos los regalos! Gracias por cada día, Bell 💗
              </p>
            ) : (
              <p className="text-sm text-primary font-semibold">
                ✨ ¡Tienes un giro disponible hoy! 🎀
              </p>
            )}
          </div>
        )}

        {!isApril && (
          <div className="text-center mb-6 rounded-lg border border-primary/20 bg-card p-4">
            <p className="text-sm text-muted-foreground">
              🎀 La ruleta se activa en <span className="text-primary font-semibold">abril {now.getFullYear()}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Vista previa — puedes girar sin límite para probar ✨
            </p>
          </div>
        )}

        {/* Spin counter */}
        <div className="text-center mb-6">
          <span className="text-xs text-muted-foreground">
            Regalos descubiertos: <span className="text-primary font-bold">{spinCount}</span> / 30
          </span>
        </div>

        {/* Wheel */}
        <SpinWheel
          availableGifts={availableGifts}
          forcedGiftId={forcedGiftId}
          onResult={handleResult}
          disabled={isApril ? !canSpin : false}
        />

        {/* History of won gifts */}
        {wonGifts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-center text-sm font-semibold text-muted-foreground mb-4">
              🎁 Regalos descubiertos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wonGifts.map((gift, i) => (
                <div
                  key={gift.id}
                  className="rounded-lg border border-primary/20 bg-card p-3 text-center"
                >
                  <span className="text-xs text-muted-foreground">Giro #{i + 1}</span>
                  <span className="text-2xl block my-1">{gift.emoji}</span>
                  <span className="text-xs font-bold text-primary block">{gift.title}</span>
                  <span className="text-[10px] text-foreground/70 leading-tight block mt-1">{gift.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-10 sm:mt-14">
          <p className="text-xs text-muted-foreground">
            Hecho con 💗 para la persona más especial
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-muted-foreground/50">
            <span className="text-[10px]">🎀</span>
            <span className="text-[10px]">🐱</span>
            <span className="text-[10px]">🌿</span>
            <span className="text-[10px]">🦋</span>
            <span className="text-[10px]">⭐</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
