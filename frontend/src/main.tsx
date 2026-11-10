import React from "react";
import { createRoot } from "react-dom/client";
import { PayerDashboard } from "./components/PayerDashboard";
import { E2EFlowHarness } from "./components/E2EFlowHarness";

const isE2EView =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("view") === "e2e";

createRoot(document.getElementById("root")!).render(
  isE2EView ? <E2EFlowHarness /> : <PayerDashboard />,
);
