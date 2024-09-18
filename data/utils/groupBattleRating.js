/**
 * Fetches vehicle data based on the current page URL and a fetch-all flag.
 *
 * This asynchronous function determines the appropriate vehicle data URLs to fetch based on
 * the current page's URL. If the `fetchall` parameter is true, it fetches data from all vehicle
 * categories. Otherwise, it selects the relevant category based on the URL pattern. The function
 * returns a promise that resolves with the fetched vehicle data and also initiates a fetch for
 * any additional vehicle data not included in the initial request.
 *
 * @param {boolean} [fetchall=false] - A flag indicating whether to fetch data from all vehicle categories.
 * @returns {Promise<Object>} A promise that resolves to the fetched vehicle data.
 */
const fetchCurrentPageVehicleData = async (fetchall = false) => {
  const baseurl = window.location.href;
  const urlConfig = [
    { pattern: /ground/, urls: ["/Ground"] },
    { pattern: /Bluewater_Fleet|Coastal_Fleet/, urls: ["/Fleet"] },
    { pattern: /aircraft|helicopter/, urls: ["/Aviation"] },
    { urls: ["/Aviation", "/Ground", "/Fleet"] },
  ];
  const config = fetchall
    ? urlConfig[3]
    : urlConfig.find((cfg) => cfg.pattern.test(baseurl)) || urlConfig[3];
  return fetchVehicleData(config.urls).then((data) => {
    fetchVehicleData(
      urlConfig[3].urls.filter((url) => !config.urls.includes(url))
    );
    return data;
  });
};

/**
 * Fetches vehicle battle ratings from specified URLs and stores them in local storage.
 *
 * This asynchronous function constructs a complete URL for each provided path, fetches the HTML
 * content from the battle ratings page, and parses the data to extract vehicle ratings. It organizes
 * the ratings into an object with the vehicle name as the key and the battle ratings for different
 * modes (AB, RB, SB) as values. If an error occurs during the fetch process, it logs the error to the console.
 *
 * @param {string[]} urls - An array of URL paths to append to the base battle ratings URL.
 * @returns {Promise<Object>} A promise that resolves to an object containing vehicle ratings.
 */
const fetchVehicleData = async (urls) => {
  const battleRatingsUrl =
    "https://wiki.warthunder.com/List_of_vehicle_battle_ratings";
  const vehicleRatings = {};
  try {
    const html = await Promise.all(
      urls.map(async (url) => {
        const resp = await fetch(battleRatingsUrl + url);
        return resp.text();
      })
    );
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const tables = doc.querySelectorAll(".wikitable");
    for (const table of tables) {
      const rows = table.querySelectorAll("tr");
      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        const rowData = [];
        for (const cell of cells) {
          const hasHref = cell.querySelector("a");
          if (hasHref) {
            rowData.unshift(hasHref.getAttribute("href"));
          } else {
            rowData.push(cell.textContent.trim());
          }
        }
        if (rowData.length === 6) {
          vehicleRatings[rowData[0]] = {
            ab: rowData[3],
            rb: rowData[4],
            sb: rowData[5],
          };
        }
      }
    }
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
  }
  browser.storage.local.set(vehicleRatings);
  return vehicleRatings;
};
