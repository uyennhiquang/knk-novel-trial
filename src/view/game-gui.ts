// Consider making a DOM init that initiates what to display
// BUGS
// On novel 1, chapter 3, paragraph 197, when trying to skip blank paragraphs at the end of a chapter, it leads to a out-of-index bug
// Game does not move on to the next novel once reaching the end (?)

import { Series, Soundtrack, knk } from "../model/knk";

const series = new Series();
let soundtrack = new Soundtrack(series.novelIndex);

console.log(
  "Init (on first load)\n",
  "Novel:",
  series.novelIndex,
  "\n",
  "Chapter:",
  series.currentNovel.chapterIndex,
  "\n",
  "Paragraph Position:",
  series.currentNovel.paragraphIndex,
  "\n",
  "Sentence Position:",
  series.currentNovel.sentenceIndex,
  "\n",
  "Current sentence:",
  series.currentNovel.currentParagraph[series.currentNovel.sentenceIndex]
);

const GameDOM = (() => {
  const gameScreen = document.getElementById("screen--game");
  const textContainer = document.getElementById("container--text");
  const DEFAULT_TEXT_SPEED = 18;
  const SPED_UP_TEXT_SPEED = 5;

  // Consider encapsulating these by making functions that update these states, but not exposing them
  let textSpeed = DEFAULT_TEXT_SPEED;
  let textContainerIndex = 0;
  let playing = false;
  let running = false;
  let charAt = 0;

  const playGame = () => {
    GameDOM.playing = true;
    GameDOM.gameScreen.classList.toggle("hidden");
  };

  const startGame = () => {
    playGame();
    series.currentNovel.setChapter(0);
    series.currentNovel.setParagraph(0);

    series.currentNovel.sentenceIndex = 0;
  };

  // const continueGame = playGame;
  const continueGame = () => {
    playGame();

    series.currentNovel.sentenceIndex = 0;
  };

  const clearText = () => {
    textContainer.replaceChildren();
    textContainerIndex = 0;
  };

  const incrTextContainerIndex = () => {
    textContainerIndex++;
  };

  const resetTextContainerIndex = () => {
    textContainerIndex = 0;
  };
  /**
   * The typeWriter() function works by using setTimeout() to call it in interval -- each time typeWriter() is called it adds 1 letter to the specific <p> (indicated by textContainerIndex) inside the textContainer div.
   * @param text sentence text
   */
  const typeWriter = (text: string): void => {
    GameDOM.running = true;

    if (charAt < text.length) {
      textContainer.children[`${textContainerIndex}`].innerHTML += text[charAt];
      charAt++;
      setTimeout(() => typeWriter(text), textSpeed);
    } else if (charAt === text.length) {
      textContainer.children[`${textContainerIndex}`].innerHTML += " ";

      GameDOM.running = false;
      charAt = 0;
      textSpeed = DEFAULT_TEXT_SPEED;
      series.nextSentence();
    }
  };

  const speedUp = () => {
    textSpeed = SPED_UP_TEXT_SPEED;
  }


  const chapterChangedHandler = () => {
    if (series.currentNovel.chapterChanged) {
      GameDOM.clearText();
      series.toggleChapterChange();
    }
  }

  return {
    gameScreen,
    textContainer,
    running,
    playing,

    startGame,
    continueGame,
    clearText,
    typeWriter,
    speedUp,
    chapterChangedHandler,
    incrTextContainerIndex,
    resetTextContainerIndex,
  };
})();

const ParagraphJump = (() => {
  const inputNovel = document.getElementById("novel") as HTMLInputElement;
  const inputChapter = document.getElementById("chapter") as HTMLInputElement;
  const inputParagraph = document.getElementById(
    "paragraph"
  ) as HTMLInputElement;
  const buttonElt = document.getElementById("button--paragraph");

  const jump = () => {
    GameDOM.clearText();
    GameDOM.textContainer.appendChild(document.createElement("p"));

    series.setNovel(Number(inputNovel.value));
    series.setCurrentNovel(series.novelIndex);

    soundtrack.pauseAudio();
    soundtrack = new Soundtrack(series.novelIndex);

    series.currentNovel.setChapter(Number(inputChapter.value));

    series.currentNovel.setParagraph(Number(inputParagraph.value));
    series.currentNovel.sentenceIndex = 0;
  };

  buttonElt.addEventListener("click", jump);
})();

