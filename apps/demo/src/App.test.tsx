import { act, render, screen, waitFor } from "@testing-library/react";

import { createTiltSimulator } from "@tilt-to-edit/core";

import { App } from "./App";

describe("Demo app", () => {
  it("is live-device-first and keeps the slider monitor visible", async () => {
    const simulator = createTiltSimulator();

    render(<App backend={simulator.backend} />);

    expect(
      screen.queryByRole("button", { name: "Simulator" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Live Slider Monitor" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Fork on GitHub" }),
    ).toHaveAttribute("href", "https://github.com/baditaflorin/tilt-to-edit");
    expect(
      screen.getByRole("heading", { name: "Tilt Settings Adjuster" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Tilt Submenu Editor" }),
    ).toBeInTheDocument();

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 0, gamma: 20, timestamp: 10 });
    });

    await waitFor(() => {
      expect(
        screen.getByRole("slider", { name: "Live slider monitor preview" }),
      ).toHaveValue("82");
    });
  });
});
