A web-based sound novel for the Kara no Kyoukai series of novel. The web app follows the traditional visual novel workflow (click to display text, save slots); the text being used is my own edit of the translation of the novel series, but if you have a better translation that you would like to propose, feel free to make an issue.

## Playtest
If you would like to playtest this on your local machine, download the `beta` branch as a `.zip`. As of now, due to an inevitable issue with CORS, the easiest way to play the game is to view the webpage in a Chrome-based browser.
### Windows
1. Create an empty `.bat` file anywhere (this will be your executable).
2. Inside the script, add the following line:  `"<path_to_chrome_browser.exe" --user-data-dir="C://Chrome dev session" --disable-web-security "<path_to_index.html>"`.
2b. Optionally, you can change the icon of the executable.
