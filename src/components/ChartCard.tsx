import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <Card className={cn("shadow-soft hover:shadow-strong transition-all duration-300 bg-gradient-card border-border/50", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}