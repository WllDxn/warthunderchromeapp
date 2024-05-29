const fetchCurrentPageVehicleData = async () => {
  const currentUrl = window.location.href;

  const urlConfig = [
    { pattern: /ground/, urls: ["/Land"] },
    { pattern: /Bluewater_Fleet|Coastal_Fleet|ships/, urls: ["/Sea"] },
    { pattern: /aircraft|helicopter/, urls: [""] },
    { urls: ["", "/Land", "/Sea"] }, // Default case
  ];

  const config = urlConfig.find((cfg) => cfg.pattern?.test(currentUrl)) || urlConfig[3];
       
  const vehicledata = await fetchVehicleData(config.urls);
  fetchVehicleData(
    urlConfig[3].urls.filter((url) => !config.urls.includes(url))
  );
  return vehicledata;
};

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

