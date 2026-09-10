import { randomBytes } from "node:crypto";
import path from "node:path";

/**
 * THE STORAGE BOUNDARY.
 *
 * One interface, one driver today (`local`), and a second (`r2`) later without
 * touching a caller. That is the entire reason this file exists: object storage
 * is the dependency most likely to change, and the change is only cheap if
 * every upload in the product already goes through one door.
 *
 * Two rules from `docs/SECURITY.md` §4 are enforced *here* rather than at the
 * call sites, because a call site that forgets one produces a working feature
 * with a hole in it:
 *
 *  1. **The stored name is generated, never the uploaded one.** A filename is
 *     metadata. The moment it becomes a path, `../../etc/passwd` and
 *     `report.pdf.exe` are both our problem.
 *  2. **The type is decided by the bytes, not by the extension or the
 *     client-supplied MIME type.** Both of the latter are attacker-controlled
 *     strings; the first few bytes of the file are not.
 */

export type StoredObject = {
  /** The generated key. Opaque, unguessable, and never derived from user input. */
  key: string;
  sizeBytes: number;
  /** SHA-256 of the content, so a re-upload of identical bytes is detectable. */
  checksum: string;
};

export interface StorageProvider {
  readonly name: string;
  put(key: string, data: Uint8Array): Promise<StoredObject>;
  get(key: string): Promise<Uint8Array | null>;
  /** Bytes at rest, for the per-group quota. */
  size(key: string): Promise<number | null>;
  delete(key: string): Promise<void>;
}

/* ------------------------------------------------------------------- keys */

/**
 * A storage key.
 *
 * Shaped `groups/<groupId>/<random>.<ext>` — the prefix makes a group's objects
 * enumerable for quota and cleanup, the random segment makes an individual
 * object unguessable, and the extension is taken from the *verified* type, not
 * from what the browser sent.
 */
export function storageKey(scope: string, scopeId: string, extension: string): string {
  const safeScope = scope.replace(/[^a-z]/g, "");
  const safeId = scopeId.replace(/[^A-Za-z0-9_-]/g, "");
  const safeExt = extension.replace(/[^a-z0-9]/g, "").slice(0, 8);

  return `${safeScope}/${safeId}/${randomBytes(16).toString("hex")}${safeExt ? `.${safeExt}` : ""}`;
}

/**
 * The uploaded filename, reduced to something safe to show and to send back in
 * a `Content-Disposition`.
 *
 * This is display metadata. It is never a path — `storageKey()` decides that —
 * but a filename still reaches a header and a download dialog, so control
 * characters, quotes and directory separators come out here.
 */
export function sanitiseFilename(input: string): string {
  const base = path
    .basename(input.replace(/\\/g, "/"))
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/["'\\]/g, "")
    .trim();

  const cleaned = base.replace(/^\.+/, "").slice(0, 120);
  return cleaned.length > 0 ? cleaned : "file";
}
