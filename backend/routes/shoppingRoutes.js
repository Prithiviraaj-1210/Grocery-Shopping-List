const express = require('express')
const router = express.Router()
const { getLists, createList } = require('../controllers/shoppingController')
router.get('/', getLists)
router.post('/', createList)
module.exports = router
