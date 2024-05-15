const getFromStorage = async (storageRef) => {
  try {
    const items = await browser.storage.local.get(storageRef);
    return items;
  } catch (error) {
    console.error("Error getting vehicle from storage:", error);
    throw error;
  }
}