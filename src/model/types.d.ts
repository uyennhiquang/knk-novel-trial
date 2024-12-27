declare global {
  type Sentence = {
    en: string;
    jp: string;
  }
  type Paragraph = Sentence[]
  type Chapter = Paragraph[]
  type Position = {
    novel: number;
    chapter: number;
    paragraph: number;
    sentence: number;
  }

  type SavedSlot = {
    novel: number;
    chapter: number;
    paragraph: number;
    time: number;
  };
  type SavedSlots = {
    slots: SavedSlot[];
    latestSavedIndex: number;
  };

  interface NoLoop {
    [key: number]: string[];
  }
}
export {};
