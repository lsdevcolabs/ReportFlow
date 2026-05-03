import { useState } from "react";
import { useListClients, useDeleteClient, getListClientsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ClientFormDialog } from "./client-form-dialog";

export default function Clients() {
  const { data: clients, isLoading } = useListClients();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteClient = useDeleteClient();

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase()) || 
    client.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleDelete = () => {
    if (!deleteId) return;
    deleteClient.mutate({ clientId: deleteId }, {
      onSuccess: () => {
        toast({ title: "Client deleted", description: "The client has been removed." });
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
        setDeleteId(null);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to delete client.", variant: "destructive" });
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your clients and their reporting preferences.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-new-client">
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="flex items-center space-x-2 w-full max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-clients"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Project Type</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Reports</th>
                <th className="px-6 py-4 font-medium hidden lg:table-cell">Added</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-[200px]" /></td>
                    <td className="px-6 py-4 hidden sm:table-cell"><Skeleton className="h-5 w-[100px]" /></td>
                    <td className="px-6 py-4 hidden md:table-cell"><Skeleton className="h-5 w-[50px]" /></td>
                    <td className="px-6 py-4 hidden lg:table-cell"><Skeleton className="h-5 w-[80px]" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    {search ? "No clients found matching your search." : "No clients yet. Add your first client to get started."}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm shrink-0"
                          style={{ backgroundColor: client.brandColor || 'hsl(var(--primary))' }}
                        >
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/clients/${client.id}`} className="font-medium text-foreground hover:underline" data-testid={`link-client-${client.id}`}>
                            {client.name}
                          </Link>
                          <div className="text-muted-foreground">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-muted-foreground">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {client.projectType}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">
                      {client.reportCount}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/reports/new?clientId=${client.id}`}>
                          <Button variant="ghost" size="sm" className="hidden sm:flex" data-testid={`button-new-report-for-${client.id}`}>
                            Report <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`menu-client-${client.id}`}>
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditId(client.id)} data-testid={`menu-edit-client-${client.id}`}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <Link href={`/clients/${client.id}`}>
                              <DropdownMenuItem data-testid={`menu-view-client-${client.id}`}>
                                <Search className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                              onClick={() => setDeleteId(client.id)}
                              data-testid={`menu-delete-client-${client.id}`}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the client and all of their reports. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ClientFormDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
      
      {editId && (
        <ClientFormDialog 
          open={!!editId} 
          onOpenChange={(open) => !open && setEditId(null)} 
          clientId={editId}
        />
      )}
    </div>
  );
}