import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser } from "@/firebase";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, "Password must contain letters and numbers"),
  referralCode: z.string().optional(),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Removed Google redirect handling

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      referralCode: "",
    },
  });

  const onSubmit = async (values: SignupValues) => {
    setLoading(true);
    try {
      console.log("Starting signup process with email:", values.email);
      
      // Create the user in Firebase
      const firebaseUser = await createUser(values.email, values.password);
      console.log("Firebase user created with UID:", firebaseUser.uid);
      
      // Once Firebase authentication is successful, create the user in our backend
      const response = await apiRequest("POST", "/api/users", {
        email: values.email,
        username: values.email.split("@")[0],
        password: values.password, // Include password for server-side storage
        referralCode: values.referralCode || "",
        uid: firebaseUser.uid,
      });
      
      const userData = await response.json();
      console.log("Backend user created:", userData);

      toast({
        title: "Account created successfully!",
        description: "You've been signed up and logged in.",
      });
      
      // Force fresh token
      await firebaseUser.getIdToken(true);
      
      // Wait a moment for token propagation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Invalidate any cached user data
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      
      setLocation("/");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "There was an error creating your account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-neutral-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-6 text-center">Create an account</h2>
      
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
                <FormLabel>Password (6 characters)</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Mix of letters and numbers"
                    className="w-full p-3 rounded-lg bg-neutral-700 border-neutral-600"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-gray-400 mt-1">Must be 6 characters with letters and numbers</p>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="referralCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referral Code (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter referral code if any"
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
                <span>Signing Up...</span>
              </div>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </Form>
      
      {/* Removed Google Sign In Button */}

      <p className="text-center mt-4 text-sm">
        Already have an account? 
        <a href="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] font-medium ml-1">
          Login here
        </a>
      </p>
    </div>
  );
}
