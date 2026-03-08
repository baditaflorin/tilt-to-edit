import { useEffect, useRef, useState } from "react";

import {
  createDeviceOrientationBackend,
  type TiltSensorBackend,
} from "@tilt-to-edit/core";
import { useTiltToEdit } from "@tilt-to-edit/react";

interface MotionState {
  speed: number;
  velocityX: number;
  velocityY: number;
  hue: number;
}

interface TrailPoint extends MotionState {
  id: number;
  x: number;
  y: number;
  z: number;
}

type LastAction = "browse" | "committed" | "returned";

const MENU_ITEMS = [
  "Brightness",
  "Contrast",
  "Theme",
  "Ambient audio",
  "Focus mode",
];

export interface AppProps {
  backend?: TiltSensorBackend;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

function getHue(velocityX: number, velocityY: number) {
  return ((toDegrees(Math.atan2(velocityY, velocityX)) % 360) + 360) % 360;
}

function formatSigned(value: number) {
  return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}

export function App({ backend }: AppProps) {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [highlightedIndex, setHighlightedIndex] = useState(2);
  const [lastAction, setLastAction] = useState<LastAction>("browse");
  const [liveBackend] = useState<TiltSensorBackend>(
    () => backend ?? createDeviceOrientationBackend(),
  );
  const resolvedBackend = backend ?? liveBackend;
  const { state, requestPermission, calibrate, confirm, pause, resume } =
    useTiltToEdit({
      backend: resolvedBackend,
      axisMode: "both",
      deadZone: 1,
      smoothing: 0.72,
      continuousRange: 18,
      stepThreshold: 8,
    });
  const previousRef = useRef<{ x: number; y: number; timestamp: number } | null>(
    null,
  );
  const lastVerticalSequenceRef = useRef(state.stepEvents.y.sequence);
  const lastHorizontalSequenceRef = useRef(state.stepEvents.x.sequence);
  const [motion, setMotion] = useState<MotionState>({
    speed: 0,
    velocityX: 0,
    velocityY: 0,
    hue: 210,
  });
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  useEffect(() => {
    if (state.stepEvents.y.sequence === lastVerticalSequenceRef.current) {
      return;
    }

    lastVerticalSequenceRef.current = state.stepEvents.y.sequence;
    if (state.stepEvents.y.direction === 0) {
      return;
    }

    setLastAction("browse");
    setHighlightedIndex((currentIndex) => {
      const nextIndex = currentIndex + state.stepEvents.y.direction;
      return Math.min(Math.max(nextIndex, 0), MENU_ITEMS.length - 1);
    });
  }, [state.stepEvents.y.direction, state.stepEvents.y.sequence]);

  useEffect(() => {
    if (state.stepEvents.x.sequence === lastHorizontalSequenceRef.current) {
      return;
    }

    lastHorizontalSequenceRef.current = state.stepEvents.x.sequence;
    if (state.stepEvents.x.direction === 0) {
      return;
    }

    const horizontalDominant =
      Math.abs(state.intentVector.x) > Math.abs(state.intentVector.y) + 0.08;
    if (!horizontalDominant) {
      return;
    }

    if (state.stepEvents.x.direction > 0) {
      confirm();
      setSelectedIndex(highlightedIndex);
      setLastAction("committed");
      return;
    }

    setHighlightedIndex(selectedIndex);
    setLastAction("returned");
  }, [
    confirm,
    highlightedIndex,
    selectedIndex,
    state.intentVector.x,
    state.intentVector.y,
    state.stepEvents.x.direction,
    state.stepEvents.x.sequence,
  ]);

  useEffect(() => {
    const sample = state.lastSample;
    if (!sample) {
      return;
    }

    const current = {
      x: state.intentVector.x,
      y: state.intentVector.y,
      timestamp: sample.timestamp,
    };
    const previous = previousRef.current;
    previousRef.current = current;

    if (!previous || previous.timestamp === current.timestamp) {
      return;
    }

    const elapsedMs = Math.max(current.timestamp - previous.timestamp, 1);
    const velocityX = ((current.x - previous.x) / elapsedMs) * 1000;
    const velocityY = ((current.y - previous.y) / elapsedMs) * 1000;
    const rawSpeed = Math.hypot(velocityX, velocityY);
    const speed = clamp(rawSpeed, 0, 8);
    const normalizedSpeed = clamp(speed / 8, 0, 1);
    const hue = getHue(velocityX, velocityY);
    const trailPoint: TrailPoint = {
      id: current.timestamp,
      x: current.x,
      y: current.y,
      z: 24 + normalizedSpeed * 110,
      speed,
      velocityX,
      velocityY,
      hue,
    };

    setMotion({
      speed,
      velocityX,
      velocityY,
      hue,
    });
    setTrail((currentTrail) => [...currentTrail.slice(-11), trailPoint]);
  }, [state.intentVector.x, state.intentVector.y, state.lastSample?.timestamp]);

  const speedRatio = clamp(motion.speed / 8, 0, 1);
  const intentMagnitude = clamp(state.intentVector.magnitude, 0, 1.5);
  const chamber = {
    orbX: state.intentVector.x * 132,
    orbY: state.intentVector.y * 114,
    orbZ: 26 + speedRatio * 108,
    intentLength: 34 + intentMagnitude * 134,
    intentAngle: toDegrees(
      Math.atan2(state.intentVector.y, state.intentVector.x || 0.0001),
    ),
    velocityLength: 44 + speedRatio * 112,
    velocityAngle: toDegrees(
      Math.atan2(motion.velocityY, motion.velocityX || 0.0001),
    ),
    glowColor: `hsla(${motion.hue}, 100%, ${66 + speedRatio * 12}%, 0.95)`,
    beamColor: `hsla(${motion.hue}, 100%, ${62 + speedRatio * 14}%, ${0.45 + speedRatio * 0.4})`,
    shadowColor: `hsla(${motion.hue}, 100%, 60%, ${0.18 + speedRatio * 0.26})`,
    verticalGlow: clamp(Math.abs(state.intentVector.y), 0.18, 1),
    commitGlow: clamp(Math.max(state.intentVector.x, 0), 0.14, 1),
    returnGlow: clamp(Math.max(-state.intentVector.x, 0), 0.14, 1),
  };

  return (
    <main className="shell">
      <div className="nebula nebula-a" aria-hidden="true" />
      <div className="nebula nebula-b" aria-hidden="true" />
      <div className="nebula nebula-c" aria-hidden="true" />

      <header className="hero">
        <div>
          <p className="eyebrow">3D Hybrid Control</p>
          <h1>React Vector Space</h1>
          <p className="hero-copy">
            This version turns the vector chamber into a spatial menu: tilt up
            and down to browse the stack, lean right to keep the focused item,
            and lean left to snap back to the committed choice.
          </p>
          <a className="back-link" href="../">
            View all demos
          </a>
        </div>

        <section className="ritual-panel">
          <p className="micro-label">Gesture language</p>
          <ol>
            <li>Tap <strong>Enable tilt</strong>.</li>
            <li>Allow <strong>Motion &amp; Orientation Access</strong>.</li>
            <li>Tap <strong>Calibrate</strong> in a neutral pose.</li>
            <li>Browse vertically, then lean right to commit or left to return.</li>
          </ol>
          <div className="action-row">
            {state.status === "needs-permission" ? (
              <button
                onClick={() => {
                  void requestPermission();
                }}
                type="button"
              >
                Enable tilt
              </button>
            ) : null}
            <button
              onClick={() => {
                calibrate();
              }}
              type="button"
            >
              Calibrate
            </button>
            {state.status === "active" ? (
              <button
                onClick={() => {
                  pause();
                }}
                type="button"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={() => {
                  void resume();
                }}
                type="button"
              >
                Resume
              </button>
            )}
          </div>
        </section>
      </header>

      <section className="experience-grid">
        <section className="space-card">
          <div className="card-head">
            <div>
              <p className="micro-label">Spatial menu</p>
              <h2>Floating focus stack</h2>
            </div>
            <strong className={`status-badge status-${state.status}`}>{state.status}</strong>
          </div>

          <p className="space-copy">
            The center lane is browse. The right gate commits. The left gate
            restores the current selection. Motion speed changes the glow so the
            gesture feels alive instead of purely mechanical.
          </p>

          <div className="space-stage">
            <div className="gate-label gate-left">Return left</div>
            <div className="gate-label gate-right">Commit right</div>

            <div className="space-room">
              <div className="plane floor-grid" />
              <div className="plane back-grid" />
              <div className="plane side-grid" />

              <div className="rail rail-vertical">
                <span>Browse</span>
              </div>
              <div
                className="rail rail-left"
                style={{
                  opacity: chamber.returnGlow,
                  boxShadow: `0 0 34px rgba(244, 114, 182, ${0.18 + chamber.returnGlow * 0.48})`,
                }}
              >
                <span>Return</span>
              </div>
              <div
                className="rail rail-right"
                style={{
                  opacity: chamber.commitGlow,
                  boxShadow: `0 0 34px rgba(56, 189, 248, ${0.18 + chamber.commitGlow * 0.48})`,
                }}
              >
                <span>Commit</span>
              </div>

              <div className="origin-core" />
              <div
                className="intent-beam"
                style={{
                  width: `${chamber.intentLength}px`,
                  transform: `translate3d(0, 0, 18px) rotate(${chamber.intentAngle}deg)`,
                  boxShadow: `0 0 28px ${chamber.beamColor}`,
                  background: `linear-gradient(90deg, rgba(255,255,255,0.08), ${chamber.beamColor})`,
                }}
              />
              <div
                className="velocity-beam"
                style={{
                  width: `${chamber.velocityLength}px`,
                  transform: `translate3d(${chamber.orbX}px, ${chamber.orbY}px, ${chamber.orbZ}px) rotate(${chamber.velocityAngle}deg)`,
                  boxShadow: `0 0 34px ${chamber.glowColor}`,
                  background: `linear-gradient(90deg, rgba(255,255,255,0.04), ${chamber.glowColor})`,
                }}
              />
              {trail.map((point, index) => {
                const opacity = (index + 1) / trail.length;
                const scale = 0.35 + opacity * 0.85;
                return (
                  <div
                    key={point.id}
                    className="trail-point"
                    style={{
                      transform: `translate3d(${point.x * 132}px, ${point.y * 114}px, ${point.z}px) scale(${scale})`,
                      background: `hsla(${point.hue}, 100%, 68%, ${0.28 + opacity * 0.5})`,
                      boxShadow: `0 0 ${14 + opacity * 22}px hsla(${point.hue}, 100%, 64%, ${0.18 + opacity * 0.46})`,
                    }}
                  />
                );
              })}
              {MENU_ITEMS.map((item, index) => {
                const relative = index - highlightedIndex;
                const isHighlighted = index === highlightedIndex;
                const isSelected = index === selectedIndex;
                const depth = 86 - Math.abs(relative) * 56;
                const x = (isHighlighted ? state.intentVector.x * 34 : 0) + relative * 5;
                const y = relative * 92 - state.intentVector.y * 38;
                const scale = clamp(1.04 - Math.abs(relative) * 0.08, 0.72, 1.08);
                const opacity = clamp(1 - Math.abs(relative) * 0.18, 0.3, 1);
                const hue = isHighlighted
                  ? motion.hue
                  : (motion.hue + relative * 18 + 360) % 360;

                return (
                  <article
                    key={item}
                    className={`menu-node${isHighlighted ? " is-highlighted" : ""}${isSelected ? " is-selected" : ""}`}
                    style={{
                      opacity,
                      transform: `translate3d(${x}px, ${y}px, ${depth}px) rotateY(${state.intentVector.x * 10 - relative * 5}deg) rotateX(${relative * -4}deg) scale(${scale})`,
                      borderColor: isHighlighted
                        ? `hsla(${hue}, 100%, 74%, 0.8)`
                        : isSelected
                          ? "rgba(251, 191, 36, 0.54)"
                          : "rgba(255, 255, 255, 0.08)",
                      boxShadow: isHighlighted
                        ? `0 24px 60px hsla(${hue}, 100%, 62%, 0.24), 0 0 40px hsla(${hue}, 100%, 64%, 0.24)`
                        : isSelected
                          ? "0 24px 60px rgba(251, 191, 36, 0.18)"
                          : "0 20px 48px rgba(5, 10, 24, 0.22)",
                    }}
                  >
                    <span className="menu-node-title">{item}</span>
                    <span className="menu-node-meta">
                      {isSelected
                        ? "Selected"
                        : isHighlighted
                          ? "Focus"
                          : `${Math.abs(relative)} away`}
                    </span>
                  </article>
                );
              })}
              <div
                className="vector-orb"
                data-testid="vector-orb"
                style={{
                  transform: `translate3d(${chamber.orbX}px, ${chamber.orbY}px, ${chamber.orbZ}px)`,
                  background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${chamber.glowColor} 34%, rgba(10, 16, 30, 0.76) 100%)`,
                  boxShadow: `0 0 34px ${chamber.glowColor}, 0 0 80px ${chamber.shadowColor}`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="metrics-card">
          <div className="card-head">
            <div>
              <p className="micro-label">Menu telemetry</p>
              <h2>State</h2>
            </div>
          </div>

          <div className="metric-grid">
            <div>
              <span>Status</span>
              <strong>{state.status}</strong>
            </div>
            <div>
              <span>Selected</span>
              <strong>{MENU_ITEMS[selectedIndex]}</strong>
            </div>
            <div>
              <span>Highlighted</span>
              <strong>{MENU_ITEMS[highlightedIndex]}</strong>
            </div>
            <div>
              <span>Action</span>
              <strong>{lastAction}</strong>
            </div>
            <div>
              <span>Intent</span>
              <strong>
                {formatSigned(state.intentVector.x)} /{" "}
                {formatSigned(state.intentVector.y)}
              </strong>
            </div>
            <div>
              <span>Speed</span>
              <strong>{motion.speed.toFixed(2)}</strong>
            </div>
            <div>
              <span>Velocity X</span>
              <strong>{formatSigned(motion.velocityX)}</strong>
            </div>
            <div>
              <span>Velocity Y</span>
              <strong>{formatSigned(motion.velocityY)}</strong>
            </div>
            <div>
              <span>Trail</span>
              <strong>{trail.length}</strong>
            </div>
            <div>
              <span>Confirmations</span>
              <strong>{state.confirmationSequence}</strong>
            </div>
          </div>

          <div className="legend">
            <div>
              <span className="legend-swatch browse" />
              <p>Vertical motion walks the stack one card at a time.</p>
            </div>
            <div>
              <span className="legend-swatch commit" />
              <p>Right tilt commits the focused card to the live selection.</p>
            </div>
            <div>
              <span className="legend-swatch return" />
              <p>Left tilt throws focus back to the last committed card.</p>
            </div>
          </div>

          {state.diagnostics.length > 0 ? (
            <ul className="diagnostics">
              {state.diagnostics.map((diagnostic) => (
                <li key={`${diagnostic.code}-${diagnostic.message}`}>
                  {diagnostic.message}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </section>
    </main>
  );
}
