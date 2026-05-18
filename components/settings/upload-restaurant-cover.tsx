"use client";

import { useRef, useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/es";

export function UploadRestaurantCover() {
  const { refresh } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setMessage(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/restaurant/cover", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data?.error?.message ||
          (typeof data?.error === "string" ? data.error : null) ||
          copy.errors.generic;
        setError(msg);
        return;
      }
      setMessage(copy.settings.coverUploadSuccess);
      await refresh();
    } catch {
      setError(copy.errors.generic);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={onFileChange}
        disabled={uploading}
      />
      <Button
        type="button"
        variant="secondary"
        fullWidth
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? copy.settings.coverUploading : copy.settings.coverUploadCta}
      </Button>
      <p className="text-[11px] leading-5 text-ink-soft">
        {copy.settings.coverUploadHint}
      </p>
      {message ? (
        <p className="text-center text-sm text-olive">{message}</p>
      ) : null}
      {error ? (
        <p className="text-center text-sm text-terracotta">{error}</p>
      ) : null}
    </div>
  );
}
