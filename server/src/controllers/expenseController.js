import {Expense} from "../models/Expense.js";

export const createExpense = async(req,res) => {
    try{
        const {amount,category,description,date} = req.body;
        const expense = await Expense.create({amount,category,description,date});
        res.status(201).json(expense);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
};

export const getExpenses = async(req,res) => {
    try{
        const limit = Math.min(Number(req.query.limit)|| 20, 100);
        const expenses = await Expense.find().sort({date: -1}).limit(limit);
        res.status(200).json(expenses);
    } catch(err){
        res.status(500).json({message: err.message});
    }
};

export const getExpenseById = async(req,res) => {
    try{
        const expense = await Expense.findById(req.params.id);
        if(!expense){
            return res.status(404).json({message: "Expense not found"});
        }
        res.json(expense);
    } catch(err){
        res.status(500).json({message: err.message})
    }
};

export const updateExpense = async(req,res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
          new: true,            // return the updated doc
          runValidators: true,  // enforce schema rules on update too
        });
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        res.json(expense);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    
};

export const deleteExpense = async(req,res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        res.json({ message: "Expense deleted" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
};