import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import cors from 'cors'
import axios from 'axios'
import bcrypt from 'bcryptjs'
// @ts-ignore
import bodyParser from 'body-parser'
import React from "react";
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
const User = require('./schema.ts')

const app = express()

app.use(cors())
app.use(bodyParser.json())

const saltRounds = 10

console.log(process.env.PLAID_ENV)

const client = new PlaidApi(new Configuration({
        basePath: PlaidEnvironments[process.env.PLAID_ENV],
        baseOptions: {
            headers: {
                'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
                'PLAID-SECRET': process.env.PLAID_SECRET,
                'Plaid-Version': '2020-09-14',
            },
        },
    })
)

mongoose.connect(`mongodb+srv://admin:${process.env.MONGOOSE_PASSWORD}@cluster0.fy0zm.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    console.log('Connected to MongoDB')
})

app.post('/api/signup', (req, res) => {
    const { username, password } = req.body
    User.findOne({ username: username }, (err: any, user: {username: string, password: string}) => {
        if (err) {
            res.status(500).send(err)
        } else if (user) {
            res.status(400).send('User already exists')
        } else {
            bcrypt.hash(password, saltRounds).then((hash: string) => {
                //@ts-ignore
                const newUser = new User({
                    username: username,
                    password: hash,
                    balance: 0
                })
                newUser.save((err: any, user: {username: string, password: string}) => {
                    if (err) {
                        res.status(500).send(err)
                    } else {
                        res.status(201).send(user)
                    }
                })
            })
        }
    })
})

app.post('/api/login', (req, res) => {
    const { username, password } = req.body
    console.log(username, password)
    User.findOne({username: username}).then((user: any) => {
        if (!user) {
            res.status(404).send('User not found')
        } else {
            bcrypt.compare(password, user.password).then((result: boolean) => {
                if (result) {
                    res.status(200).json(user)
                } else {
                    res.status(401).send('Password incorrect')
                }
            })
        }
    })
})

app.patch('/api/deposit', (req, res) => {
    const { username, amount, date } = req.body
    User.findOne({username: username})
        .then((user: any) => {
            if (user) {
                const oldBalance = user.balance
                const newBalance = Number(oldBalance) + Number(amount)
                user.balance = newBalance
                const newTransaction = {
                    date: date,
                    type: 'deposit',
                    desc: 'Deposit',
                    amount: amount,
                    oldBalance: oldBalance,
                    newBalance: newBalance
                }
                user.items.push(newTransaction)
                user.save()
                    //@ts-ignore
                    .then((response: any) => {
                        console.log(user)
                        res.json({balance: user.balance, items: user.items})
                    })
                    //@ts-ignore
                    .catch((error: any) => {
                        res.status(500).send(error)
                    })
            } else {
                res.status(404).send('User not found')
            }
    })
})

app.patch('/api/transaction', (req, res) => {
    const { username, amount, date, type, desc } = req.body
    console.log(username)
    User.findOne({username: username})
        .then((user: any) => {
            if (user) {
                const oldBalance = user.balance
                const newBalance = Number(oldBalance) - Number(amount)
                user.balance = newBalance
                const newTransaction = {
                    date: date,
                    type: type,
                    desc: desc,
                    amount: amount,
                    oldBalance: oldBalance,
                    newBalance: newBalance
                }
                user.items.push(newTransaction)
                user.save()
                    //@ts-ignore
                    .then((response: any) => {
                        console.log(user)
                        res.json({balance: user.balance, items: user.items})
                    }).catch((error: any) => {
                        res.status(500).send(error)
                    }
                )
            } else {
                res.status(404).send('User not found')
            }
    })
})

app.post('/api/exchange_public_token', (req, res) => {
    const { public_token } = req.body
    client.itemPublicTokenExchange({public_token: public_token})
        .then((response: any) => {
            console.log(response)
            res.json(response.data)
        })
})

app.post('/api/create_link_token', (req, res) => {
    const { username } = req.body
    User.findOne({username: username})
        .then((user: any) => {
            if (user) {
                const userID = user._id.toString()
                console.log(userID)
                const request = {
                    user: {
                        client_user_id: userID
                    },
                    client_name: 'Incept',
                    products: ['transactions'],
                    language: 'en',
                    webhook: 'incept-budget.vercel.app/api/webhook',
                    country_codes: ['US'],
                }

                try {
                    // @ts-ignore
                    client.linkTokenCreate(request).then((resp) => {
                        console.log(resp.data)
                        res.json(resp.data)
                    })
                } catch {
                    console.log('err')
                    res.status(500).send('Error creating link token')
                }
            } else {
                res.status(404).send('User not found')
            }
    })
})

app.get('/api/accounts/balance', (req, res) => {
    const { accessToken } = req.query
    console.log(accessToken)
    // @ts-ignore
    client.accountsBalanceGet({access_token: accessToken})
        .then((response) => {
            res.json(response.data)
        })
})

const port = 3500
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
