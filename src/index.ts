import { GameDOM } from "./dom/game-dom"

import "../assets/styles/reset.css";
import "../assets/styles/styles.css";

const MenuDOM = (() => {
  const homeScreen = document.getElementById("screen--home");
  const startButton = document.getElementById("button--start");
  const continueButton = document.getElementById("button--continue");

  const toggleHome = () => {
    homeScreen.classList.toggle("hidden");
  };

  startButton.addEventListener("click", () => {
    toggleHome();
    GameDOM.startGame();
  });

  continueButton.addEventListener("click", () => {
    toggleHome();
    GameDOM.continueGame();
  });
})();
