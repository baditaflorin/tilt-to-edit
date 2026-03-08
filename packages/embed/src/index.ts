import {
  createDeviceOrientationBackend,
  createTiltEngine,
  type TiltEngine,
  type TiltEngineOptions,
  type TiltEngineSnapshot,
  type TiltSensorBackend,
} from "@tilt-to-edit/core";

const VERSION = "0.3.0";
const AUTO_MOUNT_SELECTOR = "[data-tilt-to-edit]";
const DEFAULT_MENU_ITEMS = ["Brightness", "Contrast", "Theme", "Focus mode", "Volume"];
const EMBED_STYLES = `
:host {
  all: initial;
}

.tte-shell,
.tte-shell * {
  box-sizing: border-box;
}

.tte-shell {
  font-family: "Avenir Next", "Trebuchet MS", sans-serif;
  color: #f8fafc;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    radial-gradient(circle at top left, rgba(251, 191, 36, 0.18), transparent 32%),
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.18), transparent 28%),
    linear-gradient(155deg, rgba(7, 17, 31, 0.96), rgba(28, 17, 46, 0.92));
  box-shadow: 0 24px 62px rgba(6, 10, 22, 0.36);
  padding: 1.2rem;
}

.tte-head {
  display: flex;
  gap: 0.9rem;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.tte-kicker {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.73rem;
  color: #fbbf24;
}

.tte-title {
  margin: 0;
  font-size: 1.35rem;
  color: #fff7ed;
}

.tte-copy {
  margin: 0.35rem 0 0;
  color: rgba(226, 232, 240, 0.76);
  line-height: 1.5;
}

.tte-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 112px;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  color: #fde68a;
}

.tte-status[data-state="blocked"],
.tte-status[data-state="unsupported"],
.tte-status[data-state="error"] {
  color: #fecaca;
}

.tte-status[data-state="needs-permission"],
.tte-status[data-state="paused"] {
  color: #bfdbfe;
}

.tte-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.tte-metric {
  padding: 0.8rem 0.9rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tte-metric-label {
  display: block;
  color: rgba(226, 232, 240, 0.64);
  font-size: 0.78rem;
}

.tte-metric-value {
  display: block;
  margin-top: 0.22rem;
  color: #fff7ed;
  font-weight: 700;
}

.tte-stage {
  margin-top: 1rem;
}

.tte-vector-pad {
  position: relative;
  min-height: 220px;
  overflow: hidden;
  border-radius: 24px;
  background:
    radial-gradient(circle at 50% 16%, rgba(34, 211, 238, 0.24), transparent 34%),
    linear-gradient(180deg, rgba(12, 33, 64, 0.92), rgba(15, 23, 42, 0.8));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tte-vector-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.34;
}

.tte-vector-axis {
  position: absolute;
  background: rgba(255, 255, 255, 0.14);
}

.tte-vector-axis-x {
  left: 16px;
  right: 16px;
  top: 50%;
  height: 1px;
}

.tte-vector-axis-y {
  top: 16px;
  bottom: 16px;
  left: 50%;
  width: 1px;
}

.tte-vector-orb {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 22px;
  margin-left: -11px;
  margin-top: -11px;
  border-radius: 999px;
  background: #67e8f9;
  box-shadow: 0 0 22px rgba(34, 211, 238, 0.88), 0 0 44px rgba(45, 212, 191, 0.44);
  transition: transform 140ms ease;
}

.tte-vector-label {
  position: absolute;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.46);
}

.tte-vector-label-x {
  right: 18px;
  bottom: 16px;
}

.tte-vector-label-y {
  left: 18px;
  top: 18px;
}

.tte-number-stage {
  padding: 1rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.tte-number-value {
  margin: 0;
  font-size: clamp(2.2rem, 7vw, 3.3rem);
  line-height: 1;
  color: #fff7ed;
}

.tte-number-copy {
  margin: 0.35rem 0 0;
  color: rgba(226, 232, 240, 0.72);
}

.tte-track {
  position: relative;
  height: 10px;
  border-radius: 999px;
  margin-top: 1rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.tte-track-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #2dd4bf, #fbbf24);
  box-shadow: 0 0 24px rgba(45, 212, 191, 0.3);
}

.tte-slider {
  width: 100%;
  margin-top: 1rem;
  accent-color: #fbbf24;
}

.tte-menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.7rem;
}

.tte-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(248, 250, 252, 0.92);
  transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
}

.tte-menu-item[data-highlighted="true"] {
  border-color: rgba(251, 191, 36, 0.62);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(255, 255, 255, 0.1));
  transform: translateY(-1px);
}

.tte-menu-item[data-selected="true"] .tte-menu-state {
  color: #fbbf24;
}

.tte-menu-label {
  font-weight: 600;
}

.tte-menu-state {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.44);
}

.tte-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.tte-button {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.08));
  color: #fff7ed;
  padding: 0.72rem 1rem;
  cursor: pointer;
  box-shadow: 0 18px 38px rgba(8, 15, 28, 0.24);
}

.tte-button[data-variant="primary"] {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.38), rgba(45, 212, 191, 0.22));
}

.tte-button[hidden] {
  display: none;
}

.tte-diagnostics {
  margin: 1rem 0 0;
  padding-left: 1.2rem;
  color: #fed7aa;
}

@media (max-width: 720px) {
  .tte-shell {
    padding: 1rem;
  }

  .tte-head {
    flex-direction: column;
  }
}
`;

