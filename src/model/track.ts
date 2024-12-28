import { Howl } from "howler";

class Track {
  audioId: string;
  audio: Howl;

  constructor(novelIndex: number, audioId: string, vol: number, loop: boolean) {
    const flac = `../assets/music/${novelIndex + 1}/M${audioId}.flac`;
    const mp3 = `../assets/music/${novelIndex + 1}/M${audioId}.mp3`;

    this.audioId = audioId;
    this.audio = new Howl({
      src: [novelIndex === 0 ? mp3 : flac],
      loop: loop,
      volume: vol,
    });
    this.audio.on("fade", () => {
      this.audio.pause();
    });
    // this.audio.on("play", () => {
    // console.log(this.audioId, this.audio);
    // });
  }

  play(): void {
    this.audio.play();
  }

  stop(): void {
    this.audio.stop();
  }
}

export { Track };