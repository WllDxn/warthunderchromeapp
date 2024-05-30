function getFromStorage(storageRef = null) {
  try {
    return browser.storage.local.get(storageRef).then(storageItem => {
            if (storageRef === 'battletype'){       
                return storageItem['battletype']
            }
            else if (typeof(storageRef) === typeof("string")) {
                if (storageRef in Object.keys(storageItem)){
                    return storageItem[storageRef]
                } else {
                    return waitForStorageKey(storageRef)
                }
            } 
            else{                
                return storageItem
            }
        });
  } catch (error) {
    console.error("Error getting vehicle from storage:", error);
    throw error;
  }
}

async function addBRtoVehicle(vehicles, currentBattleType) {
  document
    .querySelectorAll("#mw-content-text .tree-item")
    .forEach(async (treeItem) => {
      const vehicleUri = treeItem.querySelector("a").getAttribute("href");
      let vehicleRatings = vehicles[vehicleUri] || {
        ab: "69",
        sb: "69",
        rb: "69",
      }; //(await getBattleRatingsFromHref(vehicleUri));
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

function techTree() {
    const currentData = getFromStorage();
    if (!('battletype' in currentData)){
        currentData.battletype = "rb"
        browser.storage.local.set({'battletype': 'rb'});
    }
    injectBattleTypeSelector(currentData.battletype);
    const vehicleElements = Array.from(
        document.querySelectorAll("#mw-content-text .tree-item")
    );
    vehicleElements.map((treeItem) => {
        const vehicleUri = treeItem.querySelector("a").getAttribute("href");
        const textElement = treeItem.querySelector(".tree-item-text");
        textElement.id=`br${vehicleUri}`
        getFromStorage(vehicleUri)
        if (vehicleUri in Object.keys(currentData)){
            createRatingsElement(textElement, vehicleUri)
        }
        return vehicleUri;
    });  
    fetchCurrentPageVehicleData(fetchall=false, notfound=vehicleElements.map(x=>x.querySelector("a").getAttribute("href")))
}
async function p(){
    let a = await getFromStorage('unfound')
    console.log(a)
}
function createRatingsElement(textElement, vehicleUri) {
    // const {firstChild} = textElement;
    while (textElement.lastChild && textElement.lastChild!==textElement.firstChild) {
        textElement.removeChild(textElement.lastChild);
    }
    textElement.appendChild(document.createElement("br"));
    getFromStorage("battletype").then(currentBattleType => {
        getFromStorage(vehicleUri).then(vehicleRatings => {
            ["ab", "rb", "sb"].map((battleType) => {
                let currentRating = document.createElement("span");
                currentRating.className = `tree-item-text-scroll brdisplay${battleType} brdisplay`;
                currentRating.style.display = (battleType === currentBattleType.battletype) ? "" : "none";        
                currentRating.textContent = vehicleRatings[vehicleUri][battleType];
                textElement.appendChild(currentRating)
            });
        }); 
    });
}

function waitForStorageKey(key) {
    return new Promise((resolve, reject) => {
      const listener = (changes, areaName) => {
        if (areaName === 'local' && changes[key]) {
          browser.storage.onChanged.removeListener(listener);
          const textid = document.getElementById(`br${key}`)
          createRatingsElement(textid, key)
          resolve(changes[key].newValue);
        }
      };  
      browser.storage.onChanged.addListener(listener);
    });
  }
techTree();
