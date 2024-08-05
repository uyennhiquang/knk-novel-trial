declare global {
  type ParagraphText = string[];
  type Paragraph = {
    audioId?: string[];
    sentences: ParagraphText;
  };

  type ChapterContent = Paragraph[];
  type Chapter = {
    texts: ChapterContent;
  };
  type SavedSlot = {
    novel: number;
    chapter: number;
    paragraph: number;
  };

  interface NoLoop {
    [key: number]: string[];
  }
}
export {};
