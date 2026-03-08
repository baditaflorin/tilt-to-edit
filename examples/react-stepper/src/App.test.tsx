import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { App } from "./App";

function getMetricValue(label: string) {
  return screen.getByText(label).parentElement?.querySelector("strong")?.textContent;
}

describe("React Stepper example", () => {
  it("offers simulator and live device modes", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Simulator" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Live device" })).toBeInTheDocument();
  });

  it("shows iPhone-specific live instructions", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Live device" }));

    expect(
      screen.getByText(/On iPhone or iPad in Safari or Chrome/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Motion & Orientation Access")).toBeInTheDocument();
    expect(screen.getAllByText("Calibrate")).toHaveLength(2);
  });

  it("updates the stepper draft in simulator mode", async () => {
    render(<App />);

    act(() => {
      fireEvent.change(screen.getByRole("slider"), {
        target: { value: "20" },
      });
    });

    await waitFor(() => {
      expect(getMetricValue("Draft")).toBe("13");
    });
  });
});
