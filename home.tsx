import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import TaskCard from "@/components/tasks/TaskCard";
import { Button } from "@/components/ui/button";
import { logOut } from "@/firebase";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";

export default function HomePage() {
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me"],
  });
  
  const { data: completedTaskIds = [] } = useQuery<number[]>({
    queryKey: ["/api/tasks/completed"],
  });
  
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      console.log("Logging out user from homepage...");
      
      // First clear all queries from the cache to prevent stale data
      queryClient.clear();
      
      // Then perform the actual logout
      await logOut();
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      // Manually redirect to login page
      setLocation("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "There was an error logging out.",
        variant: "destructive",
      });
    }
  };
  
  // Filter out tasks that the user created or has already completed
  const availableTasks = tasks.filter(task => 
    task.ownerId !== user?.id && 
    !completedTaskIds.includes(task.id) &&
    !task.isCompleted
  );
  
  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header />
      
      <main className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : availableTasks.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {availableTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="col-span-2 flex items-center justify-center h-60 text-gray-400 text-center">
            <p>No available tasks for now</p>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
