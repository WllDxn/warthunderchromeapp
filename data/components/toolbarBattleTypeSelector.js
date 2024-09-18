(function(){
  const VALID_BATTLE_TYPES = ["ab", "rb", "sb"];
  browser.runtime.onMessage.addListener((message) => {
    if (
      message.command === "changeBattleType" &&
      VALID_BATTLE_TYPES.includes(message.battleType)
    ) {
      const { battleType } = message;
      const elements = document.querySelectorAll(
        VALID_BATTLE_TYPES.map(type => `.${"brdisplay"}${type}`).join(", ")
      );
      
      elements.forEach((element) => {
        element.classList.toggle('hidden', !element.classList.contains(
          `${"brdisplay"}${battleType}`
        ));
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