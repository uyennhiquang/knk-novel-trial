// Consider making a DOM init that initiates what to display
// BUGS
// Clicking jump while the typewriter function is running causes an error with the concat call
// Bugs with paragraphObject
// Continuing the game will start from the next sentence due to the order of playGame()
// Jumping and then refreshing does not update the localStorage to the progress after jumping audio-wise. Probably because how the soundtrack is set to 0 and not updated even when continuing.

import { series, Soundtrack } from "../model/knk";

let soundtrack = new Soundtrack(series.getNovelIndex());

console.log(
  "Init (on first load)\n",
  "Novel:",
  series.getNovelIndex(),
  "\n",
  "Chapter:",
  series.getChapterIndex(),
  "\n",
  "Paragraph Position:",
  series.getParagraphIndex(),
  "\n",
  "Sentence Position:",
  series.getSentenceIndex(),
  "\n",
  "Current sentence:",
  series.getCurrentSentence()
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
    series.startGame();
    
    soundtrack.pauseAudio();
    soundtrack = new Soundtrack(series.getNovelIndex());
  };

  const continueGame = () => {
    playGame();
    series.continueGame();
    
    soundtrack.pauseAudio();
    soundtrack = new Soundtrack(series.getNovelIndex());
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
  };

  const chapterChangedHandler = () => {
    if (series.getChapterChanged()) {
      GameDOM.clearText();
      series.toggleChapterChange();
    }
  };

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

    series.setNovel(Number(inputNovel.value));
    series.setCurrentNovel();

    soundtrack.pauseAudio();
    soundtrack = new Soundtrack(series.getNovelIndex());

    series.setChapter(Number(inputChapter.value));
    series.setCurrentChapter();

    series.setParagraph(Number(inputParagraph.value));
    series.setCurrentParagraph();

    series.setSentence(0);
    series.setCurrentSentence();
  };

  buttonElt.addEventListener("click", jump);
})();

const GameWindow = (() => {
  const gameWindow = document.getElementById("window--text");

  /**
   * In a normal game workflow where the user is in the middle of playing, the action of moving to the next sentence happens "before" the overflow check (due to the event being a click). Thus, when the sentence being updated is the beginning of the new chapter, this is the only time the function should behave logically, otherwise you risk clearing a screen when the user is half-way through a paragraph, which is undesirable.
   */
  const checkForParagraphOverflow = () => {
    const windowVertPadding =
      2 * Number(window.getComputedStyle(gameWindow).paddingTop.slice(0, -2));
    const roomError = 0;
    const MAX_CONTAINER_HEIGHT =
      gameWindow.offsetHeight - windowVertPadding - roomError;

    if (GameDOM.textContainer.children.length > 0) {
      const p = document.createElement("p");
      const currentParagraphStr = series
        .getCurrentParagraph()
        .map((sentence) => sentence)
        .join(" ");
      p.innerHTML = currentParagraphStr;
      GameDOM.textContainer.appendChild(p);

      if (GameDOM.textContainer.offsetHeight >= MAX_CONTAINER_HEIGHT) {
        GameDOM.clearText();
      } else {
        GameDOM.textContainer.removeChild(GameDOM.textContainer.lastChild);
      }
    }
  };

  /**
   * An eventHandler when clicking the gameWindow. The game "mechanic" follows the workflow below:
   * 1. Check for empty paragraph
   * This has to be the first thing as the next 2 actions depend on the outcome of this function. In a non-edge case (user continuing the game), after the nextSentence() method is invoked in typeWriter, the current "sentence"/paragraph is set, which may or may be empty. If it is empty, it has to be dealt with before moving onto the other parts below.
   * 2. Clear text if we just moved onto the next chapter
   * Has to be placed before the typeWriter call, otherwise it'll clear the text once typeWriter is done executing.
   * 3. Check for paragraph overflow
   * 4. Display text
   * This HAS to be the very last thing that happens due to how disjointed the functions/methods for checking whether it is safe to display the sentence. Basically, every failsafe method has to be executed to ensure that there is a valid sentence and <p> tag.
   * 4b. Call model to update the next sentence
   */
  const playGame = () => {
    if (GameDOM.playing) {
      if (!series.isGameOver()) {
        if (!GameDOM.running) {
          series.checkEmptyParagraph();

          GameDOM.chapterChangedHandler();

          if (series.getSentenceIndex() == 0)
            GameWindow.checkForParagraphOverflow();

          GameDOM.textContainer.appendChild(document.createElement("p"));

          soundtrack.playAudio(series.getCurrentParagraphObject());
          GameDOM.typeWriter(series.getCurrentSentence());
        } else {
          GameDOM.speedUp();
        }
      } else {
        console.log;
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

// const SaveDOM = (() => {
//   const saveBtn = document.getElementById("button--save");
//   const loadBtn = document.getElementById("button--load");
//   const savedSlotsElt = document
//     .getElementById("save-slots")
//     .getElementsByTagName("td");
//   const saveSectionElt = document.getElementById("section--save");

//   const defaultMessage = "waiting for action...";
//   saveSectionElt.lastChild.textContent = defaultMessage;

//   let isSaving = false;
//   let isLoading = false;

//   saveBtn.addEventListener("click", () => {
//     saveSectionElt.lastChild.textContent = "Select a slot below";
//     isSaving = true;
//   });

//   loadBtn.addEventListener("click", () => {
//     saveSectionElt.lastChild.textContent = "Select a slot below";
//     isLoading = true;
//   });

//   document.addEventListener("keydown", (e) => {
//     if (e.key === "Escape") {
//       if (isSaving) {
//         isSaving = false;
//       } else if (isLoading) {
//         isLoading = false;
//       }
//       saveSectionElt.lastChild.textContent = defaultMessage;
//     }
//   });

//   for (let i = 0; i < savedSlotsElt.length; i++) {
//     savedSlotsElt[i].addEventListener("click", () => {
//       if (isSaving) {
//         series.addSave(i);
//         console.log(series.savedSlots);

//         const novelObj = knk[series.savedSlots[i].novel];
//         const title = novelObj.title;
//         const chapterIndex = series.savedSlots[i].chapter;
//         const paragraphIndex = series.savedSlots[i].paragraph;

//         savedSlotsElt[i].textContent = `${title} - Chapter ${chapterIndex}`;
//         isSaving = false;
//         saveSectionElt.lastChild.textContent = defaultMessage;
//       } else if (isLoading) {
//         console.log("loading clicked");
//         GameDOM.clearText();
//         GameDOM.textContainer.appendChild(document.createElement("p"));

//         series.jumpSave(series.savedSlots[i]);

//         soundtrack.pauseAudio();
//         soundtrack = new Soundtrack(series.getNovelIndex());

//         isLoading = false;
//         saveSectionElt.lastChild.textContent = defaultMessage;
//       }
//     });
//   }
// })();

// const InitDOM = (() => {
//   // Display saved slots
//   const savedSlotsElt = document
//     .getElementById("save-slots")
//     .getElementsByTagName("td");

//   for (let i = 0; i < series.savedSlots.length; i++) {
//     if (series.savedSlots[i] === null) {
//       savedSlotsElt[i].textContent = "empty";
//     } else {
//       const novelObj = knk[series.savedSlots[i].novel];
//       const title = novelObj.title;
//       const chapterIndex = series.savedSlots[i].chapter;
//       const paragraphIndex = series.savedSlots[i].paragraph;

//       savedSlotsElt[i].textContent = `${title} - Chapter ${chapterIndex}`;
//     }
//   }
// })();

export { GameDOM, GameWindow };
