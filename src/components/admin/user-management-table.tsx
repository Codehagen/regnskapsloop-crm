"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Plus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import {
  assignUserToWorkspace,
  removeUserFromWorkspace,
  toggleUserAdminStatus,
} from "@/app/actions/admin/actions";

interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  createdAt: Date;
  workspaces: {
    id: string;
    name: string;
  }[];
}

interface Workspace {
  id: string;
  name: string;
  _count: {
    users: number;
  };
}

interface UserManagementTableProps {
  users: User[];
  workspaces: Workspace[];
}

export function UserManagementTable({ users, workspaces }: UserManagementTableProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");

  const handleAssignToWorkspace = () => {
    if (!selectedUser || !selectedWorkspace) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", selectedUser.id);
      formData.append("workspaceId", selectedWorkspace);

      const result = await assignUserToWorkspace(formData);
      if (result.success) {
        toast.success(result.message);
        setIsAssignDialogOpen(false);
        setSelectedWorkspace("");
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRemoveFromWorkspace = (userId: string, workspaceId: string, workspaceName: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("workspaceId", workspaceId);

      const result = await removeUserFromWorkspace(formData);
      if (result.success) {
        toast.success(`Bruker fjernet fra ${workspaceName}`);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleToggleAdmin = (userId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("isAdmin", (!currentStatus).toString());

      const result = await toggleUserAdminStatus(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const getAvailableWorkspaces = (user: User) => {
    const userWorkspaceIds = user.workspaces.map(w => w.id);
    return workspaces.filter(w => !userWorkspaceIds.includes(w.id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brukeradministrasjon</CardTitle>
        <CardDescription>
          Administrer alle brukere og deres arbeidsområdetilgang.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bruker</TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Arbeidsområder</TableHead>
              <TableHead>Ble med</TableHead>
              <TableHead className="text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {user.name || "Ingen navn"}
                  </span>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.isAdmin && (
                    <Badge variant="destructive">Administrator</Badge>
                  )}
                  {!user.isAdmin && (
                    <Badge variant="secondary">Bruker</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.workspaces.map((workspace) => (
                      <div key={workspace.id} className="flex items-center gap-1">
                        <Badge variant="outline">{workspace.name}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveFromWorkspace(user.id, workspace.id, workspace.name)}
                          disabled={isPending}
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString("nb-NO")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          setIsAssignDialogOpen(true);
                        }}
                        disabled={getAvailableWorkspaces(user).length === 0}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Legg til arbeidsområde
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                        disabled={isPending}
                      >
                        {user.isAdmin ? "Fjern admin" : "Gjør til admin"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Assign to Workspace Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Legg til arbeidsområde</DialogTitle>
              <DialogDescription>
                Velg et arbeidsområde for {selectedUser?.name || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg arbeidsområde" />
                </SelectTrigger>
                <SelectContent>
                  {selectedUser &&
                    getAvailableWorkspaces(selectedUser).map((workspace) => (
                      <SelectItem key={workspace.id} value={workspace.id}>
                        {workspace.name} ({workspace._count.users} medlemmer)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAssignDialogOpen(false)}
                >
                  Avbryt
                </Button>
                <Button
                  onClick={handleAssignToWorkspace}
                  disabled={!selectedWorkspace || isPending}
                >
                  {isPending ? "Legger til..." : "Legg til"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}