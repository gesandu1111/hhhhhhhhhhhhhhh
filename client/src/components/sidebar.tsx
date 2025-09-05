import { Link, useLocation } from "wouter";

const navigation = [
  { name: "Dashboard", href: "/", icon: "fas fa-chart-bar" },
  { name: "Messages", href: "/messages", icon: "fas fa-comments" },
  { name: "Templates", href: "/templates", icon: "fas fa-clipboard-list" },
  { name: "Webhooks", href: "/webhooks", icon: "fas fa-link" },
  { name: "Bot Config", href: "/bot-config", icon: "fas fa-robot" },
  { name: "Analytics", href: "/analytics", icon: "fas fa-chart-line" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
            <i className="fab fa-whatsapp text-xl"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-card-foreground">WhatsApp Bot</h1>
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>
                <a
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
                >
                  <i className={`${item.icon} w-4 h-4`}></i>
                  {item.name}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-md bg-muted">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
            <span>JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-card-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">john@company.com</p>
          </div>
          <button 
            className="text-muted-foreground hover:text-card-foreground"
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt w-4 h-4"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
