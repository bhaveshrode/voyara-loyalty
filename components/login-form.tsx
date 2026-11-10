"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="field-label">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="input"
          defaultValue="ava@voyara.club"
          required
        />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="password" className="field-label mb-0">
            Password
          </label>
          <span className="text-[10px] text-muted/70">Demo password: voyara123</span>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="input"
          defaultValue="voyara123"
          required
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-terracotta/25 bg-terracotta/10 px-4 py-3 text-[12px] leading-5 text-terracotta"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton className="mt-2 w-full" pendingLabel="Opening your wallet…">
        Sign in to Voyara
        <ArrowRight className="size-4" />
      </SubmitButton>

      <p className="pt-1 text-center text-[10px] leading-5 text-muted/70">
        By continuing you agree to the Voyara terms and privacy notice.
      </p>
    </form>
  );
}
