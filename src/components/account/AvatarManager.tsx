"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { removeAvatar, uploadAvatar } from "@/lib/auth/actions";
import { validateAvatarFile } from "@/lib/profile/schema";
import { Banner, Button } from "@/components/ui/controls";
import { Avatar, ConfirmDialog, useToast } from "@/components/ui/primitives";

export function AvatarManager({ name, url, hasAvatar }: { name: string; url: string | null; hasAvatar: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  function pick(file: File | undefined) {
    setError(null);
    if (!file) return;
    const err = validateAvatarFile(file);
    if (err) return setError(err);
    if (preview) URL.revokeObjectURL(preview);
    setPending(file);
    setPreview(URL.createObjectURL(file));
  }

  function discard() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPending(null);
    if (input.current) input.current.value = "";
  }

  async function save() {
    if (!pending) return;
    setBusy(true);
    const res = await uploadAvatar(pending);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    discard();
    toast("success", "Profile picture updated.");
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    const res = await removeAvatar();
    setBusy(false);
    setConfirmRemove(false);
    if (!res.ok) return toast("error", res.error);
    toast("success", "Profile picture removed.");
    router.refresh();
  }

  return (
    <section className="card" aria-labelledby="av">
      <h2 id="av">Profile picture</h2>
      <p className="page-sub">JPEG, PNG or WebP. It is cropped to a square and stored privately; only you can access the file.</p>
      <div className="avatar-row">
        <Avatar url={preview ?? url} name={name} size={96} />
        <div className="stack" style={{ margin: 0 }}>
          {error ? <Banner kind="error">{error}</Banner> : null}
          <input ref={input} id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])} />
          {pending ? (
            <div className="form-actions" style={{ marginTop: 0 }}>
              <Button inline onClick={save} loading={busy}>Save picture</Button>
              <Button variant="outline" inline onClick={discard} disabled={busy}>Cancel</Button>
            </div>
          ) : (
            <div className="form-actions" style={{ marginTop: 0 }}>
              <label htmlFor="avatar-file" className="btn btn-outline btn-inline" style={{ cursor: "pointer" }}>
                {hasAvatar ? "Replace picture" : "Upload picture"}
              </label>
              {hasAvatar ? <Button variant="outline" inline onClick={() => setConfirmRemove(true)}>Remove</Button> : null}
            </div>
          )}
          {!hasAvatar && !pending ? <p className="field-hint">No picture yet; your initials are shown instead.</p> : null}
        </div>
      </div>
      <ConfirmDialog open={confirmRemove} title="Remove profile picture?" confirmLabel="Remove" danger busy={busy}
        onConfirm={remove} onCancel={() => setConfirmRemove(false)}>
        <p>Your picture will be deleted and your initials will be shown instead.</p>
      </ConfirmDialog>
    </section>
  );
}
