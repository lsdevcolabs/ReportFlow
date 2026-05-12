"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, FileBarChart, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm, ClientFormData } from "@/components/clients/client-form";
import { PlanLimitBadge, UpgradePrompt } from "@/components/ui/upgrade-prompt";
import { getUpgradeMessage } from "@/lib/plans";
import type { Plan } from "@/lib/plans";

interface ClientData {
  id: string;
  name: string;
  email: string | null;
  website: string | null;
  industry: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  reportCount?: number;
}

interface ClientsClientProps {
  initialClients: ClientData[];
  maxClients: number;
  currentCount: number;
  plan: string;
}

export default function ClientsClient({ initialClients, maxClients, plan }: ClientsClientProps) {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [clients, setClients] = useState(initialClients);
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(search.toLowerCase())) ||
      (client.industry && client.industry.toLowerCase().includes(search.toLowerCase()))
  );

  const canAddClient = clients.length < maxClients;

  const handleAddClick = () => {
    if (!canAddClient) {
      setIsLimitDialogOpen(true);
      return;
    }
    setIsFormOpen(true);
  };

  const handleAddClient = async (data: ClientFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const { client } = await res.json();
        setClients([{ ...client, reportCount: 0 }, ...clients]);
        setIsFormOpen(false);
      } else {
        const error = await res.json();
        if (error.error === "LIMIT_EXCEEDED") {
          setIsFormOpen(false);
          setIsLimitDialogOpen(true);
        }
      }
    } catch (e) {
      console.error("Failed to add client", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteClientId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/clients/${deleteClientId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setClients(clients.filter((c) => c.id !== deleteClientId));
      }
    } catch (e) {
      console.error("Failed to delete client", e);
    } finally {
      setDeleteClientId(null);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your clients and their reporting preferences.</p>
        </div>
        <div className="flex items-center gap-4">
          <PlanLimitBadge limit={maxClients} current={clients.length} type="clients" />
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search clients..."
          className="pl-8 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No clients found</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              {search
                ? "No clients match your search criteria."
                : "Get started by adding your first client."}
            </p>
            {!search && (
              <Button onClick={handleAddClick}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {client.logoUrl ? (
                      <img
                        src={client.logoUrl}
                        alt={client.name}
                        className="h-12 w-12 rounded-full object-contain"
                      />
                    ) : (
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                        style={{ backgroundColor: client.brandColor || "#2563EB" }}
                      >
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/clients/${client.id}`} className="font-medium hover:underline">
                          {client.name}
                        </Link>
                        {client.industry && (
                          <Badge variant="secondary" className="text-xs">
                            {client.industry}
                          </Badge>
                        )}
                      </div>
                      {client.email && (
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {client.reportCount !== undefined && (
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{client.reportCount} reports</p>
                        <p className="text-xs text-muted-foreground">
                          Added {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/reports/new?clientId=${client.id}`}>
                            <FileBarChart className="mr-2 h-4 w-4" />
                            New Report
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/clients/${client.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteClientId(client.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClientForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddClient}
        mode="create"
      />

      <UpgradePrompt
        open={isLimitDialogOpen}
        onOpenChange={setIsLimitDialogOpen}
        message={`You've reached the maximum of ${maxClients} clients on your ${plan} plan. Upgrade to add more clients.`}
        feature="More clients"
      />

      <AlertDialog open={!!deleteClientId} onOpenChange={() => setDeleteClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the client and all of their reports. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}