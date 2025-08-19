const fs = require('fs').promises
const { dataFile } = require('../config/db')
async function readLists() {
  try {
    const raw = await fs.readFile(dataFile, 'utf8')
    return JSON.parse(raw || '[]')
  } catch (err) {
    return []
  }
}
async function writeLists(lists) {
  await fs.writeFile(dataFile, JSON.stringify(lists, null, 2))
}
module.exports = { readLists, writeLists }
