"use client";

import { useState, useTransition, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { UserEditDialog } from "@/components/admin/user-edit-dialog";
import { MoreHorizontal, Plus, UserMinus, Edit, Search, Filter } from "lucide-react";
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterWorkspace, setFilterWorkspace] = useState<string>("all");

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

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = filterRole === "all" ||
        (filterRole === "admin" && user.isAdmin) ||
        (filterRole === "user" && !user.isAdmin);

      // Workspace filter
      const matchesWorkspace = filterWorkspace === "all" ||
        user.workspaces.some(w => w.id === filterWorkspace);

      return matchesSearch && matchesRole && matchesWorkspace;
    });
  }, [users, searchTerm, filterRole, filterWorkspace]);

  const getAvailableWorkspaces = (user: User) => {
    const userWorkspaceIds = user.workspaces.map(w => w.id);
    return workspaces.filter(w => !userWorkspaceIds.includes(w.id));
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUserUpdated = () => {
    // Optionally refresh data or show success message
    // The revalidatePath in the server action should handle the refresh
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
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Søk etter navn eller e-post..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer etter rolle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle roller</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="user">Bruker</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterWorkspace} onValueChange={setFilterWorkspace}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer etter arbeidsområde" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle arbeidsområder</SelectItem>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            Viser {filteredUsers.length} av {users.length} brukere
          </p>
        </div>

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
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Filter className="mx-auto h-8 w-8 mb-2" />
                    <p>Ingen brukere funnet</p>
                    <p className="text-sm">Prøv å justere søkekriteriene</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
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
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Rediger bruker
                      </DropdownMenuItem>
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
              ))
            )}
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

        {/* User Edit Dialog */}
        <UserEditDialog
          user={editingUser}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUserUpdated={handleUserUpdated}
        />
      </CardContent>
    </Card>
  );
}