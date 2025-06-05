"use client";

import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import { Business } from "@/app/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";
import {
  Mail,
  Upload,
  Eye,
  Trash2,
  Calendar,
  User,
  Star,
  StarOff,
  Paperclip,
  Download,
  X,
} from "@/lib/tabler-icons";

// Import server actions
import {
  getBusinessEmails,
  createEmail,
  updateEmailImportance,
  deleteEmail,
  parseAndCreateEmail,
} from "@/app/actions/emails/actions";

// Temporary Email type until Prisma is regenerated
interface Email {
  id: string;
  subject: string;
  senderEmail: string;
  senderName?: string | null;
  recipientEmail: string;
  recipientName?: string | null;
  content: string;
  htmlContent?: string | null;
  receivedAt?: Date | null;
  attachments?: any;
  messageId?: string | null;
  inReplyTo?: string | null;
  priority?: string | null;
  isRead: boolean;
  isImportant: boolean;
  createdAt: Date;
  updatedAt: Date;
  businessId?: string | null;
  contactId?: string | null;
  workspaceId: string;
}

interface LeadEmailsProps {
  lead: Business;
  workspaceId: string;
}

export function LeadEmails({ lead, workspaceId }: LeadEmailsProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailToDelete, setEmailToDelete] = useState<Email | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load emails on component mount
  useEffect(() => {
    loadEmails();
  }, [lead.id, workspaceId]);

  const loadEmails = useCallback(async () => {
    try {
      setIsLoadingEmails(true);
      const emailList = await getBusinessEmails(lead.id, workspaceId);
      setEmails(emailList);
    } catch (error) {
      console.error("Error loading emails:", error);
      toast.error("Feil ved lasting av e-post");
    } finally {
      setIsLoadingEmails(false);
    }
  }, [lead.id, workspaceId]);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      await processFiles(files);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      for (const file of files) {
        // Check file type
        const allowedTypes = [
          "message/rfc822", // .eml files
          "application/vnd.ms-outlook", // .msg files
          "text/plain", // .txt files
          "application/pdf", // PDF files (for email printouts)
          "text/html", // HTML files
          "application/octet-stream", // Generic binary (some email clients export with this)
        ];

        const allowedExtensions = [
          ".eml",
          ".msg",
          ".txt",
          ".html",
          ".htm",
          ".mbox",
        ];

        const isValidType =
          allowedTypes.includes(file.type) ||
          allowedExtensions.some((ext) =>
            file.name.toLowerCase().endsWith(ext)
          );

        if (!isValidType) {
          toast.error(
            `Ikke støttet filtype: ${file.name}. Støttede typer: .eml, .msg, .txt, .html, .mbox`
          );
          continue;
        }

        // Process the file
        await processEmailFile(file);
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Feil ved opplasting av e-post");
    } finally {
      setIsLoading(false);
    }
  };

  const processEmailFile = async (file: File) => {
    console.log(
      `Processing email file: ${file.name}, size: ${file.size}, type: ${file.type}`
    );

    try {
      // Read file content as buffer and convert to base64
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);

      // Convert to base64 safely for binary data
      let base64String = "";
      const chunkSize = 8192; // Process in chunks to avoid call stack issues
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        base64String += btoa(
          String.fromCharCode.apply(null, Array.from(chunk))
        );
      }

      console.log(
        `File converted to base64, original size: ${buffer.byteLength} bytes`
      );

      // Send to server for parsing and saving
      console.log("Sending file to server for parsing...");
      const result = await parseAndCreateEmail(
        base64String,
        file.name,
        lead.id,
        workspaceId,
        lead.email,
        lead.name
      );

      if (result.success && result.data) {
        setEmails((prev) => [result.data!, ...prev]);
        toast.success(`E-post "${result.data.subject}" ble lagret`);
        console.log("Email saved successfully:", result.data.id);
      } else {
        console.error("Server action failed:", result);
        throw new Error(result.message || "Failed to save email");
      }
    } catch (error) {
      console.error("Error processing email file:", error);

      // More specific error messages for users
      let userMessage = `Feil ved behandling av ${file.name}`;
      if (error instanceof Error) {
        if (error.message.includes("parsing")) {
          userMessage +=
            ": E-post filen kunne ikke leses. Kontroller at det er en gyldig e-post fil.";
        } else if (error.message.includes("required fields")) {
          userMessage +=
            ": E-posten mangler nødvendig informasjon (emne, avsender eller innhold).";
        } else if (error.message.includes("validation")) {
          userMessage += ": E-post dataene er ikke gyldige.";
        } else {
          userMessage += `: ${error.message}`;
        }
      }

      toast.error(userMessage);
    }
  };

  const toggleEmailImportance = async (email: Email) => {
    startTransition(async () => {
      try {
        const result = await updateEmailImportance(
          email.id,
          !email.isImportant,
          workspaceId
        );

        if (result.success && result.data) {
          setEmails((prev) =>
            prev.map((e) =>
              e.id === email.id ? { ...e, isImportant: !e.isImportant } : e
            )
          );

          toast.success(
            email.isImportant
              ? "E-post markert som vanlig"
              : "E-post markert som viktig"
          );
        } else {
          throw new Error(result.message || "Failed to update email");
        }
      } catch (error) {
        console.error("Error updating email:", error);
        toast.error("Feil ved oppdatering av e-post");
      }
    });
  };

  const handleDeleteEmail = async (email: Email) => {
    startTransition(async () => {
      try {
        const result = await deleteEmail(email.id, workspaceId);

        if (result.success) {
          setEmails((prev) => prev.filter((e) => e.id !== email.id));
          toast.success("E-post slettet");
          setEmailToDelete(null);
        } else {
          throw new Error(result.message || "Failed to delete email");
        }
      } catch (error) {
        console.error("Error deleting email:", error);
        toast.error("Feil ved sletting av e-post");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Dra og slipp e-post her</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Støtter .eml, .msg, .txt, .html, .mbox og andre e-post filer
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                Velg filer
              </Button>
              {(isLoading || isPending) && (
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Behandler filer..." : "Oppdaterer..."}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".eml,.msg,.txt,.html,.htm,.mbox,message/rfc822,application/vnd.ms-outlook,text/plain,text/html"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Email List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-post ({emails.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingEmails ? (
            <p className="text-center text-muted-foreground py-8">
              Laster e-post...
            </p>
          ) : emails.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Ingen e-post funnet for dette leadet
            </p>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">
                          {email.subject}
                        </h4>
                        {email.isImportant && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                        {email.attachments &&
                          Array.isArray(email.attachments) &&
                          email.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {email.attachments.length}
                              </span>
                            </div>
                          )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Fra: {email.senderName || email.senderEmail}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(
                          email.receivedAt || email.createdAt,
                          {
                            addSuffix: true,
                            locale: nb,
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleEmailImportance(email)}
                      >
                        {email.isImportant ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedEmail(email)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEmailToDelete(email)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Email Detail Dialog */}
      <Dialog
        open={selectedEmail !== null}
        onOpenChange={() => setSelectedEmail(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedEmail?.subject}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedEmail(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <div className="flex flex-col space-y-1 text-sm">
                <div>
                  <strong>Fra:</strong>{" "}
                  {selectedEmail?.senderName || selectedEmail?.senderEmail}
                  {selectedEmail?.senderName &&
                    selectedEmail?.senderEmail &&
                    ` <${selectedEmail.senderEmail}>`}
                </div>
                <div>
                  <strong>Til:</strong>{" "}
                  {selectedEmail?.recipientName ||
                    selectedEmail?.recipientEmail}
                  {selectedEmail?.recipientName &&
                    selectedEmail?.recipientEmail &&
                    ` <${selectedEmail.recipientEmail}>`}
                </div>
                {selectedEmail?.receivedAt && (
                  <div>
                    <strong>Dato:</strong>{" "}
                    {new Date(selectedEmail.receivedAt).toLocaleString("no-NO")}
                  </div>
                )}
                {selectedEmail?.messageId && (
                  <div>
                    <strong>Message-ID:</strong>{" "}
                    <code className="text-xs">{selectedEmail.messageId}</code>
                  </div>
                )}
                {selectedEmail?.attachments &&
                  Array.isArray(selectedEmail.attachments) &&
                  selectedEmail.attachments.length > 0 && (
                    <div>
                      <strong>
                        Vedlegg ({selectedEmail.attachments.length}):
                      </strong>
                      <div className="ml-2 space-y-1">
                        {selectedEmail.attachments.map(
                          (attachment: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-xs"
                            >
                              <Paperclip className="h-3 w-3" />
                              <span>{attachment.filename}</span>
                              <span className="text-muted-foreground">
                                ({attachment.contentType}, {attachment.size}{" "}
                                bytes)
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="text-sm">
              {selectedEmail?.htmlContent ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: selectedEmail.htmlContent,
                  }}
                />
              ) : (
                <div className="whitespace-pre-wrap font-mono text-sm bg-muted/50 p-4 rounded">
                  {selectedEmail?.content}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={emailToDelete !== null}
        onOpenChange={() => setEmailToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett e-post</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil slette e-posten "
              {emailToDelete?.subject}"? Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => emailToDelete && handleDeleteEmail(emailToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/*
CLOUDFLARE R2 INTEGRATION NOTES:
===============================

To implement attachment storage in Cloudflare R2 in the future:

1. Install Cloudflare SDK:
   npm install @cloudflare/workers-types

2. Set up environment variables:
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET_NAME=your_bucket_name

3. Create upload utility function:
   ```typescript
   async function uploadToR2(
     content: Buffer, 
     filename: string, 
     workspaceId: string,
     emailId: string
   ): Promise<string> {
     const key = `emails/${workspaceId}/${emailId}/${filename}`;
     
     // Upload to R2 using REST API or SDK
     const response = await fetch(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`, {
       method: 'PUT',
       headers: {
         'Authorization': `Bearer ${R2_ACCESS_TOKEN}`,
         'Content-Type': 'application/octet-stream'
       },
       body: content
     });
     
     return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
   }
   ```

4. Update attachment processing:
   - Generate unique emailId before saving
   - Upload each attachment to R2
   - Store R2 URLs in database instead of just metadata
   - Add download functionality to retrieve from R2

5. Add cleanup for deleted emails:
   - When email is deleted, also delete R2 objects
   - Implement batch cleanup for orphaned files

6. Security considerations:
   - Use signed URLs for private attachments
   - Implement access control based on workspace membership
   - Set appropriate CORS policies on R2 bucket
*/
