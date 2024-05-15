const fetchCurrentPageVehicleData = async() => {
  let urls;
  const currentUrl = window.location.href;

  const urlPatterns = [
    /ground/,
    /Fleet/,
    /aircraft|helicopter/,
  ];

  const urlMappings = [
    ["/Land"],
    ["/Sea"],
    [""],
    ["", "/Land", "/Sea"],
  ];

  const patternIndex = urlPatterns.findIndex(pattern => pattern.test(currentUrl));
  urls = patternIndex !== -1 ? urlMappings[patternIndex] : urlMappings[3];
  let vehicledata = await fetchVehicleData(urls);
  fetchVehicleData(urlMappings[3].filter(url => !urlMappings[patternIndex].includes(url)))
  return vehicledata
}
const fetchVehicleData = async (urls) => {  
  const battleRatingsUrl = "https://wiki.warthunder.com/List_of_vehicle_battle_ratings";
  const vehicleRatings = {};

  try {
    const requests = urls.map(url => $.ajax({
      url: `${battleRatingsUrl}${url}`,
    }));
    const responses = await Promise.all(requests);

    for (const response of responses) {
      const $table = $(response).find("table");
      $table.find("tr").each(function () {
        const rowData = [];
        $(this)
          .find("td")
          .each(function () {
            const $cell = $(this);
            const hasHref = $cell.find("a").length > 0;
            if (hasHref) {
              rowData.unshift($cell.find("a").attr("href"));
            } else {
              rowData.push($(this).text().trim());
            }
          });
        if (rowData.length === 6) {
          vehicleRatings[rowData[0]] = {
            ab: rowData[3],
            rb: rowData[4],
            sb: rowData[5],
          };
        }
      });
    }
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
  }
  browser.storage.local.set(vehicleRatings)
  return vehicleRatings;
};
