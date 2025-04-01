import { useEffect } from "react";
import { useLocation } from "wouter";
import { logOut } from "../../firebase";
import { showStatusMessage } from "./StatusMessage";

type NavigateHelperProps = {
  action: 'signup' | 'logout';
};

export default function NavigateHelper({ action }: NavigateHelperProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const performAction = async () => {
      try {
        if (action === 'signup') {
          setLocation('/signup');
          return;
        }

        if (action === 'logout') {
          await logOut();
          showStatusMessage("Logged out successfully");
          setLocation('/login');
          return;
        }
      } catch (error) {
        console.error(`Error during ${action}:`, error);
        showStatusMessage(`Failed to ${action === 'logout' ? 'log out' : 'navigate to signup'}`, true);
      }
    };

    performAction();
  }, [action, setLocation]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
}