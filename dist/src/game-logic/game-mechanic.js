import { Howl } from "howler";
import { knk } from "./knk";
var Novel = /** @class */ (function () {
    function Novel(novelIndex) {
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
        }
        else {
            this.paragraphIndex = Number(localStorage.getItem("paragraphIndex"));
        }
        if (typeof localStorage.getItem("chapterIndex") !== "string") {
            this.chapterIndex = 0;
            localStorage.setItem("chapterIndex", String(this.chapterIndex));
        }
        else {
            this.chapterIndex = Number(localStorage.getItem("chapterIndex"));
        }
    }
    Novel.prototype.setParagraph = function (value) {
        this.paragraphIndex = value;
        localStorage.setItem("paragraphIndex", String(value));
    };
    Novel.prototype.setChapter = function (value) {
        this.chapterIndex = value;
        localStorage.setItem("chapterIndex", String(value));
    };
    Novel.prototype.setCurrentChapter = function (value) {
        this.currentChapter = this.chapters[value].texts;
    };
    Novel.prototype.setCurrentParagraph = function (value) {
        this.currentParagraph = this.currentChapter[value].sentences;
        this.currentParagraphObject = this.currentChapter[value];
    };
    return Novel;
}());
var Series = /** @class */ (function () {
    function Series() {
        if (typeof localStorage.getItem("novelIndex") !== "string") {
            this.novelIndex = 0;
            localStorage.setItem("novelIndex", String(this.novelIndex));
        }
        else {
            this.novelIndex = Number(localStorage.getItem("paragraphIndex"));
        }
        this.currentNovel = new Novel(this.novelIndex);
        this.completedNovels = [];
    }
    Series.prototype.setNovel = function (value) {
        this.novelIndex = value;
        localStorage.setItem("novelIndex", String(this.novelIndex));
    };
    Series.prototype.setCurrentNovel = function (value) {
        this.currentNovel = new Novel(value);
    };
    Series.prototype.addCompletedNovel = function (value) {
        this.completedNovels.push(new Novel(value));
    };
    return Series;
}());
var Track = /** @class */ (function () {
    function Track(novelIndex, audioId, noLoopList) {
        var _this = this;
        var flac = "../assets/music/".concat(novelIndex + 1, "/M").concat(audioId, ".flac");
        var mp3 = "../assets/music/".concat(novelIndex + 1, "/M").concat(audioId, ".mp3");
        this.audioId = audioId;
        this.audio = new Howl({
            src: [novelIndex === 0 ? mp3 : flac],
            loop: noLoopList.includes(audioId) ? false : true,
            volume: 0.3,
        });
        this.audio.on("fade", function () {
            _this.audio.pause();
        });
        this.audio.on("play", function () {
            console.log(_this.audioId, _this.audio);
        });
    }
    return Track;
}());
var TrackList = /** @class */ (function () {
    function TrackList(novelIndex, audioId, noLoopList) {
        if (audioId === void 0) { audioId = []; }
        var _this = this;
        this.tracks = [];
        this.trackIds = [];
        audioId.forEach(function (id) {
            _this.tracks.push(new Track(novelIndex, id, noLoopList));
            _this.trackIds.push(id);
        });
        this.playing = false;
    }
    TrackList.prototype.addToTrackList = function (track) {
        this.tracks.push(track);
        this.trackIds.push(track.audioId);
        track.audio.play();
    };
    TrackList.prototype.removeTrackWithId = function (audioId) {
        this.tracks.forEach(function (track) {
            if (track.audioId === audioId) {
                track.audio.fade(0.3, 0, 2000);
            }
        });
        this.trackIds = this.trackIds.filter(function (id) { return id != audioId; });
        this.tracks = this.tracks.filter(function (track) { return track.audioId !== audioId; });
    };
    TrackList.prototype.clearTrackList = function () {
        this.tracks = [];
    };
    TrackList.prototype.playTrackList = function () {
        this.tracks.forEach(function (track) {
            if (!track.audio.playing()) {
                track.audio.play();
            }
        });
        this.playing = true;
    };
    TrackList.prototype.pauseTrackList = function () {
        this.tracks.forEach(function (track) { return track.audio.fade(0.3, 0, 2000); });
        this.playing = false;
    };
    return TrackList;
}());
var Soundtrack = /** @class */ (function () {
    function Soundtrack(novelIndex) {
        this.noLoop = {
            0: ["01"],
            1: ["07", "16", "18"],
        };
        this.novelIndex = novelIndex;
        this.currentTrackList = new TrackList(this.novelIndex, [], this.noLoop[this.novelIndex]);
    }
    Soundtrack.prototype.playAudio = function (paragraphObject) {
        var _this = this;
        if (paragraphObject.hasOwnProperty("audioId")) {
            if (!this.currentTrackList.playing) {
                this.currentTrackList = new TrackList(this.novelIndex, paragraphObject.audioId, this.noLoop[this.novelIndex]);
                this.currentTrackList.playTrackList();
            }
            else {
                var unique_1 = true;
                // Iterate over old track list first to remove tracks that aren't part of the new track list
                this.currentTrackList.trackIds.forEach(function (id) {
                    if (!paragraphObject.audioId.includes(id)) {
                        _this.currentTrackList.removeTrackWithId(id);
                    }
                    else {
                        unique_1 = false;
                    }
                });
                // Iterate over new track list first to add tracks that aren't part of the old track list
                paragraphObject.audioId.forEach(function (id) {
                    if (!_this.currentTrackList.trackIds.includes(id)) {
                        _this.currentTrackList.addToTrackList(new Track(_this.novelIndex, id, _this.noLoop[_this.novelIndex]));
                    }
                    else {
                        unique_1 = false;
                    }
                });
                if (unique_1) {
                    this.currentTrackList.pauseTrackList();
                    this.currentTrackList = new TrackList(this.novelIndex, paragraphObject.audioId, this.noLoop[this.novelIndex]);
                    this.currentTrackList.playTrackList();
                }
            }
        }
        else if (this.currentTrackList.trackIds.length !== 0 &&
            this.currentTrackList.playing) {
            this.currentTrackList.pauseTrackList();
            this.currentTrackList.clearTrackList();
        }
    };
    return Soundtrack;
}());
// export { Novel, Soundtrack };
export { Series, Soundtrack };