const GameWindow = (() => {
  const gameWindow = document.getElementById("window--text");

  const checkForParagraphOverflow = () => {
    const windowVertPadding =
      2 * Number(window.getComputedStyle(gameWindow).paddingTop.slice(0, -2));
    const roomError = 10;
    const MAX_CONTAINER_HEIGHT =
      gameWindow.offsetHeight - windowVertPadding - roomError;

    if (GameDOM.textContainer.children.length > 0) {
      const p = document.createElement("p");
      const currentParagraphStr = series.currentNovel.currentParagraph
        .map((sentence) => `${sentence}`)
        .join(" ");
      p.innerHTML = currentParagraphStr;
      GameDOM.textContainer.appendChild(p);

      if (GameDOM.textContainer.offsetHeight >= MAX_CONTAINER_HEIGHT) {
        GameDOM.clearText();
        console.log("should only be run when new paragraph overflow blah blah");
      } else {
        GameDOM.textContainer.removeChild(GameDOM.textContainer.lastChild);
      }
    }
  };

  /**
   * An eventHandler when clicking the gameWindow. The game "mechanic" follows the workflow below:
   * 1. Create a new <p> tag
   * 2. Call the typeWriter -- the handler -- to display the text (which will call the nextSentence() method after it is done.
   * 3. Check for gameWindow overflow
   * REFER TO THE playGame() eventHandler INSIDE game-gui-old FOR THINGS TO DO
   */
  const playGame = () => {
    if (GameDOM.playing) {
      if (!series.isGameOver()) {
        if (!GameDOM.running) {
          series.checkEmptyParagraph();
          GameDOM.chapterChangedHandler();
          GameWindow.checkForParagraphOverflow();
          
          GameDOM.textContainer.appendChild(document.createElement("p"));

          GameDOM.typeWriter(series.currentSentence);
        } else {
          GameDOM.speedUp();
        }
      } else {
        GameDOM.clearText();
        GameDOM.textContainer.appendChild(document.createElement("p"));
        GameDOM.typeWriter(
          "You've reached the end of the demo. Thank you for playing."
        );
        GameDOM.playing = false;
      }
    }
  };

  gameWindow.addEventListener("click", playGame);
  document.addEventListener("keydown", (e) => {
    const SPACE = " ";
    const DOWN = "ArrowDown";
    const ENTER = "Enter";

    if (
      (GameDOM.playing && (e.key == SPACE || e.key == DOWN)) ||
      e.key == ENTER
    ) {
      playGame();
    }
  });

  return {
    checkForParagraphOverflow,
  };
})();

const SaveDOM = (() => {
  const saveBtn = document.getElementById("button--save");
  const loadBtn = document.getElementById("button--load");
  const savedSlotsElt = document
    .getElementById("save-slots")
    .getElementsByTagName("td");
  const saveSectionElt = document.getElementById("section--save");

  const defaultMessage = "waiting for action...";
  saveSectionElt.lastChild.textContent = defaultMessage;

  let isSaving = false;
  let isLoading = false;

  saveBtn.addEventListener("click", () => {
    saveSectionElt.lastChild.textContent = "Select a slot below";
    isSaving = true;
  });

  loadBtn.addEventListener("click", () => {
    saveSectionElt.lastChild.textContent = "Select a slot below";
    isLoading = true;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isSaving) {
        isSaving = false;
      } else if (isLoading) {
        isLoading = false;
      }
      saveSectionElt.lastChild.textContent = defaultMessage;
    }
  });

  for (let i = 0; i < savedSlotsElt.length; i++) {
    savedSlotsElt[i].addEventListener("click", () => {
      if (isSaving) {
        series.addSave(i);
        console.log(series.savedSlots);

        const novelObj = knk[series.savedSlots[i].novel];
        const title = novelObj.title;
        const chapterIndex = series.savedSlots[i].chapter;
        const paragraphIndex = series.savedSlots[i].paragraph;

        savedSlotsElt[i].textContent = `${title} - Chapter ${chapterIndex}`;
        isSaving = false;
        saveSectionElt.lastChild.textContent = defaultMessage;
      } else if (isLoading) {
        console.log("loading clicked");
        GameDOM.clearText();
        GameDOM.textContainer.appendChild(document.createElement("p"));

        series.jumpSave(series.savedSlots[i]);

        soundtrack.pauseAudio();
        soundtrack = new Soundtrack(series.novelIndex);

        isLoading = false;
        saveSectionElt.lastChild.textContent = defaultMessage;
      }
    });
  }
})();

const InitDOM = (() => {
  // Display saved slots
  const savedSlotsElt = document
    .getElementById("save-slots")
    .getElementsByTagName("td");

  for (let i = 0; i < series.savedSlots.length; i++) {
    if (series.savedSlots[i] === null) {
      savedSlotsElt[i].textContent = "empty";
    } else {
      const novelObj = knk[series.savedSlots[i].novel];
      const title = novelObj.title;
      const chapterIndex = series.savedSlots[i].chapter;
      const paragraphIndex = series.savedSlots[i].paragraph;

      savedSlotsElt[i].textContent = `${title} - Chapter ${chapterIndex}`;
    }
  }
})();

export { GameDOM, GameWindow };
