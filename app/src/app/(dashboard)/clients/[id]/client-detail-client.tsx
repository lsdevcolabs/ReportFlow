"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Plus, FileBarChart, ExternalLink, Globe, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ClientForm, ClientFormData } from "@/components/clients/client-form";
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
import { useRouter } from "next/navigation";

interface ClientDetailClientProps {
  initialClient: any;
  initialReports: any[];
}

export default function ClientDetailClient({ initialClient, initialReports }: ClientDetailClientProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [client, setClient] = useState(initialClient);

  const handleUpdateClient = async (data: ClientFormData) => {
    try {
      const updateData: Record<string, unknown> = {
        name: data.name,
        email: data.email,
        website: data.website,
        industry: data.industry,
        brandColor: data.brandColor,
        logoUrl: client.logoUrl,
      };

      if (data.logoFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(data.logoFile);
        });
        updateData.logoData = base64;
        delete updateData.logoUrl;
      }

      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const { client: updatedClient } = await res.json();
        setClient({ ...client, ...updatedClient });
        setIsEditOpen(false);
        router.refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("Failed to update client", err);
      }
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/clients";
      }
    } catch (e) {
      console.error("Failed to delete client", e);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link href="/clients" className="shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            {client.logoUrl ? (
              <img
                src={client.logoUrl}
                alt={client.name}
                className="h-12 w-12 rounded-full object-contain shrink-0"
              />
            ) : (
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
                style={{ backgroundColor: client.brandColor || "#2563EB" }}
              >
                {client.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{client.name}</h1>
              {client.industry && <Badge variant="secondary" className="mt-1">{client.industry}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto pt-2 sm:pt-0">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Client Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{client.email || "No email provided"}</span>
            </div>
            {client.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {client.website}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{client.industry || "No industry provided"}</span>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Added on</span>
              <span className="text-sm font-medium">
                {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand Settings</CardTitle>
            <CardDescription>Customize how reports look for this client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Brand Color</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-8 w-8 rounded-md border"
                    style={{ backgroundColor: client.brandColor || "#2563EB" }}
                  />
                  <span className="font-mono text-sm">{client.brandColor || "#2563EB"}</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Logo</p>
              <p className="text-sm">
                {client.logoUrl ? "Logo uploaded" : "No logo uploaded"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Reports ({initialReports.length})</h2>
          <Link href={`/reports/new?clientId=${client.id}`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </Link>
        </div>

        {initialReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileBarChart className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first report for this client.
              </p>
              <Link href={`/reports/new?clientId=${client.id}`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {initialReports.map((report) => (
              <Card key={report.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: client.brandColor || "#2563EB" }}>
                        <FileBarChart className="h-5 w-5" />
                      </div>
                      <div>
                        <Link href={`/reports/${report.id}`} className="font-medium hover:underline">
                          {report.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {report.dateRangeStart && report.dateRangeEnd 
                            ? `${new Date(report.dateRangeStart).toLocaleDateString()} - ${new Date(report.dateRangeEnd).toLocaleDateString()}` 
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={report.isPublic ? "default" : "secondary"}>
                        {report.isPublic ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex gap-1">
                        {report.isPublic && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/r/${report.shareToken}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/reports/${report.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <ClientForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSubmit={handleUpdateClient}
        initialData={client}
        mode="edit"
      />

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {client.name} and all {initialReports.length} reports. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
