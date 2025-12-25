import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { mergeAttributes } from '@tiptap/core';

const ResizableImageComponent = ({ node, updateAttributes, selected }) => {
    const [width, setWidth] = useState(node.attrs.width || '100%');
    const [resizing, setResizing] = useState(false);
    const containerRef = useRef(null);

    // Initial width setup
    useEffect(() => {
        if (node.attrs.width) {
            setWidth(node.attrs.width);
        }
    }, [node.attrs.width]);

    const handleMouseDown = useCallback((e, direction) => {
        e.preventDefault();
        e.stopPropagation();
        setResizing(true);

        const startX = e.clientX;
        const startWidth = containerRef.current.offsetWidth;

        const onMouseMove = (e) => {
            let newWidth;
            if (direction === 'right') {
                newWidth = startWidth + (e.clientX - startX);
            } else {
                newWidth = startWidth - (e.clientX - startX);
            }

            // Constrain width
            const parentWidth = containerRef.current.parentElement?.offsetWidth || 800;
            if (newWidth > 50 && newWidth <= parentWidth) {
                setWidth(`${newWidth}px`);
            }
        };

        const onMouseUp = () => {
            setResizing(false);
            updateAttributes({ width: containerRef.current.style.width });
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [updateAttributes]);

    return (
        <NodeViewWrapper className="resizable-image-wrapper" style={{ width: width, display: 'inline-block', position: 'relative', lineHeight: 0 }}>
            <div
                ref={containerRef}
                className={`image-container ${selected || resizing ? 'selected' : ''}`}
                style={{ width: '100%', position: 'relative' }}
            >
                <img
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    style={{ width: '100%', display: 'block' }}
                />
                {(selected || resizing) && (
                    <>
                        {/* Resize Handles */}
                        <div
                            className="resize-handle bottom-right"
                            onMouseDown={(e) => handleMouseDown(e, 'right')}
                        />
                        <div
                            className="resize-handle bottom-left"
                            onMouseDown={(e) => handleMouseDown(e, 'left')}
                        />
                    </>
                )}
            </div>
        </NodeViewWrapper>
    );
};

export const ResizableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                renderHTML: attributes => ({
                    style: `width: ${attributes.width}`,
                }),
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageComponent);
    },
});
