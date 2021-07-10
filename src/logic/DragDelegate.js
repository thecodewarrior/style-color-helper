export const DragHandler = new (class {
    constructor() {
        this.dragging = null;
        document.addEventListener("mouseup", e => this.mouseup(e));
        document.addEventListener("mousemove", e => this.mousemove(e));
    }
    start(delegate) {
        this.dragging = delegate;
    }
    mouseup(e) {
        if (this.dragging) {
            const { x, y } = this.relative(e, this.dragging);
            this.dragging?.dragEnd(x, y);
        }
        this.dragging = null;
    }
    mousemove(e) {
        if (this.dragging) {
            const { x, y } = this.relative(e, this.dragging);
            this.dragging?.drag(x, y);
        }
    }
    relative(e, delegate) {
        const rect = delegate.dragElement.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        if (delegate.fractionalDrag) {
            x /= rect.width;
            y /= rect.height;
        }
        return { x, y };
    }
});
//# sourceMappingURL=DragDelegate.js.map