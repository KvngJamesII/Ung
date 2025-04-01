import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import NotificationsModal from "@/components/notifications/NotificationsModal";

export default function BottomNav() {
  const [location] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
  });
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
    <>
      <nav className="bg-black px-4 py-3 flex items-center justify-around relative border-t border-neutral-800 fixed bottom-0 left-0 right-0">
        <Link href="/wallet">
          <button className="p-2 rounded-full bg-neutral-800 w-12 h-12 flex items-center justify-center">
            <span className="text-xl">💰</span>
          </button>
        </Link>
        
        <Link href="/my-tasks">
          <button className="p-2 rounded-full bg-neutral-800 w-12 h-12 flex items-center justify-center">
            <span className="text-xl">📋</span>
          </button>
        </Link>
        
        <Link href="/create-task">
          <button className="p-2 rounded-full bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] w-16 h-16 flex items-center justify-center -mt-6">
            <span className="text-2xl">+</span>
          </button>
        </Link>
        
        <button 
          onClick={() => setShowNotifications(true)}
          className="p-2 rounded-full bg-neutral-800 w-12 h-12 flex items-center justify-center relative"
        >
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </nav>
      
      {showNotifications && (
        <NotificationsModal onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}
