import chroma, {Color} from "chroma-js";

export interface ColorFilter {
  filter(color: Color): Color;
}

export class PosterizeFilter implements ColorFilter {
  constructor(
      public levels: number
  ) {
  }

  private get stepSize() {
    return 256 / this.levels
  }

  filter(color: Color): Color {
    const rgb = color.rgb()
    return chroma.rgb(
        this.filterComponent(rgb[0]),
        this.filterComponent(rgb[1]),
        this.filterComponent(rgb[2]),
    )
  }

  private filterComponent(value: number): number {
    return 255 * Math.floor(value * this.levels / 256) / (this.levels - 1)
  }
}