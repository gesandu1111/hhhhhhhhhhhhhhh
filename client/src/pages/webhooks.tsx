import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface WebhookLog {
  id: string;
  webhookUrl: string;
  method: string;
  responseStatus: number;
  responseTime: number;
  timestamp: string;
  isSuccessful: boolean;
  errorMessage?: string;
}

export default function Webhooks() {
  const { data: logs, isLoading } = useQuery<WebhookLog[]>({
    queryKey: ["/api/webhooks/logs"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <>
        <Header 
          title="Webhooks" 
          subtitle="Monitor webhook activity and logs"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading webhook logs...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Webhooks" 
        subtitle="Monitor webhook activity and logs"
      >
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Webhook Active</span>
        </div>
      </Header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6">
          {/* Webhook Configuration */}
          <div className="bg-card rounded-lg border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Webhook Configuration</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Webhook URL</label>
                    <div className="mt-1 p-3 bg-muted rounded-md font-mono text-sm">
                      {process.env.NODE_ENV === 'development' 
                        ? `${window.location.origin}/api/webhook`
                        : '/api/webhook'
                      }
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Verification Token</label>
                    <div className="mt-1 p-3 bg-muted rounded-md font-mono text-sm">
                      your_verify_token_here
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border border-border rounded-md">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-md">
                    <span className="text-sm font-medium">Last Ping</span>
                    <span className="text-sm text-muted-foreground">2 min ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-md">
                    <span className="text-sm font-medium">Total Requests</span>
                    <span className="text-sm font-semibold">{logs?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Webhook Logs */}
          <div className="bg-card rounded-lg border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Recent Webhook Activity</h3>
            </div>
            
            {logs?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Method</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">URL</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Response Time</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr 
                        key={log.id}
                        className={index % 2 === 0 ? "bg-background" : "bg-muted/25"}
                        data-testid={`webhook-log-${log.id}`}
                      >
                        <td className="p-4 text-sm text-muted-foreground">
                          {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="font-mono">
                            {log.method}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm font-mono">
                          {log.webhookUrl}
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={log.responseStatus >= 200 && log.responseStatus < 300 ? "secondary" : "destructive"}
                            className={
                              log.responseStatus >= 200 && log.responseStatus < 300
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {log.responseStatus}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {log.responseTime}ms
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={log.isSuccessful ? "secondary" : "destructive"}
                              className={
                                log.isSuccessful
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {log.isSuccessful ? "Success" : "Failed"}
                            </Badge>
                            {log.errorMessage && (
                              <span className="text-xs text-red-600" title={log.errorMessage}>
                                <i className="fas fa-exclamation-triangle"></i>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <i className="fas fa-link text-4xl text-muted-foreground mb-4"></i>
                <p className="text-lg font-medium text-card-foreground mb-2">No webhook activity</p>
                <p className="text-muted-foreground">
                  Webhook requests will appear here when WhatsApp sends messages to your bot
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
