const injectBattleTypeSelector = async (
  currentBattleType,
  selectorLocation = document.querySelector("#firstHeading")
) => {
  const battleType = await currentBattleType;
  selectorLocation.style.display = "flex";
  selectorLocation.appendChild(createBattleTypeSelector(battleType));
};

const createInputElement = (type, currentBattleType) => {
  const inputElement = document.createElement("input");
  inputElement.id = type;
  inputElement.name = "battleType";
  inputElement.type = "radio";
  if (type === currentBattleType) {
    inputElement.checked = true;
  }
  inputElement.addEventListener("click", handleBattleTypeSelection);
  return inputElement;
};

const createLabelElement = (type) => {
  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", type);
  labelElement.textContent = type.toUpperCase();
  return labelElement;
};

const createBattleTypeSelector = (currentBattleType) => {
  const battleTypes = ["ab", "rb", "sb"];
  const container = document.createElement("div");
  container.classList.add("switch-field");
  container.id = "battleTypeSelector";

  battleTypes.forEach((type) => {
    const inputElement = createInputElement(type, currentBattleType);
    const labelElement = createLabelElement(type);
    container.appendChild(inputElement);
    container.appendChild(labelElement);
  });

  return container;
};

const handleBattleTypeSelection = ({ target: { id: selectedBattleType } }) => {
  document
    .querySelectorAll(".brdisplayab, .brdisplayrb, .brdisplaysb")
    .forEach((element) => {
      element.classList.toggle(
        "hidden",
        !element.classList.contains(`brdisplay${selectedBattleType}`)
      );
    });
  browser.storage.local.set({ battletype: selectedBattleType });
};
