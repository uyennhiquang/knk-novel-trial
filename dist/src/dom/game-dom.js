// import { Novel, Soundtrack } from "../game-logic/game-mechanic";
import { Series, Soundtrack } from "../game-logic/game-mechanic";
var series = new Series();
var soundtrack = new Soundtrack(series.novelIndex);
var GameDOM = (function () {
    var gameScreen = document.getElementById("screen--game");
    var textContainer = document.getElementById("container--text");
    var textSpeed = 18;
    var textContainerIndex = 0;
    var playing = false;
    var running = false;
    var playGame = function () {
        GameDOM.playing = true;
        GameDOM.gameScreen.classList.toggle("hidden");
    };
    var startGame = function () {
        playGame();
        series.currentNovel.setChapter(0);
        series.currentNovel.setParagraph(0);
        series.currentNovel.sentenceIndex = 0;
    };
    var continueGame = playGame;
    var clearText = function () {
        textContainer.replaceChildren();
        GameDOM.textContainerIndex = 0;
    };
    var typeWriter = function (text) {
        var j = 0;
        var go = function (text) {
            GameDOM.running = true;
            if (j < text.length) {
                textContainer.children["".concat(GameDOM.textContainerIndex)].innerHTML +=
                    text[j];
                j++;
                setTimeout(function () { return go(text); }, textSpeed);
            }
            if (j === text.length) {
                textContainer.children["".concat(GameDOM.textContainerIndex)].innerHTML +=
                    " ";
                GameDOM.running = false;
            }
        };
        go(text);
    };
    return {
        gameScreen: gameScreen,
        textContainer: textContainer,
        textContainerIndex: textContainerIndex,
        running: running,
        playing: playing,
        startGame: startGame,
        continueGame: continueGame,
        clearText: clearText,
        typeWriter: typeWriter,
    };
})();
var ParagraphJump = (function () {
    var inputNovel = document.getElementById("novel");
    var inputChapter = document.getElementById("chapter");
    var inputParagraph = document.getElementById("paragraph");
    var buttonElt = document.getElementById("button--paragraph");
    var jump = function () {
        GameDOM.clearText();
        GameDOM.textContainer.appendChild(document.createElement("p"));
        series.setNovel(Number(inputNovel.value));
        series.setCurrentNovel(series.novelIndex);
        soundtrack = new Soundtrack(series.novelIndex);
        series.currentNovel.setChapter(Number(inputChapter.value));
        series.currentNovel.setParagraph(Number(inputParagraph.value));
        series.currentNovel.sentenceIndex = 0;
        console.log(series.novelIndex, series.currentNovel.chapterIndex, series.currentNovel.paragraphIndex);
    };
    buttonElt.addEventListener("click", jump);
})();
var GameWindow = (function () {
    var gameWindow = document.getElementById("window--text");
    gameWindow.addEventListener("click", function () {
        if (GameDOM.playing) {
            // The GameDOM.running condition is used to prevent the typeWriter function to be executed while it itself is being executed. This is a temporary solution -- the program should be able to finish the current sentence quickly when the user clicks a second time.
            if (!GameDOM.running) {
                var windowVertPadding = 2 *
                    Number(window.getComputedStyle(gameWindow).paddingTop.slice(0, -2));
                var roomError = 10;
                var MAX_CONTAINER_HEIGHT = gameWindow.offsetHeight - windowVertPadding - roomError;
                series.currentNovel.setCurrentChapter(series.currentNovel.chapterIndex);
                series.currentNovel.setCurrentParagraph(series.currentNovel.paragraphIndex);
                // Starts a new paragraph element if we've gone out of sentenceIndex
                if (series.currentNovel.sentenceIndex >= series.currentNovel.currentParagraph.length) {
                    series.currentNovel.sentenceIndex = 0;
                    series.currentNovel.setParagraph(series.currentNovel.paragraphIndex + 1);
                    GameDOM.textContainerIndex++;
                    // Checks if starting a new paragraph would be out of paragraphIndex for the current chapter
                    if (series.currentNovel.paragraphIndex >= series.currentNovel.currentChapter.length) {
                        series.currentNovel.sentenceIndex = 0;
                        series.currentNovel.setParagraph(0);
                        series.currentNovel.setChapter(series.currentNovel.chapterIndex + 1);
                        GameDOM.clearText();
                    }
                }
                if (series.currentNovel.chapterIndex < series.currentNovel.chapters.length) {
                    series.currentNovel.setCurrentChapter(series.currentNovel.chapterIndex);
                    series.currentNovel.setCurrentParagraph(series.currentNovel.paragraphIndex);
                    // Checks if adding the current paragraph would cause the text to overflow by adding a "ghost" p element (that is to be deleted later), then calculating the total textContainer height.
                    if (series.currentNovel.sentenceIndex === 0) {
                        if (GameDOM.textContainer.children.length > 0) {
                            var p = document.createElement("p");
                            var currentParagraphStr = series.currentNovel.currentParagraph
                                .map(function (sentence) { return "".concat(sentence); })
                                .join(" ");
                            p.innerHTML = currentParagraphStr;
                            GameDOM.textContainer.appendChild(p);
                            if (GameDOM.textContainer.offsetHeight >= MAX_CONTAINER_HEIGHT) {
                                GameDOM.clearText();
                            }
                            else {
                                GameDOM.textContainer.removeChild(GameDOM.textContainer.lastChild);
                            }
                        }
                        GameDOM.textContainer.appendChild(document.createElement("p"));
                    }
                    // A byproduct of the auto-generated JSON -- the Python script that generates our data uses regex on each line. Thus, if it matches an empty line for example, we will get an empty array. This will cause issues when we try to index our empty currentParagraph. The code in this while loop ensures it'll never happen -- it first clears the screen (denoting a page flip) and hops to the next paragraph until the current paragraph isn't empty.
                    while (series.currentNovel.currentParagraph.length === 0) {
                        GameDOM.clearText();
                        series.currentNovel.sentenceIndex = 0;
                        series.currentNovel.setParagraph(series.currentNovel.paragraphIndex + 1);
                        GameDOM.textContainerIndex = 0;
                        series.currentNovel.setCurrentParagraph(series.currentNovel.paragraphIndex);
                        GameDOM.textContainer.appendChild(document.createElement("p"));
                    }
                    soundtrack.playAudio(series.currentNovel.currentParagraphObject);
                    GameDOM.typeWriter(series.currentNovel.currentParagraph[series.currentNovel.sentenceIndex]);
                    series.currentNovel.sentenceIndex++;
                }
                else {
                    GameDOM.clearText();
                    GameDOM.textContainer.appendChild(document.createElement("p"));
                    GameDOM.typeWriter("You've reached the end of the demo. Thank you for playing.");
                    GameDOM.playing = false;
                }
            }
        }
    });
})();
export { GameDOM, GameWindow, ParagraphJump };
