# Task Page Improvements

Implementation of improvements to the tasks page to match the patterns used in the leads page for better UX.

## Completed Tasks

- [x] Research current task implementation
- [x] Research kanban-view.tsx toast and revalidation patterns  
- [x] Research skeleton loading patterns used in other components

## In Progress Tasks

- [ ] Test all functionality end-to-end

## Completed Tasks

- [x] Research current task implementation
- [x] Research kanban-view.tsx toast and revalidation patterns  
- [x] Research skeleton loading patterns used in other components
- [x] Update TasksClient to add toast notifications for status changes
- [x] Implement proper error handling with revert functionality
- [x] Create TasksSkeleton component for loading states
- [x] Update tasks page to use Suspense with skeleton

## Future Tasks

- [ ] Add empty state handling for tasks (when no tasks exist)
- [ ] Add search functionality for tasks (similar to leads)
- [ ] Implement task filtering by assignee or business
- [ ] Add bulk task actions (mark multiple as complete, etc.)

## Implementation Plan

Based on research, we need to implement the following patterns from the leads page:

### 1. Toast Notifications
- Import `toast` from "sonner" in TasksClient
- Add success toast when task status changes successfully
- Add error toast when status change fails
- Include detailed information in toast (task name, old status → new status)

### 2. Error Handling & Revert
- Store original tasks state before optimistic update
- Revert local state if API call fails
- Show appropriate error message to user

### 3. Skeleton Loading
- Create TasksSkeleton component similar to KanbanSkeleton
- Use Suspense wrapper in tasks page
- Show skeleton during initial load and transitions

### 4. Revalidation
- Already implemented in updateTaskStatus action
- Ensure proper revalidatePath calls for /tasks and related business pages

## Relevant Files

- src/app/tasks/page.tsx - Main tasks page ✅
- src/components/task/tasks-client.tsx - Client component ✅
- src/components/task/kanban-view.tsx - Task kanban view
- src/app/actions/tasks/actions.ts - Server actions (already has revalidatePath) ✅
- src/components/task/tasks-skeleton.tsx - New skeleton component ✅
- src/components/lead/leads-client.tsx - Reference implementation ✅
- src/components/lead/kanban-view.tsx - Reference kanban view ✅

## Architecture Decisions

1. **Follow Leads Pattern**: Mirror the exact pattern used in LeadsClient for consistency
2. **Optimistic Updates**: Update local state immediately, revert on error
3. **Rich Toast Messages**: Include task name and status transition details
4. **Skeleton Loading**: Use consistent skeleton patterns across the app
5. **Error Boundaries**: Graceful error handling with user feedback

## Data Flow

```
User drags task → Optimistic UI update → API call → Success toast | Error toast + revert
Page load → Show skeleton → Load data → Hide skeleton → Show content
```

## Technical Components Needed

1. **TasksSkeleton Component**
   - Similar structure to KanbanSkeleton
   - Support for task kanban columns (ikke_startet, pabegynt, ferdig)
   - Configurable number of task cards per column

2. **Enhanced TasksClient**
   - Toast import and usage
   - Error handling with state revert
   - Loading states management
   - Optimistic updates

3. **Suspense Integration**
   - Wrap TasksClient in Suspense
   - Use TasksSkeleton as fallback
   - Ensure server components are properly async 