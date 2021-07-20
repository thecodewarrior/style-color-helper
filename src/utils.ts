
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