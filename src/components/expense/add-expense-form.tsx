"use client";

import { useActionState, useMemo, useState } from "react";
import { ReceiptText, UsersRound } from "lucide-react";
import Image from "next/image";

import { createExpenseAction } from "@/lib/actions/expenses";
import { calculateEqualShares } from "@/lib/calculations/splits";
import { formatRupees, rupeesToPaisa } from "@/lib/money";
import { emptyActionState } from "@/lib/validators/forms";
import type { RoommateListItem, SplitType } from "@/types/app";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

export function AddExpenseForm({
  roommates,
  currentRoommateId,
}: {
  roommates: RoommateListItem[];
  currentRoommateId: string;
}) {
  const [state, formAction, isPending] = useActionState(createExpenseAction, emptyActionState);
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [selectedIds, setSelectedIds] = useState<string[]>(roommates.map((roommate) => roommate.id));
  const [amount, setAmount] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptPublicId, setReceiptPublicId] = useState("");
  const [receiptStatus, setReceiptStatus] = useState("");
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const amountPaisa = rupeesToPaisa(amount);
  const equalPreview = useMemo(() => {
    if (!Number.isInteger(amountPaisa) || amountPaisa <= 0 || selectedIds.length === 0) {
      return [];
    }

    return calculateEqualShares(amountPaisa, selectedIds);
  }, [amountPaisa, selectedIds]);

  function toggleRoommate(roommateId: string) {
    setSelectedIds((current) =>
      current.includes(roommateId)
        ? current.filter((id) => id !== roommateId)
        : [...current, roommateId],
    );
  }

  async function uploadReceipt(file: File) {
    if (!file.type.startsWith("image/")) {
      setReceiptStatus("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setReceiptStatus("Receipt image must be 5 MB or smaller.");
      return;
    }

    setIsUploadingReceipt(true);
    setReceiptStatus("Uploading receipt...");

    try {
      const signResponse = await fetch("/api/cloudinary/sign", { method: "POST" });
      const signature = (await signResponse.json()) as
        | {
            cloudName: string;
            apiKey: string;
            folder: string;
            timestamp: number;
            signature: string;
          }
        | { error: string };

      if (!signResponse.ok || "error" in signature) {
        throw new Error("error" in signature ? signature.error : "Could not sign upload.");
      }

      const uploadData = new FormData();
      uploadData.set("file", file);
      uploadData.set("api_key", signature.apiKey);
      uploadData.set("timestamp", String(signature.timestamp));
      uploadData.set("signature", signature.signature);
      uploadData.set("folder", signature.folder);

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
        method: "POST",
        body: uploadData,
      });

      const uploadResult = (await uploadResponse.json()) as
        | { secure_url: string; public_id: string }
        | { error: { message: string } };

      if (!uploadResponse.ok || "error" in uploadResult) {
        throw new Error("error" in uploadResult ? uploadResult.error.message : "Upload failed.");
      }

      setReceiptUrl(uploadResult.secure_url);
      setReceiptPublicId(uploadResult.public_id);
      setReceiptStatus("Receipt uploaded.");
    } catch (error) {
      setReceiptUrl("");
      setReceiptPublicId("");
      setReceiptStatus(error instanceof Error ? error.message : "Receipt upload failed.");
    } finally {
      setIsUploadingReceipt(false);
    }
  }

  return (
    <form action={formAction} className="grid gap-4">
      <Card className="grid gap-4">
        <Field label="Title">
          <Input name="title" placeholder="Dinner, milk, electricity bill" required />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount">
            <Input
              name="amount"
              inputMode="decimal"
              placeholder="900"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </Field>
          <Field label="Date">
            <Input name="expenseDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </Field>
        </div>

        <Field label="Paid by">
          <Select name="paidByRoommateId" defaultValue={currentRoommateId}>
            {roommates.map((roommate) => (
              <option key={roommate.id} value={roommate.id}>
                {roommate.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Split type">
          <Select name="splitType" value={splitType} onChange={(event) => setSplitType(event.target.value as SplitType)}>
            <option value="equal">Equal</option>
            <option value="custom">Custom</option>
          </Select>
        </Field>

        <Field label="Note optional">
          <Textarea name="note" placeholder="Any helpful detail for roommates" />
        </Field>

        <Field label="Receipt image optional" hint="Upload a receipt or payment screenshot before adding the expense.">
          <Input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadReceipt(file);
              }
            }}
          />
        </Field>
        {receiptStatus ? <p className="text-sm font-medium text-slate-600">{receiptStatus}</p> : null}
        {receiptUrl ? (
          <Image
            src={receiptUrl}
            alt="Receipt preview"
            width={320}
            height={220}
            className="h-auto w-full rounded-lg border border-slate-200 object-cover"
          />
        ) : null}
      </Card>

      <Card className="grid gap-3">
        <div className="flex items-center gap-2">
          <UsersRound size={18} className="text-emerald-700" />
          <h3 className="font-bold text-slate-950">Included roommates</h3>
        </div>
        <div className="grid gap-2">
          {roommates.map((roommate) => {
            const selected = selectedIds.includes(roommate.id);
            const preview = equalPreview.find((share) => share.roommateId === roommate.id);

            return (
              <label
                key={roommate.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="memberIds"
                    value={roommate.id}
                    checked={selected}
                    onChange={() => toggleRoommate(roommate.id)}
                    className="h-5 w-5 accent-emerald-700"
                  />
                  <div>
                    <p className="font-semibold text-slate-950">{roommate.name}</p>
                    <p className="text-xs text-slate-500">{roommate.id === currentRoommateId ? "You" : roommate.login_id}</p>
                  </div>
                </div>
                {splitType === "equal" && selected && preview ? (
                  <span className="text-sm font-bold text-slate-700">{formatRupees(preview.sharePaisa)}</span>
                ) : null}
              </label>
            );
          })}
        </div>
      </Card>

      {splitType === "custom" ? (
        <Card className="grid gap-3">
          <div className="flex items-center gap-2">
            <ReceiptText size={18} className="text-amber-600" />
            <h3 className="font-bold text-slate-950">Custom shares</h3>
          </div>
          {roommates
            .filter((roommate) => selectedIds.includes(roommate.id))
            .map((roommate) => (
              <Field key={roommate.id} label={`${roommate.name}'s share`}>
                <Input name={`share_${roommate.id}`} inputMode="decimal" placeholder="300" required />
              </Field>
            ))}
          <p className="text-xs text-slate-500">Custom shares must add up exactly to the total amount.</p>
        </Card>
      ) : null}

      <input type="hidden" name="receiptUrl" value={receiptUrl} readOnly />
      <input type="hidden" name="receiptPublicId" value={receiptPublicId} readOnly />
      <ActionMessage state={state} />
      <Button type="submit" disabled={isPending || isUploadingReceipt || selectedIds.length === 0}>
        <ReceiptText size={18} />
        {isPending ? "Adding expense..." : isUploadingReceipt ? "Uploading receipt..." : "Add expense"}
      </Button>
    </form>
  );
}
