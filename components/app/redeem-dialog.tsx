"use client";

import { useActionState, useEffect, useState } from "react";
import { CircleCheck, Lock, TriangleAlert, X } from "lucide-react";
import { redeemRewardAction } from "@/app/actions/rewards";
import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/action-state";
import { cn, formatNumber } from "@/lib/format";

interface RedeemReward {
  id: string;
  title: string;
  cost: number;
  merchantName: string;
  image: string;
  location: string;
}

export function RedeemDialog({
  reward,
  balance,
}: {
  reward: RedeemReward;
  balance: number;
}) {
  const [open, setOpen] = useState(false);
  const affordable = balance >= reward.cost;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!affordable}
        title={affordable ? undefined : `You need ${formatNumber(reward.cost - balance)} more VYA`}
        className={cn("btn btn-sm", affordable ? "btn-dark" : "btn-outline opacity-55")}
      >
        {affordable ? "Redeem" : "Need more VYA"}
      </button>
      {open ? <RedeemModal reward={reward} balance={balance} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function RedeemModal({
  reward,
  balance,
  onClose,
}: {
  reward: RedeemReward;
  balance: number;
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(redeemRewardAction, initialFormState);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-forest-deep/65 backdrop-blur-sm"
        aria-label="Close redemption dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Redeem ${reward.title}`}
        className="relative w-full max-w-md overflow-hidden rounded-[26px] border border-line bg-cream shadow-card"
      >
        <div className="relative h-36 overflow-hidden">
          <img src={reward.image} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/25 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-forest-deep/55 text-ivory backdrop-blur transition hover:bg-forest-deep/80"
          >
            <X className="size-4" />
          </button>
          <div className="absolute inset-x-5 bottom-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory/60">
              {reward.merchantName} · {reward.location}
            </p>
            <h2 className="mt-1 font-display text-2xl text-ivory">{reward.title}</h2>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {state.success ? (
            <div className="text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-moss/30 bg-moss/10 text-forest-soft">
                <CircleCheck className="size-6" strokeWidth={1.6} />
              </span>
              <h3 className="mt-4 font-display text-2xl text-forest">Reward secured</h3>
              <p className="mt-2 text-[12px] leading-5 text-muted">{state.success}</p>
              <button type="button" onClick={onClose} className="btn btn-dark mt-5 w-full">
                Back to the marketplace
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-2xl border border-line bg-ivory/70 px-4 py-3.5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-muted">Redemption cost</p>
                  <p className="mt-1 font-display text-xl text-forest">
                    {formatNumber(reward.cost)} <span className="text-[11px]">VYA</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-muted">Balance after</p>
                  <p className="mt-1 font-display text-xl text-forest/70">
                    {formatNumber(balance - reward.cost)}
                  </p>
                </div>
              </div>

              <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-muted">
                <Lock className="mt-0.5 size-3.5 shrink-0 text-moss" />
                Your points are burned by the LoyaltyManager contract and the redemption is recorded
                permanently on the local Voyara chain.
              </p>

              {state.error ? (
                <p
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-xl border border-terracotta/25 bg-terracotta/10 px-3.5 py-3 text-[11.5px] leading-5 text-terracotta"
                >
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                  {state.error}
                </p>
              ) : null}

              <form action={formAction} className="mt-5 flex gap-2.5">
                <input type="hidden" name="rewardId" value={reward.id} />
                <button type="button" onClick={onClose} className="btn btn-outline flex-1">
                  Cancel
                </button>
                <SubmitButton className="flex-[1.6]" pendingLabel="Confirming…">
                  Confirm redemption
                </SubmitButton>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
