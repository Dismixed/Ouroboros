import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    date: Date!,
    type: String!,
    desc: String,
    amount: Number!,
    oldBalance: Number!,
    newBalance: Number!
})

const investmentSchema = new mongoose.Schema({
    symbol: String,
    initialPrice: Number,
    type: String,
    amount: Number
})

const userSchema = new mongoose.Schema({
    username: String!,
    password: String!,
    balance: Number!,
    items: [transactionSchema],
    investments: [investmentSchema]
})

const User = mongoose.model('user', userSchema)

module.exports = User