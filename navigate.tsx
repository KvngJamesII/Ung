import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function NavigatePage() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="bg-neutral-800 rounded-xl p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] text-transparent bg-clip-text">
          QuicRef Navigation
        </h1>
        
        <div className="space-y-4">
          <Button 
            onClick={() => setLocation("/go-to-signup")}
            className="w-full bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] hover:opacity-90 text-white font-semibold py-4 rounded-lg"
          >
            Go to Signup Page
          </Button>
          
          <Button 
            onClick={() => setLocation("/logout")}
            className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-4 rounded-lg"
          >
            Logout
          </Button>
          
          <Button 
            onClick={() => setLocation("/")}
            className="w-full border border-neutral-600 bg-transparent hover:bg-neutral-700 text-white font-semibold py-4 rounded-lg"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}