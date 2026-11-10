import { useState, useCallback, useRef, useEffect } from "react";

export type CopyStatus = "idle" | "copied" | "error";

function isClipboardApiAvailable(): boolean {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return false;
  }
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return false;
  }
  return typeof navigator.clipboard.writeText === "function";
}

function copyViaExecCommand(text: string): boolean {
  if (typeof document === "undefined" || typeof document.execCommand !== "function") {
    return false;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
  return ok;
}

export function useCopyToClipboard(resetDelay = 2000) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      try {
        if (isClipboardApiAvailable()) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for non-secure origins or browsers without Clipboard API
          const ok = copyViaExecCommand(text);
          if (!ok) {
            throw new Error("Unable to copy to clipboard on this origin");
          }
        }
        setErrorMessage(null);
        setStatus("copied");
      } catch (err) {
        setErrorMessage(
          err instanceof Error && err.message
            ? err.message
            : "Unable to copy to clipboard",
        );
        setStatus("error");
      } finally {
        timerRef.current = setTimeout(() => {
          setStatus("idle");
          setErrorMessage(null);
        }, resetDelay);
      }
    },
    [resetDelay],
  );

  return { copy, status, errorMessage };
}
