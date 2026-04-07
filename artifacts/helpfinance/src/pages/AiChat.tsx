import { useState, useRef, useEffect } from "react";
import { useAiChat } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Sparkles } from "lucide-react";
import { Loader2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "How much did I spend this month?",
  "Am I on track to meet my goals?",
  "Where can I save money?",
  "What is my biggest expense category?"
];

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your HelpFinance AI Coach. I analyze your spending, goals, and habits. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatMutation = useAiChat();

  const handleSend = (text: string) => {
    if (!text.trim() || chatMutation.isPending) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Create a context string from the last few messages
    const context = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join("\n");

    chatMutation.mutate({ data: { message: text, context } }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply
        }]);
      },
      onError: () => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again later."
        }]);
      }
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" /> AI Financial Coach
        </h1>
        <p className="text-muted-foreground mt-1">Ask questions about your finances and get personalized advice.</p>
      </div>

      <Card className="flex-1 flex flex-col border-none shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
        <ScrollArea className="flex-1 p-4 md:p-6" viewportRef={scrollRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <Avatar className={`h-10 w-10 shrink-0 ${msg.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
                  <AvatarFallback className="bg-transparent">
                    {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={`rounded-2xl p-4 text-sm md:text-base shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-secondary text-secondary-foreground rounded-tr-sm' 
                      : 'bg-card border rounded-tl-sm leading-relaxed'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex gap-4 max-w-[80%]">
                <Avatar className="h-10 w-10 shrink-0 bg-primary text-primary-foreground">
                  <AvatarFallback className="bg-transparent"><Bot className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="rounded-2xl p-4 bg-card border rounded-tl-sm flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background/50 backdrop-blur border-t space-y-4">
          {messages.length < 3 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-xs md:text-sm bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors px-3 py-1.5 rounded-full flex items-center gap-1 border"
                >
                  <Sparkles className="h-3 w-3" /> {s}
                </button>
              ))}
            </div>
          )}
          
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your spending..."
              className="rounded-full bg-card"
              disabled={chatMutation.isPending}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full shrink-0" 
              disabled={!input.trim() || chatMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}