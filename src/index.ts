import { GameDOM } from "./view/game-gui"

import "../assets/styles/reset.css";
import "../assets/styles/styles.css";

const root = document.documentElement;
if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  // dark mode
  root.className = 'dark';
}
else {
  root.className = 'light';
}

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
