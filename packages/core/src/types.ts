export type TiltStatus =
  | "unsupported"
  | "needs-permission"
  | "blocked"
  | "active"
  | "paused"
  | "error";

export type TiltPermissionState =
  | "unknown"
  | "granted"
  | "denied"
  | "not-required";

export type TiltDiagnosticCode =
  | "unsupported-api"
  | "insecure-context"
  | "permission-required"
  | "permission-denied"
  | "permissions-policy"
  | "backend-error";

export interface TiltDiagnostic {
  code: TiltDiagnosticCode;
  message: string;
  detail?: string | undefined;
}

export interface TiltSensorSample {
  alpha: number | null;
  beta: number;
  gamma: number;
  absolute?: boolean | undefined;
  timestamp: number;
}

export interface TiltSensorHandlers {
  onSample: (sample: TiltSensorSample) => void;
  onError: (error: Error) => void;
}

export interface TiltAvailability {
  supported: boolean;
  permissionRequired: boolean;
  blockedDiagnostic?: TiltDiagnostic | undefined;
}

export interface TiltSensorBackend {
  readonly name: string;
  getAvailability: () => TiltAvailability;
  requestPermission?: () => Promise<"granted" | "denied">;
  subscribe: (handlers: TiltSensorHandlers) => () => void;
}

export type TiltAxisMode = "horizontal" | "vertical" | "both";

export interface TiltCalibration {
  alpha: number | null;
  beta: number;
  gamma: number;
  timestamp: number;
}

export interface TiltVector {
  x: number;
  y: number;
  magnitude: number;
}

export interface TiltStepEvent {
  direction: -1 | 0 | 1;
  sequence: number;
  timestamp: number | null;
}

export interface TiltEngineOptions {
  backend?: TiltSensorBackend | undefined;
  axisMode?: TiltAxisMode | undefined;
  deadZone?: number | undefined;
  hysteresis?: number | undefined;
  stepThreshold?: number | undefined;
  repeatIntervalMs?: number | undefined;
  continuousRange?: number | undefined;
  smoothing?: number | undefined;
  autoCalibrateOnStart?: boolean | undefined;
  initialArmed?: boolean | undefined;
  requireArmedForStep?: boolean | undefined;
  screenOrientationProvider?: (() => number) | undefined;
  now?: (() => number) | undefined;
}

export interface TiltEngineSnapshot {
  status: TiltStatus;
  backend: string;
  permissionState: TiltPermissionState;
  armed: boolean;
  calibrated: boolean;
  diagnostics: TiltDiagnostic[];
  calibration: TiltCalibration | null;
  rawVector: TiltVector;
  intentVector: TiltVector;
  stepEvents: {
    x: TiltStepEvent;
    y: TiltStepEvent;
  };
  lastSample: TiltSensorSample | null;
  lastConfirmationAt: number | null;
  confirmationSequence: number;
}

export type TiltEngineListener = (snapshot: TiltEngineSnapshot) => void;

export interface TiltSimulatorController {
  backend: TiltSensorBackend;
  emit: (sample: Partial<TiltSensorSample> & Pick<TiltSensorSample, "beta" | "gamma">) => void;
  setSupported: (supported: boolean) => void;
  setPermissionRequired: (permissionRequired: boolean) => void;
  setPermissionResult: (result: "granted" | "denied") => void;
  setBlockedDiagnostic: (diagnostic: TiltDiagnostic | null) => void;
  throwError: (message: string) => void;
}
