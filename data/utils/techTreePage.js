/**
 * Retrieves data from the browser's local storage with optional default handling.
 *
 * This asynchronous function fetches an item from local storage based on the provided
 * `storageRef`. If the `storageRef` is "battletype" and the item does not exist, it sets
 * a default value of "rb". If `storageRef` is a string, it returns the corresponding value
 * from storage; if it is null, it returns the entire storage object. Errors during the fetch
 * process are logged and re-thrown.
 *
 * @param {string|null} [storageRef=null] - The key of the item to retrieve from local storage,
 * or null to retrieve all items.
 * @returns {Promise<any>} A promise that resolves to the retrieved value or the entire storage
 * object if `storageRef` is null.
 * @throws {Error} Throws an error if there is an issue retrieving data from storage.
 */
async function getFromStorage(storageRef = null) {
  try {
    return browser.storage.local.get(storageRef).then((storageItem) => {
      if (
        storageRef === "battletype" &&
        !Object.keys(storageItem).includes(storageRef)
      ) {
        browser.storage.local.set({ battletype: "rb" });
        return "rb";
      }
      if (typeof storageRef === "string") {
        if (storageRef in storageItem) {
          return storageItem[storageRef];
        }
      } else {
        return storageItem;
      }
    });
  } catch (error) {
    console.error("Error getting vehicle from storage:", error);
    throw error;
  }
}


/**
 * Retrieves vehicle battle ratings from either local storage or a group fetch promise.
 *
 * This asynchronous function attempts to obtain vehicle battle ratings from two sources:
 * a local storage promise and a group fetch promise. It returns the first successful result
 * from either source. If both sources fail to provide the ratings, it falls back to fetching
 * the ratings from a specified URL using the `getBattleRatingsFromHref` function.
 *
 * @param {Promise<Object>} localStoragePromise - A promise that resolves to an object containing
 * vehicle ratings from local storage.
 * @param {Promise<Object>} groupFetchPromise - A promise that resolves to an object containing
 * vehicle ratings from a group fetch.
 * @param {string} vehicleUri - The URI of the vehicle for which to retrieve battle ratings.
 * @returns {Promise<any>} A promise that resolves to the vehicle's battle ratings.
 * @throws {Error} Throws an error if all attempts to retrieve the ratings fail.
 */
async function getVehicleBattleRatings(
  localStoragePromise,
  groupFetchPromise,
  vehicleUri
) {
  return Promise.any([
    localStoragePromise.then(
      (result) => result[vehicleUri] || Promise.reject()
    ),
    groupFetchPromise.then((result) => result[vehicleUri] || Promise.reject()),
  ]).catch(() => getBattleRatingsFromHref(vehicleUri));
}





/**
 * Calculates the minimum and maximum values for each key in an array of vehicle ratings.
 *
 * This function takes an array of objects representing vehicle ratings and reduces it to an
 * object that contains the minimum and maximum values for each key. The resulting object is
 * then transformed into a new object where each key maps to a string representing the range
 * of values in the format "min-max" with one decimal place.
 *
 * @param {Array<Object>} vehicleRatings - An array of objects where each object contains
 * vehicle rating values associated with various keys.
 * @returns {Object} An object where each key corresponds to a string representing the
 * minimum and maximum values in the format "min-max".
 */
function getMinMax(vehicleRatings) {
  let minMax = vehicleRatings.reduce((acc, obj) => {
    Object.entries(obj).forEach(([key, value]) => {
      acc[key] = {
        min: Math.min(acc[key]?.min ?? value, value),
        max: Math.max(acc[key]?.max ?? value, value),
      };
    });
    return acc;
  }, {});
  return Object.fromEntries(
    Object.entries(minMax).map(([key, { min, max }]) => [
      key,
      `${min.toFixed(1)}-${max.toFixed(1)}`,
    ])
  );
}



