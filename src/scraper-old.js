function injectBattleTypeSelector(currentBattleType) {
  const selectorLocation = $("body").find("#firstHeading")[0];
  const selectorHtml = createBattleTypeSelector(currentBattleType);
  $(selectorLocation).append(selectorHtml);

  $('input[name="state-d"]').on("click", handleBattleTypeSelection);
}

async function getVehicles() {
  const vehicleUrls = await getVehicleUrls();
  const vehicleData = await fetchVehicleData(vehicleUrls);
  return vehicleData;
}

async function main() {
  try {
    let currentBattleType = await getVehicleFromStorage("battletype");
    if (Object.keys(currentBattleType).length === 0) {
      currentBattleType = "rb";
    } else {
      currentBattleType = currentBattleType["battletype"];
    }
    
    injectBattleTypeSelector(currentBattleType);

    const vehicles = await getVehicles();

    $("#mw-content-text")
      .find(".tree-item")
      .each(async function () {
        const $treeItem = $(this);
        const vehicleUri = $treeItem.find("a").attr("href");
        let vehicleRatings = vehicles[vehicleUri];
        if (vehicleRatings == null) {
          vehicleRatings = await getBattleRatingsFromHref(vehicleUri);
        }

        const $textElement = $treeItem.find(".tree-item-text")[0];
        $textElement.appendChild(document.createElement("br"));

        for (const battleType in vehicleRatings) {
          const currentRating = document.createElement("span");
          currentRating.className = `tree-item-text-scroll brdisplay${battleType}`;
          currentRating.style.display =
            battleType === currentBattleType ? "inline" : "none";
          currentRating.textContent = vehicleRatings[battleType];
          $textElement.appendChild(currentRating);

          if (
            $textElement.parentNode.parentNode.classList.contains(
              "tree-group-collapse"
            )
          ) {
            const treeGroup =
              $textElement.parentNode.parentNode.nextElementSibling.firstChild;
            if (treeGroup.childNodes.length === 1) {
              treeGroup.appendChild(document.createElement("br"));
            }

            if ($(treeGroup).find(`.brdisplay${battleType}`).length === 0) {
              const rating = currentRating.cloneNode(true);
              rating.className = `tree-item-text-scroll brdisplay${battleType}`;
              rating.textContent = `${vehicleRatings[battleType]}-${vehicleRatings[battleType]}`;
              treeGroup.appendChild(rating);
            } else {
              const vals = $(treeGroup).find(`.brdisplay${battleType}`)[0]
                .textContent;
              const minMax = vals.split("-");
              if (
                parseFloat(vehicleRatings[battleType]) < parseFloat(minMax[0])
              ) {
                minMax[0] = vehicleRatings[battleType];
              }
              if (
                parseFloat(vehicleRatings[battleType]) > parseFloat(minMax[1])
              ) {
                minMax[1] = vehicleRatings[battleType];
              }
              $(treeGroup).find(
                `.brdisplay${battleType}`
              )[0].textContent = `${minMax[0]}-${minMax[1]}`;
            }
          }
        }
      });
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();
