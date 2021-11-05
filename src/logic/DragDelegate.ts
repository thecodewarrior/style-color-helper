
export interface DragDelegate {
  readonly dragElement: HTMLElement
  readonly fractionalDrag?: boolean
  moveMouse?(dx: number, dy: number): void
  dragMouse(x: number, y: number): void
  dragEnd(x: number, y: number): void

  moveTouch?(dx: number, dy: number): void
  dragTouch(x: number, y: number): void
  touchEnd(): void
}

export const DragHandler = new (class {
  private dragging: DragDelegate | null = null;

  constructor() {
    document.addEventListener("mouseup", e => this.mouseup(e));
    document.addEventListener("mousemove", e => this.mousemove(e));

    document.addEventListener("touchcancel", e => this.touchend(e));
    document.addEventListener("touchend", e => this.touchend(e));
    document.addEventListener("touchmove", e => this.touchmove(e));
  }

  start(delegate: DragDelegate) {
    this.dragging = delegate
  }

  startMouse(delegate: DragDelegate, e: MouseEvent) {
    this.dragging = delegate
    this.mousemove(e)
  }

  startTouch(delegate: DragDelegate, e: TouchEvent) {
    this.dragging = delegate
    this.touchmove(e)
  }

  private mouseup(e: MouseEvent) {
    if(this.dragging) {
      const {x, y} = this.relative(e.clientX, e.clientY, this.dragging)
      this.dragging?.dragEnd(x, y)
    }
    this.dragging = null
  }

  private mousemove(e: MouseEvent) {
    if(this.dragging) {
      const {x, y} = this.relative(e.clientX, e.clientY, this.dragging)
      this.dragging?.dragMouse(x, y)
    }
  }

  private touchend(e: TouchEvent) {
    if(this.dragging) {
      this.dragging?.touchEnd()
    }
    this.dragging = null
  }

  private touchmove(e: TouchEvent) {
    if(this.dragging) {
      let touch = e.touches[0]
      const {x, y} = this.relative(touch.clientX, touch.clientY, this.dragging)
      this.dragging?.dragTouch(x, y)
    }
  }

  private relative(clientX: number, clientY: number, delegate: DragDelegate): {x: number, y: number} {
    const rect = delegate.dragElement.getBoundingClientRect()
    let x = clientX - rect.left
    let y = clientY - rect.top
    if(delegate.fractionalDrag) {
      x /= rect.width
      y /= rect.height
    }
    return {x, y}
  }
})