/**
 * Processes and displays vehicle ratings in a structured format within folder elements.
 *
 * This asynchronous function retrieves all folder elements from the document, iterates over each
 * folder, and fetches the corresponding vehicle ratings based on the links contained within. It
 * calculates the minimum and maximum values for the ratings, creates a line break, and appends
 * the formatted ratings to the appropriate text element in the DOM. The function utilizes
 * asynchronous operations to handle multiple folder elements concurrently.
 *
 * @param {Object} ratings - An object mapping vehicle URLs to their respective ratings.
 * @param {string} currentBattleType - The current battle type used to format the ratings display.
 * @returns {Promise<void>} A promise that resolves when all folder elements have been processed.
 */
async function folderText(ratings, currentBattleType) {
  const folderElements = document.querySelectorAll(
    "#mw-content-text .tree-group-collapse"
  );
  await Promise.all(
    Array.from(folderElements).map(async (folderElement) => {
      const vehicleRatings = await Promise.all(
        [...folderElement.querySelectorAll("a")].map(
          (a) => ratings[a.getAttribute("href")]
        )
      );
      const minMaxValues = getMinMax(vehicleRatings);
      const textElement = folderElement.nextElementSibling.firstChild;
      textElement.appendChild(document.createElement("br"));
      createRatingsElement(textElement, minMaxValues, currentBattleType, group=true);
    })
  );
}


/**
 * Creates and appends rating elements for different battle types to a specified text element.
 *
 * This asynchronous function generates span elements for each battle type (AB, RB, SB) based on
 * the provided ratings. It sets the class names for styling and toggles visibility based on the
 * current battle type. The function appends these span elements to the specified text element
 * in the DOM, allowing for dynamic display of vehicle ratings.
 *
 * @param {HTMLElement} textElement - The DOM element to which the rating spans will be appended.
 * @param {Promise<Object>} ratings - A promise that resolves to an object containing vehicle ratings
 * for different battle types.
 * @param {Promise<string>} currentBattleType - A promise that resolves to the current battle type
 * to determine which rating should be visible.
 * @returns {Promise<void>} A promise that resolves when all rating elements have been created and appended.
 */
async function createRatingsElement(textElement, ratings, currentBattleType, group=false) {
  const vehicleRatings = await ratings;
  let cbt = await currentBattleType;
  ["ab", "rb", "sb"].map((battleType) => {
    let currentRating = document.createElement("span");
    currentRating.className = `tree-item-text-scroll brdisplay${battleType} brdisplay${group ? ' brdisplaygroup' : ''}`;
    currentRating.classList.toggle("hidden", battleType !== cbt);
    currentRating.textContent = vehicleRatings[battleType];    
    
    textElement.appendChild(currentRating);
  });
}


/**
 * Main function to initialize the extension's functionality and populate vehicle ratings.
 *
 * This function sets up a message listener for incoming messages, retrieves the current battle type
 * from storage, and injects the battle type selector into the page. It collects vehicle elements
 * from the document, fetches current vehicle data, and processes each vehicle to extract and display
 * its battle ratings. Finally, it organizes the ratings into a structured format for further use.
 *
 * @returns {void} This function does not return a value.
 */
function main() {
  browser.runtime.onMessage.addListener((request) => {});
  const currentBattleType = getFromStorage("battletype");
  injectBattleTypeSelector(currentBattleType);
  const elementList = Array.from(
    document.querySelectorAll("#mw-content-text .tree-item")
  );
  const pageData = fetchCurrentPageVehicleData();
  const storageData = getFromStorage();
  const vehicleRatings = {};
  elementList.forEach((treeItem) => {
    const vehicleUri = treeItem.querySelector("a").getAttribute("href");
    const textElement = treeItem.querySelector(".tree-item-text");
    textElement.appendChild(document.createElement("br"));
    const rating = getVehicleBattleRatings(storageData, pageData, vehicleUri);
    vehicleRatings[vehicleUri] = rating;
    createRatingsElement(textElement, rating, currentBattleType);
  });
  folderText(vehicleRatings, currentBattleType);
}

main();
