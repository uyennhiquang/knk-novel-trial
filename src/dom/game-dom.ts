// Consider making a DOM init that initiates what to display
import { Series, Soundtrack, knk } from "../game-logic/game-mechanic";

const series = new Series();
let soundtrack = new Soundtrack(series.novelIndex);

const GameDOM = (() => {
  const gameScreen = document.getElementById("screen--game");
  const textContainer = document.getElementById("container--text");

  let textSpeed = 18;
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
  const continueGame = playGame;

  const clearText = () => {
    textContainer.replaceChildren();
    GameDOM.textContainerIndex = 0;
  };

  const typeWriter = (text: string): void => {
    GameDOM.running = true;

    if (GameDOM.charAt < text.length) {
      textContainer.children[`${GameDOM.textContainerIndex}`].innerHTML +=
        text[GameDOM.charAt];
      GameDOM.charAt++;
      setTimeout(() => typeWriter(text), GameDOM.textSpeed);
    } else if (GameDOM.charAt === text.length) {
      textContainer.children[`${GameDOM.textContainerIndex}`].innerHTML += " ";

      GameDOM.running = false;
      GameDOM.charAt = 0;
      GameDOM.textSpeed = 18;
    }
    //
  };

  return {
    gameScreen,
    textContainer,
    textContainerIndex,
    running,
    playing,
    charAt,
    textSpeed,

    startGame,
    continueGame,
    clearText,
    typeWriter,
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

  gameWindow.addEventListener("click", () => {
    if (GameDOM.playing) {
      if (!GameDOM.running) {
        const windowVertPadding =
          2 *
          Number(window.getComputedStyle(gameWindow).paddingTop.slice(0, -2));
        const roomError = 10;
        const MAX_CONTAINER_HEIGHT =
          gameWindow.offsetHeight - windowVertPadding - roomError;

        series.currentNovel.setCurrentChapter(series.currentNovel.chapterIndex);
        series.currentNovel.setCurrentParagraph(
          series.currentNovel.paragraphIndex
        );

        // Starts a new paragraph element if we've gone out of sentenceIndex
        if (
          series.currentNovel.sentenceIndex >=
          series.currentNovel.currentParagraph.length
        ) {
          series.currentNovel.sentenceIndex = 0;
          series.currentNovel.setParagraph(
            series.currentNovel.paragraphIndex + 1
          );
          GameDOM.textContainerIndex++;

          // Checks if starting a new paragraph would be out of paragraphIndex for the current chapter
          if (
            series.currentNovel.paragraphIndex >=
            series.currentNovel.currentChapter.length
          ) {
            series.currentNovel.sentenceIndex = 0;
            series.currentNovel.setParagraph(0);
            series.currentNovel.setChapter(
              series.currentNovel.chapterIndex + 1
            );

            GameDOM.clearText();
          }
        }

        if (
          series.currentNovel.chapterIndex < series.currentNovel.chapters.length
        ) {
          series.currentNovel.setCurrentChapter(
            series.currentNovel.chapterIndex
          );
          series.currentNovel.setCurrentParagraph(
            series.currentNovel.paragraphIndex
          );

          // Checks if adding the current paragraph would cause the text to overflow by adding a "ghost" p element (that is to be deleted later), then calculating the total textContainer height.
          if (series.currentNovel.sentenceIndex === 0) {
            if (GameDOM.textContainer.children.length > 0) {
              const p = document.createElement("p");
              const currentParagraphStr = series.currentNovel.currentParagraph
                .map((sentence) => `${sentence}`)
                .join(" ");
              p.innerHTML = currentParagraphStr;
              GameDOM.textContainer.appendChild(p);

              if (GameDOM.textContainer.offsetHeight >= MAX_CONTAINER_HEIGHT) {
                GameDOM.clearText();
              } else {
                GameDOM.textContainer.removeChild(
                  GameDOM.textContainer.lastChild
                );
              }
            }

            GameDOM.textContainer.appendChild(document.createElement("p"));
          }

          // A byproduct of the auto-generated JSON -- the Python script that generates our data uses regex on each line. Thus, if it matches an empty line for example, we will get an empty array. This will cause issues when we try to index our empty currentParagraph. The code in this while loop ensures it'll never happen -- it first clears the screen (denoting a page flip) and hops to the next paragraph until the current paragraph isn't empty.
          while (series.currentNovel.currentParagraph.length === 0) {
            GameDOM.clearText();

            series.currentNovel.sentenceIndex = 0;
            series.currentNovel.setParagraph(
              series.currentNovel.paragraphIndex + 1
            );
            GameDOM.textContainerIndex = 0;

            series.currentNovel.setCurrentParagraph(
              series.currentNovel.paragraphIndex
            );
            GameDOM.textContainer.appendChild(document.createElement("p"));
          }

          // Load the audio and display the current sentence
          soundtrack.playAudio(series.currentNovel.currentParagraphObject);
          GameDOM.typeWriter(
            series.currentNovel.currentParagraph[
              series.currentNovel.sentenceIndex
            ]
          );

          series.currentNovel.sentenceIndex++;
        } else {
          GameDOM.clearText();
          GameDOM.textContainer.appendChild(document.createElement("p"));
          GameDOM.typeWriter(
            "You've reached the end of the demo. Thank you for playing."
          );
          GameDOM.playing = false;
        }
      } else {
        GameDOM.textSpeed = 5;
      }
    }
  });
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
      } else if (isLoading) {
        GameDOM.clearText();
        GameDOM.textContainer.appendChild(document.createElement("p"));

        series.jumpSave(series.savedSlots[i]);

        soundtrack.pauseAudio();
        soundtrack = new Soundtrack(series.novelIndex);
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

export { GameDOM };
