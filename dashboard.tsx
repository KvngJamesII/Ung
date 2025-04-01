import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { logOut } from "@/firebase";
import { showStatusMessage } from "@/components/ui/StatusMessage";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("deposits");
  const [searchUserId, setSearchUserId] = useState("");
  const [addBalanceAmount, setAddBalanceAmount] = useState("");
  const [balanceType, setBalanceType] = useState("deposit");
  const [searchedUser, setSearchedUser] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch data based on active tab
  const { data: deposits = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/deposits"],
    enabled: activeTab === "deposits",
  });
  
  const { data: withdrawals = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/withdrawals"],
    enabled: activeTab === "withdrawals",
  });
  
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
  });
  
  // Admin actions mutations
  const approveDepositMutation = useMutation({
    mutationFn: (depositId: number) => {
      return apiRequest("POST", `/api/admin/deposits/${depositId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Deposit approved",
        description: "The deposit has been approved and the user's balance has been updated.",
      });
    },
  });
  
  const rejectDepositMutation = useMutation({
    mutationFn: (depositId: number) => {
      return apiRequest("POST", `/api/admin/deposits/${depositId}/reject`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      toast({
        title: "Deposit rejected",
        description: "The deposit has been rejected.",
      });
    },
  });
  
  const completeWithdrawalMutation = useMutation({
    mutationFn: (withdrawalId: number) => {
      return apiRequest("POST", `/api/admin/withdrawals/${withdrawalId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Withdrawal completed",
        description: "The withdrawal has been marked as completed.",
      });
    },
  });
  
  const searchUserMutation = useMutation({
    mutationFn: (userId: string) => {
      return apiRequest("GET", `/api/admin/users/${userId}`, {});
    },
    onSuccess: (data) => {
      setSearchedUser(data);
    },
    onError: (error: any) => {
      toast({
        title: "User not found",
        description: error.message || "No user found with that ID.",
        variant: "destructive",
      });
      setSearchedUser(null);
    },
  });
  
  const banUserMutation = useMutation({
    mutationFn: (userId: number) => {
      return apiRequest("POST", `/api/admin/users/${userId}/ban`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${searchUserId}`] });
      toast({
        title: "User banned",
        description: "The user has been banned.",
      });
      
      // Refresh user data
      if (searchUserId) {
        searchUserMutation.mutate(searchUserId);
      }
    },
  });
  
  const unbanUserMutation = useMutation({
    mutationFn: (userId: number) => {
      return apiRequest("POST", `/api/admin/users/${userId}/unban`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${searchUserId}`] });
      toast({
        title: "User unbanned",
        description: "The user has been unbanned.",
      });
      
      // Refresh user data
      if (searchUserId) {
        searchUserMutation.mutate(searchUserId);
      }
    },
  });
  
  const addBalanceMutation = useMutation({
    mutationFn: (data: { userId: number; amount: number; type: string }) => {
      return apiRequest("POST", `/api/admin/users/${data.userId}/add-balance`, {
        amount: data.amount,
        type: data.type,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${searchUserId}`] });
      toast({
        title: "Balance added",
        description: "The user's balance has been updated.",
      });
      
      // Reset form and refresh user data
      setAddBalanceAmount("");
      if (searchUserId) {
        searchUserMutation.mutate(searchUserId);
      }
    },
  });
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Handle search user
  const handleSearchUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUserId.trim()) {
      searchUserMutation.mutate(searchUserId.trim());
    }
  };
  
  // Handle add balance
  const handleAddBalance = () => {
    if (!searchedUser) return;
    
    const amount = parseFloat(addBalanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    addBalanceMutation.mutate({
      userId: searchedUser.id,
      amount,
      type: balanceType,
    });
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logOut();
      // Redirect is handled by App.tsx through authState
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "There was an error logging out.",
        variant: "destructive",
      });
    }
  };
  
  // Mask user email
  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    return `${username.charAt(0)}***@${domain.charAt(0)}***${domain.slice(-4)}`;
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-black px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold font-poppins text-transparent bg-clip-text bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121]">
          Admin Dashboard
        </h1>
        <Button onClick={handleLogout} variant="outline" className="text-sm border border-neutral-600 px-3 py-1 rounded-lg">
          Logout
        </Button>
      </header>
      
      <main className="flex-1 p-4">
        {/* Admin Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-neutral-800 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Total Users</p>
            <p className="text-xl font-bold">{stats?.userCount || 0}</p>
          </div>
          <div className="bg-neutral-800 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Active Tasks</p>
            <p className="text-xl font-bold">{stats?.activeTaskCount || 0}</p>
          </div>
        </div>
        
        {/* Admin Tabs */}
        <div className="flex border-b border-neutral-700 mb-4">
          <button
            className={`py-2 px-3 text-sm ${activeTab === "deposits" ? "border-b-2 border-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] text-white" : "text-gray-400"}`}
            onClick={() => handleTabChange("deposits")}
          >
            Deposits
          </button>
          <button
            className={`py-2 px-3 text-sm ${activeTab === "withdrawals" ? "border-b-2 border-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] text-white" : "text-gray-400"}`}
            onClick={() => handleTabChange("withdrawals")}
          >
            Withdrawals
          </button>
          <button
            className={`py-2 px-3 text-sm ${activeTab === "users" ? "border-b-2 border-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] text-white" : "text-gray-400"}`}
            onClick={() => handleTabChange("users")}
          >
            Users
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === "deposits" && (
          <div className="space-y-3">
            {deposits.length > 0 ? (
              deposits.map((deposit) => (
                <div key={deposit.id} className="bg-neutral-800 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium">User ID: {deposit.user.referralCode}</p>
                      <p className="text-xs text-gray-400">{maskEmail(deposit.user.email)}</p>
                    </div>
                    <p className="text-sm font-semibold">₦{deposit.amount}</p>
                  </div>
                  <p className="text-xs mb-2">Name: {deposit.paymentName || "N/A"}</p>
                  {deposit.paymentReceipt && (
                    <div className="mb-2">
                      <a 
                        href={`/api/deposits/${deposit.id}/receipt`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 underline"
                      >
                        View Receipt
                      </a>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => approveDepositMutation.mutate(deposit.id)}
                      disabled={approveDepositMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-lg"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => rejectDepositMutation.mutate(deposit.id)}
                      disabled={rejectDepositMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-3 rounded-lg"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-6">
                <p>No pending deposits</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "withdrawals" && (
          <div className="space-y-3">
            {withdrawals.length > 0 ? (
              withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="bg-neutral-800 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium">User ID: {withdrawal.user.referralCode}</p>
                      <p className="text-xs text-gray-400">{maskEmail(withdrawal.user.email)}</p>
                    </div>
                    <p className="text-sm font-semibold">₦{withdrawal.amount}</p>
                  </div>
                  <p className="text-xs mb-1">Network: {withdrawal.network}</p>
                  <p className="text-xs mb-2">Phone: {withdrawal.phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')}</p>
                  <Button
                    onClick={() => completeWithdrawalMutation.mutate(withdrawal.id)}
                    disabled={completeWithdrawalMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-3 rounded-lg"
                  >
                    Mark as Done
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-6">
                <p>No pending withdrawals</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "users" && (
          <div>
            <div className="mb-4">
              <form onSubmit={handleSearchUser}>
                <label className="block text-sm font-medium mb-1">Find User</label>
                <div className="flex">
                  <Input
                    type="text"
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    className="flex-1 p-3 rounded-l-lg bg-neutral-700 border-neutral-600"
                    placeholder="Enter User ID"
                  />
                  <Button
                    type="submit"
                    disabled={searchUserMutation.isPending}
                    className="bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] text-white font-medium py-2 px-4 rounded-r-lg"
                  >
                    {searchUserMutation.isPending ? "Searching..." : "Search"}
                  </Button>
                </div>
              </form>
            </div>
            
            {searchedUser && (
              <div className="bg-neutral-800 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">User Details</p>
                <p className="text-xs mb-1">ID: <span>{searchedUser.referralCode}</span></p>
                <p className="text-xs mb-1">Email: <span>{searchedUser.email}</span></p>
                <p className="text-xs mb-3">
                  Status: <span className={searchedUser.isBanned ? "text-red-400" : "text-green-400"}>
                    {searchedUser.isBanned ? "Banned" : "Active"}
                  </span>
                </p>
                
                <div className="flex space-x-2 mb-3">
                  {!searchedUser.isBanned ? (
                    <Button
                      onClick={() => banUserMutation.mutate(searchedUser.id)}
                      disabled={banUserMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-3 rounded-lg"
                    >
                      Ban User
                    </Button>
                  ) : (
                    <Button
                      onClick={() => unbanUserMutation.mutate(searchedUser.id)}
                      disabled={unbanUserMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-lg"
                    >
                      Unban User
                    </Button>
                  )}
                </div>
                
                <div className="border-t border-neutral-700 pt-3 mt-2">
                  <p className="text-xs font-medium mb-2">Add Balance</p>
                  <div className="flex">
                    <Input
                      type="number"
                      min="100"
                      value={addBalanceAmount}
                      onChange={(e) => setAddBalanceAmount(e.target.value)}
                      className="flex-1 p-2 rounded-l-lg text-sm bg-neutral-700 border-neutral-600"
                      placeholder="Amount"
                    />
                    <select
                      value={balanceType}
                      onChange={(e) => setBalanceType(e.target.value)}
                      className="p-2 text-sm bg-neutral-700 border-neutral-600 text-white"
                    >
                      <option value="deposit">Deposit</option>
                      <option value="withdrawal">Withdrawal</option>
                    </select>
                    <Button
                      onClick={handleAddBalance}
                      disabled={addBalanceMutation.isPending}
                      className="bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] text-white text-xs py-1 px-3 rounded-r-lg"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
