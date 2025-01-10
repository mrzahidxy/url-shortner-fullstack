const fs = require("fs");
const path = require("path");

// Path to JSON file
const FILE_PATH = path.join(__dirname, "storage.json");

// Read JSON from file
async function loadData() {
  try {
    const dataRaw = await fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(dataRaw);
  } catch (error) {
    console.error("Could not read or parse storage.json:", error);
    return {};
  }
}

// Write JSON to file
async function saveData(dataObj) {
  try {
    await fs.writeFileSync(
      FILE_PATH,
      JSON.stringify(dataObj, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error writing to storage.json:", error);
  }
}

module.exports = {
  loadData,
  saveData,
};
