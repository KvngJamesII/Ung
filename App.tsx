import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Pages
import HomePage from "@/pages/home";
import SignupPage from "@/pages/signup";
import LoginPage from "@/pages/login";
import WalletPage from "@/pages/wallet";
import ProfilePage from "@/pages/profile";
import CreateTaskPage from "@/pages/create-task";
import TaskDetailsPage from "@/pages/task-details";
import MyTasksPage from "@/pages/my-tasks";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import NavigatePage from "@/pages/navigate";
import NotFound from "@/pages/not-found";

// Components
import StatusMessage from "@/components/ui/StatusMessage";
import NavigateHelper from "@/components/ui/NavigateHelper";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        // Check if user is admin
        if (user.email === "adedayomichael333@gmail.com") {
          setIsAdmin(true);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Wait until authentication state is determined
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-black text-white font-inter">
        <Switch>
          {/* Public routes */}
          <Route path="/signup">
            {isAuthenticated ? <HomePage /> : <SignupPage />}
          </Route>
          <Route path="/login">
            {isAuthenticated ? <HomePage /> : <LoginPage />}
          </Route>
          <Route path="/admin/login">
            {isAdmin ? <AdminDashboardPage /> : <AdminLoginPage />}
          </Route>

          {/* Protected routes */}
          <Route path="/">
            {isAuthenticated ? <HomePage /> : <LoginPage />}
          </Route>
          <Route path="/wallet">
            {isAuthenticated ? <WalletPage /> : <LoginPage />}
          </Route>
          <Route path="/profile">
            {isAuthenticated ? <ProfilePage /> : <LoginPage />}
          </Route>
          <Route path="/create-task">
            {isAuthenticated ? <CreateTaskPage /> : <LoginPage />}
          </Route>
          <Route path="/task/:id">
            {isAuthenticated ? <TaskDetailsPage /> : <LoginPage />}
          </Route>
          <Route path="/my-tasks">
            {isAuthenticated ? <MyTasksPage /> : <LoginPage />}
          </Route>
          <Route path="/admin">
            {isAdmin ? <AdminDashboardPage /> : <AdminLoginPage />}
          </Route>
          
          {/* Navigation page route */}
          <Route path="/navigate">
            <NavigatePage />
          </Route>
          
          {/* Navigation helper routes */}
          <Route path="/go-to-signup">
            <NavigateHelper action="signup" />
          </Route>
          <Route path="/logout">
            <NavigateHelper action="logout" />
          </Route>

          {/* Fallback */}
          <Route>
            <NotFound />
          </Route>
        </Switch>

        <StatusMessage />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
