import { Link } from "wouter";
import { Task } from "@shared/schema";

type TaskCardProps = {
  task: Task;
};

export default function TaskCard({ task }: TaskCardProps) {
  const progress = ((task.totalSlots - task.remainingSlots) / task.totalSlots) * 100;
  
  // Mask the owner's email
  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    return `${username.charAt(0)}***@${domain.charAt(0)}***${domain.slice(-4)}`;
  };
  
  return (
    <div className="bg-neutral-800 p-3 rounded-lg relative overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121]"></div>
      
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] flex items-center justify-center mr-2">
          <span className="text-sm font-bold">QR</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-sm font-semibold truncate">{task.name}</h3>
          <p className="text-xs text-gray-400 truncate">Owner: {maskEmail("user@example.com")}</p>
        </div>
      </div>
      
      <div className="text-sm mb-1">Price: ₦{task.price}</div>
      <div className="text-xs mb-1">
        Slots Left: {task.remainingSlots}/{task.totalSlots}
      </div>
      
      <div className="h-1 bg-neutral-700 rounded mb-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121]" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <Link href={`/task/${task.id}`}>
        <button className="w-full bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] text-white text-sm py-1.5 px-3 rounded-lg">
          Start
        </button>
      </Link>
    </div>
  );
}
