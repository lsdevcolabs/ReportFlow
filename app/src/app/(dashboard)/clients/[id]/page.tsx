"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

// Mock data
const mockClient = {
  id: "1",
  name: "Acme Corporation",
  email: "contact@acme.com",
  website: "https://acme.com",
  industry: "E-commerce",
  brandColor: "#3B82F6",
  createdAt: "2025-01-15",
  reports: [
    { id: "r1", title: "Q1 2025 Performance Report", dateRange: "Jan - Mar 2025", isPublic: true, createdAt: "2025-03-31" },
    { id: "r2", title: "February 2025 Report", dateRange: "Feb 1-28, 2025", isPublic: false, createdAt: "2025-02-28" },
    { id: "r3", title: "January 2025 Report", dateRange: "Jan 1-31, 2025", isPublic: true, createdAt: "2025-01-31" },
  ],
};

export default function ClientDetailPage() {
  const params = useParams();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [client, setClient] = useState(mockClient);

  const handleUpdateClient = async (data: ClientFormData) => {
    setClient({ ...client, ...data });
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    // Would redirect to clients list
    console.log("Deleted client");
    setIsDeleteOpen(false);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div 
              className="h-12 w-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: client.brandColor }}
            >
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
              <Badge variant="secondary">{client.industry}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setIsDeleteOpen(true)}>
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
              <span>{client.email}</span>
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
              <span>{client.industry}</span>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Added on</span>
              <span className="text-sm font-medium">{client.createdAt}</span>
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
                    style={{ backgroundColor: client.brandColor }}
                  />
                  <span className="font-mono text-sm">{client.brandColor}</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Logo</p>
              <p className="text-sm">No logo uploaded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Reports ({client.reports.length})</h2>
          <Link href={`/reports/new?clientId=${client.id}`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </Link>
        </div>

        {client.reports.length === 0 ? (
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
            {client.reports.map((report) => (
              <Card key={report.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: client.brandColor }}>
                        <FileBarChart className="h-5 w-5" />
                      </div>
                      <div>
                        <Link href={`/reports/${report.id}`} className="font-medium hover:underline">
                          {report.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">{report.dateRange}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={report.isPublic ? "default" : "secondary"}>
                        {report.isPublic ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex gap-1">
                        {report.isPublic && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/r/${report.id}`} target="_blank">
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
              This will permanently delete {client.name} and all {client.reports.length} reports. This action cannot be undone.
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