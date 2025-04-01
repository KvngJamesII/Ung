import { useParams } from "wouter";
import Header from "@/components/layout/Header";
import TaskDetails from "@/components/tasks/TaskDetails";

export default function TaskDetailsPage() {
  const { id } = useParams();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Task Details" showBackButton={true} />
      
      <main className="flex-1 p-4">
        <TaskDetails taskId={id} />
      </main>
    </div>
  );
}
