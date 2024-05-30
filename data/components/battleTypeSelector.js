const injectBattleTypeSelector = (currentBattleType) => {
  const selectorLocation = document.querySelector("#firstHeading");
  selectorLocation.style.display = "flex";
  selectorLocation.appendChild(createBattleTypeSelector(currentBattleType));
}

const createBattleTypeSelector = (currentBattleType) => {
  const battleTypes = ["ab", "rb", "sb"];
  const container = document.createElement("div");
  container.classList.add("switch-field");
  container.id = "battleTypeSelector";
  battleTypes.map(type => {
    const inputElement = document.createElement("input");
    inputElement.id = type;
    inputElement.name = "battleType";
    inputElement.type = "radio";
    if (type === currentBattleType) {
      inputElement.checked = true;
    }
    inputElement.addEventListener("click", handleBattleTypeSelection)    
    const labelElement = document.createElement("label");
    labelElement.setAttribute("for", type);
    labelElement.textContent = type.toUpperCase();    
    container.appendChild(inputElement)
    container.appendChild(labelElement)
  });
  return container;
}

const handleBattleTypeSelection = async (event) => {
  const selectedBattleType = event.target.id;
  document.querySelectorAll(".brdisplayab, .brdisplayrb, .brdisplaysb").forEach(element => {
    element.style.display = element.classList.contains(`brdisplay${selectedBattleType}`) ? "block" : "none";
  });
  await browser.storage.local.set({ battletype: selectedBattleType });
};
