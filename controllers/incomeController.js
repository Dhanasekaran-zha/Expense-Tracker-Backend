const Income = require('../models/Income')
const xlsx = require('xlsx')

//Add Income
exports.addIncome = async (req, res) => {
    const userId = req.user.id
    try {
        const {icon, source, amount, date} = req.body

        //Validation: Check for missing fields
        if (!source || !amount || !date) {
            return res.status(400).json({message: "All fields are required"})
        }

        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date)
        })

        await newIncome.save()
        res.status(201).json(newIncome)

    } catch (e) {
        res.status(500).json({message: "Server Error", error: e.message})
    }
}

//Get All Income
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        const income = await Income.find({userId}).sort({date: -1})
        res.json(income)
    } catch (e) {
        res.status(500).json({message: "Server Error", error: e.message})
    }
}

//Delete Income
exports.deleteIncome = async (req, res) => {
    try {
        await Income.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "Income deleted successfully"})
    } catch (e) {
        res.status(500).json({message: "Server Error", error: e.message})
    }
}


//Download Income
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;

    try {
        const income = await Income.find({userId}).sort({date: -1})

        //Prepare data for Excel
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date
        }))

        const wb = xlsx.utils.book_new()
        const ws = xlsx.utils.json_to_sheet(data)
        xlsx.utils.book_append_sheet(wb, ws, "Income")
        xlsx.writeFile(wb, 'income_details.xlsx')
        res.download('income_details.xlsx')
    } catch (e) {
        res.status(500).json({message: "Server Error", error: e.message})
    }
}

