import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    date: Date!,
    type: String!,
    desc: String,
    amount: Number!,
    oldBalance: Number!,
    newBalance: Number!
})

const userSchema = new mongoose.Schema({
    username: String!,
    password: String!,
    balance: Number!,
    items: [transactionSchema]
})

const User = mongoose.model('user', userSchema)

module.exports = User