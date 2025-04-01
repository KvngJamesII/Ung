import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { auth } from "@/firebase";
import { Task } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type TaskDetailsProps = {
  taskId: string;
};

const proofSchema = z.object({
  textProof: z.string().optional(),
  imageProof: z.any().optional(),
}).refine(data => data.textProof || data.imageProof, {
  message: "Please provide either text proof or image proof",
  path: ["textProof"],
});

type ProofFormValues = z.infer<typeof proofSchema>;

export default function TaskDetails({ taskId }: TaskDetailsProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: task, isLoading } = useQuery<Task>({
    queryKey: [`/api/tasks/${taskId}`],
  });

  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me"],
  });

  const { data: taskCompletion } = useQuery<any>({
    queryKey: [`/api/tasks/${taskId}/completion`],
  });

  const form = useForm<ProofFormValues>({
    resolver: zodResolver(proofSchema),
    defaultValues: {
      textProof: "",
      imageProof: undefined,
    },
  });

  const submitProofMutation = useMutation({
    mutationFn: async (values: ProofFormValues) => {
      const formData = new FormData();
      if (values.textProof) {
        formData.append("textProof", values.textProof);
      }
      if (values.imageProof) {
        formData.append("imageProof", values.imageProof);
      }
      
      // Get current Firebase auth token
      const currentUser = auth.currentUser;
      let authToken = '';
      
      if (currentUser) {
        try {
          authToken = await currentUser.getIdToken(true);
        } catch (error) {
          console.error("Error getting authentication token:", error);
          throw new Error("Authentication error. Please try logging out and back in.");
        }
      } else {
        throw new Error("You must be logged in to submit a task proof.");
      }
      
      console.log("Submitting task completion with auth token:", !!authToken);
      
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}/completion`] });
      toast({
        title: "Proof submitted successfully!",
        description: "Your submission is now awaiting approval.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit proof",
        description: error.message || "There was an error submitting your proof.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ProofFormValues) => {
    submitProofMutation.mutate(values);
  };

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("imageProof", file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-4 bg-neutral-800 rounded-lg text-center my-4">
        <p>Task not found or has been deleted.</p>
      </div>
    );
  }

  // Mask the owner's email
  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    return `${username.charAt(0)}***@${domain.charAt(0)}***${domain.slice(-4)}`;
  };

  // Check if user has already completed this task
  const hasCompleted = !!taskCompletion;
  
  // Check if user is the owner of this task
  const isOwner = user?.id === task.ownerId;

  return (
    <div className="space-y-4">
      <div className="bg-neutral-800 rounded-xl p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">{task.name}</h2>
        <p className="text-sm text-gray-400 mb-2">Owner: {maskEmail("user@example.com")}</p>
        <p className="text-sm mb-4">{task.description}</p>
        
        <div className="bg-neutral-900 p-3 rounded-lg mb-4">
          <p className="text-sm font-medium mb-1">Task Link:</p>
          <a 
            href={task.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] break-all"
          >
            {task.link}
          </a>
        </div>
        
        <p className="text-base font-medium">Price: ₦{task.price}</p>
      </div>
      
      {!isOwner && !hasCompleted && (
        <div className="bg-neutral-800 rounded-xl p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3">Submit Proof</h3>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="textProof"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Proof</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe how you completed the task"
                        className="w-full p-3 rounded-lg bg-neutral-700 border-neutral-600"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Image Proof</FormLabel>
                <div className="bg-neutral-900 border border-dashed border-neutral-600 rounded-lg p-4 text-center">
                  {previewUrl && (
                    <div className="mb-3">
                      <img src={previewUrl} alt="Proof preview" className="max-h-40 mx-auto" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <span className="bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] text-white font-medium py-2 px-4 rounded-lg inline-block">
                      Upload Image
                    </span>
                    <input
                      id="image-proof"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </FormItem>
              
              <Button 
                type="submit" 
                disabled={submitProofMutation.isPending}
                className="w-full bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all"
              >
                {submitProofMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Proof ✅"
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}
      
      {hasCompleted && (
        <div className="bg-neutral-800 rounded-xl p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3">Submission Status</h3>
          <div className="p-3 bg-neutral-900 rounded-lg">
            {taskCompletion.status === "pending" && (
              <p className="text-yellow-400">Your submission is pending approval</p>
            )}
            {taskCompletion.status === "approved" && (
              <p className="text-green-400">Your submission has been approved! ₦{task.price} has been added to your balance.</p>
            )}
            {taskCompletion.status === "rejected" && (
              <p className="text-red-400">Your submission was rejected. Please contact the task owner.</p>
            )}
          </div>
        </div>
      )}
      
      {isOwner && (
        <div className="bg-neutral-800 rounded-xl p-4 mb-4">
          <p className="text-yellow-400 text-center">You cannot complete your own task.</p>
        </div>
      )}
    </div>
  );
}
