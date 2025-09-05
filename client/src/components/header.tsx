interface HeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground" data-testid={`heading-${title.toLowerCase()}`}>
            {title}
          </h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {children && (
          <div className="flex items-center gap-4">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
