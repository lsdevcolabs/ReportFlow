import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateClient, useUpdateClient, useGetClient, getListClientsQueryKey, getGetClientQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const clientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  projectType: z.string().min(1, "Please select a project type."),
  brandColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please enter a valid hex color code.").optional().or(z.literal("")),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: number;
}

export function ClientFormDialog({ open, onOpenChange, clientId }: ClientFormDialogProps) {
  const isEditing = !!clientId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  
  const { data: clientData, isLoading: isLoadingClient } = useGetClient(clientId as number, { 
    query: { enabled: open && isEditing, queryKey: getGetClientQueryKey(clientId as number) } 
  });

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      projectType: "SEO",
      brandColor: "#2563eb", // default primary color
    },
  });

  useEffect(() => {
    if (clientData && open) {
      form.reset({
        name: clientData.name,
        email: clientData.email,
        projectType: clientData.projectType,
        brandColor: clientData.brandColor || "",
      });
    } else if (!open) {
      form.reset();
    }
  }, [clientData, open, form]);

  const onSubmit = (data: ClientFormValues) => {
    if (isEditing && clientId) {
      updateClient.mutate(
        { clientId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetClientQueryKey(clientId) });
            toast({ title: "Client updated successfully." });
            onOpenChange(false);
          },
          onError: () => {
            toast({ title: "Failed to update client.", variant: "destructive" });
          }
        }
      );
    } else {
      createClient.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
            toast({ title: "Client created successfully." });
            onOpenChange(false);
          },
          onError: () => {
            toast({ title: "Failed to create client.", variant: "destructive" });
          }
        }
      );
    }
  };

  const isPending = createClient.isPending || updateClient.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Client" : "Add Client"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your client's details and preferences." 
              : "Add a new client to start generating reports for them."}
          </DialogDescription>
        </DialogHeader>

        {isLoadingClient ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company / Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} data-testid="input-client-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@acme.com" {...field} data-testid="input-client-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-client-type">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SEO">SEO</SelectItem>
                          <SelectItem value="PPC">Paid Ads</SelectItem>
                          <SelectItem value="Social Media">Social Media</SelectItem>
                          <SelectItem value="Content">Content</SelectItem>
                          <SelectItem value="Full Service">Full Service</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            className="w-12 p-1 cursor-pointer" 
                            {...field} 
                            data-testid="input-client-color" 
                          />
                          <Input 
                            type="text" 
                            placeholder="#000000" 
                            className="flex-1 uppercase font-mono text-sm"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)} data-testid="button-cancel-client">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-client">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Create Client"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}