import { LogOut } from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="secondary" className="w-full">
        <LogOut size={18} />
        Logout
      </Button>
    </form>
  );
}

