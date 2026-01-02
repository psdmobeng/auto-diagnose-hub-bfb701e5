import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface DetailField {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
  hidden?: boolean;
}

interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  fields: DetailField[];
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  };
}

export function DetailSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  fields,
  badge,
}: DetailSheetProps) {
  const visibleFields = fields.filter((f) => !f.hidden);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <SheetTitle className="text-xl">{title}</SheetTitle>
              {subtitle && (
                <SheetDescription className="text-sm">
                  {subtitle}
                </SheetDescription>
              )}
            </div>
            {badge && (
              <Badge
                variant={badge.variant || "secondary"}
                className={cn("shrink-0", badge.className)}
              >
                {badge.label}
              </Badge>
            )}
          </div>
        </SheetHeader>
        <Separator className="mb-4" />
        <ScrollArea className="h-[calc(100vh-180px)] pr-4">
          <div className="grid gap-4">
            {visibleFields.map((field, index) => (
              <div
                key={index}
                className={cn(
                  "space-y-1.5",
                  field.fullWidth ? "col-span-full" : ""
                )}
              >
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {field.label}
                </label>
                <div className="text-sm">
                  {field.value !== null && field.value !== undefined && field.value !== "" 
                    ? field.value 
                    : <span className="text-muted-foreground italic">-</span>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 pt-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <div className="pl-3 border-l-2 border-primary/20 space-y-3">
        {children}
      </div>
    </div>
  );
}

export function DetailCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
      {children}
    </code>
  );
}

export function DetailParagraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
      {children}
    </p>
  );
}
