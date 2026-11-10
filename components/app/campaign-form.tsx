"use client";

import { useActionState, useEffect, useRef } from "react";
import { CircleCheck, Megaphone, TriangleAlert } from "lucide-react";
import { createCampaignAction } from "@/app/actions/merchant";
import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/action-state";

export function CampaignForm() {
  const [state, formAction] = useActionState(createCampaignAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label htmlFor="campaign-name" className="field-label">
          Campaign name
        </label>
        <input
          id="campaign-name"
          name="name"
          className="input"
          placeholder="e.g. Late-summer terrace dinners"
          minLength={3}
          maxLength={80}
          required
        />
      </div>

      <div>
        <label htmlFor="campaign-description" className="field-label">
          Description
        </label>
        <textarea
          id="campaign-description"
          name="description"
          className="input min-h-[92px] resize-none py-3"
          placeholder="What should members do, and what do they receive?"
          minLength={12}
          maxLength={240}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="campaign-points" className="field-label">
            Points per transaction
          </label>
          <input
            id="campaign-points"
            name="points"
            type="number"
            inputMode="numeric"
            min={10}
            max={10000}
            step={1}
            defaultValue={150}
            className="input font-mono"
            required
          />
        </div>
        <div>
          <label htmlFor="campaign-audience" className="field-label">
            Audience
          </label>
          <select id="campaign-audience" name="audience" className="input appearance-none" defaultValue="All members">
            <option>All members</option>
            <option>Voyager &amp; Luminary</option>
            <option>Luminary</option>
            <option>New members</option>
          </select>
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

      <SubmitButton className="w-full" pendingLabel="Creating campaign…">
        <Megaphone className="size-4" />
        Launch campaign
      </SubmitButton>
    </form>
  );
}
