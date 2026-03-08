import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";

import { createTiltSimulator } from "@tilt-to-edit/core";

import { TiltListNavigator } from "./TiltListNavigator";
import { TiltMenuSelector } from "./TiltMenuSelector";
import { TiltSettingsAdjuster } from "./TiltSettingsAdjuster";
import { TiltSlider } from "./TiltSlider";
import { TiltStepper } from "./TiltStepper";
import { TiltSubmenuEditor } from "./TiltSubmenuEditor";

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
      simulator.emit({ beta: 0, gamma: 8, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getMetricValue("Draft")).toBe("11");
    });

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onCommit).toHaveBeenCalledWith(11);
  });

  it("updates continuous slider previews by default", async () => {
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

    await waitFor(() => {
      expect(getMetricValue("Draft")).toBe("90.00");
    });
  });

  it("supports optional arm mode for continuous slider previews", async () => {
    const simulator = createTiltSimulator();

    function Wrapper() {
      const [value, setValue] = useState(50);
      return (
        <TiltSlider
          backend={simulator.backend}
          onCommit={(nextValue) => {
            setValue(nextValue);
          }}
          requireArm
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
      expect(getMetricValue("Draft")).toBe("100.00");
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

  it("browses vertically and commits with a right tilt", async () => {
    const simulator = createTiltSimulator();

    function Wrapper() {
      const [selectedIndex, setSelectedIndex] = useState(0);

      return (
        <TiltMenuSelector
          backend={simulator.backend}
          items={["Alpha", "Beta", "Gamma"]}
          onCommit={(index) => {
            setSelectedIndex(index);
          }}
          selectedIndex={selectedIndex}
        />
      );
    }

    render(<Wrapper />);

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 20, gamma: 0, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getMetricValue("Highlighted")).toBe("Beta");
    });

    act(() => {
      simulator.emit({ beta: 0, gamma: 20, timestamp: 200 });
    });

    await waitFor(() => {
      expect(getMetricValue("Selected")).toBe("Beta");
      expect(getMetricValue("Action")).toBe("committed");
    });
  });

  it("browses settings and adjusts the focused value in place", async () => {
    const simulator = createTiltSimulator();
    const onChange = vi.fn();

    render(
      <TiltSettingsAdjuster
        backend={simulator.backend}
        items={[
          { label: "Brightness", value: 64, min: 0, max: 100, step: 4, unit: "%" },
          { label: "Contrast", value: 48, min: 0, max: 100, step: 3, unit: "%" },
        ]}
        onChange={onChange}
      />,
    );

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 20, gamma: 0, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getMetricValue("Focused")).toBe("Contrast");
    });

    act(() => {
      simulator.emit({ beta: 0, gamma: 20, timestamp: 220 });
    });

    await waitFor(() => {
      expect(getMetricValue("Value")).toBe("51 %");
      expect(getMetricValue("Action")).toBe("increase");
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("enters a submenu editor and adjusts the active value", async () => {
    const simulator = createTiltSimulator();
    const onChange = vi.fn();

    function Wrapper() {
      const [sections, setSections] = useState([
        {
          label: "Display",
          items: [
            { label: "Brightness", value: 72, min: 0, max: 100, step: 4, unit: "%" },
            { label: "Contrast", value: 46, min: 0, max: 100, step: 3, unit: "%" },
          ],
        },
        {
          label: "Audio",
          items: [{ label: "Volume", value: 34, min: 0, max: 100, step: 4, unit: "%" }],
        },
      ]);

      return (
        <TiltSubmenuEditor
          backend={simulator.backend}
          onChange={(event) => {
            setSections(event.sections);
            onChange(event);
          }}
          sections={sections}
        />
      );
    }

    render(<Wrapper />);

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 0, gamma: 20, timestamp: 10 });
    });

    await waitFor(() => {
      expect(getMetricValue("Mode")).toBe("items");
    });

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 160 });
      simulator.emit({ beta: 0, gamma: 20, timestamp: 220 });
    });

    await waitFor(() => {
      expect(getMetricValue("Mode")).toBe("editor");
    });

    act(() => {
      simulator.emit({ beta: -20, gamma: 0, timestamp: 430 });
    });

    await waitFor(() => {
      expect(getMetricValue("Mode")).toBe("editor");
      expect(getMetricValue("Value")).toBe("76 %");
      expect(getMetricValue("Action")).toBe("increase value");
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
