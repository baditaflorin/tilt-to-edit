import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";

import { createTiltSimulator } from "@tilt-to-edit/core";

import { TiltListNavigator } from "./TiltListNavigator";
import { TiltSlider } from "./TiltSlider";
import { TiltStepper } from "./TiltStepper";

function getMetricValue(label: string) {
  return screen.getByText(label).parentElement?.querySelector("strong")?.textContent;
}

describe("Tilt primitives", () => {
  it("updates and commits a stepper draft value", async () => {
    const simulator = createTiltSimulator();
    const onCommit = vi.fn();

    render(
      <TiltStepper backend={simulator.backend} onCommit={onCommit} value={10} />,
    );

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 0, gamma: 20, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getMetricValue("Draft")).toBe("11");
    });

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onCommit).toHaveBeenCalledWith(11);
  });

  it("uses arm mode for continuous slider previews", async () => {
    const simulator = createTiltSimulator();

    function Wrapper() {
      const [value, setValue] = useState(50);
      return (
        <TiltSlider
          backend={simulator.backend}
          onCommit={(nextValue) => {
            setValue(nextValue);
          }}
          value={value}
        />
      );
    }

    render(<Wrapper />);

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 0, gamma: 20, timestamp: 10 });
    });
    expect(getMetricValue("Draft")).toBe("50.00");

    fireEvent.click(screen.getByRole("button", { name: "Arm" }));
    act(() => {
      simulator.emit({ beta: 0, gamma: 20, timestamp: 20 });
    });

    await waitFor(() => {
      expect(getMetricValue("Draft")).toBe("61.00");
    });
  });

  it("moves a list highlight and commits it", async () => {
    const simulator = createTiltSimulator();
    const onCommit = vi.fn();

    render(
      <TiltListNavigator
        backend={simulator.backend}
        items={["Alpha", "Beta", "Gamma"]}
        onCommit={onCommit}
      />,
    );

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 20, gamma: 0, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getMetricValue("Highlighted")).toBe("Beta");
    });

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onCommit).toHaveBeenCalledWith(1, "Beta");
  });
});
