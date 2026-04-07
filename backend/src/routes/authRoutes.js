const express = require('express')
const router = express.Router()
const { getMe } = require('../controllers/authController')
const { requireAuth } = require('../middleware/requireAuth')

router.get('/me', requireAuth, getMe)

module.exports = router
