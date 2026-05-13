import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { $generateHtmlFromNodes } from '@lexical/html';
import { EditorState, LexicalEditor } from 'lexical';

import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import { ImagePlugin } from './plugins/ImagePlugin';
import { ImageNode } from './nodes/ImageNode';
import { VideoPlugin } from './plugins/VideoPlugin';
import { VideoNode } from './nodes/VideoNode';

export interface KnEditorProps {
  initialConfig?: {
    namespace?: string;
    onError?: (error: Error) => void;
    editorState?: string;
  };
  onChange?: (html: string, editorState: EditorState) => void;
  placeholder?: string;
}

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'kn-editor-placeholder',
  paragraph: 'kn-editor-paragraph',
  quote: 'kn-editor-quote',
  heading: {
    h1: 'kn-editor-h1',
    h2: 'kn-editor-h2',
    h3: 'kn-editor-h3',
  },
  list: {
    nested: {
      listitem: 'kn-editor-nested-listitem',
    },
    ol: 'kn-editor-list-ol',
    ul: 'kn-editor-list-ul',
    listitem: 'kn-editor-listitem',
  },
  image: 'kn-editor-image',
  link: 'kn-editor-link',
  text: {
    bold: 'kn-editor-text-bold',
    italic: 'kn-editor-text-italic',
    overflowed: 'kn-editor-text-overflowed',
    strikethrough: 'kn-editor-text-strikethrough',
    underline: 'kn-editor-text-underline',
    underlineStrikethrough: 'kn-editor-text-underlineStrikethrough',
  },
};

const editorNodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  AutoLinkNode,
  LinkNode,
  ImageNode,
  VideoNode,
];

export function KnEditor({
  initialConfig,
  onChange,
  placeholder = 'Type something amazing...',
}: KnEditorProps) {
  const defaultOnError = (error: Error) => {
    console.error('KnEditor Error:', error);
  };

  const config = {
    namespace: initialConfig?.namespace || 'KnEditor',
    theme,
    onError: initialConfig?.onError || defaultOnError,
    nodes: editorNodes,
    editorState: initialConfig?.editorState,
  };

  const handleChange = (editorState: EditorState, editor: LexicalEditor) => {
    if (!onChange) return;
    editorState.read(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      onChange(htmlString, editorState);
    });
  };

  return (
    <LexicalComposer initialConfig={config}>
      <div className="kn-editor-container">
        <ToolbarPlugin />
        <div className="kn-editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="kn-editor-input" />}
            placeholder={<div className="kn-editor-placeholder">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <ImagePlugin />
          <VideoPlugin />
          {onChange && <OnChangePlugin onChange={handleChange} />}
        </div>
      </div>
    </LexicalComposer>
  );
}
