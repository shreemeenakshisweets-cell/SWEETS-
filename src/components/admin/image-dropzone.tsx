"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadProductImageAction } from "@/app/admin/products/actions";
import { getActionErrorMessage } from "@/lib/utils/errors";
import { cn } from "@/lib/utils";

type PendingUpload = { key: string; previewUrl: string };

/**
 * Drag-and-drop (or click-to-browse) image uploader for product photos.
 * Each dropped/selected file uploads to Supabase Storage immediately via
 * uploadProductImageAction; the resulting URLs are the controlled `value`.
 */
export function ImageDropzone({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const [pending, setPending] = React.useState<PendingUpload[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      toast.error("Only image files are allowed");
      return;
    }

    const uploads: PendingUpload[] = list.map((file) => ({
      key: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      previewUrl: URL.createObjectURL(file),
    }));
    setPending((prev) => [...prev, ...uploads]);

    await Promise.all(
      list.map(async (file, i) => {
        const { key, previewUrl } = uploads[i];
        try {
          const formData = new FormData();
          formData.append("file", file);
          const result = await uploadProductImageAction(formData);
          if (result.error || !result.url) {
            toast.error(result.error ?? "Upload failed");
          } else {
            onChange([...value, result.url]);
          }
        } catch (error) {
          toast.error(getActionErrorMessage(error));
        } finally {
          URL.revokeObjectURL(previewUrl);
          setPending((prev) => prev.filter((p) => p.key !== key));
        }
      })
    );
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
  }

  function removeImage(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDraggingOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <ImagePlus className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag &amp; drop images here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground/70">JPG, PNG, or WebP — up to 5MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {(value.length > 0 || pending.length > 0) && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {value.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(url);
                }}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {pending.map((p) => (
            <div
              key={p.key}
              className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob: preview, not a remote image next/image can optimize */}
              <img src={p.previewUrl} alt="" className="size-full object-cover opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Loader2 className="size-5 animate-spin text-white" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
