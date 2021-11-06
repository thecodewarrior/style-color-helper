import chroma, {Color} from "chroma-js";

export function clamp(min: number, value: number, max: number): number {
  if(value < min)
    return min;
  if(value > max)
    return max;
  return value;
}

export function guid(): string {
  let S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

export function formatDecimal(value: number, decimals: number): string {
  return roundDecimals(value, decimals).toFixed(decimals)
}

export function roundDecimals(value: number, decimals: number): number {
  let factor = Math.pow(10, decimals)
  return (Math.round(value * factor) / factor)
}

export function swatchStyle(color: Color): object {
  let whiteContrast = chroma.contrast('white', color)
  let blackContrast = chroma.contrast('black', color)
  return {
    'color': blackContrast > whiteContrast ? 'black' : 'white',
    'background-color': color.hex()
  }
}