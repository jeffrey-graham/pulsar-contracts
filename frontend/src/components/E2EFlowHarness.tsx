import React, { useState } from "react";

export function E2EFlowHarness() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [merchantStatus, setMerchantStatus] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState("");
  const [merchantEmail, setMerchantEmail] = useState("");
  const [merchantDesc, setMerchantDesc] = useState("");

  const [paymentAmount, setPaymentAmount] = useState("250");
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);

  const [refundOrderId, setRefundOrderId] = useState("ORD_1001");
  const [refundAmount, setRefundAmount] = useState("100");
  const [refundReason, setRefundReason] = useState("");
  const [refundStatus, setRefundStatus] = useState<string | null>(null);

  async function handleConnectWallet() {
    const freighter = (window as any).freighter;
    if (freighter?.setAllowed && freighter?.getPublicKey) {
      await freighter.setAllowed();
      const pubKey = await freighter.getPublicKey();
      setWalletAddress(pubKey);
    } else {
      setWalletAddress("GB7TAYRUZGE6TVT7NHP5SMIZRNQA6PLM423EYISAOAP3MKYIQMVYP2JO");
    }
  }

  function handleDisconnectWallet() {
    setWalletAddress(null);
  }

  async function handleRegisterMerchant(e: React.FormEvent) {
    e.preventDefault();
    if (!merchantName.trim() || !merchantEmail.includes("@") || !merchantDesc.trim()) {
      return;
    }
    setMerchantStatus(`Merchant "${merchantName.trim()}" registered on-chain`);
  }

  async function handleProcessPayment(e: React.FormEvent) {
    e.preventDefault();
    const freighter = (window as any).freighter;
    if (freighter?.signTransaction) {
      await freighter.signTransaction(
        JSON.stringify({ order_id: "ORD_1001", amount: Number(paymentAmount) }),
        { network: "TESTNET" },
      );
    }
    setPaymentTxHash("tx_pay_9f8e7d6c5b4a3210");
  }

  async function handleInitiateRefund(e: React.FormEvent) {
    e.preventDefault();
    if (!refundOrderId.trim() || !refundReason.trim()) return;
    setRefundStatus(
      `Refund RF_${refundOrderId} initiated for ${refundAmount} USDC (${refundReason.trim()})`,
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Pulsar E2E Critical Flows</h1>

      {/* 1. Wallet Connect Flow */}
      <section aria-label="Wallet Connection" data-testid="flow-wallet">
        <h2>1. Wallet Connection</h2>
        {!walletAddress ? (
          <button type="button" onClick={handleConnectWallet} data-testid="connect-wallet-btn">
            Connect Freighter
          </button>
        ) : (
          <div>
            <span data-testid="connected-wallet-address">{walletAddress}</span>
            <button type="button" onClick={handleDisconnectWallet} data-testid="disconnect-wallet-btn">
              Disconnect
            </button>
          </div>
        )}
      </section>

      {/* 2. Merchant Registration Flow */}
      <section aria-label="Merchant Registration" data-testid="flow-merchant-register">
        <h2>2. Merchant Registration</h2>
        <form onSubmit={handleRegisterMerchant}>
          <label>
            Merchant Name
            <input
              data-testid="merchant-name-input"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
            />
          </label>
          <label>
            Contact Email
            <input
              data-testid="merchant-email-input"
              value={merchantEmail}
              onChange={(e) => setMerchantEmail(e.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              data-testid="merchant-desc-input"
              value={merchantDesc}
              onChange={(e) => setMerchantDesc(e.target.value)}
            />
          </label>
          <button
            type="submit"
            data-testid="merchant-register-submit"
            disabled={!merchantName.trim() || !merchantEmail.includes("@") || !merchantDesc.trim()}
          >
            Register Merchant
          </button>
        </form>
        {merchantStatus && <p data-testid="merchant-register-status">{merchantStatus}</p>}
      </section>

      {/* 3. Payment Processing Flow */}
      <section aria-label="Payment Processing" data-testid="flow-payment">
        <h2>3. Process Payment</h2>
        <form onSubmit={handleProcessPayment}>
          <label>
            Payment Amount (USDC)
            <input
              type="number"
              data-testid="payment-amount-input"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </label>
          <button type="submit" data-testid="payment-submit-btn" disabled={!walletAddress}>
            Submit Signed Payment
          </button>
        </form>
        {paymentTxHash && (
          <p data-testid="payment-success-banner">Payment confirmed: {paymentTxHash}</p>
        )}
      </section>

      {/* 4. Refund Initiation Flow */}
      <section aria-label="Refund Initiation" data-testid="flow-refund">
        <h2>4. Initiate Refund</h2>
        <form onSubmit={handleInitiateRefund}>
          <label>
            Order ID
            <input
              data-testid="refund-order-input"
              value={refundOrderId}
              onChange={(e) => setRefundOrderId(e.target.value)}
            />
          </label>
          <label>
            Refund Amount
            <input
              type="number"
              data-testid="refund-amount-input"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          </label>
          <label>
            Refund Reason
            <input
              data-testid="refund-reason-input"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
            />
          </label>
          <button
            type="submit"
            data-testid="refund-submit-btn"
            disabled={!walletAddress || !refundReason.trim()}
          >
            Initiate Refund
          </button>
        </form>
        {refundStatus && <p data-testid="refund-status-banner">{refundStatus}</p>}
      </section>
    </div>
  );
}
