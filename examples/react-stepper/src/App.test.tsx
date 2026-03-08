import { act, render, screen, waitFor } from "@testing-library/react";

import { createTiltSimulator } from "@tilt-to-edit/core";

import { App } from "./App";

function getMetricValue(label: string) {
  return screen.getByText(label).parentElement?.querySelector("strong")?.textContent;
}

describe("React Stepper example", () => {
  it("is live-device-first", () => {
    render(<App />);

    expect(
      screen.queryByRole("button", { name: "Simulator" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/On iPhone or iPad in Safari or Chrome/i),
    ).toBeInTheDocument();
  });

  it("shows iPhone-specific live instructions", () => {
    render(<App />);

    expect(
      screen.getByText(/On iPhone or iPad in Safari or Chrome/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Motion & Orientation Access")).toBeInTheDocument();
    expect(screen.getAllByText("Calibrate")).toHaveLength(2);
  });

  it("updates the stepper draft from tilt samples", async () => {
    const simulator = createTiltSimulator();

    render(<App backend={simulator.backend} />);

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 0, gamma: 8, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getMetricValue("Draft")).toBe("13");
    });
  });
});
