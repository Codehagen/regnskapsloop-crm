import { getTasks } from "../actions/tasks/actions";
import { getUserWorkspaceData } from "@/lib/auth/workspace";
import TasksClient from "@/components/task/tasks-client";
import { PageLayout } from "@/components/page-layout";
import { AddTaskButtonWrapper } from "@/components/task/add-task-button-wrapper";

export default async function TasksPage() {
  const { workspaceId, userId } = await getUserWorkspaceData();
  const tasks = await getTasks(workspaceId);

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
            <p className="text-muted-foreground mt-2">Administrer oppgaver i workspace.</p>
          </div>
          <AddTaskButtonWrapper workspaceId={workspaceId} />
        </div>
        <TasksClient initialTasks={tasks} workspaceId={workspaceId} userId={userId} />
      </main>
    </PageLayout>
  );
}
