import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

type HeaderProps = {
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
};

export default function Header({ title = "QuicRef", showBackButton = false, backTo = "/" }: HeaderProps) {
  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me"],
  });

  return (
    <header className="bg-black px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
      <div className="flex items-center">
        {showBackButton && (
          <Link href={backTo}>
            <button className="mr-4 text-xl">&larr;</button>
          </Link>
        )}
        {!showBackButton && (
          <Link href="/profile">
            <button className="text-2xl">👤</button>
          </Link>
        )}
      </div>
      
      <h1 className="text-2xl font-bold font-poppins text-transparent bg-clip-text bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121]">
        {title}
      </h1>
      
      {!showBackButton && (
        <div className="text-xl">
          🏦: <span>₦{user?.withdrawableBalance || 0}</span>
        </div>
      )}
      
      {showBackButton && <div className="w-8"></div>}
    </header>
  );
}
