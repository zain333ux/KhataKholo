"use client";

import { useActionState, useMemo, useState } from "react";
import { ImagePlus, ReceiptText, Upload, UsersRound, X } from "lucide-react";
import Image from "next/image";

import { createExpenseAction } from "@/lib/actions/expenses";
import { calculateEqualShares } from "@/lib/calculations/splits";
import { formatRupees, rupeesToPaisa } from "@/lib/money";
import { emptyActionState } from "@/lib/validators/forms";
import type { RoommateListItem, SplitType } from "@/types/app";
import { ActionMessage } from "@/components/ui/action-message";
import { Avatar } from "@/components/ui/avatar";
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
  const [selectedIds, setSelectedIds] = useState<string[]>(roommates.map((r) => r.id));
  const [amount, setAmount] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptPublicId, setReceiptPublicId] = useState("");
  const [receiptStatus, setReceiptStatus] = useState("");
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const amountPaisa = rupeesToPaisa(amount);
  const equalPreview = useMemo(() => {
    if (!Number.isInteger(amountPaisa) || amountPaisa <= 0 || selectedIds.length === 0) return [];
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
    setReceiptStatus("Uploading receipt…");

    try {
      const signResponse = await fetch("/api/cloudinary/sign", { method: "POST" });
      const signature = (await signResponse.json()) as
        | { cloudName: string; apiKey: string; folder: string; timestamp: number; signature: string }
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

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
        { method: "POST", body: uploadData },
      );

      const uploadResult = (await uploadResponse.json()) as
        | { secure_url: string; public_id: string }
        | { error: { message: string } };

      if (!uploadResponse.ok || "error" in uploadResult) {
        throw new Error("error" in uploadResult ? uploadResult.error.message : "Upload failed.");
      }

      setReceiptUrl(uploadResult.secure_url);
      setReceiptPublicId(uploadResult.public_id);
      setReceiptStatus("Receipt uploaded ✓");
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
      {/* ── Section 1: Details ── */}
      <Card className="grid gap-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100">
            <ReceiptText size={15} className="text-emerald-700" />
          </span>
          <h3 className="font-bold text-slate-900">Expense Details</h3>
        </div>

        <Field label="Title">
          <Input name="title" placeholder="Dinner, milk, electricity bill…" required />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (₨)">
            <Input
              name="amount"
              inputMode="decimal"
              placeholder="900"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Field>
          <Field label="Date">
            <Input
              name="expenseDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Paid by">
            <Select name="paidByRoommateId" defaultValue={currentRoommateId}>
              {roommates.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Split type">
            <Select
              name="splitType"
              value={splitType}
              onChange={(e) => setSplitType(e.target.value as SplitType)}
            >
              <option value="equal">Equal</option>
              <option value="custom">Custom</option>
            </Select>
          </Field>
        </div>

        <Field label="Note (optional)">
          <Textarea name="note" placeholder="Any helpful detail for roommates…" />
        </Field>
      </Card>

      {/* ── Section 2: Included Roommates ── */}
      <Card className="grid gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-100">
            <UsersRound size={15} className="text-sky-700" />
          </span>
          <h3 className="font-bold text-slate-900">Included Roommates</h3>
          <span className="ml-auto text-xs text-slate-500">
            {selectedIds.length}/{roommates.length} selected
          </span>
        </div>

        <div className="grid gap-2">
          {roommates.map((roommate) => {
            const selected = selectedIds.includes(roommate.id);
            const preview = equalPreview.find((s) => s.roommateId === roommate.id);
            return (
              <label
                key={roommate.id}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all",
                  selected
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  name="memberIds"
                  value={roommate.id}
                  checked={selected}
                  onChange={() => toggleRoommate(roommate.id)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <Avatar name={roommate.name} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{roommate.name}</p>
                  <p className="text-xs text-slate-500">
                    {roommate.id === currentRoommateId ? "You" : roommate.login_id}
                  </p>
                </div>
                {splitType === "equal" && selected && preview ? (
                  <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    {formatRupees(preview.sharePaisa)}
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </Card>

      {/* ── Section 3: Custom shares (conditional) ── */}
      {splitType === "custom" ? (
        <Card className="grid gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100">
              <ReceiptText size={15} className="text-amber-700" />
            </span>
            <h3 className="font-bold text-slate-900">Custom Shares</h3>
          </div>
          <p className="text-xs text-slate-500">
            All custom shares must add up exactly to the total amount.
          </p>
          {roommates
            .filter((r) => selectedIds.includes(r.id))
            .map((r) => (
              <Field key={r.id} label={`${r.name}'s share (₨)`}>
                <Input name={`share_${r.id}`} inputMode="decimal" placeholder="300" required />
              </Field>
            ))}
        </Card>
      ) : null}

      {/* ── Section 4: Receipt upload ── */}
      <Card className="grid gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100">
            <ImagePlus size={15} className="text-slate-600" />
          </span>
          <h3 className="font-bold text-slate-900">Receipt (optional)</h3>
        </div>

        {receiptUrl ? (
          <div className="relative">
            <Image
              src={receiptUrl}
              alt="Receipt preview"
              width={320}
              height={220}
              className="h-auto w-full rounded-xl border border-slate-200 object-cover"
            />
            <button
              type="button"
              onClick={() => { setReceiptUrl(""); setReceiptPublicId(""); setReceiptStatus(""); }}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-rose-600 text-white shadow"
              aria-label="Remove receipt"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
            <Upload size={22} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Receipt upload: Working on it</span>
            <span className="text-xs text-slate-400">Cloudinary integration is not configured yet.</span>
          </div>
        )}

        {receiptStatus ? (
          <p className={[
            "text-xs font-medium",
            receiptStatus.includes("✓") ? "text-emerald-600" :
            isUploadingReceipt ? "text-sky-600" : "text-rose-600",
          ].join(" ")}>
            {receiptStatus}
          </p>
        ) : null}
      </Card>

      <input type="hidden" name="receiptUrl" value={receiptUrl} readOnly />
      <input type="hidden" name="receiptPublicId" value={receiptPublicId} readOnly />

      <ActionMessage state={state} />
      <Button
        type="submit"
        className="w-full"
        disabled={isPending || isUploadingReceipt || selectedIds.length === 0}
      >
        <ReceiptText size={18} />
        {isPending
          ? "Adding expense…"
          : isUploadingReceipt
          ? "Uploading receipt…"
          : "Add Expense"}
      </Button>
    </form>
  );
}
