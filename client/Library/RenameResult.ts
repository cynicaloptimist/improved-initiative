/**
 * Result returned by an inline rename command.
 *
 * Failures are recoverable: the editor keeps the draft active and presents
 * the supplied message without applying the requested rename.
 */
export type RenameResult =
  | { success: true }
  | { success: false; error: string };
