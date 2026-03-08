import {
  createDeviceOrientationBackend,
} from "./device-orientation-backend";
import type {
  TiltCalibration,
  TiltDiagnostic,
  TiltEngineListener,
  TiltEngineOptions,
  TiltEngineSnapshot,
  TiltSensorBackend,
  TiltSensorSample,
  TiltStatus,
  TiltVector,
} from "./types";

interface StepAxisState {
  lastDirection: -1 | 0 | 1;
  lastEmitAt: number;
  sequence: number;
}

interface ResolvedTiltEngineOptions {
  axisMode: "horizontal" | "vertical" | "both";
  deadZone: number;
  hysteresis: number;
  stepThreshold: number;
  repeatIntervalMs: number;
  continuousRange: number;
  smoothing: number;
  autoCalibrateOnStart: boolean;
  autoCalibrateOnScreenOrientationChange: boolean;
  initialArmed: boolean;
  requireArmedForStep: boolean;
  screenOrientationProvider: () => number;
  now: () => number;
}

function createVector(x = 0, y = 0): TiltVector {
  return {
    x,
    y,
    magnitude: Math.hypot(x, y),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeScreenAngle(angle: number) {
  const normalized = ((Math.round(angle / 90) * 90) % 360 + 360) % 360;
  if (
    normalized === 0 ||
    normalized === 90 ||
    normalized === 180 ||
    normalized === 270
  ) {
    return normalized;
  }

  return 0;
}

function defaultScreenOrientationProvider() {
  if (typeof window === "undefined") {
    return 0;
  }

  const screenOrientation = window.screen.orientation;
  if (typeof screenOrientation?.angle === "number") {
    return screenOrientation.angle;
  }

  const legacyOrientation = window.orientation;
  return typeof legacyOrientation === "number" ? legacyOrientation : 0;
}

function mapOrientationToVector(
  beta: number,
  gamma: number,
  screenAngle: number,
) {
  switch (normalizeScreenAngle(screenAngle)) {
    case 90:
      return { x: -beta, y: gamma };
    case 180:
      return { x: -gamma, y: -beta };
    case 270:
      return { x: beta, y: -gamma };
    default:
      return { x: gamma, y: beta };
  }
}

function normalizeContinuous(
  value: number,
  deadZone: number,
  range: number,
) {
  const absoluteValue = Math.abs(value);
  if (absoluteValue <= deadZone) {
    return 0;
  }

  const safeRange = Math.max(range, deadZone + 1);
  const normalized =
    (absoluteValue - deadZone) / Math.max(safeRange - deadZone, 1);
  return clamp(normalized, 0, 1) * Math.sign(value);
}

function applySmoothing(
  previousValue: number,
  nextValue: number,
  smoothing: number,
) {
  const factor = clamp(smoothing, 0, 1);
  if (factor === 0) {
    return nextValue;
  }
  return previousValue + (nextValue - previousValue) * factor;
}

function createDiagnostic(
  code: TiltDiagnostic["code"],
  message: string,
  detail?: string,
): TiltDiagnostic {
  return { code, message, detail };
}

export class TiltEngine {
  private readonly listeners = new Set<TiltEngineListener>();

  private readonly options: ResolvedTiltEngineOptions;

  private readonly backend: TiltSensorBackend;

  private readonly stepState = {
    x: { lastDirection: 0, lastEmitAt: -Infinity, sequence: 0 } as StepAxisState,
    y: { lastDirection: 0, lastEmitAt: -Infinity, sequence: 0 } as StepAxisState,
  };

  private snapshot: TiltEngineSnapshot;

  private calibration: TiltCalibration | null = null;

  private unsubscribeBackend: (() => void) | null = null;

  private lastScreenAngle: number;

  constructor(options: TiltEngineOptions = {}) {
    this.backend = options.backend ?? createDeviceOrientationBackend();
    this.options = {
      axisMode: options.axisMode ?? "both",
      deadZone: options.deadZone ?? 5,
      hysteresis: options.hysteresis ?? 2,
      stepThreshold: options.stepThreshold ?? 12,
      repeatIntervalMs: options.repeatIntervalMs ?? 160,
      continuousRange: options.continuousRange ?? 30,
      smoothing: options.smoothing ?? 0.3,
      autoCalibrateOnStart: options.autoCalibrateOnStart ?? true,
      autoCalibrateOnScreenOrientationChange:
        options.autoCalibrateOnScreenOrientationChange ?? true,
      initialArmed: options.initialArmed ?? false,
      requireArmedForStep: options.requireArmedForStep ?? false,
      screenOrientationProvider:
        options.screenOrientationProvider ?? defaultScreenOrientationProvider,
      now: options.now ?? (() => Date.now()),
    };
    this.lastScreenAngle = normalizeScreenAngle(this.options.screenOrientationProvider());

    const availability = this.backend.getAvailability();
    const initialStatus = this.deriveInitialStatus(availability);
    const permissionState = availability.permissionRequired
      ? "unknown"
      : "not-required";

    this.snapshot = {
      status: initialStatus,
      backend: this.backend.name,
      permissionState,
      armed: this.options.initialArmed,
      calibrated: false,
      diagnostics: availability.blockedDiagnostic
        ? [availability.blockedDiagnostic]
        : availability.permissionRequired
          ? [
              createDiagnostic(
                "permission-required",
                "Tilt permission must be requested from a user gesture.",
              ),
            ]
          : [],
      calibration: null,
      rawVector: createVector(),
      intentVector: createVector(),
      stepEvents: {
        x: { direction: 0, sequence: 0, timestamp: null },
        y: { direction: 0, sequence: 0, timestamp: null },
      },
      lastSample: null,
      lastConfirmationAt: null,
      confirmationSequence: 0,
    };
  }

  private deriveInitialStatus(availability: ReturnType<TiltSensorBackend["getAvailability"]>): TiltStatus {
    if (!availability.supported) {
      return "unsupported";
    }

    if (availability.blockedDiagnostic) {
      return "blocked";
    }

    if (availability.permissionRequired) {
      return "needs-permission";
    }

    return "paused";
  }

  getSnapshot() {
    return this.snapshot;
  }

  subscribe(listener: TiltEngineListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitSnapshot() {
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }

  private updateSnapshot(partial: Partial<TiltEngineSnapshot>) {
    this.snapshot = {
      ...this.snapshot,
      ...partial,
    };
    this.emitSnapshot();
  }

  async start() {
    if (this.unsubscribeBackend) {
      return this.snapshot;
    }

    const availability = this.backend.getAvailability();
    if (!availability.supported) {
      this.updateSnapshot({
        status: "unsupported",
        diagnostics: availability.blockedDiagnostic
          ? [availability.blockedDiagnostic]
          : this.snapshot.diagnostics,
      });
      return this.snapshot;
    }

    if (availability.blockedDiagnostic) {
      this.updateSnapshot({
        status: "blocked",
        diagnostics: [availability.blockedDiagnostic],
      });
      return this.snapshot;
    }

    if (
      availability.permissionRequired &&
      this.snapshot.permissionState !== "granted"
    ) {
      this.updateSnapshot({
        status: "needs-permission",
        diagnostics: [
          createDiagnostic(
            "permission-required",
            "Tilt permission must be requested from a user gesture.",
          ),
        ],
      });
      return this.snapshot;
    }

    this.unsubscribeBackend = this.backend.subscribe({
      onSample: (sample) => {
        this.processSample(sample);
      },
      onError: (error) => {
        this.handleBackendError(error);
      },
    });

    this.updateSnapshot({
      status: "active",
      diagnostics: [],
    });
    return this.snapshot;
  }

  async requestPermission() {
    if (!this.backend.requestPermission) {
      this.updateSnapshot({
        permissionState: "not-required",
      });
      return this.start();
    }

    const result = await this.backend.requestPermission();
    if (result === "granted") {
      this.updateSnapshot({
        permissionState: "granted",
        diagnostics: [],
        status: "paused",
      });
      return this.start();
    }

    this.updateSnapshot({
      permissionState: "denied",
      status: "blocked",
      diagnostics: [
        createDiagnostic(
          "permission-denied",
          "Tilt permission was denied by the browser.",
        ),
      ],
    });
    return this.snapshot;
  }

  pause() {
    if (this.unsubscribeBackend) {
      this.unsubscribeBackend();
      this.unsubscribeBackend = null;
    }

    if (this.snapshot.status === "unsupported" || this.snapshot.status === "blocked") {
      return this.snapshot;
    }

    this.updateSnapshot({
      status: "paused",
    });
    return this.snapshot;
  }

  resume() {
    return this.start();
  }

  calibrate(sample = this.snapshot.lastSample) {
    if (!sample) {
      return false;
    }

    this.captureCalibration(sample);
    this.updateSnapshot({
      calibrated: true,
      calibration: this.calibration,
      rawVector: createVector(),
      intentVector: createVector(),
      stepEvents: {
        x: { ...this.snapshot.stepEvents.x, direction: 0 },
        y: { ...this.snapshot.stepEvents.y, direction: 0 },
      },
    });
    return true;
  }

  private captureCalibration(sample: TiltSensorSample) {
    this.calibration = {
      alpha: sample.alpha,
      beta: sample.beta,
      gamma: sample.gamma,
      timestamp: sample.timestamp,
    };
    this.resetStepState();
  }

  confirm() {
    this.updateSnapshot({
      confirmationSequence: this.snapshot.confirmationSequence + 1,
      lastConfirmationAt: this.options.now(),
    });
    return this.snapshot;
  }

  setArmed(armed: boolean) {
    this.updateSnapshot({
      armed,
    });
    return this.snapshot;
  }

  destroy() {
    this.pause();
    this.listeners.clear();
  }

  private resetStepState() {
    this.stepState.x = { lastDirection: 0, lastEmitAt: -Infinity, sequence: 0 };
    this.stepState.y = { lastDirection: 0, lastEmitAt: -Infinity, sequence: 0 };
  }

  private handleBackendError(error: Error) {
    this.updateSnapshot({
      status: "error",
      diagnostics: [
        createDiagnostic(
          "backend-error",
          "Tilt input failed while reading the sensor backend.",
          error.message,
        ),
      ],
    });
  }

  private processSample(sample: TiltSensorSample) {
    const screenAngle = normalizeScreenAngle(this.options.screenOrientationProvider());
    const screenAngleChanged = screenAngle !== this.lastScreenAngle;

    if (
      screenAngleChanged &&
      this.options.autoCalibrateOnScreenOrientationChange &&
      this.calibration
    ) {
      this.captureCalibration(sample);
    }
    this.lastScreenAngle = screenAngle;

    if (!this.calibration && this.options.autoCalibrateOnStart) {
      this.captureCalibration(sample);
    }

    const currentVector = mapOrientationToVector(
      sample.beta,
      sample.gamma,
      screenAngle,
    );
    const calibrationVector = this.calibration
      ? mapOrientationToVector(
          this.calibration.beta,
          this.calibration.gamma,
          screenAngle,
        )
      : { x: 0, y: 0 };

    let rawX = currentVector.x - calibrationVector.x;
    let rawY = currentVector.y - calibrationVector.y;

    if (this.options.axisMode === "horizontal") {
      rawY = 0;
    } else if (this.options.axisMode === "vertical") {
      rawX = 0;
    }

    const smoothedX = applySmoothing(
      this.snapshot.rawVector.x,
      rawX,
      this.options.smoothing,
    );
    const smoothedY = applySmoothing(
      this.snapshot.rawVector.y,
      rawY,
      this.options.smoothing,
    );

    const rawVector = createVector(smoothedX, smoothedY);
    const intentVector = createVector(
      normalizeContinuous(
        smoothedX,
        this.options.deadZone,
        this.options.continuousRange,
      ),
      normalizeContinuous(
        smoothedY,
        this.options.deadZone,
        this.options.continuousRange,
      ),
    );

    const stepEvents = {
      x: this.computeStepEvent("x", smoothedX),
      y: this.computeStepEvent("y", smoothedY),
    };

    this.updateSnapshot({
      status: this.snapshot.status === "paused" ? "paused" : "active",
      calibrated: this.calibration !== null,
      calibration: this.calibration,
      rawVector,
      intentVector,
      stepEvents,
      lastSample: sample,
    });
  }

  private computeStepEvent(axis: "x" | "y", value: number) {
    const state = this.stepState[axis];
    const now = this.options.now();
    const rearmThreshold = Math.max(
      this.options.stepThreshold - this.options.hysteresis,
      0,
    );

    let direction: -1 | 0 | 1 = 0;
    if (Math.abs(value) >= this.options.stepThreshold) {
      direction = value > 0 ? 1 : -1;
    } else if (Math.abs(value) <= rearmThreshold) {
      state.lastDirection = 0;
    }

    if (this.options.requireArmedForStep && !this.snapshot.armed) {
      direction = 0;
    }

    const directionChanged = direction !== 0 && direction !== state.lastDirection;
    const enoughTimeElapsed =
      direction !== 0 && now - state.lastEmitAt >= this.options.repeatIntervalMs;

    if (direction !== 0 && (directionChanged || enoughTimeElapsed)) {
      state.lastDirection = direction;
      state.lastEmitAt = now;
      state.sequence += 1;
      return {
        direction,
        sequence: state.sequence,
        timestamp: now,
      };
    }

    return {
      direction: 0 as const,
      sequence: state.sequence,
      timestamp: this.snapshot.stepEvents[axis].timestamp,
    };
  }
}

export function createTiltEngine(options: TiltEngineOptions = {}) {
  return new TiltEngine(options);
}
