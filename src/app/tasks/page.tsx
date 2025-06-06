import { Suspense } from "react";
import { getTasks } from "../actions/tasks/actions";
import { getUserWorkspaceData } from "@/lib/auth/workspace";
import TasksClient from "@/components/task/tasks-client";
import { PageLayout } from "@/components/page-layout";
import { AddTaskButtonWrapper } from "@/components/task/add-task-button-wrapper";
import { TasksSkeleton } from "@/components/task/tasks-skeleton";

async function TasksContent() {
  const { workspaceId, userId } = await getUserWorkspaceData();
  const tasks = await getTasks(workspaceId);

  return (
    <TasksClient
      initialTasks={tasks}
      workspaceId={workspaceId}
      userId={userId}
    />
  );
}

function TasksLoading() {
  return (
    <div>
      <div className="mb-4">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all">
            Alle
          </div>
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all">
            Mine
          </div>
        </div>
      </div>
      <TasksSkeleton />
    </div>
  );
}

export default async function TasksPage() {
  const { workspaceId } = await getUserWorkspaceData();

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Oppgaver", isCurrentPage: true },
      ]}
    >
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Oppgaver</h1>
            <p className="text-muted-foreground mt-2">
              Administrer oppgaver i workspace.
            </p>
          </div>
          <AddTaskButtonWrapper workspaceId={workspaceId} />
        </div>
        <Suspense fallback={<TasksLoading />}>
          <TasksContent />
        </Suspense>
      </main>
    </PageLayout>
  );
}
