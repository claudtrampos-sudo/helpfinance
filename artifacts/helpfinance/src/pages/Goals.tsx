import { useListGoals, useCreateGoal, useUpdateGoal, getListGoalsQueryKey, useListCategories } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate, translateCategory } from "@/lib/format";
import { Target, Plus, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const goalSchema = z.object({
  title: z.string().min(1, "Nome é obrigatório"),
  targetAmount: z.coerce.number().positive("O valor alvo deve ser positivo"),
  currentAmount: z.coerce.number().min(0, "O valor atual não pode ser negativo"),
  deadline: z.string().optional().nullable(),
  category: z.string().min(1, "Categoria é obrigatória"),
});

function AddGoalDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createGoal = useCreateGoal();
  const { data: categories } = useListCategories();

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: "",
      category: "",
    }
  });

  const onSubmit = (values: z.infer<typeof goalSchema>) => {
    const selectedCat = categories?.find(c => c.name === values.category);
    createGoal.mutate({ 
      data: { 
        ...values, 
        icon: selectedCat?.icon || "Target", 
        color: selectedCat?.color || "#16a34a" 
      } 
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        toast({ title: "Meta criada com sucesso!" });
        onOpenChange(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Meta Financeira</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Meta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Reserva de Emergência, Carro Novo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Alvo (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Inicial (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.filter(c => c.type !== "income").map(c => (
                        <SelectItem key={c.id} value={c.name}>{translateCategory(c.name)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={createGoal.isPending}>
              {createGoal.isPending ? "Criando..." : "Criar Meta"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Goals() {
  const { data: goals, isLoading } = useListGoals();
  const updateGoal = useUpdateGoal();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();

  const handleAddFunds = (id: number, current: number, amount: number) => {
    updateGoal.mutate({ id, data: { currentAmount: current + amount } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        toast({ title: "Progresso atualizado! Continue assim!" });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Metas Financeiras</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seu progresso rumo ao que importa.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="rounded-full shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> Nova Meta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
        ) : goals?.length ? (
          goals.map(goal => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = progress >= 100;
            return (
              <Card key={goal.id} className={`border-none shadow-md overflow-hidden relative ${isCompleted ? 'bg-primary/5' : ''}`}>
                <div className="h-2 w-full" style={{ backgroundColor: `${goal.color}20` }}>
                  <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%`, backgroundColor: goal.color }} />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: `${goal.color}15`, color: goal.color }}>
                      <Target className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-display" style={{ color: goal.color }}>{progress}%</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold font-display mb-1">{goal.title}</h3>
                  {goal.deadline && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Prazo: {formatDate(goal.deadline)}
                    </p>
                  )}
                  
                  <div className="space-y-1 mb-6 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Atual</span>
                      <span className="font-bold">{formatCurrency(goal.currentAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Alvo</span>
                      <span className="font-bold text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  {!isCompleted && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleAddFunds(goal.id, goal.currentAmount, 50)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" /> Adicionar R$ 50
                    </Button>
                  )}
                  {isCompleted && (
                    <div className="w-full text-center p-2 bg-primary/10 text-primary font-bold rounded-md">
                      Meta Atingida!
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Você ainda não definiu nenhuma meta.</p>
            <Button variant="link" onClick={() => setIsAddOpen(true)}>Crie sua primeira meta</Button>
          </div>
        )}
      </div>

      <AddGoalDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}
