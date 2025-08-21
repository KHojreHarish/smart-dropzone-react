import { TIMING, LAYOUT, DIMENSIONS } from "./config";
import { InputValidator } from "./validation";
import { UploadError } from "./error-handler";
export class DragReorderManager {
    constructor(options = {}) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dragState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "containerRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "itemRefs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "animationFrame", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "isEnabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "files", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        }); // For testing purposes
        this.options = {
            enableReordering: true,
            animationDuration: TIMING.ANIMATION_DURATION,
            dragThreshold: LAYOUT.DRAG_THRESHOLD,
            snapToGrid: false,
            gridSize: LAYOUT.GRID_SIZE,
            constrainToContainer: true,
            ...options,
        };
        this.dragState = {
            isDragging: false,
            draggedItem: null,
            draggedIndex: -1,
            targetIndex: -1,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            offset: { x: 0, y: 0 },
        };
    }
    enable() {
        this.isEnabled = true;
    }
    disable() {
        this.isEnabled = false;
        this.stopDrag();
    }
    setContainer(container) {
        const validation = InputValidator.validateElement(container);
        if (!validation.isValid) {
            throw UploadError.validationError(`Invalid container element: ${validation.errors.join(", ")}`);
        }
        this.containerRef = container;
        this.setupContainerListeners();
    }
    registerItem(id, element) {
        if (!id || typeof id !== "string") {
            throw UploadError.validationError("Item ID must be a non-empty string");
        }
        const validation = InputValidator.validateElement(element);
        if (!validation.isValid) {
            throw UploadError.validationError(`Invalid element for item ${id}: ${validation.errors.join(", ")}`);
        }
        this.itemRefs.set(id, element);
        this.setupItemListeners(id, element);
    }
    unregisterItem(id) {
        this.itemRefs.delete(id);
    }
    setupContainerListeners() {
        if (!this.containerRef)
            return;
        this.containerRef.addEventListener("dragover", this.handleDragOver.bind(this));
        this.containerRef.addEventListener("drop", this.handleDrop.bind(this));
        this.containerRef.addEventListener("dragleave", this.handleDragLeave.bind(this));
    }
    setupItemListeners(id, element) {
        element.setAttribute("draggable", "true");
        element.addEventListener("dragstart", (e) => this.handleDragStart(e, id));
        element.addEventListener("dragend", this.handleDragEnd.bind(this));
        element.addEventListener("dragenter", (e) => this.handleDragEnter(e, id));
        element.addEventListener("dragover", this.handleDragOver.bind(this));
    }
    handleDragStart(event, id) {
        if (!this.isEnabled || !this.options.enableReordering)
            return;
        const element = event.currentTarget;
        const rect = element.getBoundingClientRect();
        this.dragState = {
            isDragging: true,
            draggedItem: this.findFileById(id),
            draggedIndex: this.findFileIndex(id),
            targetIndex: -1,
            startPosition: { x: event.clientX, y: event.clientY },
            currentPosition: { x: event.clientX, y: event.clientY },
            offset: {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            },
        };
        if (this.dragState.draggedItem) {
            event.dataTransfer?.setData("text/plain", id);
            event.dataTransfer.effectAllowed = "move";
            // Add visual feedback
            element.style.opacity = "0.5";
            element.style.transform = "rotate(5deg) scale(1.05)";
            element.style.transition = `all ${this.options.animationDuration}ms ease`;
            // Create drag preview
            this.createDragPreview(element);
        }
    }
    handleDragOver(event) {
        if (!this.isEnabled || !this.dragState.isDragging)
            return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        this.dragState.currentPosition = { x: event.clientX, y: event.clientY };
        // Update target index based on current position
        const newTargetIndex = this.calculateTargetIndex(event.clientX, event.clientY);
        if (newTargetIndex !== this.dragState.targetIndex &&
            newTargetIndex !== this.dragState.draggedIndex) {
            this.dragState.targetIndex = newTargetIndex;
            this.updateVisualFeedback();
        }
    }
    handleDragEnter(_event, id) {
        if (!this.isEnabled || !this.dragState.isDragging)
            return;
        const targetIndex = this.findFileIndex(id);
        if (targetIndex !== -1 && targetIndex !== this.dragState.draggedIndex) {
            this.dragState.targetIndex = targetIndex;
            this.updateVisualFeedback();
        }
    }
    handleDragLeave(event) {
        if (!this.isEnabled || !this.dragState.isDragging)
            return;
        // Only handle if leaving the container entirely
        const rect = this.containerRef.getBoundingClientRect();
        const { clientX, clientY } = event;
        if (clientX < rect.left ||
            clientX > rect.right ||
            clientY < rect.top ||
            clientY > rect.bottom) {
            this.dragState.targetIndex = -1;
            this.updateVisualFeedback();
        }
    }
    handleDrop(event) {
        if (!this.isEnabled || !this.dragState.isDragging)
            return;
        event.preventDefault();
        const targetIndex = this.calculateTargetIndex(event.clientX, event.clientY);
        if (targetIndex !== -1 && targetIndex !== this.dragState.draggedIndex) {
            this.completeReorder(this.dragState.draggedIndex, targetIndex);
        }
        this.stopDrag();
    }
    handleDragEnd(_event) {
        this.stopDrag();
    }
    calculateTargetIndex(clientX, clientY) {
        if (!this.containerRef)
            return -1;
        const containerRect = this.containerRef.getBoundingClientRect();
        const relativeX = clientX - containerRect.left;
        const relativeY = clientY - containerRect.top;
        // Apply grid snapping if enabled
        if (this.options.snapToGrid) {
            const snappedX = Math.round(relativeX / this.options.gridSize) * this.options.gridSize;
            const snappedY = Math.round(relativeY / this.options.gridSize) * this.options.gridSize;
            return this.findClosestItemIndex(snappedX, snappedY);
        }
        return this.findClosestItemIndex(relativeX, relativeY);
    }
    findClosestItemIndex(x, y) {
        let closestIndex = -1;
        let closestDistance = Infinity;
        this.itemRefs.forEach((element, id) => {
            const rect = element.getBoundingClientRect();
            const containerRect = this.containerRef.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2 - containerRect.left;
            const centerY = rect.top + rect.height / 2 - containerRect.top;
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = this.findFileIndex(id);
            }
        });
        return closestIndex;
    }
    updateVisualFeedback() {
        if (!this.containerRef)
            return;
        // Remove previous feedback
        this.itemRefs.forEach((element) => {
            element.style.transform = "";
            element.style.border = "";
            element.style.backgroundColor = "";
        });
        // Add new feedback
        if (this.dragState.targetIndex !== -1) {
            const targetElement = this.findElementByIndex(this.dragState.targetIndex);
            if (targetElement) {
                targetElement.style.border = "2px dashed #3b82f6";
                targetElement.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                targetElement.style.transition = `all ${this.options.animationDuration}ms ease`;
            }
        }
    }
    completeReorder(fromIndex, toIndex) {
        // Perform the actual reordering on internal files array
        if (fromIndex === toIndex ||
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= this.files.length ||
            toIndex >= this.files.length) {
            return {
                success: false,
                newOrder: [...this.files],
                movedItem: this.dragState.draggedItem,
                fromIndex,
                toIndex,
            };
        }
        const newOrder = [...this.files];
        const [movedItem] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedItem);
        // Update internal files array with new order
        this.files = newOrder;
        // Emit reorder event for parent components to listen to
        this.emitReorderEvent(fromIndex, toIndex, newOrder, movedItem);
        return {
            success: true,
            newOrder,
            movedItem,
            fromIndex,
            toIndex,
        };
    }
    stopDrag() {
        if (this.dragState.isDragging) {
            // Reset visual feedback
            this.itemRefs.forEach((element) => {
                element.style.opacity = "";
                element.style.transform = "";
                element.style.border = "";
                element.style.backgroundColor = "";
                element.style.transition = "";
            });
            // Remove drag preview
            this.removeDragPreview();
            // Reset drag state
            this.dragState = {
                isDragging: false,
                draggedItem: null,
                draggedIndex: -1,
                targetIndex: -1,
                startPosition: { x: 0, y: 0 },
                currentPosition: { x: 0, y: 0 },
                offset: { x: 0, y: 0 },
            };
        }
    }
    createDragPreview(element) {
        const preview = element.cloneNode(true);
        preview.setAttribute("data-drag-preview", "true");
        preview.style.position = "fixed";
        preview.style.top = "0";
        preview.style.left = "0";
        preview.style.pointerEvents = "none";
        preview.style.zIndex = DIMENSIONS.DRAG_PREVIEW_Z_INDEX.toString();
        preview.style.opacity = DIMENSIONS.PREVIEW_OPACITY.toString();
        preview.style.transform = "rotate(5deg) scale(1.05)";
        document.body.appendChild(preview);
        // Update preview position on mousemove
        const updatePreview = (e) => {
            if (this.dragState.isDragging) {
                preview.style.left = `${e.clientX - this.dragState.offset.x}px`;
                preview.style.top = `${e.clientY - this.dragState.offset.y}px`;
            }
        };
        document.addEventListener("mousemove", updatePreview);
        // Store reference for cleanup
        preview._updateHandler = updatePreview;
    }
    removeDragPreview() {
        const previews = document.querySelectorAll("[data-drag-preview]");
        previews.forEach((preview) => {
            const element = preview;
            if (element._updateHandler) {
                document.removeEventListener("mousemove", element._updateHandler);
            }
            element.remove();
        });
    }
    findFileById(id) {
        return this.files.find((file) => file.id === id) || null;
    }
    findFileIndex(id) {
        return this.files.findIndex((file) => file.id === id);
    }
    findElementByIndex(index) {
        // Find element by file at the given index
        if (index < 0 || index >= this.files.length) {
            return null;
        }
        const file = this.files[index];
        if (!file) {
            return null;
        }
        return this.itemRefs.get(file.id) || null;
    }
    emitReorderEvent(fromIndex, toIndex, newOrder, movedItem) {
        // Create a custom event for reorder notifications
        const event = new CustomEvent("fileReorder", {
            detail: {
                fromIndex,
                toIndex,
                newOrder,
                movedItem,
                timestamp: Date.now(),
            },
        });
        // Dispatch event on container if available, otherwise on document
        const target = this.containerRef || document;
        target.dispatchEvent(event);
    }
    // Public methods for external control
    setFiles(files) {
        this.files = files;
    }
    reorderItems(fromIndex, toIndex, items) {
        // Validate array operation
        const validation = InputValidator.validateArrayOperation(fromIndex, toIndex, items?.length || 0);
        if (!validation.isValid) {
            return {
                success: false,
                newOrder: items || [],
                movedItem: null,
                fromIndex,
                toIndex,
            };
        }
        // Handle null/undefined items safely
        if (!items || !Array.isArray(items)) {
            return {
                success: false,
                newOrder: [],
                movedItem: null,
                fromIndex,
                toIndex,
            };
        }
        if (fromIndex === toIndex ||
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= items.length ||
            toIndex >= items.length) {
            return {
                success: false,
                newOrder: items,
                movedItem: null,
                fromIndex,
                toIndex,
            };
        }
        const newOrder = [...items];
        const [movedItem] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedItem);
        return {
            success: true,
            newOrder,
            movedItem,
            fromIndex,
            toIndex,
        };
    }
    getDragState() {
        return { ...this.dragState };
    }
    isReorderingEnabled() {
        return this.isEnabled && this.options.enableReordering;
    }
    destroy() {
        this.stopDrag();
        this.itemRefs.clear();
        this.containerRef = null;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}
//# sourceMappingURL=drag-reorder.js.map