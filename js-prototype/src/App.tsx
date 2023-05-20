import { useState } from "react";
import "./App.css";
import { STATE_DEFAULTS, State } from "./state";
// import { compute, setMeta } from "./compute-v1";
import { compute, setMeta } from "./compute-v2";

//
// demo data processing
//

function ema(values: number[], oversampling: number, decay: number): number[] {
  if (values.length === 0) {
    return [];
  }
  const out: number[] = [];
  const [first] = values;
  let curr = first;
  for (let i = 0; i < values.length; i++) {
    // TODO - interpolate from last to first
    // and crossfade
    const target = values[i];
    for (let j = 0; j < oversampling; j++) {
      curr += (target - curr) * decay;
      out.push(curr);
    }
  }
  return out;
}

//
// demo data
//

type Dataset = {
  max: number;
  values: number[];
  label: string;
};

const DATASETS: Dataset[] = [
  {
    label: "sineish",
    max: 12,
    values: [
      0, 0, 1, 2, 4, 7, 9, 10, 11, 11, 10, 8, 6, 3, 2, 1, 0, 1, 1, 3, 5, 8, 10,
      11, 11, 10, 9, 7, 3, 2, 1, 0,
    ],
  },
  {
    label: "sineema",
    max: 12,
    values: ema(
      [
        0, 0, 1, 2, 4, 7, 9, 10, 11, 11, 10, 8, 6, 3, 2, 1, 0, 1, 1, 3, 5, 8,
        10, 11, 11, 10, 9, 7, 3, 2, 1, 0,
      ],
      2,
      0.5
    ),
  },
  {
    label: "sinesmol",
    max: 12,
    values: ema(
      [
        0, 0, 1, 2, 4, 7, 9, 10, 11, 11, 10, 8, 6, 3, 2, 1, 0, 1, 1, 3, 5, 8,
        10, 11, 11, 10, 9, 7, 3, 2, 1, 0,
      ],
      2,
      0.5
    ).map((v) => v * 0.4 + 4),
  },
  {
    label: "triangle",
    max: 7,
    values: [
      0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4,
      3, 2, 1,
    ],
  },
  {
    label: "sawtooth",
    max: 16,
    values: [0, 2, 4, 7, 9, 11, 13, 16, 0, 3, 4, 8, 10, 14, 16],
  },
  {
    label: "blips",
    max: 8,
    values: [
      0, 0, 0, 0, 0, 0, 4, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 4, 0, 0, 0, 1, 5, 0, 0,
      3, 0, 0, 0,
    ],
  },
  {
    label: "scribble",
    max: 10,
    values: [
      0, 3, 4, 3, 6, 7, 5, 4, 4, 5, 8, 10, 8, 5, 2, 0, 1, 4, 1, 3, 5, 6, 5, 7,
      6, 4, 2,
    ],
  },
  {
    label: "scribema",
    max: 10,
    values: ema(
      [
        0, 3, 4, 3, 6, 7, 5, 4, 4, 5, 8, 10, 8, 5, 2, 0, 1, 4, 1, 3, 5, 6, 5, 7,
        6, 4, 2,
      ],
      2,
      0.75
    ),
  },
  {
    label: "shevles",
    max: 10,
    values: [
      0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 7, 7, 7, 7, 7,
      7, 7, 8, 8, 8, 8, 8, 8, 3, 3, 3, 3, 3, 3,
    ],
  },
];

//
// ui
//

type StateNumberInputProps = {
  state: State;
  handleChange: (prop: keyof State, value: unknown) => void;
  prop: keyof State;
  step?: string;
};

function StateNumberInput(props: StateNumberInputProps) {
  const { state, handleChange, prop, ...rest } = props;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange(prop, e.target.value);

  return (
    <label>
      {`${prop} `}
      <input
        className="input"
        type="number"
        value={state[prop] as string}
        onChange={handleInputChange}
        {...rest}
      />
    </label>
  );
}