export type TiltEmbedKind = "sensor" | "stepper" | "slider" | "menu";

export interface TiltEmbedDetail {
  kind: TiltEmbedKind;
  snapshot: TiltEngineSnapshot;
  committedValue?: number | undefined;
  draftValue?: number | undefined;
  selectedIndex?: number | undefined;
  highlightedIndex?: number | undefined;
  selectedItem?: string | undefined;
  highlightedItem?: string | undefined;
  action?: "idle" | "browse" | "committed" | "reverted" | undefined;
}

export interface TiltEmbedOptions {
  kind?: TiltEmbedKind | undefined;
  title?: string | undefined;
  description?: string | undefined;
  items?: string[] | undefined;
  selectedIndex?: number | undefined;
  min?: number | undefined;
  max?: number | undefined;
  value?: number | undefined;
  step?: number | undefined;
  sensitivity?: number | undefined;
  stepThreshold?: number | undefined;
  backend?: TiltSensorBackend | undefined;
  autoStart?: boolean | undefined;
  onState?: ((detail: TiltEmbedDetail) => void) | undefined;
  onChange?: ((detail: TiltEmbedDetail) => void) | undefined;
  onCommit?: ((detail: TiltEmbedDetail) => void) | undefined;
}

export interface TiltEmbedInstance {
  readonly element: HTMLElement;
  readonly kind: TiltEmbedKind;
  requestPermission: () => Promise<TiltEngineSnapshot>;
  calibrate: () => boolean;
  pause: () => TiltEngineSnapshot;
  resume: () => Promise<TiltEngineSnapshot>;
  confirm: () => TiltEngineSnapshot;
  destroy: () => void;
  getSnapshot: () => TiltEngineSnapshot;
}

export interface TiltEmbedGlobal {
  readonly version: string;
  mount: (target: string | HTMLElement, options?: TiltEmbedOptions) => TiltEmbedInstance;
  scan: (root?: ParentNode | HTMLElement | Document, options?: Pick<TiltEmbedOptions, "backend" | "autoStart">) => TiltEmbedInstance[];
  getInstances: () => TiltEmbedInstance[];
}

interface ResolvedEmbedConfig {
  kind: TiltEmbedKind;
  title: string;
  description: string;
  items: string[];
  selectedIndex: number;
  min: number;
  max: number;
  value: number;
  step: number;
  sensitivity: number;
  stepThreshold: number;
  backend?: TiltSensorBackend | undefined;
  autoStart: boolean;
  onState?: ((detail: TiltEmbedDetail) => void) | undefined;
  onChange?: ((detail: TiltEmbedDetail) => void) | undefined;
  onCommit?: ((detail: TiltEmbedDetail) => void) | undefined;
}

interface BaseDom {
  readonly shell: HTMLElement;
  readonly status: HTMLElement;
  readonly metrics: HTMLDivElement;
  readonly stage: HTMLElement;
  readonly diagnostics: HTMLUListElement;
  readonly primaryActions: HTMLDivElement;
  readonly secondaryActions: HTMLDivElement;
  readonly requestPermissionButton: HTMLButtonElement;
  readonly calibrateButton: HTMLButtonElement;
  readonly pauseButton: HTMLButtonElement;
}

