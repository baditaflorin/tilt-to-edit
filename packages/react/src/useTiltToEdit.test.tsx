import { act, renderHook, waitFor } from "@testing-library/react";

import { createTiltSimulator } from "@tilt-to-edit/core";

import { useTiltToEdit } from "./useTiltToEdit";

describe("useTiltToEdit", () => {
  it("reflects simulator samples in hook state", async () => {
    const simulator = createTiltSimulator();
    const { result } = renderHook(() =>
      useTiltToEdit({ backend: simulator.backend, smoothing: 0 }),
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe("active");
    });

    act(() => {
      simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
      simulator.emit({ beta: 0, gamma: 25, timestamp: 10 });
    });

    await waitFor(() => {
      expect(result.current.state.intentVector.x).toBeGreaterThan(0.5);
    });
  });
});
