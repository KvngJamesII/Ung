import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Header from "@/components/layout/Header";
import FundWalletModal from "@/components/wallet/FundWalletModal";
import WithdrawModal from "@/components/wallet/WithdrawModal";
import { Button } from "@/components/ui/button";

export default function WalletPage() {
  const [showFundModal, setShowFundModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  
  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me"],
  });
  
  const { data: transactions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
  });
  
  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  
  // Format transaction type
  const formatTransactionType = (type: string) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "withdrawal":
        return "Withdrawal";
      case "task_credit":
        return "Task Credit";
      case "task_debit":
        return "Task Debit";
      case "referral_bonus":
        return "Referral Bonus";
      default:
        return type;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM, yyyy • h:mm a");
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Wallet" showBackButton={true} />
      
      <main className="flex-1 p-4">
        <div className="bg-neutral-800 rounded-xl p-4 mb-4">
          <h2 className="text-gray-400 text-sm mb-1">Wallet Balance</h2>
          <p className="text-2xl font-bold">₦{user?.depositBalance || 0}</p>
          <p className="text-xs text-gray-400">Available for creating tasks</p>
        </div>
        
        <div className="bg-neutral-800 rounded-xl p-4 mb-6">
          <h2 className="text-gray-400 text-sm mb-1">Withdrawal Balance</h2>
          <p className="text-2xl font-bold">₦{user?.withdrawableBalance || 0}</p>
          <p className="text-xs text-gray-400">Available for withdrawal</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setShowFundModal(true)}
            className="bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] hover:opacity-90 text-white font-semibold"
          >
            Fund Wallet
          </Button>
          <Button
            onClick={() => setShowWithdrawModal(true)}
            variant="outline"
            className="bg-neutral-800 border border-neutral-600 text-white font-semibold"
          >
            Withdraw
          </Button>
        </div>
        
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Transaction Log</h2>
          {isLoading ? (
            <div className="flex justify-center my-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="space-y-2">
                {currentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-neutral-800 p-3 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{formatTransactionType(transaction.type)}</p>
                      <p className="text-xs text-gray-400">{formatDate(transaction.createdAt)}</p>
                    </div>
                    <p className={`text-sm font-semibold ${
                      transaction.type === "withdrawal" || transaction.type === "task_debit"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}>
                      {transaction.type === "withdrawal" || transaction.type === "task_debit" ? "-" : "+"}
                      ₦{transaction.amount}
                    </p>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-between mt-4">
                  <Button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="ghost"
                    className="text-sm text-gray-400"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="ghost"
                    className="text-sm text-gray-400"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 py-6">
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </main>
      
      {showFundModal && <FundWalletModal onClose={() => setShowFundModal(false)} />}
      {showWithdrawModal && <WithdrawModal onClose={() => setShowWithdrawModal(false)} />}
    </div>
  );
}
