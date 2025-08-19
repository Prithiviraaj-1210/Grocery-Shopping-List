const { readLists, writeLists } = require('../models/shoppingModel')
async function getLists(req, res) {
  const lists = await readLists()
  res.json(lists)
}
async function createList(req, res) {
  const { name, items } = req.body
  if (!name || !Array.isArray(items)) return res.status(400).json({ error: 'invalid payload' })
  const lists = await readLists()
  const id = Date.now().toString()
  const newList = { id, name, items }
  lists.push(newList)
  await writeLists(lists)
  res.status(201).json(newList)
}
module.exports = { getLists, createList }
