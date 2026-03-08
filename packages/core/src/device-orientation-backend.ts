import type {
  TiltAvailability,
  TiltDiagnostic,
  TiltSensorBackend,
  TiltSensorHandlers,
  TiltSensorSample,
} from "./types";

interface DeviceOrientationBackendOptions {
  window?: Window & typeof globalThis;
  now?: () => number;
}

type DeviceOrientationRequestable = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

type DeviceMotionRequestable = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

function createDiagnostic(
  code: TiltDiagnostic["code"],
  message: string,
  detail?: string,
): TiltDiagnostic {
  return { code, message, detail };
}

function detectPermissionsPolicy(
  windowObject: Window & typeof globalThis,
): TiltDiagnostic | null {
  const anyDocument = windowObject.document as Document & {
    permissionsPolicy?: {
      allowsFeature?: (feature: string) => boolean;
    };
    featurePolicy?: {
      allowsFeature?: (feature: string) => boolean;
    };
  };
  const policy = anyDocument.permissionsPolicy ?? anyDocument.featurePolicy;
  if (typeof policy?.allowsFeature !== "function") {
    return null;
  }

  const allowsAccelerometer = policy.allowsFeature("accelerometer");
  const allowsGyroscope = policy.allowsFeature("gyroscope");
  if (allowsAccelerometer && allowsGyroscope) {
    return null;
  }

  return createDiagnostic(
    "permissions-policy",
    "Tilt input is blocked by the current permissions policy.",
    "Enable accelerometer and gyroscope access for this origin or iframe.",
  );
}

export class DeviceOrientationBackend implements TiltSensorBackend {
  readonly name = "device-orientation";

  private readonly listeners = new Set<TiltSensorHandlers>();

  private readonly now: () => number;

  private readonly windowObject: (Window & typeof globalThis) | undefined;

  private eventHandler: ((event: DeviceOrientationEvent) => void) | undefined;

  constructor(options: DeviceOrientationBackendOptions = {}) {
    this.windowObject = options.window;
    this.now = options.now ?? (() => Date.now());
  }

  private getWindowObject() {
    if (this.windowObject) {
      return this.windowObject;
    }
    if (typeof window !== "undefined") {
      return window;
    }
    return undefined;
  }

  private getRequestableConstructor() {
    const windowObject = this.getWindowObject();
    return windowObject?.DeviceOrientationEvent as DeviceOrientationRequestable | undefined;
  }

  private getPermissionRequester() {
    const windowObject = this.getWindowObject();
    const orientationConstructor = this.getRequestableConstructor();
    if (typeof orientationConstructor?.requestPermission === "function") {
      return orientationConstructor;
    }

    return windowObject?.DeviceMotionEvent as DeviceMotionRequestable | undefined;
  }

  private supportsOrientationEvents() {
    const windowObject = this.getWindowObject();
    if (!windowObject) {
      return false;
    }

    if (this.getRequestableConstructor()) {
      return true;
    }

    return (
      "ondeviceorientation" in windowObject ||
      "ondeviceorientationabsolute" in windowObject
    );
  }

  getAvailability(): TiltAvailability {
    const windowObject = this.getWindowObject();
    if (!windowObject) {
      return {
        supported: false,
        permissionRequired: false,
        blockedDiagnostic: createDiagnostic(
          "unsupported-api",
          "Tilt input is not available outside a browser window.",
        ),
      };
    }

    if (!windowObject.isSecureContext) {
      return {
        supported: true,
        permissionRequired: false,
        blockedDiagnostic: createDiagnostic(
          "insecure-context",
          "Tilt input requires a secure context.",
          "Serve the app over HTTPS or localhost.",
        ),
      };
    }

    const policyDiagnostic = detectPermissionsPolicy(windowObject);
    if (policyDiagnostic) {
      return {
        supported: true,
        permissionRequired: false,
        blockedDiagnostic: policyDiagnostic,
      };
    }

    if (!this.supportsOrientationEvents()) {
      return {
        supported: false,
        permissionRequired: false,
        blockedDiagnostic: createDiagnostic(
          "unsupported-api",
          "DeviceOrientationEvent is not supported in this browser.",
        ),
      };
    }

    return {
      supported: true,
      permissionRequired:
        typeof this.getPermissionRequester()?.requestPermission === "function",
    };
  }

  async requestPermission(): Promise<"granted" | "denied"> {
    const permissionRequester = this.getPermissionRequester();
    if (!permissionRequester?.requestPermission) {
      return "granted";
    }

    try {
      return await permissionRequester.requestPermission();
    } catch {
      return "denied";
    }
  }

  subscribe(handlers: TiltSensorHandlers) {
    this.listeners.add(handlers);
    this.ensureListener();

    return () => {
      this.listeners.delete(handlers);
      if (this.listeners.size === 0) {
        this.teardownListener();
      }
    };
  }

  private ensureListener() {
    if (this.eventHandler) {
      return;
    }

    const windowObject = this.getWindowObject();
    if (!windowObject) {
      return;
    }

    this.eventHandler = (event) => {
      if (event.beta == null || event.gamma == null) {
        return;
      }

      const sample: TiltSensorSample = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
        timestamp: this.now(),
      };

      for (const listener of this.listeners) {
        try {
          listener.onSample(sample);
        } catch (error) {
          const normalizedError =
            error instanceof Error ? error : new Error(String(error));
          listener.onError(normalizedError);
        }
      }
    };

    windowObject.addEventListener(
      "deviceorientation",
      this.eventHandler as EventListener,
    );
  }

  private teardownListener() {
    const windowObject = this.getWindowObject();
    if (!windowObject || !this.eventHandler) {
      return;
    }

    windowObject.removeEventListener(
      "deviceorientation",
      this.eventHandler as EventListener,
    );
    this.eventHandler = undefined;
  }
}

export function createDeviceOrientationBackend(
  options: DeviceOrientationBackendOptions = {},
) {
  return new DeviceOrientationBackend(options);
}
