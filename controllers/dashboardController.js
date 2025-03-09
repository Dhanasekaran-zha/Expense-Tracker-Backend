const Expense = require('../models/Expense')
const Income = require('../models/Income')
const {isValidObjectId, Types} = require('mongoose')

//Dashboard Data
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id
        const userObjectId = new Types.ObjectId(String(userId))

        //Fetch total income & expense
        const totalIncome = await Income.aggregate([
            {$match: {userId: userObjectId}},
            {$group: {_id: null, total: {$sum: "$amount"}}}
        ])

        const totalExpense = await Expense.aggregate([
            {$match: {userId: userObjectId}},
            {$group: {_id: null, total: {$sum: "$amount"}}}
        ])

        // Get Income transactions in last 60 days
        const last60DaysIncomeTransactions = await Income.find({
            userId,
            date: {$gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)}
        }).sort({date: -1})

        //Get total income for last 60 days
        const incomeLast60Days = last60DaysIncomeTransactions.reduce(
            (sum, transaction) => sum + transaction.amount, 0
        )

        // Get Expense transactions in last 60 days
        const last60DaysExpenseTransactions = await Expense.find({
            userId,
            date: {$gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)}
        }).sort({date: -1})

        //Get total expense for last 60 days
        const expenseLast60Days = last60DaysExpenseTransactions.reduce(
            (sum, transaction) => sum + transaction.amount, 0
        )

        //Fetch last 5 transactions (income + expense)
        const lastTransactions = [
            ...(await Income.find({userId}).sort({date: -1}).limit(5)).map((transaction) => ({
                ...transaction.toObject(),
                type: "income"
            })),
            ...(await Expense.find({userId}).sort({date: -1}).limit(5)).map((transaction) => ({
                ...transaction.toObject(),
                type: "expense"
            }))
        ].sort((a, b) => b.date - a.date)

        // Final Response
        res.status(200).json({
            totalBalance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpense: totalExpense[0]?.total || 0,
            last60DaysExpenses: {
                total: expenseLast60Days,
                transactions: last60DaysExpenseTransactions
            },
            last60DaysIncomes: {
                total: incomeLast60Days,
                transactions: last60DaysIncomeTransactions
            },
            recentTransactions: lastTransactions
        })

    } catch (e) {
        res.status(500).json({message: "Server Error", error: e.message})
    }
}

//Monthly Dashboard Data
exports.getMonthlyDashboardData = async (req, res) => {
    try {
        const userId = req.user.id
        const userObjectId = new Types.ObjectId(String(userId))

        const {year, month} = req.params;

        // Convert year and month to numbers
        const y = parseInt(year);
        const m = parseInt(month);

        if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
            return res.status(400).json({message: "Invalid year or month"});
        }

        // Get start and end of the month
        const startDate = new Date(y, m - 1, 1); // First day of the month
        const endDate = new Date(y, m, 1); // First day of the next month

        //Fetch total income & expense of the month
        const totalIncome = await Income.aggregate([
            {
                $match: {
                    userId: userObjectId, date: {
                        $gte: startDate,
                        $lt: endDate,       // Start of the next month
                    }
                }
            },
            {$group: {_id: null, total: {$sum: "$amount"}}}
        ])

        const totalExpense = await Expense.aggregate([
            {
                $match: {
                    userId: userObjectId, date: {
                        $gte: startDate,
                        $lt: endDate,       // Start of the next month
                    }
                },
            },
            {$group: {_id: null, total: {$sum: "$amount"}}}
        ])

        // current month expenses
        const monthlyIncome = await Income.find({
            userId,
            date: {$gte: startDate, $lt: endDate}
        }).sort({date: -1});

        // monthly expenses
        const monthlyExpense = await Expense.find({
            userId,
            date: {$gte: startDate, $lt: endDate}
        }).sort({date: -1});

        //Fetch last 5 transactions (income + expense)
        const lastTransactions = [
            ...(await Income.find({
                userId,
                date: {$gte: startDate, $lt: endDate}
            }).sort({date: -1}).limit(5)).map((transaction) => ({
                ...transaction.toObject(),
                type: "income"
            })),
            ...(await Expense.find({
                userId,
                date: {$gte: startDate, $lt: endDate}
            }).sort({date: -1}).limit(5)).map((transaction) => ({
                ...transaction.toObject(),
                type: "expense"
            }))
        ].sort((a, b) => b.date - a.date)

        // Final Response
        res.status(200).json({
            totalBalance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpense: totalExpense[0]?.total || 0,
            monthlyExpenses: monthlyExpense,
            monthlyIncome: monthlyIncome,
            recentTransactions: lastTransactions
        })

    } catch (e) {
        res.status(500).json({message: "Server Error", error: e.message})
    }
}
