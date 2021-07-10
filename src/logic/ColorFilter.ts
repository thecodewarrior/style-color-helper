import chroma, {Color} from "chroma-js";

export interface ColorFilter {
  apply(color: Color): Color;
}

export class CompoundFilter implements ColorFilter {
  constructor(
      public filters: ColorFilter[] = []
  ) {
  }

  apply(color: Color): Color {
    let filtered = color
    for(let filter of this.filters) {
      filtered = filter.apply(filtered)
    }
    return filtered
  }
}

export class PosterizeFilter implements ColorFilter {
  constructor(
      public levels: number
  ) {
  }

  apply(color: Color): Color {
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