import React, { useEffect } from "react";

export interface TransactionConfirmationModalProps {
  /** Whether the confirmation modal is currently visible. */
  isOpen: boolean;
  /** Type of contract transaction being confirmed ("Payment" or "Refund"). */
  transactionType: "Payment" | "Refund";
  /** Payment or refund amount. */
  amount: number | string;
  /** Optional token identifier or contract address. */
  token?: string;
  /** Recipient Stellar address (merchant for payments, payer for refunds). */
  recipient: string;
  /** Optional order or refund reference ID. */
  orderId?: string;
  /** Estimated network/resource fees (defaults to "~0.01 XLM"). */
  estimatedFee?: string;
  /** Whether submission is currently in progress. */
  isSubmitting?: boolean;
  /** Invoked when the user explicitly confirms submission. */
  onConfirm: () => void;
  /** Invoked when the user cancels and returns to the previous screen. */
  onCancel: () => void;
}

/**
 * Confirmation modal presented before submitting a payment or refund
 * transaction on-chain so the user can review transaction details first.
 */
export function TransactionConfirmationModal({
  isOpen,
  transactionType,
  amount,
  token,
  recipient,
  orderId,
  estimatedFee = "~0.01 XLM (100,000 stroops)",
  isSubmitting = false,
  onConfirm,
  onCancel,
}: TransactionConfirmationModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-confirm-modal-title"
      data-testid="tx-confirmation-modal"
    >
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg space-y-4">
        <div className="space-y-1">
          <h3
            id="tx-confirm-modal-title"
            className="text-lg font-semibold text-[var(--color-text)]"
          >
            Confirm {transactionType}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            Please review the transaction details below before signing and submitting to Stellar.
          </p>
        </div>

        <dl className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] p-3 text-sm">
          <div className="flex justify-between py-2">
            <dt className="text-[var(--color-text-muted)]">Transaction Type</dt>
            <dd className="font-semibold text-[var(--color-text)]" data-testid="confirm-tx-type">
              {transactionType}
            </dd>
          </div>

          {orderId && (
            <div className="flex justify-between py-2">
              <dt className="text-[var(--color-text-muted)]">Order ID</dt>
              <dd className="font-mono text-[var(--color-text)]" data-testid="confirm-order-id">
                {orderId}
              </dd>
            </div>
          )}

          <div className="flex justify-between py-2">
            <dt className="text-[var(--color-text-muted)]">Amount</dt>
            <dd className="font-medium text-[var(--color-text)]" data-testid="confirm-amount">
              {amount}
              {token ? ` ${token}` : ""}
            </dd>
          </div>

          <div className="flex justify-between py-2">
            <dt className="text-[var(--color-text-muted)]">Recipient</dt>
            <dd
              className="font-mono truncate max-w-[200px] text-[var(--color-text)]"
              title={recipient}
              data-testid="confirm-recipient"
            >
              {recipient}
            </dd>
          </div>

          <div className="flex justify-between py-2">
            <dt className="text-[var(--color-text-muted)]">Estimated Fees</dt>
            <dd className="text-[var(--color-text)]" data-testid="confirm-estimated-fees">
              {estimatedFee}
            </dd>
          </div>
        </dl>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-black/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            {isSubmitting ? "Submitting…" : `Confirm ${transactionType}`}
          </button>
        </div>
      </div>
    </div>
  );
}
