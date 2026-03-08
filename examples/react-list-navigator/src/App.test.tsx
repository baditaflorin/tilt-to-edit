import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { App } from "./App";

function getMetricValue(label: string) {
  return screen.getByText(label).parentElement?.querySelector("strong")?.textContent;
}

describe("React List Navigator example", () => {
  it("offers simulator and live device modes", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Simulator" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Live device" })).toBeInTheDocument();
  });

  it("moves the highlighted item in simulator mode", async () => {
    render(<App />);

    act(() => {
      fireEvent.change(screen.getByRole("slider"), {
        target: { value: "20" },
      });
    });

    await waitFor(() => {
      expect(getMetricValue("Highlighted")).toBe("Contrast");
    });
  });
});
