"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowUpRight, CircleCheck, TriangleAlert } from "lucide-react";
import { transferPointsAction } from "@/app/actions/rewards";
import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/action-state";
import { cn, formatNumber, shortAddress } from "@/lib/format";

interface TransferMember {
  name: string;
  address: string;
  homeCity: string;
}

const QUICK_AMOUNTS = [100, 250, 500];

export function TransferForm({
  members,
  balance,
}: {
  members: TransferMember[];
  balance: number;
}) {
  const [state, formAction] = useActionState(transferPointsAction, initialFormState);
  const [amount, setAmount] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setAmount("");
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label htmlFor="recipient" className="field-label">
          Recipient
        </label>
        <select
          id="recipient"
          name="recipient"
          className="input appearance-none"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Select a Voyara member
          </option>
          {members.map((member) => (
            <option key={member.address} value={member.address}>
              {member.name} · {member.homeCity} · {shortAddress(member.address, 4)}
            </option>
          ))}
        </select>
        <p className="mt-2 text-[10px] text-muted/75">
          Points move wallet to wallet, instantly and irrevocably.
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="amount" className="field-label mb-0">
            Amount
          </label>
          <span className="text-[10px] text-muted/70">
            Available {formatNumber(balance)} VYA
          </span>
        </div>
        <div className="relative">
          <input
            id="amount"
            name="amount"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
            className="input pr-16 font-mono text-base"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/60">
            VYA
          </span>
        </div>
        <div className="mt-2.5 flex gap-2">
          {QUICK_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(String(value))}
              className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-semibold transition",
                amount === String(value)
                  ? "border-forest bg-forest text-ivory"
                  : "border-line text-muted hover:border-forest/40 hover:text-forest"
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-terracotta/25 bg-terracotta/10 px-3.5 py-3 text-[11.5px] leading-5 text-terracotta"
        >
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="flex items-start gap-2 rounded-xl border border-moss/30 bg-moss/10 px-3.5 py-3 text-[11.5px] leading-5 text-forest-soft">
          <CircleCheck className="mt-0.5 size-3.5 shrink-0" />
          {state.success}
        </p>
      ) : null}

      <SubmitButton className="w-full" pendingLabel="Signing transfer…">
        Send points
        <ArrowUpRight className="size-4" />
      </SubmitButton>
    </form>
  );
}
