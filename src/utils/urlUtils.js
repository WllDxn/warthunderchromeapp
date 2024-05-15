const getVehicleUrls = async function getVehicleUrls() {
    const currentUrl = window.location.href;
    if (currentUrl.includes("ground")) {
      return ["/Land"];
    } else if (currentUrl.includes("Fleet")) {
      return ["/Sea"];
    } else if (currentUrl.includes("aircraft")){
      return [""]
    }else{
      return ["", "/Land", "/Sea"];
    }
  }
// exports.getVehicleUrls = getVehicleUrls;