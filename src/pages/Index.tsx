import { useMemo, useState, useEffect, useCallback } from "react";
import { Gift, getAllGifts } from "@/data/gifts";
import SpinWheel from "@/components/SpinWheel";
import patternBg from "@/assets/pattern-bg.png";
import { Bell, User, Sparkles, Home, Calendar, Gift as GiftIcon, Lock } from "lucide-react";

const STORAGE_KEY = "bell-april-spins";
const LAST_SPIN_KEY = "bell-april-last-spin-date";

function getLastSpinDate(): string {
  try {
    return localStorage?.getItem(LAST_SPIN_KEY) || "";
  } catch {
    return "";
  }
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

const ALL_FLOATING_EMOJIS = [
  "🌸", "💗", "✨", "🎀", "⭐", "🦋", "🌙", "💎", "🐱", "🎵",
  "🌷", "💌", "🎪", "👑", "🕊️", "🌿", "💜", "🎶", "🌺", "🧸",
  "🌟", "💕", "🎂", "🏯", "🎸", "🔮", "🌠", "❤️", "🎭", "🎁",
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

interface Spin {
  gift_id: number;
  date: string;
}

const Index = () => {
  const now = new Date();
  const isApril = now.getMonth() === 3;

  const [allGifts, setAllGifts] = useState<Gift[]>(getAllGifts());
  const [spins, setSpins] = useState<Spin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [giftsRes, spinsRes] = await Promise.all([
          fetch(`${API_URL}/gifts`).catch(() => ({ ok: false, json: () => [] })),
          fetch(`${API_URL}/spins`).catch(() => ({ ok: false, json: () => [] }))
        ]);
        
        let giftsData = [];
        let spinsData = [];

        if ('ok' in giftsRes && giftsRes.ok) {
          giftsData = await giftsRes.json();
        }
        
        if ('ok' in spinsRes && spinsRes.ok) {
          spinsData = await spinsRes.json();
        }
        
        if (Array.isArray(giftsData) && giftsData.length > 0) {
          setAllGifts(giftsData);
        }
        
        if (Array.isArray(spinsData)) {
          setSpins(spinsData);
        }
      } catch (error) {
        console.error("Error cargando datos del backend:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = getTodayString();
  const spinCount = Array.isArray(spins) ? spins.length : 0;
  const nextSpinNumber = spinCount + 1;
  
  const lastLocalSpin = getLastSpinDate();
  const hasSpunInBackendToday = Array.isArray(spins) && spins.some(s => s.date === today);
  const alreadySpunToday = hasSpunInBackendToday || lastLocalSpin === today;
  
  const allCompleted = spinCount >= 30;

  const spinResultsIds = useMemo(() => {
    return Array.isArray(spins) ? spins.map(s => s.gift_id) : [];
  }, [spins]);

  const availableGifts = useMemo(() => {
    return allGifts.filter((g) => {
      if (spinResultsIds.includes(g.id)) return false;
      if (g.id === 1 && nextSpinNumber !== 1) return false;
      if (g.id === 8 && nextSpinNumber !== 8) return false;
      if ((nextSpinNumber === 1 || nextSpinNumber === 8) && g.id !== nextSpinNumber) return false;
      return true;
    });
  }, [allGifts, spinResultsIds, nextSpinNumber]);

  let forcedGiftId: number | null = null;
  if (nextSpinNumber === 1) forcedGiftId = 1;
  else if (nextSpinNumber === 8) forcedGiftId = 8;

  const wonGiftsByDay = useMemo(() => {
    const map: Record<number, Gift> = {};
    if (Array.isArray(spins)) {
      spins.forEach((s, index) => {
        const gift = allGifts.find((g) => g.id === s.gift_id);
        if (gift) {
          map[index + 1] = gift;
        }
      });
    }
    return map;
  }, [spins, allGifts]);

  const floatingEmojis = useMemo(() => {
    const count = Math.min(Math.floor((spinCount / 30) * ALL_FLOATING_EMOJIS.length) + 5, ALL_FLOATING_EMOJIS.length);
    return ALL_FLOATING_EMOJIS.slice(0, count);
  }, [spinCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const canSpin = isApril ? !alreadySpunToday && availableGifts.length > 0 : availableGifts.length > 0;

  const handleResult = useCallback(async (gift: Gift) => {
    const todayStr = getTodayString();
    try {
      const response = await fetch(`${API_URL}/spins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gift_id: gift.id, date: todayStr })
      });

      if (response.ok) {
        setSpins(prev => [...prev, { gift_id: gift.id, date: todayStr }]);
        try {
          localStorage.setItem(LAST_SPIN_KEY, todayStr);
        } catch (e) {
          console.error("Could not save to localStorage", e);
        }
      } else {
        const data = await response.json();
        alert(data.error || "¡Vaya! Algo salió mal al guardar tu regalo.");
      }
    } catch (error) {
      console.error("Error guardando giro:", error);
      alert("No se pudo conectar con el servidor. ¿Está encendido el backend?");
    }
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando magia...</div>;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div
        className="fixed inset-0 opacity-[0.1] pointer-events-none"
        style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "200px" }}
      />

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
        <div className="flex flex-col sm:flex-row items-start justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-accent-foreground">
                HOLIMIAMOR TEAMO XOMOTAS
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
              ¡feliz mes mi belli tiamo!
            </h1>
            <p className="text-sm text-muted-foreground">
              el mejor mes d todo el mundo mundial.
            </p>
          </div>

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

        {allCompleted ? (
          <div className="flex flex-col items-center text-center mb-12 animate-reveal">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150" />
              <div className="relative text-8xl sm:text-9xl">💝</div>
            </div>
            <h2 className="font-script text-5xl sm:text-7xl text-primary mb-4">
              ¡se logro mi corazom d melon!
            </h2>
            <div className="max-w-lg rounded-2xl border-2 border-primary/40 bg-card/80 backdrop-blur-sm p-8 space-y-4">
              <p className="text-foreground text-base leading-relaxed">
                abriste los <span className="text-primary font-bold">30 regalos</span> y cada uno fue un pedacito de todo lo k pense en ti.
              </p>
              <p className="text-foreground/80 text-sm leading-relaxed">
                este mes fue mágico porque existes tú y tu eres la k hace k todo sea mas bonito cada dia. cada estrella, cada canción, cada palabra… todo m recuerda lo feliz k me haces cada dia y espero k yo tmb pueda hacerte asi de feliz. 
                gracias por ser la persona más increíble que conozco t Amo. ◑﹏◐ヾ(≧▽≦*)o
              </p>
              <p className="text-foreground text-base leading-relaxed font-semibold">
                abril se acabó, pero eso no kiere decir k no voy a kerer sorprenderte y hacerte feliz cada dia de mi vida. 
                <span className="text-primary"> t amo mi bebe.</span> hoy, mañana y siempre.muamuamua (´▽`ʃ♡ƪ)
              </p>
              <div className="flex items-center justify-center gap-2 pt-2 text-2xl">
                🌸 💗 ✨ 🐱 🎵 🦋 🌙 💎
              </div>
            </div>

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
          <div className="relative flex flex-col items-center mb-12">
            <div className="absolute left-0 sm:left-10 top-10 text-3xl opacity-80 select-none">🐵</div>
            <div className="absolute right-0 sm:right-10 top-10 text-3xl opacity-80 select-none">🐱</div>
            <div className="absolute right-4 sm:right-16 bottom-10 text-3xl opacity-80 select-none">🎸</div>

            <SpinWheel
              availableGifts={availableGifts}
              forcedGiftId={forcedGiftId}
              onResult={handleResult}
              disabled={isApril ? !canSpin : false}
            />

            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                ⏳ {canSpin ? "1 giro disponible" : "0 giros disponibles"}
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1">
                tiamo
              </span>
            </div>

            {!isApril && (
              <p className="text-[10px] text-muted-foreground mt-2">
                puedes girar solo una vez al dia ✨                
              </p>
            )}
          </div>
        )}

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
              const day = i + 1;
              const giftWon = wonGiftsByDay[day];
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
                  <div
                    className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded mb-3 uppercase ${
                      isUnlocked
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Abr {String(day).padStart(2, "0")}
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

          <div className="w-full h-1 rounded-full bg-muted mt-2 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(spinCount / 30) * 100}%` }}
            />
          </div>
        </div>

        <footer className="text-center pt-6 pb-4 border-t border-border/30">
          <div className="flex items-center justify-center gap-6 mb-3 text-muted-foreground">
            <Home className="w-5 h-5 hover:text-primary transition-colors cursor-pointer" />
            <Calendar className="w-5 h-5 hover:text-primary transition-colors cursor-pointer" />
            <GiftIcon className="w-5 h-5 hover:text-primary transition-colors cursor-pointer" />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
            © 2026 te amomibelli • hecho con mucho amor xti
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
