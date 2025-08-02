"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface WorkspaceMember {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  createdAt: Date;
}

interface WorkspaceMembersProps {
  members: WorkspaceMember[];
}

export function WorkspaceMembers({ members }: WorkspaceMembersProps) {
  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teammedlemmer</CardTitle>
          <CardDescription>
            Ingen medlemmer funnet i dette arbeidsområdet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teammedlemmer</CardTitle>
        <CardDescription>
          Alle brukere som har tilgang til dette arbeidsområdet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {member.name
                    ? member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : member.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {member.name || "Ingen navn"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {member.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ble med {new Date(member.createdAt).toLocaleDateString("nb-NO")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {member.isAdmin && (
                <Badge variant="secondary">Administrator</Badge>
              )}
              <Badge variant="outline">Medlem</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}