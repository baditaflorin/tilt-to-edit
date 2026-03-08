import {
  createDeviceOrientationBackend,
  createTiltEngine,
  createTiltSimulator,
} from "./index";

describe("TiltEngine", () => {
  it("starts from the simulator backend and auto-calibrates on first sample", async () => {
    const simulator = createTiltSimulator();
    const engine = createTiltEngine({ backend: simulator.backend, smoothing: 0 });

    await engine.start();
    simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
    simulator.emit({ beta: 0, gamma: 20, timestamp: 10 });

    expect(engine.getSnapshot().status).toBe("active");
    expect(engine.getSnapshot().calibrated).toBe(true);
    expect(engine.getSnapshot().intentVector.x).toBeGreaterThan(0.4);
  });

  it("emits rate-limited step events", async () => {
    const simulator = createTiltSimulator();
    let now = 0;
    const engine = createTiltEngine({
      backend: simulator.backend,
      smoothing: 0,
      repeatIntervalMs: 100,
      now: () => now,
    });

    await engine.start();
    now = 0;
    simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
    now = 10;
    simulator.emit({ beta: 0, gamma: 20, timestamp: 10 });
    expect(engine.getSnapshot().stepEvents.x.sequence).toBe(1);

    now = 50;
    simulator.emit({ beta: 0, gamma: 20, timestamp: 50 });
    expect(engine.getSnapshot().stepEvents.x.sequence).toBe(1);

    now = 120;
    simulator.emit({ beta: 0, gamma: 20, timestamp: 120 });
    expect(engine.getSnapshot().stepEvents.x.sequence).toBe(2);
  });

  it("respects armed mode when required for step navigation", async () => {
    const simulator = createTiltSimulator();
    let now = 0;
    const engine = createTiltEngine({
      backend: simulator.backend,
      smoothing: 0,
      requireArmedForStep: true,
      now: () => now,
    });

    await engine.start();
    now = 0;
    simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
    now = 10;
    simulator.emit({ beta: 0, gamma: 20, timestamp: 10 });
    expect(engine.getSnapshot().stepEvents.x.sequence).toBe(0);

    engine.setArmed(true);
    now = 30;
    simulator.emit({ beta: 0, gamma: 20, timestamp: 30 });
    expect(engine.getSnapshot().stepEvents.x.sequence).toBe(1);
  });

  it("normalizes axes against screen rotation", async () => {
    const simulator = createTiltSimulator();
    const engine = createTiltEngine({
      backend: simulator.backend,
      smoothing: 0,
      screenOrientationProvider: () => 90,
    });

    await engine.start();
    simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });
    simulator.emit({ beta: -20, gamma: 0, timestamp: 10 });

    expect(engine.getSnapshot().intentVector.x).toBeGreaterThan(0.4);
  });

  it("auto-recalibrates on screen orientation changes by default", async () => {
    const simulator = createTiltSimulator();
    let screenAngle = 0;
    const engine = createTiltEngine({
      backend: simulator.backend,
      smoothing: 0,
      screenOrientationProvider: () => screenAngle,
    });

    await engine.start();
    simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });

    screenAngle = 90;
    simulator.emit({ beta: -20, gamma: 0, timestamp: 10 });

    expect(engine.getSnapshot().calibration?.timestamp).toBe(10);
    expect(engine.getSnapshot().intentVector.x).toBe(0);
    expect(engine.getSnapshot().intentVector.y).toBe(0);

    simulator.emit({ beta: -40, gamma: 0, timestamp: 20 });
    expect(engine.getSnapshot().intentVector.x).toBeGreaterThan(0.4);
  });

  it("can opt out of orientation-change auto-calibration", async () => {
    const simulator = createTiltSimulator();
    let screenAngle = 0;
    const engine = createTiltEngine({
      backend: simulator.backend,
      smoothing: 0,
      autoCalibrateOnScreenOrientationChange: false,
      screenOrientationProvider: () => screenAngle,
    });

    await engine.start();
    simulator.emit({ beta: 0, gamma: 0, timestamp: 0 });

    screenAngle = 90;
    simulator.emit({ beta: -20, gamma: 0, timestamp: 10 });

    expect(engine.getSnapshot().intentVector.x).toBeGreaterThan(0.4);
  });

  it("reports insecure-context diagnostics for the device backend", () => {
    const backend = createDeviceOrientationBackend({
      window: {
        isSecureContext: false,
        document: {},
      } as Window & typeof globalThis,
    });

    const availability = backend.getAvailability();
    expect(availability.blockedDiagnostic?.code).toBe("insecure-context");
  });

  it("treats iOS-style deviceorientation support as available without a constructor", async () => {
    const requestPermission = vi.fn(async () => "granted" as const);
    const backend = createDeviceOrientationBackend({
      window: {
        isSecureContext: true,
        document: {},
        ondeviceorientation: null,
        DeviceMotionEvent: {
          requestPermission,
        },
      } as Window & typeof globalThis,
    });

    const availability = backend.getAvailability();
    expect(availability.supported).toBe(true);
    expect(availability.permissionRequired).toBe(true);
    await expect(backend.requestPermission()).resolves.toBe("granted");
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });
});
