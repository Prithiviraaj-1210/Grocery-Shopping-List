const fs = require('fs')
const path = require('path')
const dataDir = path.join(__dirname, '..', 'data')
const dataFile = path.join(dataDir, 'lists.json')
function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify([]))
}
module.exports = { dataFile, ensureDataFile }
