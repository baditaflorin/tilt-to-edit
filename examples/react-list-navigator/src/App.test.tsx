import { act, render, screen, waitFor } from "@testing-library/react";

import { createTiltSimulator } from "@tilt-to-edit/core";

import { App } from "./App";

function getMetricValue(label: string, occurrence = 0) {
  return screen.getAllByText(label)[occurrence]?.parentElement
    ?.querySelector("strong")
    ?.textContent;
}

describe("React List Navigator example", () => {
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
    expect(screen.getAllByText("Calibrate")).toHaveLength(3);
  });

  it("moves the highlighted item from tilt samples", async () => {
    const simulator = createTiltSimulator();

    render(<App backend={simulator.backend} />);

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 20, gamma: 0, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getMetricValue("Highlighted", 0)).toBe("Contrast");
    });
  });

  it("also includes the hybrid selector on the same page", async () => {
    const simulator = createTiltSimulator();

    render(<App backend={simulator.backend} />);

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 20, gamma: 0, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getMetricValue("Highlighted", 1)).toBe("Theme");
    });

    act(() => {
      simulator.emit({ beta: 0, gamma: 20, timestamp: 200 });
    });

    await waitFor(() => {
      expect(getMetricValue("Selected", 1)).toBe("Theme");
      expect(getMetricValue("Action", 0)).toBe("committed");
    });
  });
});
