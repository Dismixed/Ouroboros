import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import cors from 'cors'
import axios from 'axios'
import bcrypt from 'bcryptjs'
// @ts-ignore
import bodyParser from 'body-parser'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import InvestmentType from "../types/InvestmentType";
const finnhub = require('finnhub');

const User = require('./schema.ts')

interface GetInvestmentType extends InvestmentType {
    currentPrice: number
}

const app = express()
app.use(cors())
app.use(bodyParser.json())

const saltRounds = 10

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

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.FINNHUBAPIKEY
const finnhubClient = new finnhub.DefaultApi()

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


//TODO update balance from current price
app.post('/api/investments', (req, res) => {
    const { username, amount, price, symbol, type } = req.body
    const investment = {
        symbol: symbol,
        initialPrice: price,
        type: type,
        amount: amount
    }

    User.findOne({username: username})
        .then((user: any) => {
            if (user) {
                user.investments.push(investment)
                user.balance = user.balance + (Number(amount) * Number(price))
                user.save()
                    //@ts-ignore
                    .then((response: any) => {
                        mongoose.connection.close()
                        console.log(user)
                        res.json({balance: user.balance, items: user.investments})
                    }).catch((error: any) => {
                        mongoose.connection.close()
                        res.status(500).send(error)
                    }
                )
            } else {
                mongoose.connection.close()
                res.status(404).send('User not found')
            }
        })
})

app.get('/api/investments', (req, res) => {
    const username = req.query.username
    User.findOne({username: username})
        .then((user: typeof User) => {
            if (user) {
                const maindata: GetInvestmentType[] = []
                for (let i = 0; i < user.investments.length; i++) {
                    const investment = user.investments[i]
                    if (investment.type === "Stock") {
                        console.log(investment.symbol)
                        // axios.get(`https://finnhub.io/api/v1/quote?symbol=${investmentS}&token=ccaebnqad3i0kro2s54g`)
                        finnhubClient.quote(investment.symbol, (error: any, data: any, response: any) => {
                            if (error) {
                                console.log(error)
                                mongoose.connection.close()
                            } else {
                                const investmentData: GetInvestmentType = {
                                    symbol: investment.symbol,
                                    initialPrice: investment.initialPrice,
                                    currentPrice: data.c,
                                    type: investment.type,
                                    amount: investment.amount
                                }
                                maindata.push(investmentData)
                                if (maindata.length === user.investments.length) {
                                    let balance = user.balance
                                    for (let j = 0; j < maindata.length; j++) {
                                        const investment = maindata[j]
                                        balance = balance + (Number(investment.amount) * Number(investment.currentPrice))
                                    }
                                    mongoose.connection.close()
                                    res.json(
                                        {items: maindata, balance: balance}
                                    )
                                }
                            }
                        })
                    }
                }
            } else {
                mongoose.connection.close()
                res.status(404).send('User not found')
            }
        })
})

app.get('/api/currentPrice', (req, res) => {
    const symbol = req.query.symbol
    const type = req.query.type
    console.log(symbol, type)
    if (type === 'stock') {
        finnhubClient.quote(symbol, (error: any, data: any, response: any) => {
            if (error) {
                console.log(error)
            } else {
                res.json({price: data.c})
            }
        })
    }
})

const port = 3500
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
