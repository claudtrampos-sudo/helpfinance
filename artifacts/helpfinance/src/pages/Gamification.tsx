import { useGetGamificationProfile, useListBadges } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Flame, Star, Medal, Zap } from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";

export default function Gamification() {
  const { data: profile, isLoading: isProfileLoading } = useGetGamificationProfile();
  const { data: badges, isLoading: isBadgesLoading } = useListBadges();

  if (isProfileLoading || isBadgesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!profile) return null;

  const totalXpForNextLevel = profile.xp + profile.xpToNextLevel;
  const progressPercent = Math.min(100, Math.max(0, (profile.xp / totalXpForNextLevel) * 100));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">Sua Jornada</h1>
        <p className="text-muted-foreground mt-1">Evolua seus hábitos financeiros.</p>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground md:col-span-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <Trophy className="w-64 h-64" />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col h-full justify-between gap-8">
              <div>
                <UiBadge className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-none px-3 py-1 text-sm mb-4">
                  Nível {profile.level}
                </UiBadge>
                <h2 className="text-4xl font-display font-bold mb-2">{profile.levelName}</h2>
                <p className="text-primary-foreground/80">Você está progredindo rumo à liberdade financeira.</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{profile.xp.toLocaleString('pt-BR')} XP</span>
                  <span>{totalXpForNextLevel.toLocaleString('pt-BR')} XP</span>
                </div>
                <div className="h-4 bg-primary-foreground/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-full bg-primary-foreground shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-primary-foreground/70 text-right">
                  {profile.xpToNextLevel.toLocaleString('pt-BR')} XP para o próximo nível
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-orange-500 to-rose-500 text-white">
          <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="bg-white/20 p-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              <Flame className="h-12 w-12 text-white animate-pulse" />
            </div>
            <div>
              <div className="text-5xl font-display font-bold">{profile.streak}</div>
              <div className="font-medium text-white/80 uppercase tracking-widest mt-1 text-sm">Dias Consecutivos</div>
            </div>
            <p className="text-sm text-white/90">Continue acessando para ganhar bônus de sequência!</p>
          </CardContent>
        </Card>
      </div>

      {/* Conquistas */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-primary" /> Conquistas
          </CardTitle>
          <CardDescription>
            Complete tarefas para ganhar medalhas e XP. Você conquistou {profile.earnedBadges.length} de {badges?.length} medalhas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges?.map((badge) => {
              const earned = profile.earnedBadges.some(eb => eb.id === badge.id);
              return (
                <div 
                  key={badge.id} 
                  className={`flex items-start gap-4 p-4 rounded-xl border ${
                    earned 
                      ? 'bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(22,163,74,0.1)]' 
                      : 'bg-muted/30 border-transparent grayscale-[0.8] opacity-60'
                  }`}
                >
                  <div className={`p-3 rounded-full shrink-0 ${earned ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {earned ? <Star className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                  </div>
                  <div>
                    <h4 className={`font-bold font-display ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {badge.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {badge.description}
                    </p>
                    <div className="mt-2 inline-flex items-center text-xs font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
                      +{badge.xpReward} XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
