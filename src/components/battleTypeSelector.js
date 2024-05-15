const createBattleTypeSelector = (currentBattleType) => {
  const battleTypes = ["ab", "rb", "sb"];
  const selectorHtml = `
    <div class="switch-field">
    ${battleTypes
      .map(
        (type) => `
    <input id="${type}" name="state-d" type="radio" ${type === currentBattleType ? "checked" : ""}>
    <label for="${type}">${type.toUpperCase()}</label>
    `
      )
      .join("")}
    </div>
    `;
  return selectorHtml;
}
  
const handleBattleTypeSelection = (event) => {
  const selectedBattleType = event.target.id;
  const otherBattleTypes = ["ab", "rb", "sb"].filter(
    (type) => type !== selectedBattleType
  );
  otherBattleTypes.map((x) => {
    $(`.brdisplay${x}`).hide();
  });
  $(`.brdisplay${selectedBattleType}`).show();
  const battleTypeData = { battletype: selectedBattleType };
  browser.storage.local.set(battleTypeData);
}