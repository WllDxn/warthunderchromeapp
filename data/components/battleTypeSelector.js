function createBattleTypeSelector(currentBattleType) {
  const battleTypes = ["ab", "rb", "sb"];
  const container = document.createElement("div");
  container.classList.add("switch-field");
  const inputs = battleTypes.flatMap(type => {
    const inputElement = document.createElement("input");
    inputElement.id = type;
    inputElement.name = "state-d";
    inputElement.type = "radio";
    if (type === currentBattleType) {
      inputElement.checked = true;
    }
    container.appendChild(inputElement)
    const labelElement = document.createElement("label");
    labelElement.setAttribute("for", type);
    labelElement.textContent = type.toUpperCase();
    container.appendChild(labelElement)
  });
  return container;
}

const handleBattleTypeSelection = (event) => {
  const selectedBattleType = event.target.id;
  document.querySelectorAll(".brdisplayab, .brdisplayrb, .brdisplaysb").forEach(element => {
    element.style.display = element.classList.contains(`brdisplay${selectedBattleType}`) ? "block" : "none";
  });

  browser.storage.local.set({ battletype: selectedBattleType });
};
