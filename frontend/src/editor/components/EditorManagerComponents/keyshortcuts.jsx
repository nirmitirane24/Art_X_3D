import React, { useEffect } from "react";

const KeyboardShortcuts = ({ selectedObjects, deleteSelectedObjects, undo, redo, copySelectedObjects, pasteCopiedObjects, handleArrowKeyMovement }) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Delete' && selectedObjects.length > 0) {
                deleteSelectedObjects();
            } else if (event.ctrlKey && event.key === 'z') {
                undo();
            } else if (event.ctrlKey && event.key === 'y') {
                redo();
            } else if (event.ctrlKey && event.key === 'c') {
                copySelectedObjects();
            } else if (event.ctrlKey && event.key === 'v') {
                pasteCopiedObjects();
            } else if (
                event.key === 'ArrowUp' ||
                event.key === 'ArrowDown' ||
                event.key === 'ArrowLeft' ||
                event.key === 'ArrowRight'
            ) {
                handleArrowKeyMovement(event);
            }
        };

        const handleWheel = (event) => {
            if (event.ctrlKey) {
                event.preventDefault();
            }
        };

        const handleContextMenu = (event) => {
            event.preventDefault();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [selectedObjects, deleteSelectedObjects, undo, redo, copySelectedObjects, pasteCopiedObjects, handleArrowKeyMovement]);

    return null;
};

export default KeyboardShortcuts;