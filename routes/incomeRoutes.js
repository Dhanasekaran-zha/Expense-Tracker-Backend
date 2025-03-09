const express = require('express')
const {
    addIncome,
    getAllIncome,
    getAllIncomeByMonth,
    deleteIncome,
    downloadIncomeExcel
} = require('../controllers/incomeController')
const {protect} = require("../middleware/authMiddleware")

const router = express.Router();

router.post("/add", protect, addIncome)
router.get("/get", protect, getAllIncome)
router.get("/downloadexcel", protect, downloadIncomeExcel)
router.delete("/:id", protect, deleteIncome)
router.get('/:year/:month', protect, getAllIncomeByMonth)

module.exports = router
