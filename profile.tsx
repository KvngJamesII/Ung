import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logOut } from "@/firebase";
import { showStatusMessage } from "@/components/ui/StatusMessage";
import { queryClient } from "@/lib/queryClient";

export default function ProfilePage() {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me"],
  });
  
  const { data: referrals = [] } = useQuery<any[]>({
    queryKey: ["/api/referrals"],
  });
  
  const totalReferralEarnings = referrals.reduce((sum, referral) => sum + referral.bonus, 0);
  
  const handleCopyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setIsCopied(true);
      showStatusMessage("Referral code copied to clipboard");
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };
  
  const [_, setLocation] = useLocation();
  
  const handleLogout = async () => {
    try {
      console.log("Logging out user...");
      
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
  
  // Get first letter of email for profile avatar
  const getInitial = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : "U";
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Profile" showBackButton={true} />
      
      <main className="flex-1 p-4">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] flex items-center justify-center mb-2">
            <span className="text-2xl font-bold">{getInitial(user.email)}</span>
          </div>
          <p className="text-sm text-gray-400 mb-1">User ID: <span>{user.referralCode}</span></p>
          <p className="text-base">{user.email}</p>
        </div>
        
        <div className="bg-neutral-800 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Referral Program</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-neutral-900 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Total Users Invited</p>
              <p className="text-xl font-bold">{referrals.length}</p>
            </div>
            <div className="bg-neutral-900 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Total Amount Earned</p>
              <p className="text-xl font-bold">₦{totalReferralEarnings}</p>
            </div>
          </div>
          
          <div className="bg-neutral-900 p-3 rounded-lg mb-3">
            <p className="text-sm text-gray-400 mb-1">Your Referral Code</p>
            <div className="flex">
              <Input
                type="text"
                value={user.referralCode}
                readOnly
                className="flex-1 bg-neutral-700 p-2 rounded-l-lg border-r-0 border-neutral-600"
              />
              <Button
                onClick={handleCopyReferralCode}
                className="bg-neutral-700 px-3 rounded-r-lg border-l-0 border-neutral-600"
              >
                {isCopied ? "✓" : "📋"}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-gray-400">
            Invite your friends and earn 5% withdrawable bonus anytime they make a deposit
          </p>
        </div>
        
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border border-neutral-600 text-white font-semibold py-3 px-4 rounded-lg"
        >
          Logout
        </Button>
      </main>
    </div>
  );
}
