import { Link } from 'wouter';
import { TrendingUp, Shield, Zap, Target, Trophy, MessageSquare, ArrowRight, BarChart2 } from 'lucide-react';

export default function LandingPage() {
  const features = [
    { icon: BarChart2, title: 'Dashboard Inteligente', desc: 'Visualize saldo, receitas, despesas e economias em tempo real.', color: 'bg-green-100 text-green-600' },
    { icon: Trophy, title: 'Gamificacao', desc: 'Ganhe XP, suba de nivel e desbloqueie conquistas criando bons habitos.', color: 'bg-yellow-100 text-yellow-600' },
    { icon: MessageSquare, title: 'Chat com IA', desc: 'Pergunte quanto gastou ou como economizar mais com inteligencia artificial.', color: 'bg-blue-100 text-blue-600' },
    { icon: Target, title: 'Metas Financeiras', desc: 'Crie metas personalizadas e acompanhe seu progresso.', color: 'bg-purple-100 text-purple-600' },
    { icon: Shield, title: 'Seguro e Confiavel', desc: 'Seus dados financeiros protegidos com seguranca e privacidade.', color: 'bg-red-100 text-red-600' },
    { icon: TrendingUp, title: 'Relatorios Detalhados', desc: 'Analises mensais por categoria e insights personalizados.', color: 'bg-indigo-100 text-indigo-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold font-display">HelpFinance</span>
        </div>
        <Link href="/dashboard">
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
            Entrar <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm px-4 py-1.5 rounded-full mb-6 font-medium">
          <Zap className="h-4 w-4" /> Assistente financeiro com IA
        </div>
        <h1 className="text-5xl md:text-6xl font-bold font-display mb-6 leading-tight">
          Seu dinheiro sob controle,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">de forma inteligente.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Controle seus gastos, defina metas, ganhe conquistas e conte com IA para tomar decisoes mais inteligentes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <button className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
              Comecar agora <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          <Link href="/">
            <button className="flex items-center gap-2 border-2 border-primary text-primary px-8 py-3 rounded-full text-base font-semibold hover:bg-primary/5 transition-colors">
              Ver demonstracao
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className={"w-10 h-10 " + color + " rounded-xl flex items-center justify-center mb-4"}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-br from-primary to-blue-500 rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold font-display mb-4">Pronto para assumir o controle?</h2>
          <p className="text-white/80 mb-8">Junte-se a milhares de pessoas que ja transformaram sua vida financeira.</p>
          <Link href="/">
            <button className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors">
              Comecar gratuitamente
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
