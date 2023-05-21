import Rand from "rand-seed";
import { State, STATE_DEFAULTS } from "./state";
import { PlotPoint } from "./plot-point";

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

//
// helpers
//

function isOutOfRange(value: number, max: number) {
  return value > max || value < 0;
}

//
// the following class is NOT written in idiomatic javascript / typescript
// this is written in "fake" c++: typescript but using only abilities of C++
// as this will be ported to C++
//
// - separate int and float types
// - fixed array lengths,
// - array length stored separately etc
// - seeded randomness
//

// fake types

type Int = number & { readonly __dataType: unique symbol };
type Float = number;

// fake utils to produce C++ "style" data structures

// fake cast to int
function int(value: Float | Int | number | string): Int {
  return Math.trunc(Number(value)) as Int;
}

// fake cast to float
function float(value: Float | Int | number | string): Float {
  return Number(value) as Float;
}

// fake create int array
function intArray(length: Int): Int[] {
  return new Array(length).fill(0);
}

// fake create float array
function floatArray(length: Int): Float[] {
  return new Array(length).fill(0);
}

//
// pattern class
//

const MAX_PATTERN_LENGTH = 1000 as Int;

class Pattern {
  // seeded random to emulate rand()'s deterministicness
  private rand = new Rand(`${meta.seed}`);

  // set by pattern
  patternValues = floatArray(MAX_PATTERN_LENGTH);
  patternSlopes = intArray(MAX_PATTERN_LENGTH);
  patternLength = 0 as Int;
  patternMaxValue = 0 as Float;
  chunkLength = 0 as Int;

  // preallocated arrays for interal ops
  transitionIndexes = intArray(MAX_PATTERN_LENGTH);
  transitionIndexesCount = 0 as Int;

  // state
  playhead = 0 as Float;
  timeUntilNextChunk = 0 as Int;
  offset = 0 as Float;
  speed = 1 as Float;

  // input parameters
  inputSpeedRange = 0 as Float;
  inputValueTransitionRange = 0.25 as Float;
  inputSlopeTransitionRange = 10 as Int;

  // vars just for demo purposes
  demoOnlyChunkCount = 0 as Int;

  private getPlayheadFraction(): Float {
    return (this.playhead - int(this.playhead)) as Float;
  }

  private getRandomInt(max: Int): Int {
    return int(this.rand.next() * max);
  }

  //
  // pattern access
  //

  getIndexAt(index: Int): Int {
    return int(index % this.patternLength);
  }

  getValueAt(index: Int): Float {
    return this.patternValues[this.getIndexAt(int(index))];
  }

  getValueAtFloat(index: Float): Float {
    const indexInt = int(index);
    const fraction = index - indexInt;
    const first = this.getValueAt(indexInt) * (1 - fraction);
    const second = this.getValueAt(int(indexInt + 1)) * fraction;
    return (first + second) as Float;
  }

  getSlopeAt(index: Int): Int {
    return this.patternSlopes[this.getIndexAt(int(index))];
  }

  //
  // pattern set
  //

  setPattern(values: Float[], patternLength: Int, maxValue: Float) {
    this.playhead = 0 as Float;
    this.patternLength = patternLength;
    this.patternMaxValue = maxValue;

    for (let i = 0; i < patternLength; i++) {
      this.patternValues[i] = values[i];
    }
    for (let i = 0; i < patternLength; i++) {
      const value = values[i];
      const next = this.getValueAt(int(i + 1));
      this.patternSlopes[i] = int(
        Math.round((Math.atan2(next - value, 1) * 180) / Math.PI)
      );
    }
    if (this.chunkLength > patternLength) {
      this.chunkLength = patternLength;
    }
  }

  setChunkLength(chunkLength: Int) {
    if (chunkLength > this.patternLength) {
      chunkLength = this.patternLength;
    }
    this.chunkLength = chunkLength;
  }

  //
  // nextChunk()
  //
  // determines next chunk index, offset and speed
  // by scanning for points in original pattern
  // that have similar value (top / bottom) and slope (up / down)
  // selecting a match randomly
  // and offsetting the chunk vertically to join smoothly
  // a speed is then also randonly determined within a specified range
  //

  nextChunk() {
    this.demoOnlyChunkCount++;

    const value = (this.getValueAt(int(this.playhead)) + this.offset) as Float;
    const slope = this.getSlopeAt(int(this.playhead));

    this.transitionIndexesCount = 0 as Int;
    for (let i = 0 as Int; i < this.patternLength; i++) {
      const newValue = this.getValueAt(i);
      const newSlope = this.getSlopeAt(i);
      const suitableValue =
        Math.abs(newValue - value) <
        this.inputValueTransitionRange * this.patternMaxValue;
      const suitableSlope =
        Math.abs(newSlope - slope) < this.inputSlopeTransitionRange;
      if (suitableValue && suitableSlope) {
        this.transitionIndexes[this.transitionIndexesCount++] = i;
      }
    }

    if (this.transitionIndexesCount === 0) {
      console.warn("no choices! oh no! report this to your supervisor!");
      this.timeUntilNextChunk = this.chunkLength;
      return;
    }

    const choice = this.getRandomInt(this.transitionIndexesCount);
    const nextIndex = this.transitionIndexes[choice];
    const newValue = this.getValueAt(nextIndex);

    this.playhead = this.getPlayheadFraction() + nextIndex;
    this.offset = (value - newValue) as Float;
    this.timeUntilNextChunk = this.chunkLength;

    if (this.inputSpeedRange !== 0) {
      // use pow(2) to distrubute even chance of quicker vs slower
      const randomBipolar = (this.rand.next() - 0.5) * 2;
      this.speed = Math.pow(2, randomBipolar * this.inputSpeedRange);
    } else {
      this.speed = 1;
    }
  }

  //
  // next()
  //
  // progresses time
  //

  next(): number {
    this.playhead += this.speed;
    this.timeUntilNextChunk = (float(this.timeUntilNextChunk) -
      this.speed) as Int;

    if (this.timeUntilNextChunk < 0) {
      this.nextChunk();
    }

    while (this.playhead >= this.patternLength) {
      this.playhead -= this.patternLength;
    }
    return this.getValueAtFloat(this.playhead) + this.offset;
  }
}

//
// compute()
//
// harness for simulating the use of Pattern over time
// and outputting data to be plotted
//
// no longer trying to emulate C++'s abilities here
// normal typescript now
//

export function compute(values: number[]): PlotPoint[] {
  const pattern = new Pattern();
  pattern.inputSpeedRange = float(meta.speedRange);
  pattern.inputValueTransitionRange = float(meta.valueRange) * 0.01;
  pattern.inputSlopeTransitionRange = int(meta.slopeRange);

  // set pattern and chunk length
  // chunk length must come second
  pattern.setPattern(values, values.length as Int, meta.max);
  pattern.setChunkLength(int(meta.freq));

  const out: PlotPoint[] = [];

  // ignore, just for visualisation
  for (let i = 0; i < pattern.patternLength; i++) {
    out.push({
      value: pattern.patternValues[i],
      slope: pattern.patternSlopes[i],
      zone: pattern.demoOnlyChunkCount * 100,
      index: i,
    });
  }

  // needs one initial regeneration to get started
  pattern.nextChunk();

  // pretend we are in main loop for 300 samples
  for (let i = 0; i < 300; i++) {
    const value = pattern.next();
    out.push({
      value,
      index: pattern.playhead,
      clip: isOutOfRange(value, pattern.patternMaxValue),
      zone: pattern.demoOnlyChunkCount * 100,
      offset: pattern.offset,
    });
  }
  return out;
}
