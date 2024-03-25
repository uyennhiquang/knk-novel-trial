import { GameDOM } from "./dom/game-dom";
import "../assets/styles/reset.css";
import "../assets/styles/styles.css";
var MenuDOM = (function () {
    var homeScreen = document.getElementById("screen--home");
    var startButton = document.getElementById("button--start");
    var continueButton = document.getElementById("button--continue");
    var toggleHome = function () {
        homeScreen.classList.toggle("hidden");
    };
    startButton.addEventListener("click", function () {
        toggleHome();
        GameDOM.startGame();
    });
    continueButton.addEventListener("click", function () {
        toggleHome();
        GameDOM.continueGame();
    });
})();
