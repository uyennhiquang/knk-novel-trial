import { Track } from "./track";

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

export { TrackList };