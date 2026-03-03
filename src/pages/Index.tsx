import { useMemo, useState, useEffect, useCallback } from "react";
import { getGiftsForApril } from "@/data/gifts";
import GiftBox from "@/components/GiftBox";
import patternBg from "@/assets/pattern-bg.png";
import { Heart, Star, Sparkles, Clock } from "lucide-react";

const STORAGE_KEY = "bell-april-gifts";

interface OpenedGifts {
  [day: string]: boolean;
}

function getOpenedGifts(): OpenedGifts {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveOpenedGifts(opened: OpenedGifts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(opened));
}

function hasOpenedTodayGift(opened: OpenedGifts, todayInApril: number): boolean {
  // Check if any gift was opened for today's date
  // We store which day of april each gift was opened on
  return Object.keys(opened).some((key) => {
    const openedDay = Number(key);
    // For day 1 and 8, they're fixed so check directly
    return opened[key] && openedDay > 0;
  });
}

function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
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

// Track which calendar day each gift was opened
const OPENED_DATE_KEY = "bell-april-opened-date";

interface OpenedDates {
  [day: string]: string; // day -> "YYYY-MM-DD" when it was opened
}

function getOpenedDates(): OpenedDates {
  try {
    return JSON.parse(localStorage.getItem(OPENED_DATE_KEY) || "{}");
  } catch {
    return {};
  }
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function hasOpenedAnyToday(openedDates: OpenedDates): boolean {
  const today = getTodayString();
  return Object.values(openedDates).includes(today);
}

const Index = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  const isApril = currentMonth === 3;
  const todayInApril = isApril ? currentDay : 0;

  const gifts = useMemo(() => getGiftsForApril(currentYear), [currentYear]);

  const [openedGifts, setOpenedGifts] = useState<OpenedGifts>(getOpenedGifts);
  const [openedDates, setOpenedDates] = useState<OpenedDates>(getOpenedDates);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  const alreadyOpenedToday = hasOpenedAnyToday(openedDates);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = useCallback((day: number) => {
    const newOpened = { ...getOpenedGifts(), [day]: true };
    saveOpenedGifts(newOpened);
    setOpenedGifts(newOpened);

    const newDates = { ...getOpenedDates(), [day]: getTodayString() };
    localStorage.setItem(OPENED_DATE_KEY, JSON.stringify(newDates));
    setOpenedDates(newDates);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

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
        <header className="text-center mb-8 sm:mb-12">
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

        {/* Countdown / Status */}
        {isApril && (
          <div className="text-center mb-6 rounded-lg border border-primary/20 bg-card p-4">
            {alreadyOpenedToday ? (
              <>
                <p className="text-sm text-primary font-semibold mb-2">
                  🎁 Ya abriste tu regalo de hoy
                </p>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm">
                    Próximo regalo en{" "}
                    <span className="text-primary font-mono font-bold">
                      {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-primary font-semibold">
                ✨ ¡Tienes un regalo disponible hoy! Elige uno 🎁
              </p>
            )}
          </div>
        )}

        {!isApril && (
          <div className="text-center mb-8 rounded-lg border border-primary/20 bg-card p-4">
            <p className="text-sm text-muted-foreground">
              🎀 Los regalos se desbloquean en <span className="text-primary font-semibold">abril {currentYear}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Hoy puedes ver una vista previa — todos los días están disponibles para probar ✨
            </p>
          </div>
        )}

        {/* Calendar grid */}
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3">
          {gifts.map((gift, index) => {
            const day = index + 1;
            const isDayUnlocked = !isApril || day <= todayInApril;
            const isOpened = !!openedGifts[day];

            // Can open today: day is unlocked, not already opened, and haven't opened another today
            // Exception: if it's day 1 or 8 and it IS that day, it auto-opens
            let canOpenToday: boolean;
            if (!isApril) {
              canOpenToday = true; // preview mode
            } else if (isOpened) {
              canOpenToday = false; // already opened
            } else if (!isDayUnlocked) {
              canOpenToday = false;
            } else if (alreadyOpenedToday) {
              canOpenToday = false; // already used today's pick
            } else {
              canOpenToday = true;
            }

            const isToday = isApril && day === todayInApril;

            return (
              <GiftBox
                key={day}
                day={day}
                gift={gift}
                isAvailable={isDayUnlocked}
                isToday={isToday}
                isOpened={isOpened}
                canOpenToday={canOpenToday}
                onOpen={handleOpen}
              />
            );
          })}
        </div>

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
