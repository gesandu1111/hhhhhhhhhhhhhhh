import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface BotConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  isActive: boolean;
  updatedAt: string;
}

export default function BotConfig() {
  const { toast } = useToast();
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  const { data: configs, isLoading } = useQuery<BotConfig[]>({
    queryKey: ["/api/bot/config"],
    onSuccess: (data) => {
      const values: Record<string, string> = {};
      data.forEach(config => {
        values[config.key] = config.value;
      });
      setConfigValues(values);
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PUT", `/api/bot/config/${key}`, { value });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "Bot configuration has been updated successfully",
      });
      setEditingConfig(null);
      queryClient.invalidateQueries({ queryKey: ["/api/bot/config"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = (key: string) => {
    const value = configValues[key];
    if (!value?.trim()) {
      toast({
        title: "Validation Error",
        description: "Configuration value cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    updateConfigMutation.mutate({ key, value });
  };

  const handleCancelEdit = (key: string) => {
    const originalConfig = configs?.find(c => c.key === key);
    if (originalConfig) {
      setConfigValues(prev => ({
        ...prev,
        [key]: originalConfig.value
      }));
    }
    setEditingConfig(null);
  };

  if (isLoading) {
    return (
      <>
        <Header 
          title="Bot Configuration" 
          subtitle="Configure automated responses and bot behavior"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading configuration...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Bot Configuration" 
        subtitle="Configure automated responses and bot behavior"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {configs?.map((config) => (
            <Card key={config.id} data-testid={`config-card-${config.key}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                    {config.description && (
                      <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingConfig === config.key ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelEdit(config.key)}
                          data-testid={`button-cancel-${config.key}`}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveConfig(config.key)}
                          disabled={updateConfigMutation.isPending}
                          data-testid={`button-save-${config.key}`}
                        >
                          {updateConfigMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingConfig(config.key)}
                        data-testid={`button-edit-${config.key}`}
                      >
                        <i className="fas fa-edit mr-2"></i>
                        Edit
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor={`config-${config.key}`}>Response Message</Label>
                  {editingConfig === config.key ? (
                    <Textarea
                      id={`config-${config.key}`}
                      value={configValues[config.key] || ""}
                      onChange={(e) => setConfigValues(prev => ({
                        ...prev,
                        [config.key]: e.target.value
                      }))}
                      rows={4}
                      className="font-mono"
                      data-testid={`textarea-${config.key}`}
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap">
                      {config.value}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <span className={`px-2 py-1 rounded-full ${
                    config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {config.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span>Last updated: {new Date(config.updatedAt).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {!configs?.length && (
            <div className="text-center py-12">
              <i className="fas fa-robot text-4xl text-muted-foreground mb-4"></i>
              <p className="text-lg font-medium text-card-foreground mb-2">No configuration found</p>
              <p className="text-muted-foreground">
                Bot configuration will be initialized automatically
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
