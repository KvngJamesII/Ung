import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/firebase";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Simple initialization - removed Google redirect handling

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      console.log("Attempting login for:", values.email);
      
      // Special case for admin login
      if (values.email === "adedayomichael333@gmail.com" && values.password === "isr828") {
        const firebaseUser = await signIn(values.email, values.password);
        console.log("Admin login successful, UID:", firebaseUser.uid);
        
        // Force fresh token
        await firebaseUser.getIdToken(true);
        
        // Invalidate any cached user data
        queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
        
        setLocation("/admin");
        return;
      }

      // Normal user login
      const firebaseUser = await signIn(values.email, values.password);
      console.log("User login successful, UID:", firebaseUser.uid);
      
      // Force fresh token
      await firebaseUser.getIdToken(true);
      
      // Wait a moment for token propagation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Invalidate any cached user data
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      
      toast({
        title: "Logged in successfully!",
        description: "Welcome back to QuicRef.",
      });
      
      setLocation("/");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-neutral-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-6 text-center">Welcome back</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full p-3 rounded-lg bg-neutral-700 border-neutral-600"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Form>
      
      {/* Removed Google Sign In Button */}

      <p className="text-center mt-4 text-sm">
        Don't have an account? 
        <a href="/signup" className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] font-medium ml-1">
          Sign up here
        </a>
      </p>
      
      {/* Admin Login Link */}
      <div className="mt-6 pt-4 border-t border-neutral-700">
        <p className="text-center text-xs text-neutral-500">
          <a href="/admin/login" className="hover:text-neutral-400">
            Admin Login
          </a>
        </p>
      </div>
    </div>
  );
}
