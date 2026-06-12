import { ReceiptText } from "lucide-react";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="grid gap-6 p-6 shadow-xl">
      <div className="grid gap-3 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-200">
          <ReceiptText size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">KhataKholo</h1>
          <p className="mt-1 text-sm text-slate-500">Login to your room khata</p>
        </div>
      </div>

      <LoginForm />

      <div className="rounded-xl bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
        💡 Ask your room admin for the room code and your PIN.
      </div>

      <p className="text-center text-sm text-slate-500">
        New room?{" "}
        <Link href="/create-room" className="font-semibold text-emerald-700 hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  );
}
