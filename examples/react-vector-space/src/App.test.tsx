import { act, render, screen, waitFor } from "@testing-library/react";

import { createTiltSimulator } from "@tilt-to-edit/core";

import { App } from "./App";

function getMetricValue(label: string) {
  const metric = screen
    .getAllByText(label)
    .find((element) => element.parentElement?.querySelector("strong"));

  return metric?.parentElement?.querySelector("strong")?.textContent;
}

describe("React Vector Space example", () => {
  it("is live-device-first", () => {
    render(<App />);

    expect(
      screen.queryByRole("button", { name: "Simulator" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Floating focus stack" }),
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
      expect(getMetricValue("Action")).toBe("committed");
      expect(getMetricValue("Trail")).not.toBe("0");
    });

    expect(screen.getByTestId("vector-orb")).toBeInTheDocument();
  });
});
