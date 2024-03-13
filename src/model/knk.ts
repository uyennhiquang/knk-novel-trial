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

  chapterIndex: number;
  paragraphIndex: number;
  sentenceIndex: number;

  constructor(novelIndex: number) {
    this.chapters = knk[novelIndex]["chapters"];
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

const MAX_SLOTS = 3;

type SavedSlot = {
  novel: number;
  chapter: number;
  paragraph: number;
};

const series = (() => {
  const MAX_NOVELS: number = 2;
  const novels: Novel[] = [];
  const completedNovels: Novel[] = [];

  let novelIndex: number = 0;

  let currentNovel: Novel = null;
  let chapterChanged: boolean = false;

  let currentSentence: string = "";

  const savedSlots: SavedSlot[] = Array(MAX_SLOTS).fill(null);
  for (let i = 0; i < MAX_SLOTS; i++) {
    const localSlot = localStorage.getItem(`slot${i}`);
    if (typeof localSlot === "string") {
      savedSlots[i] = JSON.parse(localSlot);
    }
  }

  for (let i = 0; i < MAX_NOVELS; i++) {
    novels.push(new Novel(i));
  }

  currentNovel = novels[novelIndex];
  currentSentence = currentNovel.currentParagraph[currentNovel.sentenceIndex];

  const getCurrentParagraphObject = (): Paragraph => {
    return currentNovel.currentParagraphObject;
  };

  const getCurrentParagraph = (): ParagraphText => {
    return currentNovel.currentParagraph;
  };

  const getCurrentSentence = (): string => {
    return currentSentence;
  };

  const getNovelIndex = (): number => {
    return novelIndex;
  };

  const getChapterIndex = (): number => {
    return currentNovel.chapterIndex;
  };

  const getParagraphIndex = (): number => {
    return currentNovel.paragraphIndex;
  };

  const getSentenceIndex = (): number => {
    return currentNovel.sentenceIndex;
  };

  const getChapterChanged = (): boolean => {
    return chapterChanged;
  };

  const setNovel = (value: number): void => {
    novelIndex = value;
    localStorage.setItem("novelIndex", String(novelIndex));
  };

  const setChapter = (value: number): void => {
    currentNovel.setChapter(value);
  };

  const setParagraph = (value: number): void => {
    currentNovel.setParagraph(value);
  };

  const setSentence = (value: number): void => {
    currentNovel.sentenceIndex = value;
  };

  const setCurrentNovel = (): void => {
    currentNovel = novels[novelIndex];
  };

  const setCurrentChapter = (): void => {
    currentNovel.setCurrentChapter();
  };

  const setCurrentParagraph = (): void => {
    currentNovel.setCurrentParagraph();
  };

  const setCurrentSentence = (): void => {
    currentSentence = currentNovel.currentParagraph[currentNovel.sentenceIndex];
  };

  const nextSentence = (): void => {
    currentNovel.sentenceIndex++;

    // PLEASE REWRITE THESE UGLY IF STATEMENTS AS METHODS. THANK YOU
    // Starts a new paragraph element if we've gone out of sentenceIndex, aka making a new p tag
    if (currentNovel.sentenceIndex >= currentNovel.currentParagraph.length) {
      currentNovel.sentenceIndex = 0;
      currentNovel.setParagraph(currentNovel.paragraphIndex + 1);
      GameDOM.incrTextContainerIndex();

      // Checks if starting a new paragraph would be out of paragraphIndex for the current chapter
      if (currentNovel.paragraphIndex >= currentNovel.currentChapter.length) {
        currentNovel.sentenceIndex = 0;
        currentNovel.setParagraph(0);
        currentNovel.setChapter(currentNovel.chapterIndex + 1);

        if (currentNovel.chapterIndex >= currentNovel.chapters.length) {
          setNovel(novelIndex + 1);

          if (novelIndex < novels.length) {
            setCurrentNovel();

            currentNovel.sentenceIndex = 0;
            currentNovel.setParagraph(0);
            currentNovel.setChapter(0);
          }
        }
        toggleChapterChange();
      }
    }

    // Setting the current chapter and current paragraph after incrementing (fixing order later)
    if (!isGameOver()) {
      currentNovel.setCurrentChapter();
      currentNovel.setCurrentParagraph();

      setCurrentSentence();
    }
  };
  const checkEmptyParagraph = (): void => {
    while (currentNovel.currentParagraph.length === 0) {
      GameDOM.clearText();

      currentNovel.sentenceIndex = 0;

      let newParagraphIndex: number = currentNovel.paragraphIndex + 1;
      let newChapterIndex: number = currentNovel.chapterIndex;
      let newNovelIndex: number = novelIndex;

      if (newParagraphIndex >= currentNovel.currentChapter.length) {
        newParagraphIndex = 0;
        newChapterIndex = currentNovel.chapterIndex + 1;

        if (newChapterIndex >= currentNovel.chapters.length) {
          newChapterIndex = 0;
          newNovelIndex = novelIndex + 1;
        }
      }
      GameDOM.resetTextContainerIndex();

      setNovel(newNovelIndex);
      setCurrentNovel();

      currentNovel.setChapter(newChapterIndex);
      currentNovel.setCurrentChapter();

      currentNovel.setParagraph(newParagraphIndex);
      currentNovel.setCurrentParagraph();

      setCurrentSentence();
    }
  };

  const isGameOver = (): boolean => {
    return novelIndex >= novels.length;
  };

  const toggleChapterChange = (): void => {
    chapterChanged = chapterChanged == false;
  };

  const addCompletedNovel = (value: number): void => {
    completedNovels.push(new Novel(value));
  };

  const addSave = (
    slotIndex: number
  ): {
    novel: number;
    chapter: number;
    paragraph: number;
  } => {
    const savedSlot = {
      novel: novelIndex,
      chapter: currentNovel.chapterIndex,
      paragraph: currentNovel.paragraphIndex,
    };
    savedSlots[slotIndex] = savedSlot;
    localStorage.setItem(`slot${slotIndex}`, JSON.stringify(savedSlot));

    return savedSlot;
  };

  const removeSave = (slotIndex: number): void => {
    delete savedSlots[slotIndex];
  };

  const jumpSave = (savedSlot: SavedSlot): void => {
    setNovel(savedSlot.novel);
    setCurrentNovel();

    currentNovel.setChapter(savedSlot.chapter);

    currentNovel.setParagraph(savedSlot.paragraph);
    currentNovel.sentenceIndex = 0;
  };

  const _setGameState = (
    novelIndex: number,
    chapterIndex: number,
    paragraphIndex: number
  ) => {
    setNovel(novelIndex);
    setCurrentNovel();

    currentNovel.setChapter(chapterIndex);
    currentNovel.setParagraph(paragraphIndex);
    currentNovel.sentenceIndex = 0;

    currentNovel.setCurrentChapter();
    currentNovel.setCurrentParagraph();
    setCurrentSentence();
  };

  const startGame = (): void => {
    _setGameState(0, 0, 0);
  };

  const continueGame = (): void => {
    const novelIndex = Number(localStorage.getItem("novelIndex"));
    const chapterIndex = Number(localStorage.getItem("chapterIndex"));
    const paragraphIndex = Number(localStorage.getItem("paragraphIndex"));

    _setGameState(novelIndex, chapterIndex, paragraphIndex);
  };

  return {
    getCurrentParagraphObject,
    getCurrentParagraph,
    getCurrentSentence,
    getNovelIndex,
    getChapterIndex,
    getParagraphIndex,
    getSentenceIndex,
    getChapterChanged,

    setNovel,
    setChapter,
    setParagraph,
    setSentence,
    setCurrentNovel,
    setCurrentChapter,
    setCurrentParagraph,
    setCurrentSentence,

    startGame,
    continueGame,
    checkEmptyParagraph,
    nextSentence,
    isGameOver,
    toggleChapterChange,
    addCompletedNovel,
    addSave,
    removeSave,
    jumpSave,
  };
})();

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

        // TODO: Add a comment explaining why the 2 for-loops below are needed 
        this.currentTrackList.trackIds.forEach((id) => {
          if (!paragraphObject.audioId.includes(id)) {
            this.currentTrackList.removeTrackWithId(id);
          } else {
            unique = false;
          }
        });

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
export { series, Soundtrack };
