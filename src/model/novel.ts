// import { seriesData } from "./seriesData";
import { knk_text } from "./knk_text";

class Novel {
  chapters: Chapter[];
  currentChapter: Chapter;
  currentParagraph: Paragraph;
  currentSentence: Sentence;

  chapterIndex: number;
  paragraphIndex: number;
  sentenceIndex: number;

  constructor(novelIndex: number) {
    this.chapters = knk_text[novelIndex]["content"];
    this.currentChapter = null;
    this.currentParagraph = null;
    this.currentSentence = null;

    // Have to set to the program's variable temporarily (without affecting the localStorage) so it doesn't crash
    this.chapterIndex = 0;
    this.paragraphIndex = 0;
    this.sentenceIndex = 0;

    this.setCurrentChapter();
    this.setCurrentParagraph();
    this.setCurrentSentence();
  }

  setChapterIndex(value: number): void {
    this.chapterIndex = value;
    localStorage.setItem("chapterIndex", String(value));
  }

  setParagraphIndex(value: number): void {
    this.paragraphIndex = value;
    localStorage.setItem("paragraphIndex", String(value));
  }

  setSentenceIndex(value: number): void {
    this.sentenceIndex = value;
    localStorage.setItem("sentenceIndex", String(value));
  }

  setCurrentChapter(): void {
    this.currentChapter = this.chapters[this.chapterIndex];
  }

  setCurrentParagraph(): void {
    this.currentParagraph = this.currentChapter[this.paragraphIndex];
  }

  setCurrentSentence(): void {
    this.currentSentence = this.currentParagraph[this.sentenceIndex];
  }
}

export { Novel };
