export type FormationPosition = {
  id: string;
  label: string;
  left: number;
  top: number;
};

// Positions are intentionally spread almost edge-to-edge so the Starting XI
// fills the whole pitch in the Match Summary poster.
export const formations = {
  "4-3-3": [
    { id: "LW", label: "Left Wing", left: 17, top: 17 },
    { id: "ST", label: "Striker", left: 50, top: 12 },
    { id: "RW", label: "Right Wing", left: 83, top: 17 },
    { id: "LCM", label: "Left Midfield", left: 23, top: 39 },
    { id: "CM", label: "Central Midfield", left: 50, top: 34 },
    { id: "RCM", label: "Right Midfield", left: 77, top: 39 },
    { id: "LB", label: "Left Back", left: 9, top: 67 },
    { id: "LCB", label: "Left Centre Back", left: 36, top: 75 },
    { id: "RCB", label: "Right Centre Back", left: 64, top: 75 },
    { id: "RB", label: "Right Back", left: 91, top: 67 },
    { id: "GK", label: "Goalkeeper", left: 50, top: 95 },
  ],
  "4-2-3-1": [
    { id: "ST", label: "Striker", left: 50, top: 11 },
    { id: "LW", label: "Left Wing", left: 17, top: 25 },
    { id: "CAM", label: "Attacking Midfield", left: 50, top: 35 },
    { id: "RW", label: "Right Wing", left: 83, top: 25 },
    { id: "LCM", label: "Left Central Midfield", left: 30, top: 52 },
    { id: "RCM", label: "Right Central Midfield", left: 70, top: 52 },
    { id: "LB", label: "Left Back", left: 9, top: 67 },
    { id: "LCB", label: "Left Centre Back", left: 36, top: 75 },
    { id: "RCB", label: "Right Centre Back", left: 64, top: 75 },
    { id: "RB", label: "Right Back", left: 91, top: 67 },
    { id: "GK", label: "Goalkeeper", left: 50, top: 95 },
  ],
  "4-4-2": [
    { id: "LST", label: "Left Striker", left: 36, top: 13 },
    { id: "RST", label: "Right Striker", left: 64, top: 13 },
    { id: "LM", label: "Left Midfield", left: 10, top: 39 },
    { id: "LCM", label: "Left Central Midfield", left: 37, top: 39 },
    { id: "RCM", label: "Right Central Midfield", left: 63, top: 39 },
    { id: "RM", label: "Right Midfield", left: 90, top: 39 },
    { id: "LB", label: "Left Back", left: 9, top: 67 },
    { id: "LCB", label: "Left Centre Back", left: 36, top: 75 },
    { id: "RCB", label: "Right Centre Back", left: 64, top: 75 },
    { id: "RB", label: "Right Back", left: 91, top: 67 },
    { id: "GK", label: "Goalkeeper", left: 50, top: 95 },
  ],
} as const;
