const parseBattleRatings = (doc, vehicleUrl) => {
  const tableRows = doc
    .querySelector(".general_info_br tbody")
    ?.querySelectorAll("tr");
  if (tableRows?.length >= 2) {
    const rowCells = Array.from(tableRows[1].querySelectorAll("td")).map(
      (cell) => cell.textContent.trim()
    );
    return {
      ab: rowCells[0],
      rb: rowCells[1],
      sb: rowCells[2],
    };
  } else {
    console.error("Unexpected table structure for URL:", vehicleUrl);
    return null;
  }
};

const getBattleRatingsFromHref = async (vehicleUrl) => {
  try {
    const url = `https://${document.location.hostname}${vehicleUrl}`;
    const response = await fetch(url);
    const htmlContent = await response.text();
    const doc = new DOMParser().parseFromString(htmlContent, "text/html");
    const vehicleBattleRatings = parseBattleRatings(doc, vehicleUrl);
    if (vehicleBattleRatings) {
      const storageObject = { [vehicleUrl]: vehicleBattleRatings };
      browser.storage.local.set(storageObject);
      return vehicleBattleRatings;
    }
    return null;
  } catch (error) {
    console.error("Error fetching vehicle battle ratings:", error);
    throw error;
  }
};
