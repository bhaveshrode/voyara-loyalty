"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleCheck, Send, TriangleAlert } from "lucide-react";
import { awardPointsAction } from "@/app/actions/merchant";
import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/action-state";
import { formatNumber } from "@/lib/format";
import { getTier } from "@/lib/membership";

interface CampaignOption {
  id: string;
  name: string;
  points: number;
  audience: string;
}

interface MemberOption {
  id: string;
  name: string;
  email: string;
  tier: number;
}

export function IssuePointsForm({
  campaigns,
  members,
  disabled = false,
}: {
  campaigns: CampaignOption[];
  members: MemberOption[];
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(awardPointsAction, initialFormState);
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "");
  const [memberId, setMemberId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const campaign = campaigns.find((entry) => entry.id === campaignId);
  const member = members.find((entry) => entry.id === memberId);

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
    setMemberId("");
  }, [state.success]);

  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-ivory/60 px-5 py-8 text-center">
        <p className="font-display text-xl text-forest">No active campaigns yet</p>
        <p className="mx-auto mt-2 max-w-sm text-[12px] leading-5 text-muted">
          Create a campaign first. Each campaign fixes the number of points a member receives per
          qualifying transaction.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label htmlFor="issue-campaign" className="field-label">
          Campaign
        </label>
        <select
          id="issue-campaign"
          name="campaignId"
          className="input appearance-none"
          value={campaignId}
          onChange={(event) => setCampaignId(event.target.value)}
          disabled={disabled}
          required
        >
          {campaigns.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name} · {entry.points.toLocaleString("en-US")} VYA
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="issue-member" className="field-label">
          Member
        </label>
        <select
          id="issue-member"
          name="customerId"
          className="input appearance-none"
          value={memberId}
          onChange={(event) => setMemberId(event.target.value)}
          disabled={disabled}
          required
        >
          <option value="" disabled>
            Select a Voyara member
          </option>
          {members.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name} · {getTier(entry.tier).name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-line bg-ivory/70 px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.14em] text-muted">Member receives</p>
            <p className="mt-1 font-display text-2xl text-forest">
              {formatNumber(campaign?.points ?? 0)} <span className="text-[11px]">VYA</span>
            </p>
          </div>
          <div className="text-right text-[10px] leading-5 text-muted">
            <p>{member ? member.name : "No member selected"}</p>
            <p className="text-muted/65">{member?.email}</p>
          </div>
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

      <SubmitButton className="w-full" pendingLabel="Issuing on-chain…" disabled={disabled}>
        <Send className="size-4" />
        Issue points
      </SubmitButton>
    </form>
  );
}
