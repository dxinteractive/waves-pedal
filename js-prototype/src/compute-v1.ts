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
const transitionIndexes: number[] = []; // length of max points
let transitionIndexesLen = 0;
let currentIndex = 0;
let currentOffset = 0;
let timeInZone = 0;
let rampToZeroOffset = false;

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

const getValueAt = (index: number) => {
  return points[index % pointsLen];
};

// const getLerpValueAt = (index: number) => {
//   const fraction = index - Math.floor(index);
//   const first = getValueAt(index) * (1 - fraction);
//   const second = getValueAt(index + 1) * fraction;
//   return first + second;
// };

const getSlopeAt = (index: number) => {
  return slopes[index % pointsLen];
};

// const getLerpSlopeAt = (index: number) => {
//   const fraction = index - Math.floor(index);
//   const first = getSlopeAt(index) * (1 - fraction);
//   const second = getSlopeAt(index + 1) * fraction;
//   return first + second;
// };

const isOutOfRange = (value: number) => {
  return value > meta.max || value < 0;
};

// rand not required in final product
function tryZoneTransition(
  valueRange: number, // TODO derive this from wave
  slopeRange: number, // TODO derive this from wave
  freq: number,
  max: number,
  rand: Rand,
  time: number
) {
  console.log(`tryZoneTransition at time ${time}, index ${currentIndex}`);

  const valueNow = getValueAt(currentIndex);
  const slopeNow = getSlopeAt(currentIndex);
  console.log("  valueNow", valueNow);
  console.log("  slopeNow", slopeNow);

  transitionIndexesLen = 0;
  for (let i = 0; i < pointsLen; i++) {
    const value = getValueAt(i);
    const slope = getSlopeAt(i);
    const diff = valueNow - value;
    const newValueInRange = Math.abs(diff) < valueRange;
    // if(currentOffset !== 0 && (diff )) {
    // }
    const slopeAbs = Math.abs(slope - slopeNow);
    // if (slopeAbs > 1) {
    //   slopeAbs = Math.sqrt(slopeAbs);
    // }
    const newSlopeInRange = slopeAbs < slopeRange;
    if (newValueInRange && newSlopeInRange) {
      let willFit = true;
      for (let j = i; j < i + freq; j++) {
        if (isOutOfRange(getValueAt(j) + currentOffset)) {
          willFit = false;
        }
      }
      if (willFit) {
        console.log(
          `  - could go to value ${value} slope ${slope} at index ${i}`
        );
        transitionIndexes[transitionIndexesLen++] = i;
      }
    }
  }

  if (transitionIndexesLen === 0) {
    return;
  }

  console.log(
    "transitionIndexes",
    transitionIndexes.slice(0, transitionIndexesLen)
  );
  const nextIndex =
    transitionIndexes[Math.floor(transitionIndexesLen * rand.next())];
  const nextValue = getValueAt(nextIndex);
  // TODO hardcoded 1s?
  if (nextValue <= 1 || nextValue >= max - 1) {
    currentOffset = 0;
  } else {
    currentOffset += valueNow - nextValue;
  }
  currentIndex = nextIndex;
  timeInZone = 0;
  zone += 100;
  rampToZeroOffset = false;

  console.log("currentIndex", currentIndex);
  console.log("currentOffset", currentOffset);
  // TODO TODO introduce currentRate
  // TODO autocorrelation based technique?
}

function tryZoneTransitionRecovery(
  valueNow: number,
  valueRange: number,
  recoveryValueRange: number,
  freq: number,
  rand: Rand,
  time: number
) {
  console.log(
    `tryZoneTransitionRecovery at time ${time}, index ${currentIndex}`
  );

  console.log("  valueNow", valueNow);

  transitionIndexesLen = 0;
  for (let i = 0; i < pointsLen; i++) {
    const value = getValueAt(i);
    const newValueInRange = Math.abs(value - valueNow) < valueRange;
    if (newValueInRange) {
      console.log(`  - could go to value ${value} slope at index ${i}`);
      transitionIndexes[transitionIndexesLen++] = i;
    }
  }

  if (transitionIndexesLen === 0) {
    tryZoneTransitionRecovery(
      valueNow,
      valueRange + recoveryValueRange,
      recoveryValueRange,
      freq,
      rand,
      time
    );
    return;
  }

  console.log(
    "transitionIndexes",
    transitionIndexes.slice(0, transitionIndexesLen)
  );
  const nextIndex =
    transitionIndexes[Math.floor(transitionIndexesLen * rand.next())];

  currentOffset = valueNow - getValueAt(nextIndex);
  currentIndex = nextIndex;
  timeInZone = 0;
  zone += 100;
  rampToZeroOffset = true;

  console.log("currentIndex", currentIndex);
  console.log("currentOffset", currentOffset);
}

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
    const value = getValueAt(currentIndex) + currentOffset;
    const clip = isOutOfRange(value);
    const valueClamped = Math.min(Math.max(value, 0), meta.max);
    out.push({
      value: valueClamped,
      index: currentIndex,
      clip,
      offset: currentOffset,
      zone,
    });

    if (rampToZeroOffset && currentOffset !== 0) {
      if (Math.abs(currentOffset) < 1) {
        currentOffset = 0;
        rampToZeroOffset = false;
      } else if (currentOffset > 0) {
        currentOffset--;
      } else if (currentOffset < 0) {
        currentOffset++;
      }
    } else if (clip) {
      tryZoneTransitionRecovery(
        value > meta.max ? meta.max : 0,
        Number(meta?.recoveryValueRange),
        Number(meta?.recoveryValueRange) || 0.1,
        Number(meta?.freq),
        rand,
        i
      );
    } else if (timeInZone > Number(meta.freq)) {
      tryZoneTransition(
        Number(meta?.valueRange),
        Number(meta?.slopeRange),
        Number(meta?.freq),
        meta.max,
        rand,
        i
      );
    }
    currentIndex++;
    timeInZone++;
  }
  return out;
}
