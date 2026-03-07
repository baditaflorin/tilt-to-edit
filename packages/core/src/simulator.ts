import type {
  TiltAvailability,
  TiltDiagnostic,
  TiltSensorBackend,
  TiltSensorHandlers,
  TiltSensorSample,
  TiltSimulatorController,
} from "./types";

interface SimulatorState {
  supported: boolean;
  permissionRequired: boolean;
  permissionResult: "granted" | "denied";
  blockedDiagnostic: TiltDiagnostic | null;
}

class SimulatorBackend implements TiltSensorBackend {
  readonly name = "simulator";

  private readonly listeners = new Set<TiltSensorHandlers>();

  constructor(private readonly state: SimulatorState) {}

  getAvailability(): TiltAvailability {
    return {
      supported: this.state.supported,
      permissionRequired:
        this.state.permissionRequired && this.state.permissionResult !== "granted",
      blockedDiagnostic: this.state.blockedDiagnostic ?? undefined,
    };
  }

  async requestPermission(): Promise<"granted" | "denied"> {
    return this.state.permissionResult;
  }

  subscribe(handlers: TiltSensorHandlers) {
    this.listeners.add(handlers);
    return () => {
      this.listeners.delete(handlers);
    };
  }

  emit(sample: TiltSensorSample) {
    for (const listener of this.listeners) {
      listener.onSample(sample);
    }
  }

  throwError(message: string) {
    const error = new Error(message);
    for (const listener of this.listeners) {
      listener.onError(error);
    }
  }
}

export function createTiltSimulator(): TiltSimulatorController {
  const state: SimulatorState = {
    supported: true,
    permissionRequired: false,
    permissionResult: "granted",
    blockedDiagnostic: null,
  };
  const backend = new SimulatorBackend(state);

  return {
    backend,
    emit(sample) {
      backend.emit({
        alpha: sample.alpha ?? null,
        beta: sample.beta,
        gamma: sample.gamma,
        absolute: sample.absolute,
        timestamp: sample.timestamp ?? Date.now(),
      });
    },
    setSupported(supported) {
      state.supported = supported;
    },
    setPermissionRequired(permissionRequired) {
      state.permissionRequired = permissionRequired;
    },
    setPermissionResult(result) {
      state.permissionResult = result;
    },
    setBlockedDiagnostic(diagnostic) {
      state.blockedDiagnostic = diagnostic;
    },
    throwError(message) {
      backend.throwError(message);
    },
  };
}

