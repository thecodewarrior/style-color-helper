<template>
  <div :tippy-no-target="tippyNoTarget">
    <!-- without tippy-no-target, the HTML itself provides zero indication how things went wrong -->
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import tippy, {Instance as TippyInstance, Placement, Props} from "tippy.js";

/**
 * A tooltip which will be attached to another element. The target element should be specified using the
 * `v-tippy-target` directive. When first being mounted, this component will search among its peers for a matching
 * element. This means that so long as your target name is unique among its peers (and optionally their descendents),
 * the tippy will bind to that element.
 *
 * When the target isn't specified, this will bind to an "unnamed" (`""`) target. By default this will only bind to
 * immediate sibling elements. To search recursively, set `deepSearch` to a truthy value.
 *
 * For example:
 * ```
 * <div>
 *   <div v-tippy>Hello, I'm a target!</div>
 *   <tippy>Wow, such attachment</tippy>
 *   <div v-tippy:why>Why?</div>
 *   <tippy target="why">Because!</tippy>
 *   <div>
 *     <div v-tippy:thats-deep>I'm not a sibling!</div>
 *   </div>
 *   <tippy target="thats-deep" :deepSearch="true">But I'll work!</tippy>
 * </div>
 * ```
 *
 * This attaching process is performed once, during the mounting process. However, you can update the attachments using
 * the `attach()` method.
 *
 * Several of the tippy events are exposed as vue events. For more information on these events, see
 * [the Tippy docs](https://atomiks.github.io/tippyjs/v6/all-props/#onhidden)
 * - `onShow(instance)` -> `show`
 * - `onShown(instance)` -> `shown`
 * - `onHidden(instance)` -> `hidden`
 * - `onHide(instance)` -> `hide`
 * - `onMount(instance)` -> `mount`
 * - `onTrigger(instance, event)` -> `trigger`
 * - `onUntrigger(instance, event)` -> `untrigger`
 *
 * You can cancel showing and hiding by explicitly passing the functions in `extra`, since Vue events can't have return
 * values.
 */
@Options({
  emits: [
    'show',
    'shown',
    'hidden',
    'hide',
    'mount',
    'trigger',
    'untrigger'
  ]
})
export default class Tippy extends Vue {
  /**
   * The v-tippy target name. Defaults to `""` (the default name used by `v-tippy`)
   */
  @Prop({required: false, type: String, default: ""})
  target!: string

  /**
   * Whether to perform a deep search for targets (using querySelector) or to only search for direct siblings.
   */
  @Prop({required: false, type: Boolean, default: false})
  deepSearch?: boolean

  /**
   * Extra options for tippy.js
   */
  @Prop({required: false})
  extra?: Partial<Props>

  /**
   * Whether the tooltip should be enabled
   */
  @Prop({required: false, type: Boolean, default: true})
  enabled?: boolean

  /**
   * Where to place the tooltip relative to the target element
   */
  @Prop({required: false, default: 'top'})
  placement!: Placement

  /**
   * Whether the tippy should *always* be appended to the `<body>`. You don't need to specify a value for this property,
   * its presence is sufficient (e.g. `<tippy on-body>`).
   *
   * Normally, tooltips will be appended to the document body element, *however*, interactive elements are appended
   * adjacent to their trigger, in the interest of maintaining keyboard focus order.
   * [more info](https://atomiks.github.io/tippyjs/v6/accessibility/#clipping-issues)
   *
   * This can cause zIndex issues, so sometimes it's necessary to put an interactive tooltip on the body element.
   *
   * This is a shorthand for `appendTo: () => document.body` in the `extra` property. (Note that you can't access
   * `document` directly in a vue template, so you would have to use a computed property if you wanted to set this in
   * `extra` yourself.
   */
  @Prop({required: false, type: Boolean})
  onBody?: boolean

  /**
   * Whether the tippy should be interactive. You don't need to specify a value for this property, its presence is
   * sufficient (e.g. `<tippy interactive>`).
   *
   * This is a shorthand for `interactive: true` in the `extra` property.
   */
  @Prop({required: false, type: Boolean})
  interactive?: boolean

