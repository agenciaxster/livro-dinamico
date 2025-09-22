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
    <Card className={cn("shadow-soft hover:shadow-medium transition-all duration-300 animate-scale-in", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="w-5 h-5 text-primary/70" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        {change && (
          <p className={cn("text-xs", getChangeColor())}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}