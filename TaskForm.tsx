import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const taskSchema = z.object({
  name: z.string().min(3, "Task name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  link: z.string().url("Please enter a valid URL"),
  totalSlots: z.number().min(1, "You need at least 1 user").max(100, "Maximum 100 users"),
  price: z.number().min(100, "Minimum price is ₦100"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function TaskForm() {
  const [loading, setLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me"],
  });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      description: "",
      link: "",
      totalSlots: 1,
      price: 100,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (values: TaskFormValues) => {
      return apiRequest("POST", "/api/tasks", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Task created successfully!",
        description: "Your task is now available for others to complete.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create task",
        description: error.message || "There was an error creating your task.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: TaskFormValues) => {
    const totalCost = values.totalSlots * values.price;
    
    // Check if user has enough balance
    if (user && user.depositBalance < totalCost) {
      toast({
        title: "Insufficient Funds",
        description: "Please fund your wallet to create this task.",
        variant: "destructive",
      });
      return;
    }
    
    // Create the task
    createTaskMutation.mutate(values);
  };

  // Calculate total cost whenever task users or price changes
  const totalCost = form.watch("totalSlots") * form.watch("price") || 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Give your task a name"
                  className="w-full p-3 rounded-lg bg-neutral-700 border-neutral-600"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what users need to do"
                  className="w-full p-3 rounded-lg bg-neutral-700 border-neutral-600"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Link</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  className="w-full p-3 rounded-lg bg-neutral-700 border-neutral-600"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="totalSlots"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How many users do you need?</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  className="w-full p-3 rounded-lg bg-neutral-700 border-neutral-600"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How much will you pay per user? (₦)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={100}
                  className="w-full p-3 rounded-lg bg-neutral-700 border-neutral-600"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="bg-neutral-800 p-3 rounded-lg">
          <p className="font-medium mb-1">Total Cost:</p>
          <p className="text-xl">₦{totalCost.toLocaleString()}</p>
          <p className="text-xs text-gray-400">This amount will be deducted from your wallet balance</p>
        </div>
        
        <Button 
          type="submit" 
          disabled={createTaskMutation.isPending}
          className="w-full bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all"
        >
          {createTaskMutation.isPending ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Creating Task...</span>
            </div>
          ) : (
            "Create Task"
          )}
        </Button>
      </form>
    </Form>
  );
}
