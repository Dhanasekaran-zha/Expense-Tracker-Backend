const express = require('express')
const {
    addExpense,
    getAllExpense,
    getAllExpenseByMonth,
    deleteExpense,
    downloadExpenseExcel
} = require('../controllers/expenseController')
const {protect} = require("../middleware/authMiddleware")
const {getAllIncomeByMonth} = require("../controllers/incomeController");

const router = express.Router();

router.post("/add", protect, addExpense)
router.get("/get", protect, getAllExpense)
router.get("/downloadexcel", protect, downloadExpenseExcel)
router.delete("/:id", protect, deleteExpense)
router.get('/:year/:month', protect, getAllExpenseByMonth)


module.exports = router
