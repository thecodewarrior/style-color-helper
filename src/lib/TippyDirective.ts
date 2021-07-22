import tippy from "tippy.js";
import {createOptions} from "./TippyOptions";
import {Directive} from "vue";

export const TippyDirective: Directive<HTMLElement> = {
  mounted(el, binding) {
    if (binding.value === undefined) {
      el.dataset.tippyTarget = binding.arg ?? ""
    } else {
      tippy(el, createOptions(binding.value))
    }
  }, // new
  updated(el, binding) {
    if (el.dataset.tippyTarget !== undefined) {
      el.dataset.tippyTarget = binding.arg ?? ""
    } else {
      if(el._tippy) {
        el._tippy.setProps(createOptions(binding.value))
      } else {
        tippy(el, createOptions(binding.value))
      }
    }
  },
  unmounted(el) {
    if (el.dataset.tippyTarget !== undefined) {
      delete el.dataset.tippyTarget;
    } else if (el._tippy) {
      el._tippy.destroy()
    }
  },
}
