import Rand from "rand-seed";
import { State, STATE_DEFAULTS } from "./state";

type PlotPoint = {
  value: number;
  index: number;
  zone: number;
  clip?: boolean;
  offset?: number;
  slope?: number;
};

// state
// written like i'd want to use it in teensy c++
let points: number[] = []; // length of max points
let pointsLen = 0;
const slopes: number[] = []; // length of max points
// const transitionIndexes: number[] = []; // length of max points
// let transitionIndexesLen = 0;
let currentIndex = 0;
let currentOffset = 0;
let timeInZone = 0;

// demo only
let zone = 100;

// big bucket of metadata and parameters
// flexible for demo
// likely ommitted or hardcoded for real thing
type Meta = State & { label: string; max: number };

let meta: Meta = {
  ...STATE_DEFAULTS,
  label: "",
  max: 10,
};

export function setMeta(m: Meta) {
  meta = m;
}

function computeSlopes(values: number[], len: number, slopesRef: number[]) {
  let prev = values[0];
  for (let i = 0; i < len; i++) {
    const value = values[i];
    const slope = value - prev;
    prev = value;
    slopesRef[i] = slope;
  }
}

const isOutOfRange = (value: number) => {
  return value > meta.max || value < 0;
};

export function compute(values: number[]): PlotPoint[] {
  console.log("compute", meta.label);
  const rand = new Rand(`${meta.seed}`);

  // update state
  points = values;
  pointsLen = values.length;
  computeSlopes(points, pointsLen, slopes);
  currentIndex = 0;
  currentOffset = 0;
  timeInZone = 0;
  zone = 0;

  // ignore, just for visualisation
  const out: PlotPoint[] = values.map((value, index) => ({
    value,
    index,
    zone: 0,
    slope: slopes[index],
  }));

  zone += 100;

  // pretend we are in main loop
  for (let i = 0; i < 100; i++) {
    const value = 1;
    const clip = isOutOfRange(value);
    const valueClamped = Math.min(Math.max(value, 0), meta.max);
    out.push({
      value: valueClamped,
      index: currentIndex,
      clip,
      offset: currentOffset,
      zone,
    });
    currentIndex++;
    timeInZone++;
  }
  return out;
}
