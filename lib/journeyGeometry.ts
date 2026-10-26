export type JourneyPoint = { x: number; y: number };

export const JOURNEY_ENTRY_X = 0.18;
export const JOURNEY_EXIT_X = 0.82;

type Curve = (t: number) => JourneyPoint;
const format = (point: JourneyPoint) => `${point.x.toFixed(3)} ${point.y.toFixed(3)}`;

/** Sample a smooth analytic curve into SVG cubics with matching tangents.
 * Endpoint controls are collinear, so curvature reaches zero at every join. */
function curveCommands(point: Curve, tangent: Curve): string {
  const count = 20;
  const dt = 1 / count;
  let commands = "";
  for (let i = 0; i < count; i++) {
    const a = point(i * dt);
    const b = point((i + 1) * dt);
    const da = tangent(i * dt);
    const db = tangent((i + 1) * dt);
    const c1 = { x: a.x + da.x * dt / 3, y: a.y + da.y * dt / 3 };
    const c2 = { x: b.x - db.x * dt / 3, y: b.y - db.y * dt / 3 };
    if (i === 0) {
      if (da.x === 0) c2.x = a.x;
      if (da.y === 0) c2.y = a.y;
    }
    if (i === count - 1) {
      if (db.x === 0) c1.x = b.x;
      if (db.y === 0) c1.y = b.y;
    }
    commands += ` C ${format(c1)}, ${format(c2)}, ${format(b)}`;
  }
  return commands;
}

const ease = (t: number) => t * t * t * (10 + t * (-15 + 6 * t));
const easeDerivative = (t: number) => 30 * t * t * (1 - t) * (1 - t);

/** An open quarter turn, without reversing either axis or tightening into a hook. */
function turn(from: JourneyPoint, to: JourneyPoint, verticalFirst: boolean): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const bend = (t: number) => 2 * t ** 3 - t ** 4;
  const bendDerivative = (t: number) => 6 * t * t - 4 * t ** 3;
  return curveCommands(
    t => ({
      x: from.x + dx * (verticalFirst ? bend(t) : 1 - bend(1 - t)),
      y: from.y + dy * (verticalFirst ? 1 - bend(1 - t) : bend(t)),
    }),
    t => ({
      x: dx * (verticalFirst ? bendDerivative(t) : bendDerivative(1 - t)),
      y: dy * (verticalFirst ? bendDerivative(1 - t) : bendDerivative(t)),
    }),
  );
}

/** Broad weave with zero curvature and a shared direction at each waypoint. */
export function weavePath(points: JourneyPoint[], axis: "x" | "y" = "y"): string {
  if (!points.length) return "";
  let path = `M ${format(points[0])}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    path += curveCommands(
      t => ({ x: a.x + dx * (axis === "x" ? t : ease(t)), y: a.y + dy * (axis === "y" ? t : ease(t)) }),
      t => ({ x: dx * (axis === "x" ? 1 : easeDerivative(t)), y: dy * (axis === "y" ? 1 : easeDerivative(t)) }),
    );
  }
  return path;
}

export function buildJourneyGeometry(w: number, h: number) {
  const start = { x: w * JOURNEY_ENTRY_X, y: 0 };
  const first = { x: w * 0.65, y: h * 0.78 };
  const last = { x: w * 3.52, y: h * 0.54 };
  const end = { x: w * (3 + JOURNEY_EXIT_X), y: h };
  return {
    entry: `M ${format(start)}` + turn(start, first, true),
    middle: weavePath([first, { x: w * 1.5, y: h * 0.76 }, { x: w * 2.5, y: h * 0.72 }, last], "x"),
    exit: `M ${format(last)}` + turn(last, end, false),
  };
}
