import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatCurrency } from "@/lib/utils";
import StatusMessage from "@/components/ui/StatusMessage";
import { queryClient } from "@/lib/queryClient";
// Define types locally to avoid import issues
type Task = {
  id: number;
  name: string;
  description: string;
  link: string;
  price: number;
  totalSlots: number;
  remainingSlots: number;
  ownerId: number;
  createdAt: string;
  isCompleted: boolean;
};

type TaskCompletion = {
  id: number;
  taskId: number;
  userId: number;
  textProof: string | null;
  imageProof: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
};

export default function MyTasksPage() {
  const { toast } = useToast();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  
  // Get all tasks created by the current user
  const { 
    data: myTasks, 
    isLoading: tasksLoading, 
    error: tasksError 
  } = useQuery({
    queryKey: ['/api/my-tasks'],
    queryFn: async () => {
      // Get Firebase token for authorization
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Authentication required');
      }
      
      const res = await fetch('/api/my-tasks', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to load tasks');
      }
      return res.json() as Promise<Task[]>;
    }
  });
  
  // Get completions for the selected task
  const { 
    data: completions, 
    isLoading: completionsLoading, 
    error: completionsError 
  } = useQuery({
    queryKey: ['/api/my-tasks', selectedTaskId, 'completions'],
    queryFn: async () => {
      if (!selectedTaskId) return [];
      
      // Get Firebase token for authorization
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Authentication required');
      }
      
      const res = await fetch(`/api/my-tasks/${selectedTaskId}/completions`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to load task completions');
      }
      return res.json() as Promise<(TaskCompletion & { 
        user: { id: number, username: string, email: string } 
      })[]>;
    },
    enabled: !!selectedTaskId
  });
  
  const handleReview = async (completionId: number, status: 'approved' | 'rejected') => {
    try {
      // Get Firebase token for authorization
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Authentication required');
      }
      
      const res = await fetch(`/api/tasks/completions/${completionId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `Failed to ${status} task`);
      }
      
      // Success feedback
      toast({
        title: status === 'approved' ? 'Task Approved' : 'Task Rejected',
        description: status === 'approved' 
          ? 'The user has been credited for this task' 
          : 'The submission has been marked as rejected',
        variant: status === 'approved' ? 'default' : 'destructive',
      });
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/my-tasks', selectedTaskId, 'completions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Render loading state
  if (tasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/90 pb-16">
        <Header title="My Tasks" showBackButton={true} backTo="/" />
        <main className="container px-4 py-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-28" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }
  
  // Render error state
  if (tasksError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/90 pb-16">
        <Header title="My Tasks" showBackButton={true} backTo="/" />
        <main className="container px-4 py-4">
          <div className="p-4 rounded-lg bg-destructive/20 text-destructive">
            <p>Failed to load your tasks. Please try again later.</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 pb-16">
      <StatusMessage />
      <Header title="My Tasks" showBackButton={true} backTo="/" />
      
      <main className="container px-4 py-4">
        {myTasks && myTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You haven't created any tasks yet.</p>
            <Button className="mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" onClick={() => window.location.href = '/create-task'}>
              Create Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {myTasks?.map((task) => (
              <Card key={task.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{task.name}</CardTitle>
                      <CardDescription className="text-sm">
                        Created on {new Date(task.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div>
                      <Badge variant={task.isCompleted ? "secondary" : "outline"}>
                        {task.isCompleted ? "Completed" : "Active"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="line-clamp-2">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span>{formatCurrency(task.price)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {task.remainingSlots}/{task.totalSlots} slots left
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                  >
                    {selectedTaskId === task.id ? "Hide Submissions" : "View Submissions"}
                    {selectedTaskId === task.id ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </CardFooter>
                
                {selectedTaskId === task.id && (
                  <div className="px-4 pb-4">
                    {completionsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : completions && completions.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {completions.map((completion) => (
                          <AccordionItem key={completion.id} value={`item-${completion.id}`}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{completion.user.username}</span>
                                  <Badge variant={
                                    completion.status === 'approved' ? "success" :
                                    completion.status === 'rejected' ? "destructive" : 
                                    "outline"
                                  }>
                                    {completion.status.charAt(0).toUpperCase() + completion.status.slice(1)}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(completion.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4">
                                {completion.textProof && (
                                  <div className="bg-muted/50 p-3 rounded-md">
                                    <p className="text-sm text-muted-foreground mb-1">Text Proof:</p>
                                    <p className="text-sm">{completion.textProof}</p>
                                  </div>
                                )}
                                
                                {completion.imageProof && (
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Image Proof:</p>
                                    <a 
                                      href={`/uploads/proofs/${completion.imageProof}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary underline text-sm"
                                    >
                                      View Uploaded Image
                                    </a>
                                  </div>
                                )}
                                
                                {completion.status === 'pending' && (
                                  <div className="flex gap-2 mt-2">
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                                      onClick={() => handleReview(completion.id, 'approved')}
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                                      onClick={() => handleReview(completion.id, 'rejected')}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                                
                                {completion.reviewedAt && (
                                  <div className="text-xs text-muted-foreground">
                                    Reviewed on {new Date(completion.reviewedAt).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        No submissions yet for this task.
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}