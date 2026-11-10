import { test, expect } from "@playwright/test";

const MOCK_WALLET_ADDRESS =
  "GB7TAYRUZGE6TVT7NHP5SMIZRNQA6PLM423EYISAOAP3MKYIQMVYP2JO";

test.describe("Pulsar Frontend Critical User Flows (FE-015)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((walletAddress: string) => {
      (window as any).freighter = {
        setAllowed: async () => true,
        getPublicKey: async () => walletAddress,
        signTransaction: async (xdr: string) => ({
          signedXDR: `signed:${xdr}`,
        }),
      };
    }, MOCK_WALLET_ADDRESS);
  });

  test("1. Wallet Connect flow: connects Freighter wallet and displays public key", async ({
    page,
  }) => {
    await page.goto("/?view=e2e");

    await expect(page.getByTestId("connect-wallet-btn")).toBeVisible();
    await page.getByTestId("connect-wallet-btn").click();

    await expect(page.getByTestId("connected-wallet-address")).toHaveText(
      MOCK_WALLET_ADDRESS,
    );

    await page.getByTestId("disconnect-wallet-btn").click();
    await expect(page.getByTestId("connect-wallet-btn")).toBeVisible();
  });

  test("2. Merchant Registration flow: validates fields and registers merchant", async ({
    page,
  }) => {
    await page.goto("/?view=e2e");

    const submitBtn = page.getByTestId("merchant-register-submit");
    await expect(submitBtn).toBeDisabled();

    await page.getByTestId("merchant-name-input").fill("Acme Stellar Coffee");
    await page.getByTestId("merchant-email-input").fill("ops@acmecoffee.io");
    await page
      .getByTestId("merchant-desc-input")
      .fill("Specialty coffee accepting Soroban USDC and XLM.");

    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    await expect(page.getByTestId("merchant-register-status")).toHaveText(
      'Merchant "Acme Stellar Coffee" registered on-chain',
    );
  });

  test("3. Process Payment flow: connects wallet, signs order, and confirms payment", async ({
    page,
  }) => {
    await page.goto("/?view=e2e");

    const payBtn = page.getByTestId("payment-submit-btn");
    await expect(payBtn).toBeDisabled();

    await page.getByTestId("connect-wallet-btn").click();
    await expect(payBtn).toBeEnabled();

    await page.getByTestId("payment-amount-input").fill("500");
    await payBtn.click();

    await expect(page.getByTestId("payment-success-banner")).toContainText(
      "Payment confirmed: tx_pay_9f8e7d6c5b4a3210",
    );
  });

  test("4. Initiate Refund flow: validates refund reason and submits refund request", async ({
    page,
  }) => {
    await page.goto("/?view=e2e");

    await page.getByTestId("connect-wallet-btn").click();

    const refundBtn = page.getByTestId("refund-submit-btn");
    await expect(refundBtn).toBeDisabled();

    await page.getByTestId("refund-order-input").fill("ORD_2048");
    await page.getByTestId("refund-amount-input").fill("150");
    await page.getByTestId("refund-reason-input").fill("Customer requested partial refund");

    await expect(refundBtn).toBeEnabled();
    await refundBtn.click();

    await expect(page.getByTestId("refund-status-banner")).toHaveText(
      "Refund RF_ORD_2048 initiated for 150 USDC (Customer requested partial refund)",
    );
  });
});