interface MetricDom {
  readonly root: HTMLElement;
  readonly value: HTMLElement;
}

interface WidgetController {
  update: (snapshot: TiltEngineSnapshot) => void;
  buildDetail: (snapshot: TiltEngineSnapshot) => TiltEmbedDetail;
  confirm: () => TiltEngineSnapshot;
  destroy: () => void;
}

const sharedBackend = createDeviceOrientationBackend();
const registry = new WeakMap<HTMLElement, TiltEmbedInstance>();
const mountedInstances = new Set<TiltEmbedInstance>();

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function escapeIndex(index: number, length: number) {
  if (length === 0) {
    return 0;
  }

  return clamp(index, 0, length - 1);
}

function parseKind(value: string | undefined): TiltEmbedKind | null {
  if (
    value === "sensor" ||
    value === "stepper" ||
    value === "slider" ||
    value === "menu"
  ) {
    return value;
  }

  return null;
}

function parseItems(value: string | undefined) {
  const normalized = value
    ?.split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return normalized && normalized.length > 0 ? normalized : DEFAULT_MENU_ITEMS;
}

function parseNumber(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatStatus(status: TiltEngineSnapshot["status"]) {
  switch (status) {
    case "needs-permission":
      return "needs permission";
    default:
      return status;
  }
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  textContent?: string,
) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (textContent !== undefined) {
    element.textContent = textContent;
  }
  return element;
}

function createMetric(label: string) {
  const root = createElement("div", "tte-metric");
  const labelElement = createElement("span", "tte-metric-label", label);
  const valueElement = createElement("strong", "tte-metric-value");
  root.append(labelElement, valueElement);
  return {
    root,
    value: valueElement,
  } satisfies MetricDom;
}

function createButton(label: string, variant: "default" | "primary" = "default") {
  const button = createElement("button", "tte-button", label);
  button.type = "button";
  if (variant === "primary") {
    button.dataset.variant = "primary";
  }
  return button;
}

function createBaseDom(shadowRoot: ShadowRoot, config: ResolvedEmbedConfig) {
  shadowRoot.replaceChildren();

  const style = document.createElement("style");
  style.textContent = EMBED_STYLES;

  const shell = createElement("article", "tte-shell");
  const head = createElement("header", "tte-head");
  const copyWrap = createElement("div");
  const eyebrow = createElement(
    "p",
    "tte-kicker",
    config.kind === "sensor"
      ? "Script Tag Sensor"
      : config.kind === "menu"
        ? "Hybrid Menu"
        : config.kind === "slider"
          ? "Continuous Control"
          : "Discrete Control",
  );
  const title = createElement("h2", "tte-title", config.title);
  const description = createElement("p", "tte-copy", config.description);
  const status = createElement("strong", "tte-status", "paused");
  copyWrap.append(eyebrow, title, description);
  head.append(copyWrap, status);

  const metrics = createElement("div", "tte-metrics");
  const stage = createElement("div", "tte-stage");
  const primaryActions = createElement("div", "tte-actions");
  const secondaryActions = createElement("div", "tte-actions");
  const diagnostics = createElement("ul", "tte-diagnostics");

  const requestPermissionButton = createButton("Enable tilt", "primary");
  const calibrateButton = createButton("Calibrate");
  const pauseButton = createButton("Pause");
  primaryActions.append(requestPermissionButton, calibrateButton, pauseButton);

  shell.append(head, metrics, stage, primaryActions, secondaryActions, diagnostics);
  shadowRoot.append(style, shell);

  return {
    shell,
    status,
    stage,
    diagnostics,
    primaryActions,
    secondaryActions,
    requestPermissionButton,
    calibrateButton,
    pauseButton,
    metrics,
  };
}

function resolveElement(target: string | HTMLElement) {
  if (typeof target !== "string") {
    return target;
  }

  const element = document.querySelector<HTMLElement>(target);
  if (!element) {
    throw new Error(`Unable to find tilt embed target: ${target}`);
  }

  return element;
}

