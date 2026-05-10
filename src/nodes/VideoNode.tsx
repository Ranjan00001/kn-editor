import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import React from 'react';

export type SerializedVideoNode = Spread<
  {
    url: string;
    type: 'video';
    version: 1;
  },
  SerializedLexicalNode
>;

function convertVideoElement(domNode: HTMLElement): null | DOMConversionOutput {
  const src = domNode.getAttribute('data-lexical-video');
  if (src) {
    const node = $createVideoNode(src);
    return { node };
  }
  return null;
}

export class VideoNode extends DecoratorNode<React.ReactElement> {
  __url: string;

  static getType(): string {
    return 'video';
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__url, node.__key);
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const node = $createVideoNode(serializedNode.url);
    return node;
  }

  exportJSON(): SerializedVideoNode {
    return {
      type: 'video',
      url: this.__url,
      version: 1,
    };
  }

  constructor(url: string, key?: NodeKey) {
    super(key);
    this.__url = url;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    span.className = config.theme.video || 'kn-editor-video-wrapper';
    span.setAttribute('data-lexical-video', this.__url);
    return span;
  }

  updateDOM(): false {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-video')) {
          return null;
        }
        return {
          conversion: convertVideoElement,
          priority: 1,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.className = 'kn-editor-video-wrapper';
    element.setAttribute('data-lexical-video', this.__url);
    const iframe = document.createElement('iframe');
    iframe.src = this.__url;
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.title = 'Video Embed';
    element.appendChild(iframe);
    return { element };
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): React.ReactElement {
    return (
      <iframe
        src={this.__url}
        frameBorder="0"
        allowFullScreen={true}
        title="Video Embed"
        className="kn-editor-video-iframe"
      />
    );
  }
}

export function $createVideoNode(url: string): VideoNode {
  return new VideoNode(url);
}

export function $isVideoNode(
  node: VideoNode | LexicalNode | null | undefined,
): node is VideoNode {
  return node instanceof VideoNode;
}
