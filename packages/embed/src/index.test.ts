import { createTiltSimulator } from "@tilt-to-edit/core";

import { TiltToEdit } from "./index";

function emitSequence(
  simulator: ReturnType<typeof createTiltSimulator>,
  samples: Array<{ beta: number; gamma: number; timestamp: number }>,
) {
  for (const sample of samples) {
    simulator.emit(sample);
  }
}

describe("@tilt-to-edit/embed", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    for (const instance of TiltToEdit.getInstances()) {
      instance.destroy();
    }
  });

  it("mounts a hybrid menu widget and emits commit events", () => {
    const simulator = createTiltSimulator();
    const host = document.createElement("div");
    document.body.append(host);

    const commits: string[] = [];
    host.addEventListener("tilt-to-edit:commit", (event) => {
      commits.push(
        (event as CustomEvent<{ selectedItem?: string }>).detail.selectedItem ?? "",
      );
    });

    TiltToEdit.mount(host, {
      kind: "menu",
      items: ["One", "Two", "Three"],
      backend: simulator.backend,
    });

    emitSequence(simulator, [
      { beta: 0, gamma: 0, timestamp: 0 },
      { beta: 16, gamma: 0, timestamp: 10 },
      { beta: 0, gamma: 0, timestamp: 220 },
      { beta: 0, gamma: 16, timestamp: 420 },
    ]);

    expect(commits).toEqual(["Two"]);

    const shadowText = host.shadowRoot?.textContent ?? "";
    expect(shadowText).toContain("Two");
    expect(shadowText).toContain("committed");
  });

  it("scans declarative sensor embeds and surfaces state events", () => {
    const simulator = createTiltSimulator();
    const host = document.createElement("div");
    host.dataset.tiltToEdit = "sensor";
    host.dataset.tiltTitle = "Intent Monitor";
    document.body.append(host);

    const seenX: number[] = [];
    host.addEventListener("tilt-to-edit:state", (event) => {
      seenX.push(
        Number(
          (event as CustomEvent<{ snapshot: { intentVector: { x: number } } }>).detail
            .snapshot.intentVector.x.toFixed(2),
        ),
      );
    });

    const instances = TiltToEdit.scan(document, { backend: simulator.backend });
    expect(instances).toHaveLength(1);
    expect(window.TiltToEdit).toBe(TiltToEdit);

    emitSequence(simulator, [
      { beta: 0, gamma: 0, timestamp: 0 },
      { beta: 0, gamma: 18, timestamp: 30 },
    ]);

    expect(seenX.some((value) => value > 0)).toBe(true);
    expect(host.shadowRoot?.textContent).toContain("Intent Monitor");
  });
});
