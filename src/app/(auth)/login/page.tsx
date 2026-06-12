import { ReceiptText } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="grid gap-6 p-5">
      <div className="grid gap-2 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-emerald-700 text-white">
          <ReceiptText size={25} />
        </div>
        <h1 className="text-2xl font-bold text-slate-950">KhataKholo</h1>
        <p className="text-sm text-slate-500">Login with your room code and PIN.</p>
      </div>
      <LoginForm />
    </Card>
  );
}

