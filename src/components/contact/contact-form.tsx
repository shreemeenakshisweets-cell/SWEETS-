"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessageAction } from "@/app/(shop)/contact/actions";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/validation/contact";
import { getActionErrorMessage } from "@/lib/utils/errors";

export function ContactForm() {
  const [sent, setSent] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageInput>({ resolver: zodResolver(contactMessageSchema) });

  async function onSubmit(values: ContactMessageInput) {
    try {
      const result = await sendContactMessageAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSent(true);
      reset();
    } catch (error) {
      toast.error(getActionErrorMessage(error));
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border p-8 text-center">
        <CheckCircle2 className="size-10 text-primary" />
        <h2 className="font-heading text-lg font-semibold text-foreground">Message sent</h2>
        <p className="text-sm text-muted-foreground">
          Thanks for reaching out — we&apos;ll get back to you soon.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" autoComplete="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} {...register("message")} />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>
      <Button type="submit" size="lg" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
