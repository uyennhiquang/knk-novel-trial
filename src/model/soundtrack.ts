/* The Soundtrack class takes in a novelIndex to tell the Track function which folder to pull the tracks from. Besides that, it also contains a noLoop property, which is a hashmap to be fed to the Track class, so that the Track constructor knows which track not to loop */

import { Track } from "./track";
import { TrackList } from "./trackList";

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

export { Soundtrack };