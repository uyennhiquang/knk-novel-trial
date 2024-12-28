/* The Soundtrack class takes in a novelIndex to tell the Track function which folder to pull the tracks from. */

import { Track } from "./track";
import { knk_audio } from "./knk_audio";

class Soundtrack {
  currentTrackList: Track[];
  novelIndex: number;

  constructor(novelIndex: number) {
    this.novelIndex = novelIndex;
    this.currentTrackList = [];
  }
  playAudio(position: Position) {
    // Does the current position match with one in our list of tracks to stop from the audio db?
    const sentenceAudioInfo =
      knk_audio[position.novel].content[position.chapter][position.paragraph][
        position.sentence
      ];

    if ("end" in sentenceAudioInfo) {
      const sentenceAudioEnd = sentenceAudioInfo.end;
      sentenceAudioEnd.forEach((audioInfo) => {
        this.currentTrackList.filter((currentTrack) => {
          if (currentTrack.audioId == audioInfo.audio_id) {
            currentTrack.stop();
            return false;
          }
        });
      });
    }

    // Reading from the audio db, are we currently in a position where a new track is supposed to be played?
    if ("start" in sentenceAudioInfo) {
      const sentenceAudioEnd = sentenceAudioInfo.start;
      sentenceAudioEnd.forEach((audioInfo) => {
        const newTrack = new Track(
          position.novel,
          audioInfo.audio_id,
          audioInfo.vol,
          audioInfo.loop
        );
        newTrack.play();
        this.currentTrackList.push(newTrack);
      });
    }
  }

  pauseAudio(): void {
    this.currentTrackList.forEach((currentTrack) => {
      currentTrack.stop();
    });
  }

  playAllAudio(): void {
    this.currentTrackList.forEach((currentTrack) => {
      currentTrack.play();
    });
  }
}

export { Soundtrack };
