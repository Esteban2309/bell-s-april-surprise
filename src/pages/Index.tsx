import { useMemo, useState, useEffect, useCallback } from "react";
import { Gift, getAllGifts } from "@/data/gifts";
import SpinWheel from "@/components/SpinWheel";
import patternBg from "@/assets/pattern-bg.png";
import { Bell, User, Sparkles, Home, Calendar, Gift as GiftIcon, Lock } from "lucide-react";

const STORAGE_KEY = "bell-april-spins";
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

// Floating emojis that appear progressively as more gifts are unlocked
const ALL_FLOATING_EMOJIS = [
  "🌸", "💗", "✨", "🎀", "⭐", "🦋", "🌙", "💎", "🐱", "🎵",
  "🌷", "💌", "🎪", "👑", "🕊️", "🌿", "💜", "🎶", "🌺", "🧸",
  "🌟", "💕", "🎂", "🏯", "🎸", "🔮", "🌠", "❤️", "🎭", "🎁",
];

const Index = () => {
  const now = new Date();
  const isApril = now.getMonth() === 3;

  const allGifts = useMemo(() => getAllGifts(), []);
  const [spinResults, setSpinResults] = useState<number[]>(getSpinResults);
  const [lastSpinDate, setLastSpinDate] = useState(getLastSpinDate);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  const today = getTodayString();
  const alreadySpunToday = lastSpinDate === today;
  const spinCount = spinResults.length;
  const allCompleted = spinCount >= 30;

  const availableGifts = useMemo(() => {
    return allGifts.filter((g) => !spinResults.includes(g.id));
  }, [allGifts, spinResults]);

  const nextSpinNumber = spinCount + 1;
  let forcedGiftId: number | null = null;
  if (nextSpinNumber === 1) forcedGiftId = 1;
  else if (nextSpinNumber === 8) forcedGiftId = 8;

  const wonGifts = useMemo(() => {
    return spinResults.map((id) => allGifts.find((g) => g.id === id)!).filter(Boolean);
  }, [spinResults, allGifts]);

  // How many floating emojis to show based on progress
  const floatingEmojis = useMemo(() => {
    const count = Math.min(Math.ceil(spinCount * 1), ALL_FLOATING_EMOJIS.length);
    return ALL_FLOATING_EMOJIS.slice(0, count);
  }, [spinCount]);

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
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "200px" }}
      />

      {/* Floating emojis background - more appear as gifts are unlocked */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {floatingEmojis.map((emoji, i) => {
          const seed1 = ((i * 7 + 3) % 100);
          const seed2 = ((i * 13 + 7) % 100);
          const delay = (i * 0.8) % 12;
          const duration = 6 + (i % 5) * 2;
          return (
            <span
              key={i}
              className="absolute text-2xl sm:text-3xl select-none animate-float"
              style={{
                left: `${seed1}%`,
                top: `${seed2}%`,
                opacity: 0.12 + (spinCount / 30) * 0.15,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                fontSize: `${1.2 + (i % 3) * 0.4}rem`,
              }}
            >
              {emoji}
            </span>
          );
        })}
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm tracking-[0.2em] uppercase text-foreground">
            Bell's April
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-primary/40 flex items-center justify-center text-primary">
            <Bell className="w-4 h-4" />
          </div>
          <div className="w-9 h-9 rounded-full border border-primary/40 flex items-center justify-center text-primary">
            <User className="w-4 h-4" />
          </div>
        </div>
      </nav>

      <div className="relative z-10 container max-w-5xl mx-auto px-4 py-8 sm:py-10">
        {/* Header with countdown */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-accent-foreground">
                Studio Ghibli x SKZ Energy
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
              ¡Feliz Abril, Bell!
            </h1>
            <p className="text-sm text-muted-foreground">
              Un mes mágico lleno de sorpresas y polvo de estrellas.
            </p>
          </div>

          {/* Countdown box */}
          {!allCompleted && (
            <div className="rounded-xl border border-primary/30 bg-card px-6 py-4 text-center shrink-0">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Próximo regalo en:
              </p>
              <div className="flex items-center gap-1">
                <div className="text-center">
                  <span className="text-3xl font-bold text-foreground font-mono">{pad(countdown.hours)}</span>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Horas</p>
                </div>
                <span className="text-2xl font-bold text-primary mx-1">:</span>
                <div className="text-center">
                  <span className="text-3xl font-bold text-foreground font-mono">{pad(countdown.minutes)}</span>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Mins</p>
                </div>
                <span className="text-2xl font-bold text-primary mx-1">:</span>
                <div className="text-center">
                  <span className="text-3xl font-bold text-foreground font-mono">{pad(countdown.seconds)}</span>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Segs</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ALL COMPLETED - Final Message */}
        {allCompleted ? (
          <div className="flex flex-col items-center text-center mb-12 animate-reveal">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150" />
              <div className="relative text-8xl sm:text-9xl">💝</div>
            </div>
            <h2 className="font-script text-5xl sm:text-7xl text-primary mb-4">
              ¡Lo lograste, Bell!
            </h2>
            <div className="max-w-lg rounded-2xl border-2 border-primary/40 bg-card/80 backdrop-blur-sm p-8 space-y-4">
              <p className="text-foreground text-base leading-relaxed">
                Abriste los <span className="text-primary font-bold">30 regalos</span> y cada uno fue un pedacito de todo lo que siento por ti.
              </p>
              <p className="text-foreground/80 text-sm leading-relaxed">
                Este mes fue mágico porque existes tú. Cada estrella, cada canción, cada palabra… todo fue real, todo fue para ti. 
                Gracias por ser la persona más increíble que conozco. 💕
              </p>
              <p className="text-foreground text-base leading-relaxed font-semibold">
                Abril se acaba, pero lo nuestro no tiene fecha de caducidad. 
                <span className="text-primary"> Te amo, Bell.</span> Hoy, mañana y siempre. 🎀
              </p>
              <div className="flex items-center justify-center gap-2 pt-2 text-2xl">
                🌸 💗 ✨ 🐱 🎵 🦋 🌙 💎
              </div>
            </div>

            {/* Celebration sparkles */}
            <div className="flex gap-3 mt-6">
              {["🎀", "⭐", "💕", "✨", "🌸"].map((e, i) => (
                <span
                  key={i}
                  className="text-3xl animate-float"
                  style={{ animationDelay: `${i * 0.4}s` }}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* Wheel Section */
          <div className="relative flex flex-col items-center mb-12">
            {/* Decorative icons */}
            <div className="absolute left-0 sm:left-10 top-10 text-3xl opacity-80 select-none">🐵</div>
            <div className="absolute right-0 sm:right-10 top-10 text-3xl opacity-80 select-none">🐱</div>
            <div className="absolute right-4 sm:right-16 bottom-10 text-3xl opacity-80 select-none">🎸</div>

            <SpinWheel
              availableGifts={availableGifts}
              forcedGiftId={forcedGiftId}
              onResult={handleResult}
              disabled={isApril ? !canSpin : false}
            />

            {/* Status line */}
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                ⏳ {canSpin ? "1 giro disponible" : "0 giros disponibles"}
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1">
                🏅 Rank: Wolf Chan
              </span>
            </div>

            {!isApril && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Vista previa — puedes girar sin límite para probar ✨
              </p>
            )}
          </div>
        )}

        {/* Gift History */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              🎁 Gift History
            </h2>
            <span className="text-sm text-muted-foreground">
              {spinCount} / 30 <span className="text-primary">Desbloqueados</span>
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
            {Array.from({ length: 30 }, (_, i) => {
              const giftWon = wonGifts[i];
              const isUnlocked = !!giftWon;

              return (
                <div
                  key={i}
                  className={`shrink-0 w-[150px] h-[180px] rounded-xl flex flex-col items-center justify-center p-3 transition-all ${
                    isUnlocked
                      ? "border-2 border-primary bg-card"
                      : "border-2 border-dashed border-border bg-card/50"
                  }`}
                >
                  {/* Date tag */}
                  <div
                    className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded mb-3 uppercase ${
                      isUnlocked
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Abr {String(i + 1).padStart(2, "0")}
                  </div>

                  {isUnlocked ? (
                    <>
                      <span className="text-3xl mb-2">{giftWon.emoji}</span>
                      <span className="text-[9px] text-accent-foreground uppercase tracking-wider font-bold">
                        {giftWon.title.split(" ").slice(0, 2).join(" ")}
                      </span>
                      <span className="text-[10px] font-bold text-foreground mt-0.5 text-center leading-tight">
                        {giftWon.title}
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                        Bloqueado
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 rounded-full bg-muted mt-2 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(spinCount / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pt-6 pb-4 border-t border-border/30">
          <div className="flex items-center justify-center gap-6 mb-3 text-muted-foreground">
            <Home className="w-5 h-5 hover:text-primary transition-colors cursor-pointer" />
            <Calendar className="w-5 h-5 hover:text-primary transition-colors cursor-pointer" />
            <GiftIcon className="w-5 h-5 hover:text-primary transition-colors cursor-pointer" />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
            © 2026 Bell's April Surprises • Designed with magic
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