function resolveConfig(element: HTMLElement, options: TiltEmbedOptions = {}): ResolvedEmbedConfig {
  const datasetKind = parseKind(element.dataset.tiltToEdit ?? element.dataset.tiltType);
  const kind = options.kind ?? datasetKind ?? "sensor";

  const defaults = {
    sensor: {
      title: "Tilt Sensor",
      description:
        "This widget exposes live tilt intent so the host page can react with any motion-driven experience.",
    },
    stepper: {
      title: "Tilt Stepper",
      description:
        "Lean left and right to nudge a draft value, then confirm explicitly.",
    },
    slider: {
      title: "Tilt Slider",
      description:
        "Use tilt as a soft analog input, then confirm when the preview lands where you want it.",
    },
    menu: {
      title: "Tilt Menu",
      description:
        "Tilt up and down to browse. Lean right to commit. Lean left to restore the current selection.",
    },
  }[kind];

  const items =
    options.items ??
    parseItems(element.dataset.tiltItems);
  const min = options.min ?? parseNumber(element.dataset.tiltMin, 0);
  const max = options.max ?? parseNumber(element.dataset.tiltMax, 100);
  const initialValue = options.value ?? parseNumber(element.dataset.tiltValue, 42);
  const selectedIndex = escapeIndex(
    options.selectedIndex ?? parseNumber(element.dataset.tiltSelectedIndex, 0),
    items.length,
  );

  return {
    kind,
    title: options.title ?? element.dataset.tiltTitle ?? defaults.title,
    description:
      options.description ?? element.dataset.tiltDescription ?? defaults.description,
    items,
    selectedIndex,
    min,
    max,
    value: clamp(initialValue, min, max),
    step: Math.max(options.step ?? parseNumber(element.dataset.tiltStep, 1), 1),
    sensitivity: Math.max(
      options.sensitivity ?? parseNumber(element.dataset.tiltSensitivity, 20),
      1,
    ),
    stepThreshold: Math.max(
      options.stepThreshold ?? parseNumber(element.dataset.tiltStepThreshold, kind === "menu" ? 8 : 6),
      1,
    ),
    backend: options.backend,
    autoStart: options.autoStart ?? true,
    onState: options.onState,
    onChange: options.onChange,
    onCommit: options.onCommit,
  };
}

function resolveEngineOptions(config: ResolvedEmbedConfig): TiltEngineOptions {
  switch (config.kind) {
    case "slider":
      return {
        backend: config.backend ?? sharedBackend,
        axisMode: "horizontal",
        smoothing: 0.75,
      };
    case "stepper":
      return {
        backend: config.backend ?? sharedBackend,
        axisMode: "horizontal",
        smoothing: 0.75,
        stepThreshold: config.stepThreshold,
      };
    case "menu":
      return {
        backend: config.backend ?? sharedBackend,
        axisMode: "both",
        smoothing: 0.72,
        stepThreshold: config.stepThreshold,
      };
    default:
      return {
        backend: config.backend ?? sharedBackend,
        axisMode: "both",
        deadZone: 2,
        smoothing: 0.72,
        continuousRange: 20,
      };
  }
}

