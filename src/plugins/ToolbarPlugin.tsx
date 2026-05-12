import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  LexicalEditor,
} from 'lexical';
import { $wrapNodes } from '@lexical/selection';
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
  Video
} from 'lucide-react';
import { DropDown, DropDownItem } from '../ui/DropDown';
import { TextInputDialog } from '../ui/Dialog';

import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  ListNode,
  $isListNode,
} from '@lexical/list';
import { $createHeadingNode, $createQuoteNode, HeadingTagType, $isHeadingNode } from '@lexical/rich-text';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $patchStyleText } from '@lexical/selection';
import { $getNearestNodeOfType } from '@lexical/utils';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import { INSERT_VIDEO_COMMAND } from './VideoPlugin';
import { FONT_FAMILY_OPTIONS, FONT_SIZE_OPTIONS, BLOCK_TYPE_TO_LABEL } from '../config';

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [toolbarState, setToolbarState] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false, // <-- 1. Added Strikethrough to initial state
    isLink: false,
    blockType: 'paragraph',
    fontSize: '15px',
    fontFamily: 'Arial',
  });

  const [dialogState, setDialogState] = useState<{ isOpen: boolean; type: 'link' | 'video' | null; url: string }>({
    isOpen: false,
    type: null,
    url: '',
  });

  const updateToolbarState = useCallback((key: string, value: string | boolean) => {
    setToolbarState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      updateToolbarState('isBold', selection.hasFormat('bold'));
      updateToolbarState('isItalic', selection.hasFormat('italic'));
      updateToolbarState('isUnderline', selection.hasFormat('underline'));
      updateToolbarState('isStrikethrough', selection.hasFormat('strikethrough')); // <-- 2. Read format from selection

      const node = selection.anchor.getNode();
      const parent = node.getParent();

      // Update links
      const isLinkNode = parent !== null && parent.getType() === 'link';
      updateToolbarState('isLink', isLinkNode);

      // Block Type
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          updateToolbarState('blockType', type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          updateToolbarState('blockType', type);
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

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

  const insertLink = useCallback(() => {
    if (!toolbarState.isLink) {
      setDialogState({ isOpen: true, type: 'link', url: 'https://' });
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, toolbarState.isLink]);

  const handleLinkSubmit = useCallback((url: string) => {
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
  }, [editor]);

  const insertVideo = useCallback(() => {
    setDialogState({ isOpen: true, type: 'video', url: 'https://' });
  }, []);

  const handleVideoSubmit = useCallback((url: string) => {
    if (url) {
      editor.dispatchCommand(INSERT_VIDEO_COMMAND, url);
    }
  }, [editor]);

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
            src: src,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  const blockTypeToIcon = {
    paragraph: <Pilcrow size={16} />,
    h1: <Heading1 size={16} />,
    h2: <Heading2 size={16} />,
    h3: <Heading3 size={16} />,
    bullet: <List size={16} />,
    number: <ListOrdered size={16} />,
  };

  return (
    <div className="kn-editor-toolbar">
      <DropDown
        buttonLabel={BLOCK_TYPE_TO_LABEL[toolbarState.blockType as keyof typeof BLOCK_TYPE_TO_LABEL] || 'Normal'}
        buttonIcon={blockTypeToIcon[toolbarState.blockType as keyof typeof blockTypeToIcon] || <Pilcrow size={16} />}
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
      </DropDown>

      <div className="kn-editor-toolbar-divider" />

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

      {/* <-- 3. Add the UI Button for Strikethrough */}
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        className={`kn-editor-toolbar-btn ${toolbarState.isStrikethrough ? 'active' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>

      <div className="kn-editor-toolbar-divider" />

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
        title="Insert Youtube Video"
      >
        <Video size={16} />
      </button>

      <div className="kn-editor-toolbar-divider" />

      {/* Font Family and Size using StylePatch */}
      <DropDown buttonLabel={toolbarState.fontFamily} buttonIcon={<Type size={16} />}>
        {FONT_FAMILY_OPTIONS.map(font => (
          <DropDownItem
            key={font}
            active={toolbarState.fontFamily === font}
            onClick={() => { updateToolbarState('fontFamily', font); applyStyleText({ 'font-family': font }); }}
          >
            <span style={{ fontFamily: font }}>{font}</span>
          </DropDownItem>
        ))}
      </DropDown>

      <DropDown buttonLabel={toolbarState.fontSize}>
        {FONT_SIZE_OPTIONS.map(size => (
          <DropDownItem
            key={size}
            active={toolbarState.fontSize === size}
            onClick={() => { updateToolbarState('fontSize', size); applyStyleText({ 'font-size': size }); }}
          >
            {size}
          </DropDownItem>
        ))}
      </DropDown>

      <TextInputDialog
        title={dialogState.type === 'video' ? "Insert Youtube Video" : "Insert Link"}
        placeholder={dialogState.type === 'video' ? "https://youtube.com/..." : "https://"}
        initialValue={dialogState.url}
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, type: null, url: '' })}
        onSubmit={(url) => {
          if (dialogState.type === 'video') {
            handleVideoSubmit(url);
          } else if (dialogState.type === 'link') {
            handleLinkSubmit(url);
          }
        }}
      />
    </div>
  );
}
