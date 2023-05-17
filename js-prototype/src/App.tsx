import { useState } from "react";
import "./App.css";
import Rand from "rand-seed";

type Dataset = {
  max: number;
  values: number[];
};

const DATASETS: Dataset[] = [
  {
    max: 12,
    values: [
      0, 0, 1, 2, 4, 7, 9, 10, 11, 11, 10, 8, 6, 3, 2, 1, 0, 1, 1, 3, 5, 8, 10,
      11, 11, 10, 9, 7, 3, 2, 1, 0,
    ],
  },
  {
    max: 7,
    values: [
      0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4,
      3, 2, 1,
    ],
  },
  {
    max: 16,
    values: [0, 2, 4, 7, 9, 11, 13, 16, 0, 3, 4, 8, 10, 14, 16],
  },
  {
    max: 8,
    values: [
      0, 0, 0, 0, 0, 0, 4, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 4, 0, 0, 0, 1, 5, 0, 0,
      3, 0, 0, 0,
    ],
  },
  {
    max: 10,
    values: [
      0, 3, 4, 3, 6, 7, 5, 4, 4, 5, 8, 10, 8, 5, 2, 0, 1, 4, 1, 3, 5, 6, 5, 7,
      6, 4, 2,
    ],
  },
];

const PIXEL_SIZE = 12;

function compute(
  values: number[],
  max: number,
  seed: string
): [number, number][] {
  const rand = new Rand(`${seed}`);
  const out: [number, number][] = values.map((v) => [v, 0]);

  for (let i = 0; i < 100; i++) {
    const n = Math.floor(rand.next() * max);
    out.push([n, 120]);
  }
  return out;
}

function App() {
  const [seed, setSeed] = useState(localStorage.getItem("seed") ?? "");
  const handleChange = (e) => {
    const str = e.target.value;
    localStorage.setItem("seed", str);
    setSeed(str);
  };
  return (
    <div>
      <label>
        seed{" "}
        <input
          className="input"
          type="number"
          value={seed}
          onChange={handleChange}
        />
      </label>
      {DATASETS.map((data, i) => (
        <Dataset data={data} key={i} seed={seed} />
      ))}
    </div>
  );
}

function Dataset({ data, seed }: { data: Dataset; seed: string }) {
  const values = compute(data.values, data.max, seed);
  return (
    <div className="dataset">
      {values.map(([value, zone], i) => (
        <Slice value={value} key={i} zone={zone} max={data.max} />
      ))}
    </div>
  );
}

function Slice({
  value,
  zone,
  max,
}: {
  value: number;
  zone: number;
  max: number;
}) {
  const style = {
    minWidth: `${PIXEL_SIZE}px`,
    marginRight: "1px",
  };
  const barstyle = {
    height: `${max * PIXEL_SIZE + 1}px`,
    backgroundColor: `#131313`,
    display: "flex",
    alignItems: "end",
  };
  const fillstyle = {
    height: `${value * PIXEL_SIZE + 1}px`,
    minWidth: `${PIXEL_SIZE}px`,
    backgroundColor: `hsl(${zone}deg 80% 30%)`,
  };
  return (
    <div style={style}>
      <div style={barstyle}>
        <div style={fillstyle} />
      </div>
      {value}
      <br />
    </div>
  );
}

export default App;
