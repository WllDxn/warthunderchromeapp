function createBattleTypeSelector(currentBattleType) {
  const battleTypes = ["ab", "rb", "sb"];
  const inputs = battleTypes.map(type => `
    <input id="${type}" name="state-d" type="radio" ${type === currentBattleType ? 'checked' : ''}>
    <label for="${type}">${type.toUpperCase()}</label>
  `).join('');

  const container = document.createElement("div");
  container.classList.add("switch-field");
  container.innerHTML = String(inputs);
  return container;
}

const handleBattleTypeSelection = (event) => {
  const selectedBattleType = event.target.id;
  document.querySelectorAll(".brdisplayab, .brdisplayrb, .brdisplaysb").forEach(element => {
    element.style.display = element.classList.contains(`brdisplay${selectedBattleType}`) ? "block" : "none";
  });

  browser.storage.local.set({ battletype: selectedBattleType });
};
