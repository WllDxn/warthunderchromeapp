const getBattleRatingsFromHref = async (vehicleHref) => {
  try {
    const response = await $.ajax({
      url: "https://wiki.warthunder.com" + vehicleHref,
    });
    const $generalInfoBr = $(response).find(".general_info_br");
    const $rows = $generalInfoBr.find("tbody tr");

    if ($rows.length >= 2) {
      const rowData = $rows.eq(1).find("td");
      const ratings = {
        [vehicleHref]: {
          ab: rowData.eq(0).text().trim(),
          rb: rowData.eq(1).text().trim(),
          sb: rowData.eq(2).text().trim(),
        },
      };

      browser.storage.local.set(ratings);
      return ratings[vehicleHref];
    } else {
      console.error("Unexpected table structure for URL:", vehicleHref);
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
// exports.getBattleRatingsFromHref = getBattleRatingsFromHref
