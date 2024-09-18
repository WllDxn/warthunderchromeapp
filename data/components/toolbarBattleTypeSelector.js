/*
 * Applies functionality to battle type selector in popup UI.
 * Listens for messages to change the displayed battle type and updates the UI accordingly.
 *
 * This function sets up a message listener that responds to commands for changing the battle type.
 * When a valid command is received, it toggles the visibility of elements associated with the specified
 * battle type and updates the checked state of the corresponding radio buttons. It also stores the
 * selected battle type in the browser's local storage for persistence.
 *
 * 
 * @returns {void} This function does not return a value.
*/
(function () {
  const VALID_BATTLE_TYPES = ["ab", "rb", "sb"];
  browser.runtime.onMessage.addListener((message) => {
    if (
      message.command === "changeBattleType" &&
      VALID_BATTLE_TYPES.includes(message.battleType)
    ) {
      const { battleType } = message;
      const elements = document.querySelectorAll(
        VALID_BATTLE_TYPES.map((type) => `.${"brdisplay"}${type}`).join(", ")
      );

      elements.forEach((element) => {
        element.classList.toggle(
          "hidden",
          !element.classList.contains(`${"brdisplay"}${battleType}`)
        );
      });

      VALID_BATTLE_TYPES.forEach((type) => {
        const radioButton = document.getElementById(type);
        if (radioButton) {
          radioButton.checked = type === battleType;
        }
      });
      browser.storage.local.set({ battletype: battleType });
    }
  });
})();

function n() {
  const VALID_BATTLE_TYPES = ["ab", "rb", "sb"];
  browser.runtime.onMessage.addListener((message) => {
    if (
      message.command === "changeBattleType" &&
      VALID_BATTLE_TYPES.includes(message.battleType)
    ) {
      const { battleType } = message;
      const elements = document.querySelectorAll(
        VALID_BATTLE_TYPES.map((type) => `.${"brdisplay"}${type}`).join(", ")
      );

      elements.forEach((element) => {
        element.classList.toggle(
          "hidden",
          !element.classList.contains(`${"brdisplay"}${battleType}`)
        );
      });

      VALID_BATTLE_TYPES.forEach((type) => {
        const radioButton = document.getElementById(type);
        if (radioButton) {
          radioButton.checked = type === battleType;
        }
      });
      browser.storage.local.set({ battletype: battleType });
    }
  });
}
