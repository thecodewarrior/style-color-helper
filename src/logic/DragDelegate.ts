
export interface DragDelegate {
  readonly dragElement: HTMLElement
  drag(x: number, y: number): void
  dragEnd(x: number, y: number): void
}

export const DragHandler = new (class {
  private dragging: DragDelegate | null = null;

  constructor() {
    document.addEventListener("mouseup", e => this.mouseup(e));
    document.addEventListener("mousemove", e => this.mousemove(e));
  }

  start(delegate: DragDelegate) {
    this.dragging = delegate
  }

  private mouseup(e: MouseEvent) {
    if(this.dragging) {
      const {x, y} = this.relative(e, this.dragging)
      this.dragging?.dragEnd(x, y)
    }
    this.dragging = null
  }

  private mousemove(e: MouseEvent) {
    if(this.dragging) {
      const {x, y} = this.relative(e, this.dragging)
      this.dragging?.drag(x, y)
    }
  }

  private relative(e: MouseEvent, delegate: DragDelegate): {x: number, y: number} {
    const rect = delegate.dragElement.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }
})
