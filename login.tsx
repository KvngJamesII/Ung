import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10">
      <h1 className="text-3xl font-bold font-poppins mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121]">
        QuicRef
      </h1>
      
      <LoginForm />
    </div>
  );
}
