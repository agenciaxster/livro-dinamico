import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
}

export function FinancialCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon, 
  className 
}: FinancialCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-profit";
      case "negative":
        return "text-loss";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn("shadow-soft hover:shadow-strong transition-all duration-300 animate-scale-in bg-gradient-card border-border/50", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground mb-2">
          {value}
        </div>
        {change && (
          <p className={cn("text-sm font-medium", getChangeColor())}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}