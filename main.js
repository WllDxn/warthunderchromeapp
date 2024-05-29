function injectBattleTypeSelector(currentBattleType) {
  const selectorLocation = document.querySelector("#firstHeading");
  selectorLocation.style.display = "flex";
  const selectorHtml = createBattleTypeSelector(currentBattleType);
  selectorLocation.appendChild(selectorHtml);

  document.querySelectorAll('input[name="state-d"]').forEach((input) => {
    input.addEventListener("click", handleBattleTypeSelection);
  });
}
function getFromStorage(storageRef) {
  try {
    return browser.storage.local.get(storageRef);
  } catch (error) {
    console.error("Error getting vehicle from storage:", error);
    throw error;
  }
}

function addBRtoGroup(vehicles, currentBattleType) {
  Array.from(
    document.querySelectorAll("#mw-content-text .tree-group-collapse")
  ).map((treeGroup) => {
    const vehicleUris = [...treeGroup.querySelectorAll("a")].map((a) =>
      a.getAttribute("href")
    );
    const groupRatings = vehicleUris.map((vehicleUri) => vehicles[vehicleUri]);
    const vehicleRatings = groupRatings.reduce((acc, obj) => {
      Object.entries(obj).forEach(([key, value]) => {
        acc[key] = {
          min: Math.min(acc[key]?.min ?? value, value),
          max: Math.max(acc[key]?.max ?? value, value),
        };
      });
      return acc;
    }, {});
    let textElement = treeGroup.nextElementSibling.firstChild;
    textElement.appendChild(document.createElement("br"));
    Object.entries(vehicleRatings).forEach(([battleType, rating]) => {
      appendRating(
        textElement,
        battleType,
        `${rating["min"].toFixed(1)}-${rating["max"].toFixed(1)}`,
        currentBattleType
      );
    });
  });
}

async function addBRtoVehicle(vehicles, currentBattleType) {
  document
    .querySelectorAll("#mw-content-text .tree-item")
    .forEach(async (treeItem) => {
      const vehicleUri = treeItem.querySelector("a").getAttribute("href");
      let vehicleRatings =
        vehicles[vehicleUri] || (await getBattleRatingsFromHref(vehicleUri));
      const textElement = treeItem.querySelector(".tree-item-text");
      textElement.appendChild(document.createElement("br"));
      Object.entries(vehicleRatings).forEach(([battleType, rating]) => {
        appendRating(textElement, battleType, rating, currentBattleType);
      });
    });
}

function appendRating(element, battleType, rating, currentBattleType) {
  const currentRating = document.createElement("span");
  currentRating.className = `tree-item-text-scroll brdisplay${battleType} brdisplay`;
  currentRating.style.display = battleType === currentBattleType ? "" : "none";
  currentRating.textContent = rating;
  element.appendChild(currentRating);
}
async function main() {
  try {
    const currentData = await getFromStorage(null);
    const currentBattleType = currentData.battletype || "rb";
    injectBattleTypeSelector(currentBattleType);
    const vehicleUris = Array.from(
      document.querySelectorAll("#mw-content-text .tree-item a")
    ).map((a) => a.getAttribute("href"));
    const instorage = !vehicleUris.some(
      (uri) => Object.keys(currentData).includes(uri)
    );
    const vehicles = instorage
      ? await fetchCurrentPageVehicleData()
      : (({ battletype, ...o }) => o)(currentData);
    await addBRtoVehicle(vehicles, currentBattleType);
    addBRtoGroup(vehicles, currentBattleType);
    if (!instorage){
      fetchCurrentPageVehicleData();
    }
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();
