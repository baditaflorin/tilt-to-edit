import { act, render, screen, waitFor, within } from "@testing-library/react";

import { createTiltSimulator } from "@tilt-to-edit/core";

import { App } from "./App";

function getMetricValue(label: string) {
  return screen.getByText(label).parentElement?.querySelector("strong")?.textContent;
}

function getCardMetricValue(title: string, label: string) {
  const card = screen.getByRole("heading", { name: title }).closest("section");
  if (!card) {
    return null;
  }

  return within(card).getByText(label).parentElement?.querySelector("strong")?.textContent;
}

describe("React Menu Selector example", () => {
  it("is live-device-first", () => {
    render(<App />);

    expect(
      screen.queryByRole("button", { name: "Simulator" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/On iPhone or iPad in Safari or Chrome/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Browse and adjust in place" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Three-part submenu editor" }),
    ).toBeInTheDocument();
  });

  it("browses vertically and commits with a right tilt", async () => {
    const simulator = createTiltSimulator();

    render(<App backend={simulator.backend} />);

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 20, gamma: 0, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getMetricValue("Highlighted")).toBe("Ambient audio");
    });

    act(() => {
      simulator.emit({ beta: 0, gamma: 20, timestamp: 200 });
    });

    await waitFor(() => {
      expect(getMetricValue("Selected")).toBe("Ambient audio");
    });
  });

  it("adjusts a focused setting with left and right tilt", async () => {
    const simulator = createTiltSimulator();

    render(<App backend={simulator.backend} />);

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 20, gamma: 0, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getCardMetricValue("Tilt Settings Adjuster", "Focused")).toBe("Contrast");
    });

    act(() => {
      simulator.emit({ beta: 0, gamma: 20, timestamp: 220 });
    });

    await waitFor(() => {
      expect(getCardMetricValue("Tilt Settings Adjuster", "Value")).toBe("51 %");
    });
  });
});
