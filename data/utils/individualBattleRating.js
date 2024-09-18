/**
 * Fetches battle ratings for a vehicle from a specified URL and stores them in local storage.
 *
 * This asynchronous function constructs a full URL for the vehicle based on the current hostname,
 * fetches the HTML content from that URL, and parses it to extract the vehicle's battle ratings.
 * If the ratings are successfully retrieved, they are stored in the browser's local storage with
 * the vehicle URL as the key. In case of an error during the fetch or parsing process, an error
 * message is logged to the console.
 *
 * @param {string} vehicleUrl - The relative URL of the vehicle for which to fetch battle ratings.
 * @returns {Promise<Object|undefined>} A promise that resolves to the vehicle's battle ratings
 * or undefined if an error occurs.
 */
const getBattleRatingsFromHref = async (vehicleUrl) => {
  try {
    const url = `https://${document.location.hostname}${vehicleUrl}`;
    const response = await fetch(url);
    const htmlContent = await response.text();
    const parser = new DOMParser().parseFromString(htmlContent, "text/html");
    const vehicleBattleRatings = parseBattleRatings(parser);
    if (vehicleBattleRatings) {
      const storageObject = { [vehicleUrl]: vehicleBattleRatings };
      browser.storage.local.set(storageObject);
      return vehicleBattleRatings;
    } else {
      throw error
    }
  } catch (error) {
    console.error("Error fetching vehicle battle ratings:", error);
  }
}

/**
 * Parses battle ratings from a DOM structure provided by a DOMParser.
 *
 * This function extracts battle ratings for different modes (AB, RB, SB) from a specified
 * table within the parsed HTML. It looks for the table rows in the `.general_info_br` class
 * and retrieves the text content of the relevant cells. If the expected structure is not found,
 * it logs an error and returns null.
 *
 * @param {Document} parser - The parsed HTML document from which to extract battle ratings.
 * @returns {Object|null} An object containing the battle ratings for AB, RB, and SB, or null
 * if the expected table structure is not found.
 */
const parseBattleRatings = (parser) => {
  const tableRows = parser
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
    console.error("Unexpected table structure for ");
    return null;
  }
}
