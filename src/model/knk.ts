import { Howl } from "howler";
import { knk } from "./novel";
import { GameDOM, GameWindow } from "../view/game-gui";

// Edit line "A person doesn't kill herself without wouldn't kill themselves." in the novel + database

type ParagraphText = string[];
type Paragraph = {
  audioId?: string[];
  sentences: ParagraphText;
};

type ChapterContent = Paragraph[];
type Chapter = {
  texts: ChapterContent;
};

class Novel {
  chapters: Chapter[];
  currentChapter: ChapterContent;
  currentParagraph: ParagraphText;
  currentParagraphObject: Paragraph;

  sentenceIndex: number;
  chapterIndex: number;
  paragraphIndex: number;

  chapterChanged: boolean;

  constructor(novelIndex: number) {
    this.chapters = knk[novelIndex]["chapters"];
    this.currentChapter = null;
    this.currentParagraph = null;
    this.currentParagraphObject = null;

    this.sentenceIndex = 0;
    this.chapterIndex = null;
    this.paragraphIndex = null;

    if (typeof localStorage.getItem("paragraphIndex") !== "string") {
      this.paragraphIndex = 0;
      localStorage.setItem("paragraphIndex", String(this.paragraphIndex));
    } else {
      this.paragraphIndex = Number(localStorage.getItem("paragraphIndex"));
    }
    if (typeof localStorage.getItem("chapterIndex") !== "string") {
      this.chapterIndex = 0;
      localStorage.setItem("chapterIndex", String(this.chapterIndex));
    } else {
      this.chapterIndex = Number(localStorage.getItem("chapterIndex"));
    }

    // Initializes the current chapter and paragraph upon creating a Novel instance
    this.setCurrentChapter(this.chapterIndex);
    this.setCurrentParagraph(this.paragraphIndex);

    this.chapterChanged = false;
  }

  setParagraph(value: number): void {
    this.paragraphIndex = value;
    localStorage.setItem("paragraphIndex", String(value));
  }

  setChapter(value: number): void {
    this.chapterIndex = value;
    localStorage.setItem("chapterIndex", String(value));
  }

  setCurrentChapter(value: number): void {
    this.currentChapter = this.chapters[value].texts;
  }

  setCurrentParagraph(value: number): void {
    this.currentParagraph = this.currentChapter[value].sentences;
    this.currentParagraphObject = this.currentChapter[value];
  }

}

const MAX_SLOTS = 3;

type SavedSlot = {
  novel: number;
  chapter: number;
  paragraph: number;
};
class Series {
  static MAX_NOVELS: number;
  novelIndex: number;
  novels: Novel[];
  currentNovel: Novel;
  completedNovels: Novel[];
  savedSlots: SavedSlot[];

  currentSentence: string;

  constructor() {
    Series.MAX_NOVELS = 2;

    if (typeof localStorage.getItem("novelIndex") !== "string") {
      this.novelIndex = 0;
      localStorage.setItem("novelIndex", String(this.novelIndex));
    } else {
      this.novelIndex = Number(localStorage.getItem("novelIndex"));
    }

    this.savedSlots = Array(MAX_SLOTS).fill(null);
    for (let i = 0; i < MAX_SLOTS; i++) {
      const localSlot = localStorage.getItem(`slot${i}`);
      if (typeof localSlot === "string") {
        this.savedSlots[i] = JSON.parse(localSlot);
      }
    }

    this.novels = [];

    for (let i = 0; i < Series.MAX_NOVELS; i++) {
      this.novels.push(new Novel(i));
    }

    this.currentNovel = this.novels[this.novelIndex];
    this.completedNovels = [];

    this.currentSentence = this.currentNovel.currentParagraph[
      this.currentNovel.sentenceIndex
    ];
  }

  setNovel(value: number): void {
    this.novelIndex = value;
    localStorage.setItem("novelIndex", String(this.novelIndex));
  }

  setCurrentNovel(): void {
    this.currentNovel = this.novels[this.novelIndex];
  }

  setCurrentSentence(): void {
    this.currentSentence = this.currentNovel.currentParagraph[
      this.currentNovel.sentenceIndex
    ];
  }


