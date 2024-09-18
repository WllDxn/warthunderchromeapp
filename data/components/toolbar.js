/**
 * Initializes event listeners for battle type selection and cache clearing.
 *
 * This function retrieves the current battle type from local storage, sets the checked state
 * of the corresponding radio buttons, and attaches click event listeners to them. It also
 * adds an event listener to the cache clear button to handle cache clearing actions.
 *
 * @returns {void} This function does not return a value.
 */
function listenForClicks() {
  browser.storage.local.get("battletype").then((storageItem) => {
    const currentBattleType = storageItem.battletype ?? "rb";
    ["ab", "rb", "sb"].forEach((type) => {
      const element = document.getElementById(type);
      element.checked = currentBattleType === type;
      element.addEventListener("click", handleBattleTypeClick);
    });
  });
  document
    .getElementById("cacheClear")
    .addEventListener("click", handleCacheClearClick);
}

function handleCacheClearClick() {
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => clearCache(tabs[0].id))
    .catch(reportError);
}

function handleBattleTypeClick(e) {
  const battleType = e.target.id;
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => changeBattleType(tabs[0].id, battleType))
    .catch(reportError);
}

async function clearCache(tabId) {
  const storageItem = await browser.storage.local.get("battletype");
  await browser.storage.local.clear();
  await browser.storage.local.set(storageItem);
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  if (tabs[0].url.includes("//wiki.warthunder.com")) {
    await browser.tabs.reload(tabId);
  }
}

function changeBattleType(tabId, battleType) {
  browser.tabs
    .sendMessage(tabId, {
      command: "changeBattleType",
      battleType: battleType,
    })
    .catch(reportError);
}

function reportError(error) {
  console.error(`An error occurred: ${error}`);
}

function reportExecuteScriptError(error) {
  console.error(`Failed to execute content script: ${error.message}`);
}
// Initialize the extension
browser.tabs
  .executeScript({ file: "toolbarBattleTypeSelector.js" })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);
