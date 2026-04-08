import { useState } from "react";
import { useListTransactions, useDeleteTransaction, useListCategories, useCreateTransaction, getListTransactionsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, translateCategory } from "@/lib/format";
import { ArrowUpRight, ArrowDownRight, Search, Plus, Trash2, CalendarClock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const transactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.coerce.number().positive("O valor deve ser positivo"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(["daily", "weekly", "monthly", "yearly"]).optional().nullable()
});

const INTERVAL_LABELS: Record<string, string> = {
  daily: "diário",
  weekly: "semanal",
  monthly: "mensal",
  yearly: "anual",
};

function AddTransactionDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createTx = useCreateTransaction();
  const { data: categories } = useListCategories();

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: 0,
      type: "expense",
      category: "",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
      recurringInterval: null
    }
  });

  const onSubmit = (values: z.infer<typeof transactionSchema>) => {
    createTx.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Transação adicionada com sucesso!" });
        onOpenChange(false);
        form.reset();
      },
      onError: () => {
        toast({ title: "Erro ao adicionar transação", variant: "destructive" });
      }
    });
  };

  const selectedType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Almoço, Salário..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {categories?.filter(c => c.type === selectedType || c.type === "both").map(c => (
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={createTx.isPending}>
              {createTx.isPending ? "Salvando..." : "Salvar Transação"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Transactions() {
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const queryParams = filterType === "all" ? undefined : { type: filterType };
  const { data: transactions, isLoading } = useListTransactions(queryParams);
  const deleteTx = useDeleteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteTx.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Transação excluída" });
      }
    });
  };

  const filteredTx = transactions?.filter(tx => 
    tx.description.toLowerCase().includes(search.toLowerCase()) || 
    tx.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Transações</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas receitas e despesas.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="rounded-full shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> Adicionar Transação
        </Button>
      </div>

      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar transações..." 
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cabeçalho das colunas */}
          <div className="hidden md:flex items-center justify-between px-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b mb-2">
            <span>Transação</span>
            <span>Valor</span>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            ) : filteredTx?.length ? (
              filteredTx.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/60 rounded-xl transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {tx.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{tx.description}</p>
                        {tx.isRecurring && (
                          <Badge variant="secondary" className="text-[10px] py-0 h-4">
                            <CalendarClock className="h-3 w-3 mr-1" /> {tx.recurringInterval ? INTERVAL_LABELS[tx.recurringInterval] ?? tx.recurringInterval : "recorrente"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{translateCategory(tx.category)} • {formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(tx.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma transação encontrada.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AddTransactionDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}
