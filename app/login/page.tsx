"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError } from "@/lib/auth/map-auth-error";
import { obtenerUserRestaurant } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copy } from "@/lib/copy/es";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialMode = params.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setError(copy.auth.errors.missingEnv);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    let result;
    try {
      result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });
    } catch {
      setLoading(false);
      setError(copy.auth.errors.connection);
      return;
    }

    if (result.error) {
      setLoading(false);
      setError(mapAuthError(result.error));
      return;
    }

    // Registro con confirmación de email activada: no hay sesión aún
    if (mode === "register" && result.data.user && !result.data.session) {
      setLoading(false);
      setSuccess(copy.auth.confirmEmail);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError(
        mode === "register"
          ? copy.auth.confirmEmail
          : copy.auth.errors.invalidCredentials,
      );
      return;
    }

    let destination = "/onboarding";
    try {
      const restaurante = await obtenerUserRestaurant(user.id);
      if (restaurante) destination = "/insights";
    } catch {
      // Sin tablas aún o error de red — igualmente ir a onboarding
    }

    setLoading(false);
    router.replace(destination);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-5 py-10">
      <Link href="/" className="text-sm text-ink-soft hover:text-ink">
        ← Volver
      </Link>
      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
        {copy.brand.name}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{copy.brand.tagline}</p>

      <div className="mt-8 flex rounded-xl border border-border bg-card p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
              setSuccess(null);
            }}
            className={[
              "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
              mode === m
                ? "bg-terracotta text-white"
                : "text-ink-soft hover:text-ink",
            ].join(" ")}
          >
            {m === "login" ? copy.auth.login : copy.auth.register}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm text-ink-soft">
          {copy.auth.email}
          <Input
            className="mt-1"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm text-ink-soft">
          {copy.auth.password}
          <Input
            className="mt-1"
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error ? (
          <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-lg bg-olive/10 px-3 py-2 text-sm text-olive">
            {success}
          </p>
        ) : null}

        <Button type="submit" fullWidth disabled={loading}>
          {loading
            ? copy.auth.loading
            : mode === "login"
              ? copy.auth.submitLogin
              : copy.auth.submitRegister}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-soft">
        {copy.auth.protected}
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<p className="p-10 text-center text-ink-soft">Cargando…</p>}
    >
      <LoginForm />
    </Suspense>
  );
}
