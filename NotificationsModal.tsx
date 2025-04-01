import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { X } from "lucide-react";

type NotificationsModalProps = {
  onClose: () => void;
};

export default function NotificationsModal({ onClose }: NotificationsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
  });
  
  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => {
      return apiRequest("POST", "/api/notifications/read-all", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
  
  // Mark all notifications as read when modal is opened
  useEffect(() => {
    if (notifications.some(n => !n.isRead)) {
      markAllReadMutation.mutate();
    }
  }, [notifications]);
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-neutral-800 rounded-xl w-full max-w-md mx-auto p-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <button onClick={onClose} className="text-gray-400">
            <X size={20} />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="bg-neutral-700 p-3 rounded-lg">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs text-gray-400">{formatDate(notification.createdAt)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-400">
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
