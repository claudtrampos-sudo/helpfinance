import { useGetDashboardSummary, useGetMonthlyTrend, useGetCategoryBreakdown, useListTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, translateCategory } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, Lightbulb, PiggyBank, Target, Wallet, Activity } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: monthlyTrend, isLoading: isTrendLoading } = useGetMonthlyTrend();
  const { data: categoryBreakdown, isLoading: isBreakdownLoading } = useGetCategoryBreakdown();
  const { data: transactions, isLoading: isTxLoading } = useListTransactions();

  if (isSummaryLoading || isTrendLoading || isBreakdownLoading || isTxLoading) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-500">
        <h1 className="text-3xl font-display font-bold">Visão Geral</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const recentTx = transactions?.slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Bem-vindo de volta!
          </h1>
          <p className="text-muted-foreground mt-1">Seu dinheiro sob controle, de forma inteligente.</p>
        </div>
        <Link href="/transactions">
          <Button className="rounded-full shadow-lg shadow-primary/20">Adicionar Transação</Button>
        </Link>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-primary/20 p-3 rounded-2xl">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
                <h3 className="text-3xl font-display font-bold text-foreground mt-1">
                  {formatCurrency(summary.totalBalance)}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-emerald-500/10 p-3 rounded-2xl">
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Total Ganho</p>
                <h3 className="text-2xl font-display font-bold text-foreground mt-1">
                  {formatCurrency(summary.monthlyIncome)}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-rose-500/10 p-3 rounded-2xl">
                  <ArrowDownRight className="h-5 w-5 text-rose-500" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Total Gasto</p>
                <h3 className="text-2xl font-display font-bold text-foreground mt-1">
                  {formatCurrency(summary.monthlyExpenses)}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-blue-500/10 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-blue-500/20 p-3 rounded-2xl">
                  <PiggyBank className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-sm font-bold text-blue-600 bg-blue-500/10 px-2 py-1 rounded-lg">
                  {summary.savingsRate}% de economia
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Economia</p>
                <h3 className="text-2xl font-display font-bold text-foreground mt-1">
                  {formatCurrency(summary.monthlyIncome - summary.monthlyExpenses)}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {summary?.aiInsight && (
        <Card className="border-none shadow-md bg-secondary text-secondary-foreground overflow-hidden relative">
          <div className="absolute -right-10 -top-10 opacity-10">
            <Lightbulb className="w-40 h-40" />
          </div>
          <CardContent className="p-6 flex gap-4 items-start relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl shrink-0">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-display font-bold text-lg mb-1">Dica do Assistente</h4>
              <p className="text-secondary-foreground/90 leading-relaxed">
                {summary.aiInsight}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle>Fluxo de Caixa</CardTitle>
            <CardDescription>Receitas vs Despesas ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {monthlyTrend && monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => [formatCurrency(value), undefined]}
                    />
                    <Area type="monotone" dataKey="income" name="Receita" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expenses" name="Despesas" stroke="hsl(var(--destructive))" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-2">
                  <Activity className="h-8 w-8 opacity-20" />
                  <p>Dados insuficientes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>Distribuição das despesas do mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {categoryBreakdown && categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-2">
                  <PieChart className="h-8 w-8 opacity-20" />
                  <p>Nenhuma despesa ainda</p>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {categoryBreakdown?.slice(0, 3).map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground">{item.percentage}%</span>
                    <span className="font-bold">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Suas últimas transações</CardDescription>
          </div>
          <Link href="/transactions">
            <Button variant="ghost" className="text-primary">Ver Todas</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTx.length > 0 ? (
              recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {tx.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{translateCategory(tx.category)} • {new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação ainda. Adicione uma para começar!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
