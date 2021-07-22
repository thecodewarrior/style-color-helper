import tippy, {Props} from "tippy.js";

const sharpArrow = '<svg width="16" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M 0 9 L 8 3 L 16 9"/></svg>'

tippy.setDefaultProps({
  theme: 'helper',
  arrow: sharpArrow,
  offset: [0, 5],
})

export function createOptions(value: Partial<Props> | string): Partial<Props> {
  let options = typeof value === "string" ? {content: value as string} : value;
  return Object.assign({}, tippy.defaultProps, options);
}
