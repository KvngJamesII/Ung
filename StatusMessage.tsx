import { useState, useEffect } from "react";
import { createEvent } from "@/lib/utils";

// Create a custom event for showing status messages
export const showStatusMessageEvent = createEvent<{
  message: string;
  isError?: boolean;
}>("showStatusMessage");

export default function StatusMessage() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleShowMessage = (event: CustomEvent<{ message: string; isError?: boolean }>) => {
      setMessage(event.detail.message);
      setIsError(!!event.detail.isError);
      setIsVisible(true);
      
      // Hide message after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };
    
    document.addEventListener(
      "showStatusMessage",
      handleShowMessage as EventListener
    );
    
    return () => {
      document.removeEventListener(
        "showStatusMessage",
        handleShowMessage as EventListener
      );
    };
  }, []);
  
  if (!message) return null;
  
  return (
    <div
      className={`fixed bottom-5 left-0 right-0 mx-auto w-4/5 max-w-md p-3 rounded-lg ${
        isError ? "bg-red-900 border border-red-700" : "bg-neutral-900 border border-neutral-700"
      } text-center shadow-lg transform transition-transform duration-300 z-50 ${
        isVisible ? "translate-y-0" : "translate-y-24"
      }`}
    >
      <p>{message}</p>
    </div>
  );
}

// Helper function to show a status message
export function showStatusMessage(message: string, isError = false) {
  const event = new CustomEvent("showStatusMessage", {
    detail: { message, isError },
  });
  document.dispatchEvent(event);
}
