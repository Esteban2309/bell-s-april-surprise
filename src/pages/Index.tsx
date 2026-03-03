import { useMemo } from "react";
import { getGiftsForApril } from "@/data/gifts";
import GiftBox from "@/components/GiftBox";
import patternBg from "@/assets/pattern-bg.png";
import { Heart, Star, Sparkles } from "lucide-react";

const Index = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed, April = 3
  const currentDay = now.getDate();

  const isApril = currentMonth === 3;
  const todayInApril = isApril ? currentDay : 0;

  const gifts = useMemo(() => getGiftsForApril(currentYear), [currentYear]);

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

        {/* Info */}
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
            // If not April, allow all for preview; if April, only past/today
            const isAvailable = !isApril || day <= todayInApril;
            const isToday = isApril && day === todayInApril;

            return (
              <GiftBox
                key={day}
                day={day}
                gift={gift}
                isAvailable={isAvailable}
                isToday={isToday}
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
