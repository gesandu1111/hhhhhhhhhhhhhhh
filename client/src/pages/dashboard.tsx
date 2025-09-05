import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import StatsCard from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DashboardStats {
  messagesToday: number;
  activeUsers: number;
  responseRate: number;
  avgResponseTime: number;
  recentMessages: Array<{
    id: string;
    fromNumber: string;
    messageText: string;
    timestamp: string;
    status: string;
    responseTime?: number;
    botResponse?: string;
  }>;
  commandStats: Array<{
    name: string;
    usage: number;
    description: string;
  }>;
}

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const testBotMutation = useMutation({
    mutationFn: async (data: { message: string; phoneNumber: string }) => {
      const response = await apiRequest("POST", "/api/bot/test", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Successful",
        description: "Bot test message processed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Failed to process test message",
        variant: "destructive",
      });
    },
  });

  const handleTestBot = () => {
    testBotMutation.mutate({
      message: "/help",
      phoneNumber: "+1234567890",
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Monitor your WhatsApp bot performance"
      >
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Webhook Connected</span>
        </div>
        <Button
          onClick={handleTestBot}
          disabled={testBotMutation.isPending}
          data-testid="button-test-bot"
        >
          <i className="fas fa-play mr-2"></i>
          {testBotMutation.isPending ? "Testing..." : "Test Bot"}
        </Button>
      </Header>

      <div className="flex-1 overflow-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Messages Today"
            value={stats?.messagesToday || 0}
            change="+12%"
            changeType="positive"
            icon="fas fa-envelope"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Active Users"
            value={stats?.activeUsers || 0}
            change="+8%"
            changeType="positive"
            icon="fas fa-users"
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatsCard
            title="Response Rate"
            value={`${stats?.responseRate || 0}%`}
            change="+2%"
            changeType="positive"
            icon="fas fa-chart-line"
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatsCard
            title="Avg Response Time"
            value={`${(stats?.avgResponseTime || 0) / 1000}s`}
            change="-0.2s"
            changeType="positive"
            icon="fas fa-clock"
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Messages */}
          <div className="bg-card rounded-lg border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-card-foreground">Recent Messages</h3>
                <Button variant="ghost" size="sm" data-testid="button-view-all-messages">
                  View All
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats?.recentMessages?.length ? (
                  stats.recentMessages.slice(0, 3).map((message) => (
                    <div 
                      key={message.id} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      data-testid={`message-${message.id}`}
                    >
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-gray-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-card-foreground">
                            {message.fromNumber}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.timestamp), "p")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {message.messageText || "No message text"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            message.status === 'responded' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {message.status === 'responded' ? 'Responded' : 'Pending'}
                          </span>
                          {message.responseTime && (
                            <span className="text-xs text-muted-foreground">
                              Response: {(message.responseTime / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No recent messages
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bot Commands Usage */}
          <div className="bg-card rounded-lg border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Popular Commands</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats?.commandStats?.length ? (
                  stats.commandStats.map((command) => (
                    <div 
                      key={command.name} 
                      className="flex items-center justify-between"
                      data-testid={`command-stat-${command.name.replace('/', '')}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-terminal text-blue-600 text-sm"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">
                            {command.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {command.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-card-foreground">
                          {command.usage}
                        </p>
                        <p className="text-xs text-muted-foreground">uses today</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No command usage data
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* System Status and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Webhook Status */}
          <div className="bg-card rounded-lg border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Webhook Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">WhatsApp Cloud API</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Message Verification</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Valid
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rate Limiting</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Tier 2
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Health Check</span>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Template Management */}
          <div className="bg-card rounded-lg border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Templates</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Approved Templates</span>
                  <span className="text-sm font-semibold text-card-foreground">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Approval</span>
                  <span className="text-sm font-semibold text-card-foreground">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Most Used</span>
                  <span className="text-sm font-semibold text-card-foreground">welcome_msg</span>
                </div>
                <Button className="w-full" data-testid="button-create-template">
                  <i className="fas fa-plus mr-2"></i>
                  Create Template
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-lg border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button 
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-muted transition-colors"
                  data-testid="button-broadcast-message"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-bullhorn text-blue-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Broadcast Message</p>
                    <p className="text-xs text-muted-foreground">Send to all users</p>
                  </div>
                </button>

                <button 
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-muted transition-colors"
                  data-testid="button-export-logs"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-download text-green-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Export Logs</p>
                    <p className="text-xs text-muted-foreground">Download conversation data</p>
                  </div>
                </button>

                <button 
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-muted transition-colors"
                  data-testid="button-configure-bot"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-cog text-purple-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Bot Settings</p>
                    <p className="text-xs text-muted-foreground">Configure responses</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
