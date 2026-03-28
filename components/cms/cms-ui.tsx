import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const cmsControlClassName = "cms-control h-12 w-full rounded-2xl px-4 text-sm";
export const cmsTextareaClassName = "cms-control min-h-32 w-full rounded-2xl px-4 py-3 text-sm leading-6";
export const cmsSelectTriggerClassName = "cms-control h-12 w-full rounded-2xl px-4 text-sm";

type CmsPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function CmsPageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
}: CmsPageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", className)}>
      <div className="min-w-0 space-y-3">
        {eyebrow ? <p className="cms-kicker">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="cms-page-title">{title}</h1>
          {description ? <p className="cms-page-copy">{description}</p> : null}
        </div>
        {meta ? <div className="flex flex-wrap gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}

type CmsSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  tone?: "default" | "muted";
};

export function CmsSection({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  tone = "default",
}: CmsSectionProps) {
  return (
    <section
      className={cn(
        "rounded-[1.75rem] p-5 sm:p-6",
        tone === "muted" ? "cms-surface-subtle" : "cms-surface",
        className,
      )}
    >
      {eyebrow || title || description || action ? (
        <div className="flex flex-col gap-4 border-b border-border/60 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            {eyebrow ? <p className="cms-kicker">{eyebrow}</p> : null}
            {title ? <h2 className="cms-section-title">{title}</h2> : null}
            {description ? <p className="cms-section-copy">{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 flex-wrap gap-3">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn(eyebrow || title || description || action ? "pt-5" : "", contentClassName)}>{children}</div>
    </section>
  );
}

type CmsFieldProps = {
  label: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
};

export function CmsField({ label, hint, htmlFor, className, children }: CmsFieldProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="space-y-1">
        <Label htmlFor={htmlFor} className="cms-field-label">
          {label}
        </Label>
        {hint ? <p className="cms-field-hint">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

type CmsMetricCardProps = {
  label: string;
  value: string | number;
  description: string;
  tone?: "default" | "accent";
};

export function CmsMetricCard({
  label,
  value,
  description,
  tone = "default",
}: CmsMetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] p-5",
        tone === "accent" ? "cms-surface-subtle" : "cms-surface",
      )}
    >
      <p className="cms-kicker">{label}</p>
      <p className="mt-4 font-heading text-4xl tracking-[-0.04em] text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

type CmsStatusBadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "accent";
  className?: string;
};

export function CmsStatusBadge({
  children,
  tone = "neutral",
  className,
}: CmsStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase",
        tone === "neutral" && "border-slate-200 bg-slate-50 text-slate-700",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
        tone === "accent" && "border-primary/20 bg-primary/10 text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}