  nextSentence(): void {
    // Display text by calling the GameDOM observer's controller
    this.currentNovel.sentenceIndex++;

    // PLEASE REWRITE THESE UGLY IF STATEMENTS AS METHODS. THANK YOU
    // Starts a new paragraph element if we've gone out of sentenceIndex, aka making a new p tag
    if (
      this.currentNovel.sentenceIndex >=
      this.currentNovel.currentParagraph.length
    ) {
      this.currentNovel.sentenceIndex = 0;
      this.currentNovel.setParagraph(this.currentNovel.paragraphIndex + 1);
      GameDOM.incrTextContainerIndex();

      // Checks if starting a new paragraph would be out of paragraphIndex for the current chapter
      if (
        this.currentNovel.paragraphIndex >=
        this.currentNovel.currentChapter.length
      ) {
        this.currentNovel.sentenceIndex = 0;
        this.currentNovel.setParagraph(0);
        this.currentNovel.setChapter(this.currentNovel.chapterIndex + 1);

       if (
          this.currentNovel.chapterIndex >= this.currentNovel.chapters.length
        ) {

          this.setNovel(this.novelIndex + 1);

          if (this.novelIndex < this.novels.length) {
            this.setCurrentNovel();

            this.currentNovel.sentenceIndex = 0;
            this.currentNovel.setParagraph(0);
            this.currentNovel.setChapter(0);
          }
        }
        this.toggleChapterChange();
      }
    }

    // Setting the current chapter and current paragraph after incrementing (fixing order later)
    if (!this.isGameOver()) {
      this.currentNovel.setCurrentChapter(this.currentNovel.chapterIndex);
      this.currentNovel.setCurrentParagraph(this.currentNovel.paragraphIndex);

      this.setCurrentSentence();
    }

  }

  checkEmptyParagraph(): void {
    while (this.currentNovel.currentParagraph.length === 0) {
      GameDOM.clearText();

      this.currentNovel.sentenceIndex = 0;

      let newParagraphIndex: number =
        this.currentNovel.paragraphIndex + 1;
      let newChapterIndex: number = this.currentNovel.chapterIndex;
      let newNovelIndex: number = this.novelIndex;

      if (
        newParagraphIndex >= this.currentNovel.currentChapter.length
      ) {
        newParagraphIndex = 0;
        newChapterIndex = this.currentNovel.chapterIndex + 1;

        if (newChapterIndex >= this.currentNovel.chapters.length) {
          newChapterIndex = 0;
          newNovelIndex = this.novelIndex + 1;
        }
      }
      GameDOM.resetTextContainerIndex();

      this.setNovel(newNovelIndex);
      this.setCurrentNovel();

      this.currentNovel.setChapter(newChapterIndex);
      this.currentNovel.setCurrentChapter(
        this.currentNovel.chapterIndex
      );

      this.currentNovel.setParagraph(newParagraphIndex);
      this.currentNovel.setCurrentParagraph(
        this.currentNovel.paragraphIndex
      );

      this.setCurrentSentence();
    }


  }

  isGameOver(): boolean {
    return this.novelIndex >= this.novels.length;
  }

  toggleChapterChange(): void {
    this.currentNovel.chapterChanged = this.currentNovel.chapterChanged == false;
  }

  addCompletedNovel(value: number): void {
    this.completedNovels.push(new Novel(value));
  }

  addSave(slotIndex: number): {
    novel: number;
    chapter: number;
    paragraph: number;
  } {
    const savedSlot = {
      novel: this.novelIndex,
      chapter: this.currentNovel.chapterIndex,
      paragraph: this.currentNovel.paragraphIndex,
    };
    this.savedSlots[slotIndex] = savedSlot;
    localStorage.setItem(`slot${slotIndex}`, JSON.stringify(savedSlot));

    return savedSlot;
  }

  removeSave(slotIndex: number): void {
    delete this.savedSlots[slotIndex];
  }

  jumpSave(savedSlot: SavedSlot): void {
    this.setNovel(savedSlot.novel);
    this.setCurrentNovel();

    this.currentNovel.setChapter(savedSlot.chapter);

    this.currentNovel.setParagraph(savedSlot.paragraph);
    this.currentNovel.sentenceIndex = 0;
  }
}

class Track {
  audioId: string;
  audio: Howl;

