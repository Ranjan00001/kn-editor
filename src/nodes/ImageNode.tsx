import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  DOMConversionMap,
  DOMExportOutput,
  LexicalEditor,
  NodeKey,
  LexicalNode,
  DecoratorNode,
  SerializedLexicalNode,
  Spread,
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';

export interface ImagePayload {
  altText: string;
  key?: NodeKey;
  maxWidth?: number;
  src: string;
  width?: 'inherit' | number;
  height?: 'inherit' | number;
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    src: string;
    width?: 'inherit' | number;
    height?: 'inherit' | number;
    maxWidth?: number;
  },
  SerializedLexicalNode
>;

function ImageResizer({
  onResize,
  imageRef,
}: {
  onResize: (width: number, height: number) => void;
  imageRef: React.RefObject<HTMLImageElement | null>;
}) {
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!imageRef.current) return;
    const startX = event.clientX;
    const startWidth = imageRef.current.offsetWidth;
    const startHeight = imageRef.current.offsetHeight;
    const ratio = startWidth / startHeight;

    const handlePointerMove = (e: PointerEvent) => {
      const diff = e.clientX - startX;
      const newWidth = startWidth + diff;
      const newHeight = newWidth / ratio;
      onResize(newWidth, newHeight);
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      className="kn-editor-image-resizer"
      onPointerDown={handlePointerDown}
    />
  );
}

function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  resizable,
}: {
  src: string;
  altText: string;
  nodeKey: NodeKey;
  width: 'inherit' | number;
  height: 'inherit' | number;
  maxWidth: number;
  resizable: boolean;
}) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleResize = (newWidth: number, newHeight: number) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(newWidth, newHeight);
      }
    });
  };

  const onClick = useCallback(
    (payload: MouseEvent) => {
      if (payload.target === imageRef.current) {
        if (payload.shiftKey) {
          setSelected(!isSelected);
        } else {
          clearSelection();
          setSelected(true);
        }
        return true;
      }
      return false;
    },
    [isSelected, setSelected, clearSelection],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, onClick]);

  return (
    <div className={`kn-editor-image-container ${isSelected ? 'focused' : ''}`}>
      <img
        ref={imageRef}
        src={src}
        alt={altText}
        className={`kn-editor-image ${isSelected ? 'focused' : ''}`}
        style={{
          width: width === 'inherit' ? '100%' : `${width}px`,
          height: height === 'inherit' ? 'auto' : `${height}px`,
          maxWidth: width === 'inherit' ? `${maxWidth}px` : '100%',
        }}
      />
      {resizable && (
        <ImageResizer onResize={handleResize} imageRef={imageRef} />
      )}
    </div>
  );
}

export class ImageNode extends DecoratorNode<React.JSX.Element> {
  __src: string;
  __altText: string;
  __width: 'inherit' | number;
  __height: 'inherit' | number;
  __maxWidth: number;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width || 'inherit';
    this.__height = height || 'inherit';
  }

  setWidthAndHeight(width: 'inherit' | number, height: 'inherit' | number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  createDOM(config: any): HTMLElement {
    const span = document.createElement('span');
    return span;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, maxWidth, src } = serializedNode;
    return $createImageNode({
      altText,
      height,
      maxWidth,
      src,
      width,
    });
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      height: this.__height === 'inherit' ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.__width === 'inherit' ? 0 : this.__width,
    };
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    element.setAttribute('width', this.__width.toString());
    element.setAttribute('height', this.__height.toString());
    return { element };
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  decorate(): React.JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        maxWidth={this.__maxWidth}
        nodeKey={this.getKey()}
        resizable={true}
      />
    );
  }
}

export function $createImageNode({
  altText,
  height,
  maxWidth = 500,
  src,
  width,
  key,
}: ImagePayload): ImageNode {
  return new ImageNode(
    src,
    altText,
    maxWidth,
    width,
    height,
    key,
  );
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
