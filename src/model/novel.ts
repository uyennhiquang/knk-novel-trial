import { seriesData } from "./seriesData";

class Novel {
  chapters: Chapter[];
  currentChapter: ChapterContent;
  currentParagraph: ParagraphText;
  currentParagraphObject: Paragraph;

  chapterIndex: number;
  paragraphIndex: number;
  sentenceIndex: number;

  constructor(novelIndex: number) {
    this.chapters = seriesData[novelIndex]["chapters"];
    this.currentChapter = null;
    this.currentParagraph = null;
    this.currentParagraphObject = null;

    // Have to set to the program's variable temporarily (without affecting the localStorage) so it doesn't crash
    this.chapterIndex = 0;
    this.paragraphIndex = 0;
    this.sentenceIndex = 0;

    this.setCurrentChapter();
    this.setCurrentParagraph();
  }

  setParagraph(value: number): void {
    this.paragraphIndex = value;
    localStorage.setItem("paragraphIndex", String(value));
  }

  setChapter(value: number): void {
    this.chapterIndex = value;
    localStorage.setItem("chapterIndex", String(value));
  }

  setCurrentChapter(): void {
    this.currentChapter = this.chapters[this.chapterIndex].texts;
  }

  setCurrentParagraph(): void {
    this.currentParagraphObject = this.currentChapter[this.paragraphIndex];
    this.currentParagraph = this.currentParagraphObject.sentences;
  }
}

export { Novel };