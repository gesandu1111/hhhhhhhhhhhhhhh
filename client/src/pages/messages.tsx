import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { format } from "date-fns";

interface Message {
  id: string;
  whatsappMessageId: string;
  fromNumber: string;
  toNumber: string;
  messageText: string;
  messageType: string;
  timestamp: string;
  status: string;
  responseTime?: number;
  isCommand: boolean;
  commandName?: string;
  botResponse?: string;
}

export default function Messages() {
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  if (isLoading) {
    return (
      <>
        <Header 
          title="Messages" 
          subtitle="View all WhatsApp bot conversations"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Messages" 
        subtitle="View all WhatsApp bot conversations"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground">Recent Messages</h3>
          </div>
          
          <div className="overflow-x-auto">
            {messages?.length ? (
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">From</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Message</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Response Time</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message, index) => (
                    <tr 
                      key={message.id}
                      className={index % 2 === 0 ? "bg-background" : "bg-muted/25"}
                      data-testid={`message-row-${message.id}`}
                    >
                      <td className="p-4">
                        <div className="font-medium text-card-foreground">
                          {message.fromNumber}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-card-foreground truncate">
                            {message.messageText || "No text content"}
                          </p>
                          {message.isCommand && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              <i className="fas fa-terminal mr-1"></i>
                              /{message.commandName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize text-sm text-muted-foreground">
                          {message.messageType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          message.status === 'responded' 
                            ? 'bg-green-100 text-green-800'
                            : message.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {message.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {message.responseTime 
                          ? `${(message.responseTime / 1000).toFixed(2)}s`
                          : '-'
                        }
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(message.timestamp), "MMM d, HH:mm")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <i className="fas fa-comments text-4xl text-muted-foreground mb-4"></i>
                <p className="text-lg font-medium text-card-foreground mb-2">No messages yet</p>
                <p className="text-muted-foreground">
                  Messages will appear here when users interact with your WhatsApp bot
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
