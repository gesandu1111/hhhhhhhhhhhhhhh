interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative";
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  iconBgColor, 
  iconColor 
}: StatsCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-card-foreground" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
          <p className={`text-xs mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            <i className={`fas fa-arrow-${changeType === 'positive' ? 'up' : 'down'} mr-1`}></i>
            <span>{change}</span> from yesterday
          </p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <i className={`${icon} ${iconColor}`}></i>
        </div>
      </div>
    </div>
  );
}
