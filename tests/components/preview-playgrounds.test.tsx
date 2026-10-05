import { describe, it, expect } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { VerificationPreviewPlayground } from "#/modules/verification/components/verification-preview-playground";

describe("VerificationPreviewPlayground", () => {
  it("edits to the welcome text update the panel instantly", () => {
    render(<VerificationPreviewPlayground />);
    expect(screen.getByText("✅ Verify")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Welcome text"), {
      target: { value: "Brand new welcome copy here" },
    });
    expect(
      screen.getAllByText("Brand new welcome copy here").length,
    ).toBeGreaterThan(1);
  });
});
