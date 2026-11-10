import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CopyButton } from "./CopyButton";

// ── Clipboard API mock ────────────────────────────────────────────────────────

const mockWriteText = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  Object.assign(navigator, {
    clipboard: { writeText: mockWriteText },
  });
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

test("renders copy button with icon", () => {
  render(<CopyButton text="abc123" />);
  expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
});

test("shows 'Copied!' and live region after successful copy", async () => {
  mockWriteText.mockResolvedValue(undefined);
  render(<CopyButton text="abc123" />);

  await act(async () => {
    fireEvent.click(screen.getByRole("button"));
  });

  expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard");
});

test("shows error state and error tooltip when clipboard write fails", async () => {
  mockWriteText.mockRejectedValue(new Error("Clipboard permission denied"));
  render(<CopyButton text="abc123" />);

  await act(async () => {
    fireEvent.click(screen.getByRole("button"));
  });

  expect(screen.getByRole("button", { name: /copy failed/i })).toBeInTheDocument();
  expect(screen.getByRole("tooltip")).toHaveTextContent("Clipboard permission denied");
});

test("resets to idle after resetDelay", async () => {
  mockWriteText.mockResolvedValue(undefined);
  render(<CopyButton text="abc123" />);

  await act(async () => {
    fireEvent.click(screen.getByRole("button"));
  });
  expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(2000);
  });
  expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
});

test("falls back to execCommand when clipboard API is absent", async () => {
  // Remove clipboard API
  Object.assign(navigator, { clipboard: undefined });
  const execSpy = jest.spyOn(document, "execCommand").mockReturnValue(true);

  render(<CopyButton text="fallback" />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button"));
  });

  expect(execSpy).toHaveBeenCalledWith("copy");
  expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
  execSpy.mockRestore();
});

test("falls back to execCommand on non-secure origins (window.isSecureContext === false)", async () => {
  const prevSecure = window.isSecureContext;
  Object.defineProperty(window, "isSecureContext", {
    value: false,
    configurable: true,
  });
  const execSpy = jest.spyOn(document, "execCommand").mockReturnValue(true);

  render(<CopyButton text="http-origin" />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button"));
  });

  expect(mockWriteText).not.toHaveBeenCalled();
  expect(execSpy).toHaveBeenCalledWith("copy");
  expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();

  execSpy.mockRestore();
  Object.defineProperty(window, "isSecureContext", {
    value: prevSecure,
    configurable: true,
  });
});

test("shows error tooltip when neither Clipboard API nor execCommand is available", async () => {
  Object.assign(navigator, { clipboard: undefined });
  const execSpy = jest.spyOn(document, "execCommand").mockReturnValue(false);

  render(<CopyButton text="unavailable" />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button"));
  });

  expect(screen.getByRole("button", { name: /copy failed/i })).toBeInTheDocument();
  expect(screen.getByRole("tooltip")).toHaveTextContent(/Unable to copy to clipboard/i);
  execSpy.mockRestore();
});

test("is keyboard accessible via Enter key", async () => {
  mockWriteText.mockResolvedValue(undefined);
  render(<CopyButton text="kbd" />);

  const btn = screen.getByRole("button");
  btn.focus();
  await act(async () => {
    fireEvent.keyDown(btn, { key: "Enter", code: "Enter" });
    fireEvent.click(btn); // buttons fire click on Enter natively
  });

  expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
});