type StateCheckboxInputProps = {
  state: State;
  handleChange: (prop: keyof State, value: unknown) => void;
  prop: keyof State;
};

function StateCheckboxInput(props: StateCheckboxInputProps) {
  const { state, handleChange, prop, ...rest } = props;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange(prop, e.target.checked);

  return (
    <label>
      {`${prop} `}
      <input
        type="checkbox"
        value="yes"
        checked={!!state[prop]}
        onChange={handleInputChange}
        {...rest}
      />
    </label>
  );
}

function App() {
  const [state, setState] = useState<State>({
    ...STATE_DEFAULTS,
    ...JSON.parse(localStorage.getItem("state") || "{}"),
  });

  const handleChange = (prop: keyof State, value: unknown) => {
    setState((state) => {
      const obj = {
        ...state,
        [prop]: value,
      };
      localStorage.setItem("state", JSON.stringify(obj));
      return obj;
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange("filter", e.target.value);

  const datasets = DATASETS.filter((d) =>
    d.label.includes(state.filter || "")
  ).map((data, i) => <Dataset data={data} key={i} state={state} />);

  return (
    <div>
      <div className="controls">
        <StateNumberInput
          state={state}
          handleChange={handleChange}
          prop="seed"
        />
        <StateNumberInput
          state={state}
          handleChange={handleChange}
          prop="freq"
        />
        <StateNumberInput
          state={state}
          handleChange={handleChange}
          prop="slopeRange"
          step="0.1"
        />
        <StateNumberInput
          state={state}
          handleChange={handleChange}
          prop="valueRange"
        />
        <StateNumberInput
          state={state}
          handleChange={handleChange}
          prop="recoveryValueRange"
          step="0.1"
        />
        <StateCheckboxInput
          state={state}
          handleChange={handleChange}
          prop="expand"
        />
        <StateCheckboxInput
          state={state}
          handleChange={handleChange}
          prop="colours"
        />

        <label>
          filter <input value={state.filter} onChange={handleFilterChange} />
        </label>
      </div>
      <div className="datasets">{datasets}</div>
    </div>
  );
}

type DatasetProps = { data: Dataset; state: State };

function Dataset({ data, state }: DatasetProps) {
  setMeta({ ...state, label: data.label, max: data.max });
  const values = compute(data.values);
  return (
    <div className="dataset">
      {data.label}
      <div className="slices">
        {values.map((plot, i) => (
          <Slice key={i} {...plot} max={data.max} state={state} />
        ))}
      </div>
    </div>
  );
}

const PIXEL_SIZE = 12;

type SliceProps = {
  value: number;
  index: number;
  zone: number;
  max: number;
  slope?: number;
  offset?: number;
  clip?: boolean;
  state: State;
};

function Slice({
  value,
  index,
  zone,
  max,
  slope,
  offset,
  clip,
  state,
}: SliceProps) {
  const sliceStyle = {
    minWidth: `${PIXEL_SIZE}px`,
    width: state.expand ? "" : `${PIXEL_SIZE}px`,
  };

  const sliceBarStyle = {
    height: `${max * PIXEL_SIZE + 1}px`,
  };

  const hue = state.colours ? zone : 0;

  const slceFillStyle = {
    height: `${Math.max(value, 0) * PIXEL_SIZE + 1}px`,
    minWidth: `${PIXEL_SIZE}px`,
    backgroundColor: `hsl(${hue}deg 80% 30%)`,
  };

  return (
    <div style={sliceStyle} className="slice">
      <div style={sliceBarStyle} className="sliceBar">
        <div style={slceFillStyle} />
      </div>
      {index}
      <br />
      {value}
      <br />
      {slope !== undefined ? slope : null}
      <br />
      {clip ? "X" : null}
      <br />
      {offset !== undefined ? offset : null}
    </div>
  );
}

export default App;
