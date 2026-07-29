import { AlertCircle, Inbox, RotateCcw } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

function classes(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function Button({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={classes("ui-button", className)} {...props} />;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <article className={classes("ui-card", className)} {...props} />;
}

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={classes("ui-badge", className)} {...props} />;
}

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  id?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  id,
}: PageHeaderProps) {
  return (
    <header className="ui-page-header">
      <div>
        {eyebrow && <span className="ui-eyebrow">{eyebrow}</span>}
        <h1 id={id}>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="ui-page-header-actions">{actions}</div>}
    </header>
  );
}

type StateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
};

export function EmptyState({ title, description, action, compact }: StateProps) {
  return (
    <section className={classes("ui-state", compact && "is-compact")} aria-labelledby="empty-state-title">
      <Inbox size={20} aria-hidden="true" />
      <h2 id="empty-state-title">{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  );
}

export function ErrorState({ title, description, action, compact }: StateProps) {
  return (
    <section className={classes("ui-state", "is-error", compact && "is-compact")} role="alert">
      <AlertCircle size={20} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      {action ?? <Button><RotateCcw size={15} aria-hidden="true" /> Yenidən yoxla</Button>}
    </section>
  );
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("ui-skeleton", className)} aria-hidden="true" {...props} />;
}
