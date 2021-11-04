import tippy, {Props} from "tippy.js";

const sharpArrow = '<svg width="16" height="10" xmlns="http://www.w3.org/2000/svg"><path class="arrow" d="M 0 8 L 8 0 L 16 8"/></svg>'

tippy.setDefaultProps({
  theme: 'helper',
  arrow: sharpArrow,
  offset: [0, 8],
})

export function createOptions(value: Partial<Props> | string): Partial<Props> {
  let options = typeof value === "string" ? {content: value as string} : value;
  return Object.assign({}, tippy.defaultProps, options);
}