function emitEmbedEvent(
  element: HTMLElement,
  eventName: string,
  detail: TiltEmbedDetail,
  callback?: ((detail: TiltEmbedDetail) => void) | undefined,
) {
  callback?.(detail);
  element.dispatchEvent(
    new CustomEvent(`tilt-to-edit:${eventName}`, {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

function updateBaseStatus(dom: BaseDom, snapshot: TiltEngineSnapshot) {
  dom.status.textContent = formatStatus(snapshot.status);
  dom.status.dataset.state = snapshot.status;
  dom.requestPermissionButton.hidden = snapshot.status !== "needs-permission";
  dom.pauseButton.textContent = snapshot.status === "active" ? "Pause" : "Resume";
  dom.pauseButton.disabled =
    snapshot.status === "blocked" || snapshot.status === "unsupported" || snapshot.status === "error";
  dom.diagnostics.replaceChildren();

  for (const diagnostic of snapshot.diagnostics) {
    const item = createElement("li", undefined, diagnostic.message);
    dom.diagnostics.append(item);
  }
}

function createSensorController(
  element: HTMLElement,
  engine: TiltEngine,
  dom: BaseDom,
  config: ResolvedEmbedConfig,
) {
  const statusMetric = createMetric("Status");
  const intentXMetric = createMetric("Intent X");
  const intentYMetric = createMetric("Intent Y");
  const confirmationsMetric = createMetric("Confirmations");
  dom.metrics.append(
    statusMetric.root,
    intentXMetric.root,
    intentYMetric.root,
    confirmationsMetric.root,
  );

  const pad = createElement("div", "tte-vector-pad");
  const grid = createElement("div", "tte-vector-grid");
  const axisX = createElement("div", "tte-vector-axis tte-vector-axis-x");
  const axisY = createElement("div", "tte-vector-axis tte-vector-axis-y");
  const orb = createElement("div", "tte-vector-orb");
  const xLabel = createElement("span", "tte-vector-label tte-vector-label-x", "X axis");
  const yLabel = createElement("span", "tte-vector-label tte-vector-label-y", "Y axis");
  pad.append(grid, axisX, axisY, orb, xLabel, yLabel);
  dom.stage.append(pad);

  return {
    update(snapshot) {
      updateBaseStatus(dom, snapshot);
      statusMetric.value.textContent = formatStatus(snapshot.status);
      intentXMetric.value.textContent = snapshot.intentVector.x.toFixed(2);
      intentYMetric.value.textContent = snapshot.intentVector.y.toFixed(2);
      confirmationsMetric.value.textContent = String(snapshot.confirmationSequence);
      orb.style.transform = `translate(${snapshot.intentVector.x * 68}px, ${snapshot.intentVector.y * -56}px)`;
    },
    buildDetail(snapshot) {
      return {
        kind: "sensor",
        snapshot,
      };
    },
    confirm() {
      return engine.confirm();
    },
    destroy() {},
  } satisfies WidgetController;
}

function createStepperController(
  element: HTMLElement,
  engine: TiltEngine,
  dom: BaseDom,
  config: ResolvedEmbedConfig,
) {
  let committedValue = config.value;
  let draftValue = config.value;
  let lastSequence = engine.getSnapshot().stepEvents.x.sequence;

  const statusMetric = createMetric("Status");
  const committedMetric = createMetric("Committed");
  const draftMetric = createMetric("Draft");
  const intentMetric = createMetric("Intent X");
  dom.metrics.append(
    statusMetric.root,
    committedMetric.root,
    draftMetric.root,
    intentMetric.root,
  );

  const stage = createElement("div", "tte-number-stage");
  const valueDisplay = createElement("p", "tte-number-value");
  const valueCopy = createElement(
    "p",
    "tte-number-copy",
    "Discrete tilt steps update the draft. Commit when it feels right.",
  );
  const track = createElement("div", "tte-track");
  const fill = createElement("div", "tte-track-fill");
  track.append(fill);
  stage.append(valueDisplay, valueCopy, track);
  dom.stage.append(stage);

  const resetButton = createButton("Reset draft");
  const confirmButton = createButton("Confirm", "primary");
  dom.secondaryActions.append(resetButton, confirmButton);

  const updateVisuals = (snapshot: TiltEngineSnapshot) => {
    updateBaseStatus(dom, snapshot);
    statusMetric.value.textContent = formatStatus(snapshot.status);
    committedMetric.value.textContent = committedValue.toFixed(0);
    draftMetric.value.textContent = draftValue.toFixed(0);
    intentMetric.value.textContent = snapshot.intentVector.x.toFixed(2);
    valueDisplay.textContent = draftValue.toFixed(0);
    fill.style.width = `${((draftValue - config.min) / Math.max(config.max - config.min, 1)) * 100}%`;
  };

  const emitChange = (snapshot: TiltEngineSnapshot) => {
    emitEmbedEvent(
      element,
      "change",
      {
        kind: "stepper",
        snapshot,
        committedValue,
        draftValue,
      },
      config.onChange,
    );
  };

  const commit = (source: "button" | "tilt") => {
    committedValue = draftValue;
    const snapshot = engine.confirm();
    updateVisuals(snapshot);
    emitEmbedEvent(
      element,
      "commit",
      {
        kind: "stepper",
        snapshot,
        committedValue,
        draftValue,
      },
      config.onCommit,
    );
    return snapshot;
  };

  resetButton.addEventListener("click", () => {
    draftValue = committedValue;
    updateVisuals(engine.getSnapshot());
    emitChange(engine.getSnapshot());
  });

  confirmButton.addEventListener("click", () => {
    commit("button");
  });

  return {
    update(snapshot) {
      if (
        snapshot.stepEvents.x.sequence !== lastSequence &&
        snapshot.stepEvents.x.direction !== 0
      ) {
        lastSequence = snapshot.stepEvents.x.sequence;
        draftValue = clamp(
          draftValue + snapshot.stepEvents.x.direction * config.step,
          config.min,
          config.max,
        );
        emitChange(snapshot);
      } else {
        lastSequence = snapshot.stepEvents.x.sequence;
      }

      updateVisuals(snapshot);
    },
    buildDetail(snapshot) {
      return {
        kind: "stepper",
        snapshot,
        committedValue,
        draftValue,
      };
    },
    confirm() {
      return commit("tilt");
    },
    destroy() {},
  } satisfies WidgetController;
}

function createSliderController(
  element: HTMLElement,
  engine: TiltEngine,
  dom: BaseDom,
  config: ResolvedEmbedConfig,
) {
  let committedValue = config.value;
  let draftValue = config.value;
  let lastEmittedDraft = Number.NaN;

  const statusMetric = createMetric("Status");
  const committedMetric = createMetric("Committed");
  const draftMetric = createMetric("Draft");
  const intentMetric = createMetric("Intent X");
  dom.metrics.append(
    statusMetric.root,
    committedMetric.root,
    draftMetric.root,
    intentMetric.root,
  );

  const stage = createElement("div", "tte-number-stage");
  const valueDisplay = createElement("p", "tte-number-value");
  const valueCopy = createElement(
    "p",
    "tte-number-copy",
    "Continuous tilt previews the value before you commit it.",
  );
  const slider = createElement("input", "tte-slider") as HTMLInputElement;
  slider.type = "range";
  slider.readOnly = true;
  slider.min = String(config.min);
  slider.max = String(config.max);
  stage.append(valueDisplay, valueCopy, slider);
  dom.stage.append(stage);

  const confirmButton = createButton("Confirm", "primary");
  dom.secondaryActions.append(confirmButton);

  const updateVisuals = (snapshot: TiltEngineSnapshot) => {
    updateBaseStatus(dom, snapshot);
    statusMetric.value.textContent = formatStatus(snapshot.status);
    committedMetric.value.textContent = committedValue.toFixed(2);
    draftMetric.value.textContent = draftValue.toFixed(2);
    intentMetric.value.textContent = snapshot.intentVector.x.toFixed(2);
    valueDisplay.textContent = draftValue.toFixed(2);
    slider.value = String(draftValue);
  };

  const emitChange = (snapshot: TiltEngineSnapshot) => {
    emitEmbedEvent(
      element,
      "change",
      {
        kind: "slider",
        snapshot,
        committedValue,
        draftValue,
      },
      config.onChange,
    );
  };

  const commit = (source: "button" | "tilt") => {
    committedValue = draftValue;
    const snapshot = engine.confirm();
    updateVisuals(snapshot);
    emitEmbedEvent(
      element,
      "commit",
      {
        kind: "slider",
        snapshot,
        committedValue,
        draftValue,
      },
      config.onCommit,
    );
    return snapshot;
  };

  confirmButton.addEventListener("click", () => {
    commit("button");
  });

  return {
    update(snapshot) {
      draftValue = clamp(
        committedValue + snapshot.intentVector.x * config.sensitivity,
        config.min,
        config.max,
      );

      if (Math.abs(draftValue - lastEmittedDraft) >= 0.01) {
        lastEmittedDraft = draftValue;
        emitChange(snapshot);
      }

      updateVisuals(snapshot);
    },
    buildDetail(snapshot) {
      return {
        kind: "slider",
        snapshot,
        committedValue,
        draftValue,
      };
    },
    confirm() {
      return commit("tilt");
    },
    destroy() {},
  } satisfies WidgetController;
}

function createMenuController(
  element: HTMLElement,
  engine: TiltEngine,
  dom: BaseDom,
  config: ResolvedEmbedConfig,
) {
  let selectedIndex = config.selectedIndex;
  let highlightedIndex = config.selectedIndex;
  let lastAction: "idle" | "browse" | "committed" | "reverted" = "idle";
  let lastVerticalSequence = engine.getSnapshot().stepEvents.y.sequence;
  let lastHorizontalSequence = engine.getSnapshot().stepEvents.x.sequence;

  const statusMetric = createMetric("Status");
  const selectedMetric = createMetric("Selected");
  const highlightedMetric = createMetric("Highlighted");
  const actionMetric = createMetric("Action");
  const intentMetric = createMetric("Intent");
  dom.metrics.append(
    statusMetric.root,
    selectedMetric.root,
    highlightedMetric.root,
    actionMetric.root,
    intentMetric.root,
  );

  const list = createElement("ol", "tte-menu-list");
  const itemRows = config.items.map((item) => {
    const row = createElement("li", "tte-menu-item");
    const label = createElement("span", "tte-menu-label", item);
    const state = createElement("span", "tte-menu-state");
    row.append(label, state);
    list.append(row);
    return {
      row,
      state,
      item,
    };
  });
  dom.stage.append(list);

  const returnButton = createButton("Return");
  const confirmButton = createButton("Commit", "primary");
  dom.secondaryActions.append(returnButton, confirmButton);

  const syncList = () => {
    for (const [index, item] of itemRows.entries()) {
      const highlighted = index === highlightedIndex;
      const selected = index === selectedIndex;
      item.row.dataset.highlighted = String(highlighted);
      item.row.dataset.selected = String(selected);
      item.state.textContent = selected ? "Live" : highlighted ? "Focus" : "";
    }
  };

  const updateVisuals = (snapshot: TiltEngineSnapshot) => {
    updateBaseStatus(dom, snapshot);
    statusMetric.value.textContent = formatStatus(snapshot.status);
    selectedMetric.value.textContent = config.items[selectedIndex] ?? "n/a";
    highlightedMetric.value.textContent = config.items[highlightedIndex] ?? "n/a";
    actionMetric.value.textContent =
      lastAction === "idle" ? "idle" : lastAction === "browse" ? "browse" : lastAction;
    intentMetric.value.textContent = `${snapshot.intentVector.x.toFixed(2)} / ${snapshot.intentVector.y.toFixed(2)}`;
    syncList();
  };

  const emitChange = (snapshot: TiltEngineSnapshot) => {
    emitEmbedEvent(
      element,
      "change",
      {
        kind: "menu",
        snapshot,
        action: lastAction,
        selectedIndex,
        highlightedIndex,
        selectedItem: config.items[selectedIndex] ?? "",
        highlightedItem: config.items[highlightedIndex] ?? "",
      },
      config.onChange,
    );
  };

  const commit = (source: "button" | "tilt") => {
    selectedIndex = highlightedIndex;
    lastAction = "committed";
    const snapshot = engine.confirm();
    updateVisuals(snapshot);
    const detail = {
      kind: "menu" as const,
      snapshot,
      action: lastAction,
      selectedIndex,
      highlightedIndex,
      selectedItem: config.items[selectedIndex] ?? "",
      highlightedItem: config.items[highlightedIndex] ?? "",
    };
    emitEmbedEvent(element, "commit", detail, config.onCommit);
    return snapshot;
  };

  const revert = () => {
    highlightedIndex = selectedIndex;
    lastAction = "reverted";
    const snapshot = engine.getSnapshot();
    updateVisuals(snapshot);
    emitChange(snapshot);
    return snapshot;
  };

  returnButton.addEventListener("click", () => {
    revert();
  });

  confirmButton.addEventListener("click", () => {
    commit("button");
  });

  return {
    update(snapshot) {
      if (
        snapshot.stepEvents.y.sequence !== lastVerticalSequence &&
        snapshot.stepEvents.y.direction !== 0
      ) {
        lastVerticalSequence = snapshot.stepEvents.y.sequence;
        highlightedIndex = clamp(
          highlightedIndex + snapshot.stepEvents.y.direction,
          0,
          config.items.length - 1,
        );
        lastAction = "browse";
        emitChange(snapshot);
      } else {
        lastVerticalSequence = snapshot.stepEvents.y.sequence;
      }

      if (
        snapshot.stepEvents.x.sequence !== lastHorizontalSequence &&
        snapshot.stepEvents.x.direction !== 0
      ) {
        lastHorizontalSequence = snapshot.stepEvents.x.sequence;
        const horizontalDominant =
          Math.abs(snapshot.intentVector.x) > Math.abs(snapshot.intentVector.y) + 0.08;

        if (horizontalDominant) {
          if (snapshot.stepEvents.x.direction > 0) {
            commit("tilt");
          } else {
            revert();
          }
        }
      } else {
        lastHorizontalSequence = snapshot.stepEvents.x.sequence;
      }

      updateVisuals(snapshot);
    },
    buildDetail(snapshot) {
      return {
        kind: "menu",
        snapshot,
        action: lastAction,
        selectedIndex,
        highlightedIndex,
        selectedItem: config.items[selectedIndex] ?? "",
        highlightedItem: config.items[highlightedIndex] ?? "",
      };
    },
    confirm() {
      return commit("tilt");
    },
    destroy() {},
  } satisfies WidgetController;
}

function createWidgetController(
  element: HTMLElement,
  engine: TiltEngine,
  dom: BaseDom,
  config: ResolvedEmbedConfig,
) {
  switch (config.kind) {
    case "stepper":
      return createStepperController(element, engine, dom, config);
    case "slider":
      return createSliderController(element, engine, dom, config);
    case "menu":
      return createMenuController(element, engine, dom, config);
    default:
      return createSensorController(element, engine, dom, config);
  }
}

function mount(target: string | HTMLElement, options: TiltEmbedOptions = {}) {
  const element = resolveElement(target);
  const existing = registry.get(element);
  if (existing) {
    return existing;
  }

  const config = resolveConfig(element, options);
  const shadowRoot = element.shadowRoot ?? element.attachShadow({ mode: "open" });
  const dom = createBaseDom(shadowRoot, config);
  const engine = createTiltEngine(resolveEngineOptions(config));
  const controller = createWidgetController(element, engine, dom, config);

  const emitState = (snapshot: TiltEngineSnapshot) => {
    const detail = controller.buildDetail(snapshot);
    emitEmbedEvent(element, "state", detail, config.onState);
  };

  const unsubscribe = engine.subscribe((snapshot) => {
    controller.update(snapshot);
    emitState(snapshot);
  });

  const instance: TiltEmbedInstance = {
    element,
    kind: config.kind,
    requestPermission: () => engine.requestPermission(),
    calibrate: () => engine.calibrate(),
    pause: () => engine.pause(),
    resume: () => engine.resume(),
    confirm: () => controller.confirm(),
    destroy: () => {
      unsubscribe();
      controller.destroy();
      engine.destroy();
      shadowRoot.replaceChildren();
      registry.delete(element);
      mountedInstances.delete(instance);
    },
    getSnapshot: () => engine.getSnapshot(),
  };

  dom.requestPermissionButton.addEventListener("click", () => {
    void instance.requestPermission();
  });
  dom.calibrateButton.addEventListener("click", () => {
    instance.calibrate();
  });
  dom.pauseButton.addEventListener("click", () => {
    if (engine.getSnapshot().status === "active") {
      instance.pause();
      return;
    }
    void instance.resume();
  });

  registry.set(element, instance);
  mountedInstances.add(instance);
  controller.update(engine.getSnapshot());
  emitState(engine.getSnapshot());
  emitEmbedEvent(
    element,
    "ready",
    controller.buildDetail(engine.getSnapshot()),
  );

  if (config.autoStart) {
    void engine.start();
  }

  return instance;
}

function collectTargets(root: ParentNode | HTMLElement | Document) {
  const targets = new Set<HTMLElement>();
  if (root instanceof HTMLElement && root.matches(AUTO_MOUNT_SELECTOR)) {
    targets.add(root);
  }

  if ("querySelectorAll" in root) {
    for (const element of root.querySelectorAll<HTMLElement>(AUTO_MOUNT_SELECTOR)) {
      targets.add(element);
    }
  }

  return Array.from(targets);
}

function scan(
  root: ParentNode | HTMLElement | Document = document,
  options: Pick<TiltEmbedOptions, "backend" | "autoStart"> = {},
) {
  return collectTargets(root).map((element) =>
    mount(element, {
      backend: options.backend,
      autoStart: options.autoStart,
    }),
  );
}

function getInstances() {
  return Array.from(mountedInstances);
}

export const TiltToEdit: TiltEmbedGlobal = {
  version: VERSION,
  mount,
  scan,
  getInstances,
};

declare global {
  interface Window {
    TiltToEdit?: TiltEmbedGlobal;
  }
}

if (typeof window !== "undefined") {
  window.TiltToEdit = TiltToEdit;

  const autoScan = () => {
    scan();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoScan, { once: true });
  } else {
    queueMicrotask(autoScan);
  }
}

export default TiltToEdit;
