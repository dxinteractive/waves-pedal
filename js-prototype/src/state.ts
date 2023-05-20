//
// state (demo only, hardcoded in real version)
//

export type State = {
  seed: string;
  expand: boolean;
  colours: boolean;
  freq: string;
  slopeRange: string;
  valueRange: string;
  recoveryValueRange: string;
  filter: string;
};

export const STATE_DEFAULTS: State = {
  seed: "",
  expand: false,
  colours: true,
  freq: "6",
  slopeRange: "1",
  valueRange: "6",
  recoveryValueRange: "1",
  filter: "",
};
