import React, { FunctionComponent, useState } from "react";
import { interpolateSinebow } from "d3";

type TInstruction = "+" | "-" | "F";

enum EArrow {
  R = "R",
  L = "L",
  D = "D",
  U = "U",
}

type Point = {
  x: number,
  y: number,
};


export const range: {
  /** creates array with numbers from 0 to max-1 */
  (maxExcluded: number): number[];
  /** creates array with numbers from min to max-1 */
  (minIncluded: number, maxExcluded: number): number[];
} = (a: number, b?: number): number[] => {
  const arr = [];
  if (b === undefined)
    for (let i = 0; i < a; i++)
      arr.push(i);
  else
    for (let i = a; i < b; i++)
      arr.push(i);
  return arr;
};

// source https://en.wikipedia.org/wiki/Hilbert_curve
export const hilbert = (level = 0, ver = false): TInstruction[] => {
  if (level === 0)
    return [];

  const hilbRecRes = hilbert(level - 1, ver);
  const hilbRecResInverse = hilbert(level - 1, !ver);
  const h = hilbRecRes;
  const hi = hilbRecResInverse;
  const f = "F";
  const a = ver ? "-" : "+";
  const b = ver ? "+" : "-";
  return [b, ...hi, f, a, ...h, f, ...h, a, f, ...hi, b];
};

export const instructionToArrows = (inst: TInstruction[]): EArrow[] => {
  let rotation = EArrow.R;
  const arrows: EArrow[] = [];

  const rotateArray = [EArrow.R, EArrow.D, EArrow.L, EArrow.U];

  inst.forEach(i => {
    switch (i) {
      case "+":
        rotation = rotateArray[(rotateArray.findIndex(x => x === rotation) + 1) % 4];
        break;
      case "-":
        rotation = rotateArray[(rotateArray.findIndex(x => x === rotation) - 1 + 4) % 4];
        break;
      case "F":
        arrows.push(rotation);
        break;
    }
  });

  return arrows;
};

export const arrowsToPoints = (arr: EArrow[]): Point[] => {
  const current: Point = { x: 0, y: 0 };
  const points: Point[] = [];

  const rest = [...arr];

  while (rest.length) {
    points.push({ ...current });
    const [a] = rest.splice(0, 1);
    switch (a) {
      case EArrow.U:
        current.y = current.y + 1;
        break;
      case EArrow.D:
        current.y = current.y - 1;
        break;
      case EArrow.L:
        current.x = current.x - 1;
        break;
      case EArrow.R:
        current.x = current.x + 1;
        break;
    }
  }
  points.push({ ...current });

  return points;
};

export const pointsToLines = (arr: Point[]): [Point, Point][] => range(arr.length - 1).map(x => [arr[x], arr[x + 1]]);


const width = 300;
const height = 300;

const App: FunctionComponent<any> = () => {
  const [level, setLevel] = useState(2);

  const strokeWidth = 50 / (level ** 2);

  const inst = hilbert(level);
  const arrows = instructionToArrows(inst);
  const points = arrowsToPoints(arrows);

  const padding = 10;
  const scalingX = (width - padding * 2) / Math.max(...points.map(({ x }) => x));
  const scalingy = (height - padding * 2) / Math.max(...points.map(({ y }) => y));

  const scalePoint = (p: Point): Point => ({ x: p.x * scalingX + padding, y: height - p.y * scalingy - padding });

  const lines = pointsToLines(points
    .map(scalePoint)
  );

  return (<>
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ alignSelf: "center" }}>
        Level
        <input type="number" value={level} onChange={(e) => setLevel(+e.target.value)} style={{ width: 100 }} />
      </div>
      <svg {...{ width, height }} style={{ border: "red", borderStyle: "solid", borderWidth: 2, alignSelf: "center" }}>
        {
          lines
            .map(([{ x: x1, y: y1 }, { x: x2, y: y2 }], i) => <line {...{ x1, y1, x2, y2, strokeWidth }} stroke={interpolateSinebow(i / lines.length)} strokeLinecap="round" />)
        }
      </svg>
    </div>
  </>);
};

export default App;
