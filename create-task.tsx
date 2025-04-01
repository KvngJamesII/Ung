import Header from "@/components/layout/Header";
import TaskForm from "@/components/tasks/TaskForm";

export default function CreateTaskPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Create Task" showBackButton={true} />
      
      <main className="flex-1 p-4">
        <TaskForm />
      </main>
    </div>
  );
}
