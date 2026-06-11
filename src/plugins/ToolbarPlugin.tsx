import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  ElementFormatType,
} from 'lexical';
import { $wrapNodes, $patchStyleText } from '@lexical/selection';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Type,
  Pilcrow,
  Video,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Subscript,
  Superscript,
  Code,
  Quote,
  Minus,
  Table2,
  Indent,
  Outdent,
  RemoveFormatting,
  Maximize,
  Minimize,
  Palette,
  Highlighter,
} from 'lucide-react';
import { DropDown, DropDownItem } from '../ui/DropDown';
import { TextInputDialog } from '../ui/Dialog';
import { ColorPicker } from '../ui/ColorPicker';
import { EmojiPicker } from '../ui/EmojiPicker';
import { TableInsertDialog } from './TablePlugin';

import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  $isListNode,
} from '@lexical/list';
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
  $isHeadingNode,
} from '@lexical/rich-text';
import { $createCodeNode, $isCodeNode } from '@lexical/code';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $getNearestNodeOfType } from '@lexical/utils';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import { INSERT_VIDEO_COMMAND } from './VideoPlugin';
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  BLOCK_TYPE_TO_LABEL,
  TEXT_COLOR_PRESETS,
  BG_COLOR_PRESETS,
  EMOJI_LIST,
} from '../config';

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [toolbarState, setToolbarState] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isSubscript: false,
    isSuperscript: false,
    isCode: false,
    isLink: false,
    blockType: 'paragraph',
    fontSize: '15px',
    fontFamily: 'Arial',
    elementFormat: 'left' as ElementFormatType | '',
    textColor: '#000000',
    bgColor: 'transparent',
  });

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: 'link' | 'video' | null;
    url: string;
  }>({
    isOpen: false,
    type: null,
    url: '',
  });

  const updateToolbarState = useCallback(
    (key: string, value: string | boolean) => {
      setToolbarState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      updateToolbarState('isBold', selection.hasFormat('bold'));
      updateToolbarState('isItalic', selection.hasFormat('italic'));
      updateToolbarState('isUnderline', selection.hasFormat('underline'));
      updateToolbarState('isStrikethrough', selection.hasFormat('strikethrough'));
      updateToolbarState('isSubscript', selection.hasFormat('subscript'));
      updateToolbarState('isSuperscript', selection.hasFormat('superscript'));
      updateToolbarState('isCode', selection.hasFormat('code'));

      const node = selection.anchor.getNode();
      const parent = node.getParent();
      updateToolbarState('isLink', parent !== null && parent.getType() === 'link');

      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          updateToolbarState('blockType', type);
        } else if ($isCodeNode(element)) {
          updateToolbarState('blockType', 'code');
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          updateToolbarState('blockType', type);
        }

        if ('getFormatType' in element) {
          updateToolbarState('elementFormat', (element as any).getFormatType());
        }
      }
    }
  }, [editor, updateToolbarState]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      1,
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      1,
    );
  }, [editor]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [editor],
  );

  const formatHeading = (headingSize: HeadingTagType) => {
    if (toolbarState.blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatParagraph = () => {
    if (toolbarState.blockType !== 'paragraph') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const formatQuote = () => {
    if (toolbarState.blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatCode = () => {
    if (toolbarState.blockType !== 'code') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createCodeNode());
        }
      });
    }
  };

  const clearFormatting = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if (node.getType() === 'text') {
            (node as any).setFormat(0);
            (node as any).setStyle('');
          }
        });
      }
    });
  }, [editor]);

  const insertLink = useCallback(() => {
    if (!toolbarState.isLink) {
      setDialogState({ isOpen: true, type: 'link', url: 'https://' });
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, toolbarState.isLink]);

  const handleLinkSubmit = useCallback(
    (url: string) => {
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    },
    [editor],
  );

  const insertVideo = useCallback(() => {
    setDialogState({ isOpen: true, type: 'video', url: 'https://' });
  }, []);

  const handleVideoSubmit = useCallback(
    (url: string) => {
      if (url) {
        editor.dispatchCommand(INSERT_VIDEO_COMMAND, url);
      }
    },
    [editor],
  );

  const insertImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readEvent) => {
          const src = readEvent.target?.result as string;
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            altText: file.name,
            src,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  const insertEmoji = useCallback(
    (emoji: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText(emoji);
        }
      });
    },
    [editor],
  );

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const container = document.querySelector('.kn-editor-container');
      if (container) {
        container.classList.toggle('kn-editor-fullscreen', !prev);
      }
      return !prev;
    });
  }, []);

  const blockTypeToIcon: Record<string, React.ReactNode> = {
    paragraph: <Pilcrow size={16} />,
    h1: <Heading1 size={16} />,
    h2: <Heading2 size={16} />,
    h3: <Heading3 size={16} />,
    bullet: <List size={16} />,
    number: <ListOrdered size={16} />,
    quote: <Quote size={16} />,
    code: <Code size={16} />,
  };

  const alignmentIcon: Record<string, React.ReactNode> = {
    left: <AlignLeft size={16} />,
    center: <AlignCenter size={16} />,
    right: <AlignRight size={16} />,
    justify: <AlignJustify size={16} />,
  };

  return (
    <div className="kn-editor-toolbar">
      {/* Undo / Redo */}
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="kn-editor-toolbar-btn"
        title="Undo"
      >
        <Undo2 size={16} />
      </button>
      <button
        type="button"
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="kn-editor-toolbar-btn"
        title="Redo"
      >
        <Redo2 size={16} />
      </button>

      <div className="kn-editor-toolbar-divider" />

      {/* Block Type */}
      <DropDown
        buttonLabel={BLOCK_TYPE_TO_LABEL[toolbarState.blockType] || 'Normal'}
        buttonIcon={blockTypeToIcon[toolbarState.blockType] || <Pilcrow size={16} />}
      >
        <DropDownItem onClick={formatParagraph} active={toolbarState.blockType === 'paragraph'} icon={<Pilcrow size={16} />}>
          Normal
        </DropDownItem>
        <DropDownItem onClick={() => formatHeading('h1')} active={toolbarState.blockType === 'h1'} icon={<Heading1 size={16} />}>
          Heading 1
        </DropDownItem>
        <DropDownItem onClick={() => formatHeading('h2')} active={toolbarState.blockType === 'h2'} icon={<Heading2 size={16} />}>
          Heading 2
        </DropDownItem>
        <DropDownItem onClick={() => formatHeading('h3')} active={toolbarState.blockType === 'h3'} icon={<Heading3 size={16} />}>
          Heading 3
        </DropDownItem>
        <DropDownItem onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} active={toolbarState.blockType === 'bullet'} icon={<List size={16} />}>
          Bullet List
        </DropDownItem>
        <DropDownItem onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} active={toolbarState.blockType === 'number'} icon={<ListOrdered size={16} />}>
          Numbered List
        </DropDownItem>
        <DropDownItem onClick={formatQuote} active={toolbarState.blockType === 'quote'} icon={<Quote size={16} />}>
          Blockquote
        </DropDownItem>
        <DropDownItem onClick={formatCode} active={toolbarState.blockType === 'code'} icon={<Code size={16} />}>
          Code Block
        </DropDownItem>
      </DropDown>

      <div className="kn-editor-toolbar-divider" />

      {/* Font Family & Size */}
      <DropDown buttonLabel={toolbarState.fontFamily} buttonIcon={<Type size={16} />}>
        {FONT_FAMILY_OPTIONS.map((font) => (
          <DropDownItem
            key={font}
            active={toolbarState.fontFamily === font}
            onClick={() => {
              updateToolbarState('fontFamily', font);
              applyStyleText({ 'font-family': font });
            }}
          >
            <span style={{ fontFamily: font }}>{font}</span>
          </DropDownItem>
        ))}
      </DropDown>

      <DropDown buttonLabel={toolbarState.fontSize}>
        {FONT_SIZE_OPTIONS.map((size) => (
          <DropDownItem
            key={size}
            active={toolbarState.fontSize === size}
            onClick={() => {
              updateToolbarState('fontSize', size);
              applyStyleText({ 'font-size': size });
            }}
          >
            {size}
          </DropDownItem>
        ))}
      </DropDown>

      <div className="kn-editor-toolbar-divider" />

      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={`kn-editor-toolbar-btn ${toolbarState.isBold ? 'active' : ''}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={`kn-editor-toolbar-btn ${toolbarState.isItalic ? 'active' : ''}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className={`kn-editor-toolbar-btn ${toolbarState.isUnderline ? 'active' : ''}`}
        title="Underline"
      >
        <Underline size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        className={`kn-editor-toolbar-btn ${toolbarState.isStrikethrough ? 'active' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')}
        className={`kn-editor-toolbar-btn ${toolbarState.isSubscript ? 'active' : ''}`}
        title="Subscript"
      >
        <Subscript size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')}
        className={`kn-editor-toolbar-btn ${toolbarState.isSuperscript ? 'active' : ''}`}
        title="Superscript"
      >
        <Superscript size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        className={`kn-editor-toolbar-btn ${toolbarState.isCode ? 'active' : ''}`}
        title="Inline Code"
      >
        <Code size={16} />
      </button>

      <div className="kn-editor-toolbar-divider" />

      {/* Text Color & Highlight */}
      <ColorPicker
        icon={<Palette size={16} />}
        colors={TEXT_COLOR_PRESETS}
        currentColor={toolbarState.textColor}
        onColorChange={(color) => {
          updateToolbarState('textColor', color);
          applyStyleText({ color });
        }}
        title="Text Color"
      />
      <ColorPicker
        icon={<Highlighter size={16} />}
        colors={BG_COLOR_PRESETS}
        currentColor={toolbarState.bgColor}
        onColorChange={(color) => {
          updateToolbarState('bgColor', color);
          applyStyleText({ 'background-color': color });
        }}
        title="Highlight Color"
      />

      <div className="kn-editor-toolbar-divider" />

      {/* Alignment */}
      <DropDown
        buttonLabel=""
        buttonIcon={alignmentIcon[toolbarState.elementFormat || 'left'] || <AlignLeft size={16} />}
      >
        <DropDownItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} active={toolbarState.elementFormat === 'left'} icon={<AlignLeft size={16} />}>
          Left
        </DropDownItem>
        <DropDownItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} active={toolbarState.elementFormat === 'center'} icon={<AlignCenter size={16} />}>
          Center
        </DropDownItem>
        <DropDownItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} active={toolbarState.elementFormat === 'right'} icon={<AlignRight size={16} />}>
          Right
        </DropDownItem>
        <DropDownItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')} active={toolbarState.elementFormat === 'justify'} icon={<AlignJustify size={16} />}>
          Justify
        </DropDownItem>
      </DropDown>

      {/* Indent / Outdent */}
      <button
        type="button"
        onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
        className="kn-editor-toolbar-btn"
        title="Indent"
      >
        <Indent size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
        className="kn-editor-toolbar-btn"
        title="Outdent"
      >
        <Outdent size={16} />
      </button>

      <div className="kn-editor-toolbar-divider" />

      {/* Insert */}
      <button
        type="button"
        onClick={insertLink}
        className={`kn-editor-toolbar-btn ${toolbarState.isLink ? 'active' : ''}`}
        title="Insert Link"
      >
        <Link size={16} />
      </button>
      <button
        type="button"
        onClick={insertImage}
        className="kn-editor-toolbar-btn"
        title="Insert Image"
      >
        <ImageIcon size={16} />
      </button>
      <button
        type="button"
        onClick={insertVideo}
        className="kn-editor-toolbar-btn"
        title="Insert YouTube Video"
      >
        <Video size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}
        className="kn-editor-toolbar-btn"
        title="Insert Horizontal Rule"
      >
        <Minus size={16} />
      </button>
      <button
        type="button"
        onClick={() => setTableDialogOpen(true)}
        className="kn-editor-toolbar-btn"
        title="Insert Table"
      >
        <Table2 size={16} />
      </button>

      <EmojiPicker emojis={EMOJI_LIST} onEmojiSelect={insertEmoji} />

      <div className="kn-editor-toolbar-divider" />

      {/* Utilities */}
      <button
        type="button"
        onClick={clearFormatting}
        className="kn-editor-toolbar-btn"
        title="Clear Formatting"
      >
        <RemoveFormatting size={16} />
      </button>
      <button
        type="button"
        onClick={toggleFullscreen}
        className="kn-editor-toolbar-btn"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
      </button>

      {/* Dialogs */}
      <TextInputDialog
        title={dialogState.type === 'video' ? 'Insert YouTube Video' : 'Insert Link'}
        placeholder={dialogState.type === 'video' ? 'https://youtube.com/...' : 'https://'}
        initialValue={dialogState.url}
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, type: null, url: '' })}
        onSubmit={(url) => {
          if (dialogState.type === 'video') handleVideoSubmit(url);
          else if (dialogState.type === 'link') handleLinkSubmit(url);
        }}
      />

      <TableInsertDialog
        isOpen={tableDialogOpen}
        onClose={() => setTableDialogOpen(false)}
      />
    </div>
  );
}