  /**
   * The events that trigger the tooltip. Setting the trigger key in `extra` will override this property.
   */
  @Prop({required: false, type: String})
  trigger?: string

  /**
   * Only used when using the manual trigger. To show/hide when using another trigger, use `tippy().show()` and
   * `tippy().hide()`
   */
  @Prop({required: false, type: Boolean})
  visible?: boolean

  /**
   * Whether to hide the tooltip when the target element is clicked. Defaults to false when using the `'manual'`
   * trigger, otherwise defaults to true.
   */
  @Prop({required: false, type: Boolean, default: null})
  hideOnClick?: boolean | null

  tip: TippyInstance | null = null
  options: Partial<Props> = tippy.defaultProps // the options field is overwritten, not modified
  tippyNoTarget: boolean = false

  mounted() {
    this.attach();
  }

  @Watch('enabled')
  enabledChanged(val: boolean) {
    if (!this.tip) return;
    if (val) {
      this.tip.enable();
    } else {
      this.tip.hide();
      this.tip.disable();
    }
  }

  @Watch('visible')
  visibleChanged(val: boolean) {
    if (!this.tip) return;
    if (val && this.isManualTrigger) {
      this.tip.show();
    } else {
      this.tip.hide();
    }
  }

  updated() {
    if (this.tip) {
      this.tip.setProps(this.getOptions());
    }
  }

  beforeDestroy() {
    if (!this.tip) return;
    this.tip.destroy();
  }

  get isManualTrigger() {
    return this.trigger === "manual";
  }

  attach() {
    this.$nextTick(() => {
      if (this.tip) {
        try {
          this.tip.destroy();
        } catch (error) {
        }
        this.tip = null;
      }
      let target: Element | null = null
      if (this.target === "_parent") {
        target = this.$el.parentElement
      } else if (this.deepSearch) {
        target = this.$el.parentElement.querySelector(`[data-tippy-target="${this.target}"]`);
      } else {
        for (const sibling of this.$el.parentElement.children) {
          if (sibling === this.$el) continue;
          if (sibling instanceof HTMLElement && sibling.dataset && sibling.dataset.tippyTarget === this.target) {
            target = sibling;
            break;
          }
        }
      }
      if (!target) {
        this.tippyNoTarget = true
        throw new Error(`Unable to find tippy target named ${this.target}`)
      }
      this.tippyNoTarget = false
      const tip = tippy(target, this.getOptions());
      if (!tip) {
        throw new Error(`Unable to create tippy instance`)
      }
      this.tip = tip;
      this.$emit("init", this.tip);
      if (this.enabled === false) {
        this.tip.disable();
      }
      if (this.isManualTrigger && this.visible === true) {
        this.tip.show();
      }
    });
  }

  tippy() {
    return this.tip;
  }

  getOptions(): Partial<Props> {
    const options: Partial<Props> = {}
    if(this.trigger) {
      options.trigger = this.trigger;
      if(this.isManualTrigger)
        options.hideOnClick = false;
    }
    if(this.placement) {
      options.placement = this.placement;
    }
    if(this.onBody === true) {
      options.appendTo = () => document.body;
    }
    if(this.interactive === true) {
      options.interactive = true;
    }
    if(this.hideOnClick !== null) {
      options.hideOnClick = this.hideOnClick
    }
    Object.assign(options, this.extra || {});

    options.onShow = this.wrap(options.onShow, 'show');
    options.onShown = this.wrap(options.onShown, 'shown');
    options.onHidden = this.wrap(options.onHidden, 'hidden');
    options.onHide = this.wrap(options.onHide, 'hide');
    options.onMount = this.wrap(options.onMount, 'mount');
    options.onTrigger = this.wrap(options.onTrigger, 'trigger');
    options.onUntrigger = this.wrap(options.onUntrigger, 'untrigger');
    options.content = this.$el;

    this.options = options;
    return options;
  }

  private wrap<F extends Function>(existing: F | null | undefined, name: string): F {
    return ((...args: unknown[]) => {
      this.$emit(name, ...args)
      if(existing)
        return existing(...args)
    }) as never
  }
}
</script>

