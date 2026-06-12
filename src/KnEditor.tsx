import React, { useCallback, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, EditorState, LexicalEditor } from 'lexical';

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
  value?: string;
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
    code: 'kn-editor-text-code',
    subscript: 'kn-editor-text-subscript',
    superscript: 'kn-editor-text-superscript',
  },
  code: 'kn-editor-code',
  codeHighlight: {
    atrule: 'kn-editor-tokenAttr',
    attr: 'kn-editor-tokenAttr',
    boolean: 'kn-editor-tokenProperty',
    builtin: 'kn-editor-tokenSelector',
    cdata: 'kn-editor-tokenComment',
    char: 'kn-editor-tokenSelector',
    class: 'kn-editor-tokenFunction',
    'class-name': 'kn-editor-tokenFunction',
    comment: 'kn-editor-tokenComment',
    constant: 'kn-editor-tokenProperty',
    deleted: 'kn-editor-tokenProperty',
    doctype: 'kn-editor-tokenComment',
    entity: 'kn-editor-tokenOperator',
    function: 'kn-editor-tokenFunction',
    important: 'kn-editor-tokenVariable',
    inserted: 'kn-editor-tokenSelector',
    keyword: 'kn-editor-tokenAttr',
    namespace: 'kn-editor-tokenVariable',
    number: 'kn-editor-tokenProperty',
    operator: 'kn-editor-tokenOperator',
    prolog: 'kn-editor-tokenComment',
    property: 'kn-editor-tokenProperty',
    punctuation: 'kn-editor-tokenPunctuation',
    regex: 'kn-editor-tokenVariable',
    selector: 'kn-editor-tokenSelector',
    string: 'kn-editor-tokenSelector',
    symbol: 'kn-editor-tokenProperty',
    tag: 'kn-editor-tokenProperty',
    url: 'kn-editor-tokenOperator',
    variable: 'kn-editor-tokenVariable',
  },
  table: 'kn-editor-table',
  tableCell: 'kn-editor-tableCell',
  tableCellHeader: 'kn-editor-tableCellHeader',
  tableRow: 'kn-editor-tableRow',
  horizontalRule: 'kn-editor-hr',
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
  HorizontalRuleNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
];

function WordCountPlugin({ onChange }: { onChange: (counts: { words: number; chars: number }) => void }) {
  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const text = $getRoot().getTextContent();
          const words = text.trim() ? text.trim().split(/\s+/).length : 0;
          onChange({ words, chars: text.length });
        });
      }}
    />
  );
}

export function KnEditor({
  initialConfig,
  value,
  onChange,
  placeholder = 'Type something amazing...',
}: KnEditorProps) {
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0 });

  const defaultOnError = (error: Error) => {
    console.error('KnEditor Error:', error);
  };

  const editorStateInitializer = value
    ? (editor: LexicalEditor) => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(value, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().select();
        $insertNodes(nodes);
      }
    : initialConfig?.editorState;

  const config = {
    namespace: initialConfig?.namespace || 'KnEditor',
    theme,
    onError: initialConfig?.onError || defaultOnError,
    nodes: editorNodes,
    editorState: editorStateInitializer,
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
          <HorizontalRulePlugin />
          <TablePlugin />
          <TabIndentationPlugin />
          <WordCountPlugin onChange={setWordCount} />
          {onChange && <OnChangePlugin onChange={handleChange} />}
        </div>
        <div className="kn-editor-statusbar">
          <span>{wordCount.words} words</span>
          <span>{wordCount.chars} characters</span>
        </div>
      </div>
    </LexicalComposer>
  );
}
