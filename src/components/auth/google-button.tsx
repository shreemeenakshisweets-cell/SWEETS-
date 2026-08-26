"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GoogleGlyph } from "@/components/icons/social";
import { signInWithGoogleAction } from "@/app/(auth)/actions";

export function GoogleButton() {
  const [loading, setLoading] = React.useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await signInWithGoogleAction();
    if (result.error || !result.url) {
      toast.error(result.error ?? "Could not start Google sign-in");
      setLoading(false);
      return;
    }
    window.location.href = result.url;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full gap-2"
      onClick={handleClick}
      disabled={loading}
    >
      <GoogleGlyph className="size-4" />
      Continue with Google
    </Button>
  );
}
