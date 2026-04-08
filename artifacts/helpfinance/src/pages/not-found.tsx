import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-background text-foreground animate-in fade-in duration-700">
      <Card className="w-full max-w-md mx-4 border-none shadow-2xl bg-card overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-500" />
        <CardContent className="pt-10 pb-10 px-8 text-center flex flex-col items-center">
          <div className="bg-destructive/10 p-4 rounded-full mb-6 relative">
            <AlertCircle className="h-12 w-12 text-destructive relative z-10" />
            <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">404 - Página não encontrada</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Parece que essa página se perdeu nos registros financeiros. Vamos te colocar de volta nos trilhos.
          </p>
          <Link href="/">
            <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 w-full sm:w-auto font-medium">
              Voltar ao Painel
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
