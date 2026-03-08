import { act, render, screen, waitFor } from "@testing-library/react";

import { createTiltSimulator } from "@tilt-to-edit/core";

import { TiltSceneRemixCard } from "./TiltSceneRemixCard";

function getMetricValue(label: string) {
  const metricLabel = screen
    .getAllByText(label)
    .find((element) => element.parentElement?.querySelector("strong"));

  return metricLabel?.parentElement?.querySelector("strong")?.textContent;
}

describe("TiltSceneRemixCard", () => {
  it("swaps backdrop on horizontal tilt and character on vertical tilt", async () => {
    const simulator = createTiltSimulator();

    render(<TiltSceneRemixCard backend={simulator.backend} />);

    expect(screen.getByRole("heading", { name: "Tilt Scene Remix" })).toBeInTheDocument();
    expect(getMetricValue("Backdrop")).toBe("Neon Alley");
    expect(getMetricValue("Character")).toBe("Pilot");

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 0, gamma: 20, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getMetricValue("Backdrop")).toBe("Solar Dunes");
    });

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 120 });
      simulator.emit({ beta: 20, gamma: 0, timestamp: 520 });
    });

    await waitFor(() => {
      expect(getMetricValue("Character")).toBe("Oracle");
    });
  });
});
