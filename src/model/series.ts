import { Novel } from "./novel";
import { GameDOM } from "../view/game-gui";

/*
- 10/12/24 - Last sentence is on 1-6-4
*/

const MAX_SLOTS = 3;

const series = Object.freeze(
  (() => {
    const MAX_NOVELS: number = 2;
    const novels: Novel[] = [];
    const completedNovels: Novel[] = [];

    let novelIndex: number = 0;

    let currentNovel: Novel = null;
    let chapterChanged: boolean = false;

    let currentSentence: string = "";

    // const savedSlots: SavedSlot[] = Array(MAX_SLOTS).fill(null);
    const savedSlots: SavedSlots = {
      slots: Array(MAX_SLOTS).fill(null),
      latestSavedIndex: null,
    };

    // Load saved slots from localStorage to current sessions
    let _maxTime = 0;
    for (let i = 0; i < MAX_SLOTS; i++) {
      const localSlot = localStorage.getItem(`slot${i}`);
      if (typeof localSlot === "string") {
        savedSlots.slots[i] = JSON.parse(localSlot);
        if (savedSlots.slots[i].time > _maxTime) {
          _maxTime = savedSlots.slots[i].time;
          savedSlots.latestSavedIndex = i;
        }
      }
    }

    for (let i = 0; i < MAX_NOVELS; i++) {
      novels.push(new Novel(i));
    }
    currentNovel = novels[novelIndex];
    currentSentence = currentNovel.currentParagraph[currentNovel.sentenceIndex];

    const getCurrentParagraphObject = (): Paragraph => {
      return currentNovel.currentParagraphObject;
    };

    const getCurrentParagraph = (): ParagraphText => {
      return currentNovel.currentParagraph;
    };

    const getCurrentSentence = (): string => {
      return currentSentence;
    };

    const getNovelIndex = (): number => {
      return novelIndex;
    };

    const getChapterIndex = (): number => {
      return currentNovel.chapterIndex;
    };

    const getParagraphIndex = (): number => {
      return currentNovel.paragraphIndex;
    };

    const getSentenceIndex = (): number => {
      return currentNovel.sentenceIndex;
    };

    const getChapterChanged = (): boolean => {
      return chapterChanged;
    };

    const getSavedSlots = (): SavedSlot[] => {
      return [...savedSlots.slots];
    };

    const getLatestSavedIndex = (): number => {
      return savedSlots.latestSavedIndex;
    };

    const setNovel = (value: number): void => {
      novelIndex = value;
      localStorage.setItem("novelIndex", String(novelIndex));
    };

    const setChapter = (value: number): void => {
      currentNovel.setChapter(value);
    };

    const setParagraph = (value: number): void => {
      currentNovel.setParagraph(value);
    };

    const setSentence = (value: number): void => {
      currentNovel.sentenceIndex = value;
    };

    const setCurrentNovel = (): void => {
      currentNovel = novels[novelIndex];
    };

    const setCurrentChapter = (): void => {
      currentNovel.setCurrentChapter();
    };

    const setCurrentParagraph = (): void => {
      currentNovel.setCurrentParagraph();
    };

    const setCurrentSentence = (): void => {
      currentSentence =
        currentNovel.currentParagraph[currentNovel.sentenceIndex];
    };

    const isSeriesAtStartInLocalStorage = (): boolean => {
      const novelIndex = Number(localStorage.getItem("novelIndex"));
      const chapterIndex = Number(localStorage.getItem("chapterIndex"));
      const paragraphIndex = Number(localStorage.getItem("paragraphIndex"));

      return novelIndex === 0 && chapterIndex === 0 && paragraphIndex === 0;
    };

    const checkPositionValidity = (): void => {
      if (currentNovel.sentenceIndex >= currentNovel.currentParagraph.length) {
        currentNovel.sentenceIndex = 0;
        currentNovel.setParagraph(currentNovel.paragraphIndex + 1);

        GameDOM.incrTextContainerIndex();
        // GameDOM.textContainer.appendChild(document.createElement("p"));

        // Checks if starting a new paragraph would be out of paragraphIndex for the current chapter
        if (currentNovel.paragraphIndex >= currentNovel.currentChapter.length) {
          currentNovel.sentenceIndex = 0;
          currentNovel.setParagraph(0);
          currentNovel.setChapter(currentNovel.chapterIndex + 1);

          if (currentNovel.chapterIndex >= currentNovel.chapters.length) {
            setNovel(novelIndex + 1);

            if (novelIndex < novels.length) {
              setCurrentNovel();
              GameDOM.novelChangedHandler();

              currentNovel.sentenceIndex = 0;
              currentNovel.setParagraph(0);
              currentNovel.setChapter(0);
            }
          }
          toggleChapterChange();
        }
      }

      // Setting the current chapter and current paragraph after incrementing (fixing order later)
      if (!isGameOver()) {
        setCurrentNovel();
        currentNovel.setCurrentChapter();
        currentNovel.setCurrentParagraph();

        setCurrentSentence();
      }
    };

    const incrementSentence = (): void => {
      currentNovel.sentenceIndex++;
    };
    const checkEmptyParagraph = (): void => {
      while (currentNovel.currentParagraph.length === 0) {
        GameDOM.clearText();

        currentNovel.sentenceIndex = 0;

        let newParagraphIndex: number = currentNovel.paragraphIndex + 1;
        let newChapterIndex: number = currentNovel.chapterIndex;
        let newNovelIndex: number = novelIndex;

        if (newParagraphIndex >= currentNovel.currentChapter.length) {
          newParagraphIndex = 0;
          newChapterIndex = currentNovel.chapterIndex + 1;

          if (newChapterIndex >= currentNovel.chapters.length) {
            newChapterIndex = 0;
            newNovelIndex = novelIndex + 1;
          }
        }
        GameDOM.resetTextContainerIndex();

        setNovel(newNovelIndex);
        setCurrentNovel();

        currentNovel.setChapter(newChapterIndex);
        currentNovel.setCurrentChapter();

        currentNovel.setParagraph(newParagraphIndex);
        currentNovel.setCurrentParagraph();

        setCurrentSentence();
      }
    };

    // Checks whether it's game over or not. Has to consider both the current variable and the localStorage one as the former might not be initiated yet
    const isGameOver = (): boolean => {
      return novelIndex >= novels.length || Number(localStorage.getItem("novelIndex")) >= novels.length;
    };

    const toggleChapterChange = (): void => {
      chapterChanged = chapterChanged == false;
    };

    const addCompletedNovel = (value: number): void => {
      completedNovels.push(new Novel(value));
    };

    const addSave = (slotIndex: number): void => {
      const savedSlot: SavedSlot = {
        novel: novelIndex,
        chapter: currentNovel.chapterIndex,
        paragraph: currentNovel.paragraphIndex,
        time: Math.round(+new Date() / 1000),
      };
      savedSlots.slots[slotIndex] = savedSlot;
      savedSlots.latestSavedIndex = slotIndex;
      localStorage.setItem(`slot${slotIndex}`, JSON.stringify(savedSlot));
    };

    const removeSave = (slotIndex: number): void => {
      delete savedSlots.slots[slotIndex];
    };

    const jumpSave = (savedSlot: SavedSlot): void => {
      _setGameState(savedSlot.novel, savedSlot.chapter, savedSlot.paragraph);
    };

    const _setGameState = (
      novelIndex: number,
      chapterIndex: number,
      paragraphIndex: number
    ) => {
      setNovel(novelIndex);
      setCurrentNovel();

      currentNovel.setChapter(chapterIndex);
      currentNovel.setParagraph(paragraphIndex);
      currentNovel.sentenceIndex = 0;

      currentNovel.setCurrentChapter();
      currentNovel.setCurrentParagraph();
      setCurrentSentence();
    };

    const startGame = (): void => {
      _setGameState(0, 0, 0);
    };

    const continueGame = (): void => {
      if (!series.isGameOver()) {
        _setGameState(
          Number(localStorage.getItem("novelIndex")),
          Number(localStorage.getItem("chapterIndex")),
          Number(localStorage.getItem("paragraphIndex"))
        );
      } else if (savedSlots.latestSavedIndex != null) {
        _setGameState(
          savedSlots.slots[savedSlots.latestSavedIndex].novel,
          savedSlots.slots[savedSlots.latestSavedIndex].chapter,
          savedSlots.slots[savedSlots.latestSavedIndex].paragraph
        );
      } else {
        series.startGame();
      }
    };

    return {
      getCurrentParagraphObject,
      getCurrentParagraph,
      getCurrentSentence,
      getNovelIndex,
      getChapterIndex,
      getParagraphIndex,
      getSentenceIndex,
      getChapterChanged,
      getSavedSlots,
      getLatestSavedIndex,

      setNovel,
      setChapter,
      setParagraph,
      setSentence,
      setCurrentNovel,
      setCurrentChapter,
      setCurrentParagraph,
      setCurrentSentence,

      startGame,
      continueGame,
      checkEmptyParagraph,
      checkPositionValidity,
      incrementSentence,
      isGameOver,
      toggleChapterChange,
      addCompletedNovel,
      addSave,
      removeSave,
      jumpSave,
      isSeriesAtStartInLocalStorage,
    };
  })()
);

export { series };
