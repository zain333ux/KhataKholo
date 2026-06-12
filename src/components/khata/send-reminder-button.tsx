"use client";

import { startTransition, useActionState } from "react";
import { MessageCircle } from "lucide-react";

import { sendReminderAction } from "@/lib/actions/reminders";
import { formatRupees, paisaToRupees } from "@/lib/money";
import { emptyActionState } from "@/lib/validators/forms";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";

function normalizeWhatsappPhone(phone: string | null): string {
  if (!phone) {
    return "";
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `92${digits.slice(1)}`;
  }

  return digits;
}

export function SendReminderButton({
  toRoommateId,
  toName,
  toPhone,
  amountPaisa,
}: {
  toRoommateId: string;
  toName: string;
  toPhone: string | null;
  amountPaisa: number;
}) {
  const [state, formAction, isPending] = useActionState(sendReminderAction, emptyActionState);
  const message = `Hi ${toName}, you have pending balance of ${formatRupees(amountPaisa)} in Room Khata. Please clear it when possible.`;
  const phone = normalizeWhatsappPhone(toPhone);
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  function handleReminder() {
    const formData = new FormData();
    formData.set("toRoommateId", toRoommateId);
    formData.set("amount", paisaToRupees(amountPaisa));
    formData.set("message", message);

    startTransition(() => {
      formAction(formData);
    });

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-2">
      <Button type="button" variant="secondary" onClick={handleReminder} disabled={isPending}>
        <MessageCircle size={18} />
        {isPending ? "Saving reminder..." : "WhatsApp reminder"}
      </Button>
      <ActionMessage state={state} />
    </div>
  );
}

