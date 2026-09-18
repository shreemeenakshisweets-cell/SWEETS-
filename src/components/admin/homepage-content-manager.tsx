"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import {
  saveHomepageContentAction,
  uploadHomepageImageAction,
} from "@/app/admin/homepage-content/actions";
import { getActionErrorMessage } from "@/lib/utils/errors";

export function HomepageContentManager({
  brandStoryImageUrl,
  brandStoryImageEnabled,
}: {
  brandStoryImageUrl: string;
  brandStoryImageEnabled: boolean;
}) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = React.useState(brandStoryImageUrl);
  const [enabled, setEnabled] = React.useState(brandStoryImageEnabled);
  const [isSaving, setIsSaving] = React.useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const result = await saveHomepageContentAction({
        brandStoryImageUrl: imageUrl,
        brandStoryImageEnabled: enabled,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Homepage content saved");
      router.refresh();
    } catch (error) {
      toast.error(getActionErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Homepage Content
        </h1>
        <p className="text-sm text-muted-foreground">
          One-off homepage images that don&apos;t need their own section, like the artwork
          in the &ldquo;Welcome to Shree Meenakshi&rdquo; block.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border p-5">
        <div>
          <h2 className="font-medium text-foreground">Brand-story artwork</h2>
          <p className="text-sm text-muted-foreground">
            Shown to the right of the &ldquo;Welcome to Shree Meenakshi&rdquo; text on the
            homepage. Upload a photo with a transparent background for the best blend into
            the page — it&apos;s shown as-is with a drop shadow, no cropping.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Photo</Label>
          <ImageDropzone
            value={imageUrl ? [imageUrl] : []}
            onChange={(urls) => setImageUrl(urls[urls.length - 1] ?? "")}
            uploadAction={uploadHomepageImageAction}
            maxSizeLabel="15MB"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to use the default artwork that ships with the site.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox checked={enabled} onCheckedChange={(c) => setEnabled(c === true)} />
          Show this image (turn off to show text only)
        </label>

        <Button onClick={handleSave} disabled={isSaving} className="self-start">
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
