import { Howl } from "howler";
import { knk } from "./knk";

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

  constructor(novelIndex: number) {
    this.chapters = knk[novelIndex]["chapters"];
    this.currentChapter = null;
    this.currentParagraph = null;
    this.currentParagraphObject = null;

    this.sentenceIndex = 0;
    this.chapterIndex = null;
    this.paragraphIndex = null;

    // fetch("http://localhost:3001/knk")
    // .then((response) => response.json())
    // .then((json) => {
    // this.chapters = json[novelIndex]["chapters"];
    // });

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
  novelIndex: number;
  currentNovel: Novel;
  completedNovels: Novel[];
  savedSlots: SavedSlot[];

  constructor() {
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

    this.currentNovel = new Novel(this.novelIndex);
    this.completedNovels = [];
  }

  setNovel(value: number): void {
    this.novelIndex = value;
    localStorage.setItem("novelIndex", String(this.novelIndex));
  }

  setCurrentNovel(value: number): void {
    this.currentNovel = new Novel(value);
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
    this.setCurrentNovel(this.novelIndex);

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
