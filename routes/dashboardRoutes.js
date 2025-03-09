const express = require('express')
const {protect} = require('../middleware/authMiddleware')
const {getDashboardData, getMonthlyDashboardData} = require('../controllers/dashboardController')

const router = express.Router()

router.get('/', protect, getDashboardData)
router.get('/get/:year/:month', protect, getMonthlyDashboardData)


module.exports = router
