import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  components: any;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function Templates() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "utility",
    language: "en_US",
    components: {
      type: "BODY",
      text: "",
    },
  });

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await apiRequest("POST", "/api/templates", templateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Created",
        description: "Template has been created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewTemplate({
        name: "",
        category: "utility",
        language: "en_US",
        components: {
          type: "BODY",
          text: "",
        },
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.components.text) {
      toast({
        title: "Validation Error",
        description: "Name and template content are required",
        variant: "destructive",
      });
      return;
    }

    createTemplateMutation.mutate({
      ...newTemplate,
      components: [newTemplate.components],
    });
  };

  if (isLoading) {
    return (
      <>
        <Header 
          title="Templates" 
          subtitle="Manage WhatsApp message templates"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Templates" 
        subtitle="Manage WhatsApp message templates"
      >
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-template">
              <i className="fas fa-plus mr-2"></i>
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                  data-testid="input-template-name"
                />
              </div>
              
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select 
                  value={newTemplate.category} 
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger data-testid="select-template-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="authentication">Authentication</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template-content">Template Content</Label>
                <Textarea
                  id="template-content"
                  value={newTemplate.components.text}
                  onChange={(e) => setNewTemplate(prev => ({ 
                    ...prev, 
                    components: { ...prev.components, text: e.target.value }
                  }))}
                  placeholder="Enter template message content"
                  rows={4}
                  data-testid="textarea-template-content"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setIsCreateDialogOpen(false)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-cancel-template"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTemplate}
                  disabled={createTemplateMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-template"
                >
                  {createTemplateMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Header>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground">Message Templates</h3>
            <p className="text-sm text-muted-foreground mt-1">
              WhatsApp templates must be pre-approved before use
            </p>
          </div>
          
          {templates?.length ? (
            <div className="grid gap-4 p-6">
              {templates.map((template) => (
                <div 
                  key={template.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/25 transition-colors"
                  data-testid={`template-card-${template.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-card-foreground">{template.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {template.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          template.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : template.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {template.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Used {template.usageCount} times
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" data-testid={`button-edit-template-${template.id}`}>
                        <i className="fas fa-edit mr-2"></i>
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-sm text-card-foreground font-mono">
                      {Array.isArray(template.components) 
                        ? template.components.find(c => c.type === 'BODY')?.text || 'No content'
                        : template.components.text || 'No content'
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>Language: {template.language}</span>
                    <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <i className="fas fa-clipboard-list text-4xl text-muted-foreground mb-4"></i>
              <p className="text-lg font-medium text-card-foreground mb-2">No templates yet</p>
              <p className="text-muted-foreground mb-4">
                Create message templates for consistent communication with your users
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-template">
                <i className="fas fa-plus mr-2"></i>
                Create Your First Template
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
