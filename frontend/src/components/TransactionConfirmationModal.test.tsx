import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TransactionConfirmationModal } from "./TransactionConfirmationModal";
import { CheckoutWidget } from "./CheckoutWidget";

describe("TransactionConfirmationModal (#106)", () => {
  test("renders transaction type, amount, recipient, and estimated fees", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(
      <TransactionConfirmationModal
        isOpen={true}
        transactionType="Payment"
        amount={2500}
        token="USDC"
        recipient="GMERCHANT1234567890"
        orderId="ORD-99"
        estimatedFee="~0.01 XLM"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-tx-type")).toHaveTextContent("Payment");
    expect(screen.getByTestId("confirm-order-id")).toHaveTextContent("ORD-99");
    expect(screen.getByTestId("confirm-amount")).toHaveTextContent("2500 USDC");
    expect(screen.getByTestId("confirm-recipient")).toHaveTextContent("GMERCHANT1234567890");
    expect(screen.getByTestId("confirm-estimated-fees")).toHaveTextContent("~0.01 XLM");
  });

  test("requires explicit confirmation in CheckoutWidget before signing and allows Cancel without side effects", async () => {
    const mockSignTransaction = jest.fn().mockResolvedValue({ signedXDR: "signed-xdr" });
    (window as any).freighter = {
      setAllowed: jest.fn().mockResolvedValue(true),
      getPublicKey: jest.fn().mockResolvedValue("GPAYER_WALLET"),
      signTransaction: mockSignTransaction,
    };

    render(
      <CheckoutWidget
        orderId="order_106"
        amount={1500}
        token="USDC"
        merchantAddress="GMERCHANT_ADDR"
      />
    );

    // Connect wallet
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));
    });

    // Click Pay Now -> opens confirmation modal instead of immediately signing
    fireEvent.click(screen.getByRole("button", { name: /pay now/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(mockSignTransaction).not.toHaveBeenCalled();

    // Click Cancel -> closes modal without calling signTransaction
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockSignTransaction).not.toHaveBeenCalled();

    // Re-open and click Confirm Payment -> triggers signing
    fireEvent.click(screen.getByRole("button", { name: /pay now/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /confirm payment/i }));
    });
    expect(mockSignTransaction).toHaveBeenCalledTimes(1);
  });
});
