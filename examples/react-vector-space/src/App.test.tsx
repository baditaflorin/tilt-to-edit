import { act, render, screen, waitFor } from "@testing-library/react";

import { createTiltSimulator } from "@tilt-to-edit/core";

import { App } from "./App";

function getMetricValue(label: string) {
  return screen.getByText(label).parentElement?.querySelector("strong")?.textContent;
}

describe("React Vector Space example", () => {
  it("is live-device-first", () => {
    render(<App />);

    expect(
      screen.queryByRole("button", { name: "Simulator" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Intent chamber" })).toBeInTheDocument();
  });

  it("shows speed and movement after tilt samples", async () => {
    const simulator = createTiltSimulator();

    render(<App backend={simulator.backend} />);

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
    });

    act(() => {
      simulator.emit({ beta: 0, gamma: 20, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getMetricValue("Intent X")).not.toBe("+0.00");
      expect(getMetricValue("Trail")).toBe("1");
    });

    act(() => {
      simulator.emit({ beta: 12, gamma: 24, timestamp: 20 });
    });

    await waitFor(() => {
      expect(getMetricValue("Speed")).not.toBe("0.00");
      expect(getMetricValue("Trail")).not.toBe("0");
    });

    expect(screen.getByTestId("vector-orb")).toBeInTheDocument();
  });
});
