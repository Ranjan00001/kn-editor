import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical';
import { useEffect } from 'react';
import { $createVideoNode, VideoNode } from '../nodes/VideoNode';

export const INSERT_VIDEO_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_VIDEO_COMMAND',
);

const YOUTUBE_MATCH =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]+)/;

function getEmbedUrl(url: string): string {
  const youtubeMatch = url.match(YOUTUBE_MATCH);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  return url;
}

export function VideoPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([VideoNode])) {
      throw new Error('VideoPlugin: VideoNode not registered on editor');
    }

    return editor.registerCommand<string>(
      INSERT_VIDEO_COMMAND,
      (payload) => {
        const embedUrl = getEmbedUrl(payload);
        const videoNode = $createVideoNode(embedUrl);
        $insertNodeToNearestRoot(videoNode);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
