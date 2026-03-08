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
  const [liveBackend] = useState<TiltSensorBackend>(
    () => backend ?? createDeviceOrientationBackend(),
  );
  const resolvedBackend = backend ?? liveBackend;
  const { state, requestPermission, calibrate, pause, resume } = useTiltToEdit({
    backend: resolvedBackend,
    axisMode: "both",
    deadZone: 1,
    smoothing: 0.82,
    continuousRange: 18,
  });
  const previousRef = useRef<{ x: number; y: number; timestamp: number } | null>(
    null,
  );
  const [motion, setMotion] = useState<MotionState>({
    speed: 0,
    velocityX: 0,
    velocityY: 0,
    hue: 210,
  });
  const [trail, setTrail] = useState<TrailPoint[]>([]);

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
      z: 24 + normalizedSpeed * 120,
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

  const x = state.intentVector.x * 126;
  const y = state.intentVector.y * 126;
  const speedRatio = clamp(motion.speed / 8, 0, 1);
  const intentMagnitude = clamp(state.intentVector.magnitude, 0, 1.5);
  const chamber = {
    orbX: x,
    orbY: y,
    orbZ: 24 + speedRatio * 120,
    intentLength: 28 + intentMagnitude * 138,
    intentAngle: toDegrees(
      Math.atan2(state.intentVector.y, state.intentVector.x || 0.0001),
    ),
    velocityLength: 42 + speedRatio * 118,
    velocityAngle: toDegrees(
      Math.atan2(motion.velocityY, motion.velocityX || 0.0001),
    ),
    glowColor: `hsla(${motion.hue}, 100%, ${66 + speedRatio * 10}%, 0.95)`,
    beamColor: `hsla(${motion.hue}, 100%, ${62 + speedRatio * 14}%, ${0.45 + speedRatio * 0.4})`,
    shadowColor: `hsla(${motion.hue}, 100%, 60%, ${0.16 + speedRatio * 0.26})`,
  };

  return (
    <main className="shell">
      <div className="nebula nebula-a" aria-hidden="true" />
      <div className="nebula nebula-b" aria-hidden="true" />
      <div className="nebula nebula-c" aria-hidden="true" />

      <header className="hero">
        <div>
          <p className="eyebrow">3D Visualizer</p>
          <h1>React Vector Space</h1>
          <p className="hero-copy">
            This demo places tilt intent inside a glowing chamber so direction,
            speed, and velocity read more like movement through space than raw
            sensor numbers.
          </p>
          <a className="back-link" href="../">
            View all demos
          </a>
        </div>

        <section className="ritual-panel">
          <p className="micro-label">How to read it</p>
          <ol>
            <li>Tap <strong>Enable tilt</strong>.</li>
            <li>Allow <strong>Motion &amp; Orientation Access</strong>.</li>
            <li>Tap <strong>Calibrate</strong> in a neutral pose.</li>
            <li>The core beam shows intent. The side beam shows velocity.</li>
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
              <p className="micro-label">Spatial scene</p>
              <h2>Intent chamber</h2>
            </div>
            <strong className={`status-badge status-${state.status}`}>{state.status}</strong>
          </div>

          <div className="space-stage">
            <div className="space-room">
              <div className="plane floor-grid" />
              <div className="plane back-grid" />
              <div className="plane side-grid" />

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
                      transform: `translate3d(${point.x * 126}px, ${point.y * 126}px, ${point.z}px) scale(${scale})`,
                      background: `hsla(${point.hue}, 100%, 68%, ${0.28 + opacity * 0.5})`,
                      boxShadow: `0 0 ${14 + opacity * 22}px hsla(${point.hue}, 100%, 64%, ${0.18 + opacity * 0.46})`,
                    }}
                  />
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
              <p className="micro-label">Motion vectors</p>
              <h2>Telemetry</h2>
            </div>
          </div>

          <div className="metric-grid">
            <div>
              <span>Intent X</span>
              <strong>{formatSigned(state.intentVector.x)}</strong>
            </div>
            <div>
              <span>Intent Y</span>
              <strong>{formatSigned(state.intentVector.y)}</strong>
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
              <span>Speed</span>
              <strong>{motion.speed.toFixed(2)}</strong>
            </div>
            <div>
              <span>Trail</span>
              <strong>{trail.length}</strong>
            </div>
          </div>

          <div className="legend">
            <div>
              <span className="legend-swatch slow" />
              <p>Slow motion stays cool and blue.</p>
            </div>
            <div>
              <span className="legend-swatch medium" />
              <p>Mid-speed turns electric cyan and lime.</p>
            </div>
            <div>
              <span className="legend-swatch fast" />
              <p>Fast directional changes flare warm and bright.</p>
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