  constructor(novelIndex: number, audioId: string, noLoopList: string[]) {
    const flac = `../assets/music/${novelIndex + 1}/M${audioId}.flac`;
    const mp3 = `../assets/music/${novelIndex + 1}/M${audioId}.mp3`;

    this.audioId = audioId;
    this.audio = new Howl({
      src: [novelIndex === 0 ? mp3 : flac],
      loop: noLoopList.includes(audioId) ? false : true,
      volume: 0.3,
    });
    this.audio.on("fade", () => {
      this.audio.pause();
    });
    // this.audio.on("play", () => {
    // console.log(this.audioId, this.audio);
    // });
  }
}

class TrackList {
  tracks: Track[];
  trackIds: string[];
  playing: boolean;

  constructor(
    novelIndex: number,
    audioId: string[] = [],
    noLoopList: string[]
  ) {
    this.tracks = [];
    this.trackIds = [];

    audioId.forEach((id) => {
      this.tracks.push(new Track(novelIndex, id, noLoopList));
      this.trackIds.push(id);
    });
    this.playing = false;
  }

  addToTrackList(track: Track) {
    this.tracks.push(track);
    this.trackIds.push(track.audioId);
    track.audio.play();
  }

  removeTrackWithId(audioId: string) {
    this.tracks.forEach((track) => {
      if (track.audioId === audioId) {
        track.audio.fade(0.3, 0, 2000);
      }
    });
    this.trackIds = this.trackIds.filter((id) => id != audioId);
    this.tracks = this.tracks.filter((track) => track.audioId !== audioId);
  }

  clearTrackList() {
    this.tracks = [];
  }

  playTrackList() {
    this.tracks.forEach((track) => {
      if (!track.audio.playing()) {
        track.audio.play();
      }
    });
    this.playing = true;
  }

  pauseTrackList() {
    this.tracks.forEach((track) => track.audio.fade(0.3, 0, 2000));
    this.playing = false;
  }
}

// The Soundtrack class takes in a novelIndex to tell the Track function which folder to pull the tracks from. Besides that, it also contains a noLoop property, which is a hashmap to be fed to the Track class, so that the Track constructor knows which track not to loop
interface NoLoop {
  [key: number]: string[];
}

class Soundtrack {
  noLoop: NoLoop;
  currentTrackList: TrackList;
  novelIndex: number;

  constructor(novelIndex: number) {
    this.noLoop = {
      0: ["01"],
      1: ["07", "16", "18"],
    };
    this.novelIndex = novelIndex;
    this.currentTrackList = new TrackList(
      this.novelIndex,
      [],
      this.noLoop[this.novelIndex]
    );
  }

  playAudio(paragraphObject: Paragraph) {
    if (paragraphObject.hasOwnProperty("audioId")) {
      if (!this.currentTrackList.playing) {
        this.currentTrackList = new TrackList(
          this.novelIndex,
          paragraphObject.audioId,
          this.noLoop[this.novelIndex]
        );
        this.currentTrackList.playTrackList();
      } else {
        let unique = true;

        // Iterate over old track list first to remove tracks that aren't part of the new track list
        this.currentTrackList.trackIds.forEach((id) => {
          if (!paragraphObject.audioId.includes(id)) {
            this.currentTrackList.removeTrackWithId(id);
          } else {
            unique = false;
          }
        });

        // Iterate over new track list first to add tracks that aren't part of the old track list
        paragraphObject.audioId.forEach((id) => {
          if (!this.currentTrackList.trackIds.includes(id)) {
            this.currentTrackList.addToTrackList(
              new Track(this.novelIndex, id, this.noLoop[this.novelIndex])
            );
          } else {
            unique = false;
          }
        });

        if (unique) {
          this.currentTrackList.pauseTrackList();

          this.currentTrackList = new TrackList(
            this.novelIndex,
            paragraphObject.audioId,
            this.noLoop[this.novelIndex]
          );

          this.currentTrackList.playTrackList();
        }
      }
    } else if (
      this.currentTrackList.trackIds.length !== 0 &&
      this.currentTrackList.playing
    ) {
      this.currentTrackList.pauseTrackList();
      this.currentTrackList.clearTrackList();
    }
  }

  pauseAudio(): void {
    this.currentTrackList.pauseTrackList();
  }
}

// export { Novel, Soundtrack };
export { Series, Soundtrack, knk };
