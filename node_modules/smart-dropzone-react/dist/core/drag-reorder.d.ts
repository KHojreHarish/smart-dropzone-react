import { UploadFile } from "../types";
export interface DragReorderOptions {
    enableReordering?: boolean;
    animationDuration?: number;
    dragThreshold?: number;
    snapToGrid?: boolean;
    gridSize?: number;
    constrainToContainer?: boolean;
}
export interface DragState {
    isDragging: boolean;
    draggedItem: UploadFile | null;
    draggedIndex: number;
    targetIndex: number;
    startPosition: {
        x: number;
        y: number;
    };
    currentPosition: {
        x: number;
        y: number;
    };
    offset: {
        x: number;
        y: number;
    };
}
export interface ReorderResult {
    success: boolean;
    newOrder: UploadFile[];
    movedItem: UploadFile | null;
    fromIndex: number;
    toIndex: number;
}
export declare class DragReorderManager {
    private options;
    private dragState;
    private containerRef;
    private itemRefs;
    private animationFrame;
    private isEnabled;
    private files;
    constructor(options?: DragReorderOptions);
    enable(): void;
    disable(): void;
    setContainer(container: HTMLElement): void;
    registerItem(id: string, element: HTMLElement): void;
    unregisterItem(id: string): void;
    private setupContainerListeners;
    private setupItemListeners;
    private handleDragStart;
    private handleDragOver;
    private handleDragEnter;
    private handleDragLeave;
    private handleDrop;
    private handleDragEnd;
    private calculateTargetIndex;
    private findClosestItemIndex;
    private updateVisualFeedback;
    private completeReorder;
    private stopDrag;
    private createDragPreview;
    private removeDragPreview;
    private findFileById;
    private findFileIndex;
    private findElementByIndex;
    private emitReorderEvent;
    setFiles(files: UploadFile[]): void;
    reorderItems(fromIndex: number, toIndex: number, items: UploadFile[]): ReorderResult;
    getDragState(): DragState;
    isReorderingEnabled(): boolean;
    destroy(): void;
}
//# sourceMappingURL=drag-reorder.d.ts.map