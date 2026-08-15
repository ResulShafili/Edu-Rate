"use client";

import { Camera, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { uploadSecureImage, type MediaAsset, type MediaKind } from "../lib/media-upload";

type SecureImagePickerProps = {
  kind: MediaKind;
  ownerId?: string;
  currentUrl?: string | null;
  onChange?: (asset: MediaAsset | null) => void;
  compact?: boolean;
};

export function SecureImagePicker({ kind, ownerId, currentUrl, onChange, compact = false }: SecureImagePickerProps) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [urlOverride, setUrlOverride] = useState<string | null>(null);
  const url = urlOverride ?? currentUrl ?? "";

  async function choose(file?: File) {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const asset = await uploadSecureImage(file, kind, ownerId);
      setUrlOverride(asset.secureUrl);
      setMessage("Şəkil təhlükəsiz şəkildə yükləndi.");
      onChange?.(asset);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Şəkil yüklənmədi.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    setBusy(true);
    setMessage("");
    try {
      const id = kind === "avatar" ? "me" : ownerId;
      if (!id) throw new Error("Şəklin aid olduğu qeyd tapılmadı.");
      const response = await fetch(`/api/media/${kind}/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(payload?.error?.message ?? "Şəkil silinmədi.");
      }
      setUrlOverride("");
      setMessage("Şəkil silindi.");
      onChange?.(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Şəkil silinmədi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`secure-image-picker${compact ? " is-compact" : ""}`}>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" hidden onChange={(event) => void choose(event.target.files?.[0])} />
      {url ? <span className="secure-image-preview" style={{ backgroundImage: `url("${url}")` }} aria-label="Yüklənmiş şəkil" /> : <span className="secure-image-placeholder"><Camera size={18} /></span>}
      <div>
        <button type="button" disabled={busy} onClick={() => input.current?.click()}><UploadCloud size={14} />{busy ? "Yüklənir…" : url ? "Şəkli dəyiş" : "Şəkil seç"}</button>
        {url ? <button type="button" className="is-danger" disabled={busy} onClick={() => void remove()}><Trash2 size={13} />Sil</button> : null}
        <small>JPG, PNG və ya WebP · {kind === "avatar" ? "maksimum 2 MB" : "maksimum 5 MB"}. Yalnız paylaşmaq hüququn olan şəkli yüklə.</small>
        {message ? <p role="status">{message}</p> : null}
      </div>
    </div>
  );
}
