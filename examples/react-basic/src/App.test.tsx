import { act, render, screen, waitFor } from "@testing-library/react";

import { createTiltSimulator } from "@tilt-to-edit/core";

import { App } from "./App";

function getMetricValue(label: string) {
  return screen.getByText(label).parentElement?.querySelector("strong")?.textContent;
}

describe("React Basic example", () => {
  it("is live-device-first", () => {
    render(<App />);

    expect(
      screen.queryByRole("button", { name: "Simulator" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/On iPhone or iPad/i),
    ).toBeInTheDocument();
  });

  it("shows normalized intent from tilt samples", async () => {
    const simulator = createTiltSimulator();

    render(<App backend={simulator.backend} />);

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 0, gamma: 20, timestamp: 10 });
      simulator.emit({ beta: 0, gamma: 20, timestamp: 20 });
    });

    await waitFor(() => {
      expect(getMetricValue("Intent X")).not.toBe("0.00");
    });
  });
});
