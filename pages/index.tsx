import React, {useEffect, useState} from "react";
import Image from 'next/image';
import axios from "axios";
import Link from "next/link";
import { Doughnut } from 'react-chartjs-2';

import icon from '../public/favicon.ico';
import plusicon from '../public/plusicon.svg';
import circleplus from '../public/circleplus.svg';
import circleminus from '../public/circleminus.svg';

import {
    usePlaidLink,
    PlaidLinkOptions,
    PlaidLinkOnSuccess,
} from 'react-plaid-link';

//TODO input validation on forms
const TransactionsElem = ({username, returnItems}: {username: string, returnItems: (balance: number, items: any[]) => void}) => {
    const [transAmount, setTransAmount] = useState('');
    const [transDate, setTransDate] = useState('');
    const [transType, setTransType] = useState('');

    const submitTransaction = (e: any) => {
        e.preventDefault();
        console.log(transType)
        axios.patch('http://localhost:3500/api/transaction', {
            username: username,
            date: transDate,
            type: 'transaction',
            desc: transType,
            amount: transAmount
        })
            .then((res) => {
                document.getElementById('addModal').checked = false
                returnItems(res.data.balance, res.data.items);
            })
    }

    console.log(transType)
    return (
        <div className={'h-full w-full mt-4'}>
            <div className={'flex flex-col items-center justify-center'}>
                <form className="flex flex-col">
                    <label className={'text-lg'}>Transaction Type</label>
                    <select value={transType} onChange={(e) => setTransType(e.target.value)} className="select select-bordered w-full max-w-xs">
                        <option>Purchase</option>
                        <option>Withdrawal</option>
                        <option>Other</option>
                    </select>
                    <label className={'text-lg'}>Transaction Amount</label>
                    <input value={transAmount} onChange={(e) => setTransAmount(e.target.value)} type={'text'} className={`input input-bordered`} />
                    <label className={'text-lg'}>Transaction Date</label>
                    <input type={'date'} value={transDate} onChange={(e) => setTransDate(e.target.value)} className={`input input-bordered`} />
                    <button className={'btn btn-accent mt-4'} onClick={(e) => submitTransaction(e)}>Submit</button>
                </form>
            </div>
        </div>
    )
}

//TODO onsubmit instead of onclick
const DepositElem = ({username, returnItems}: {username: string, returnItems: (balance: number, items: any[]) => void}) => {
    const [depositAmount, setDepositAmount] = useState('');
    const [depositDate, setDepositDate] = useState('');

    const submitDeposit = (e) => {
        e.preventDefault();
        console.log(username)
        axios.patch('http://localhost:3500/api/deposit', {username: username, amount: depositAmount, date: depositDate})
            .then((res) => {
                console.log(res);
                document.getElementById('addModal').checked = false
                returnItems(res.data.balance, res.data.items);
            })
    }

    return (
        <div className={'h-full w-full mt-4'}>
            <div className={'flex flex-col items-center justify-center'}>
                <form className="flex flex-col">
                    <label className={'text-lg'}>Deposit Amount</label>
                    <input value={depositAmount} min={'1'} step={'any'} onChange={(e) => setDepositAmount(e.target.value)} type={'number'} className={`input input-bordered`} />
                    <label className={'text-lg'}>Deposit Date</label>
                    <input type={'date'} value={depositDate} onChange={(e) => setDepositDate(e.target.value)} className={`input input-bordered`} />
                    <button className={'btn btn-accent mt-4'} onClick={(e) => submitDeposit(e)}>Submit</button>
                </form>
            </div>
        </div>
    )
}

const InvestmentElem = () => {
    const [budgetAmount, setBudgetAmount] = useState('');
    const [budgetStartDate, setBudgetStartDate] = useState('');
    const [budgetEndDate, setBudgetEndDate] = useState('');

    return (
        <div className={'h-full w-full mt-4'}>
            <div className={'flex flex-col items-center justify-center'}>
                <form className="flex flex-col">
                    <label className={'text-lg'}>Budget Amount</label>
                    <input value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} type={'text'} className={`input input-bordered`} />
                    <label className={'text-lg'}>Budget Start Date</label>
                    <input type={'date'} value={Date.now()} className={`input input-bordered`} />
                    <label className={'text-lg'}>Budget End Date</label>
                    <input type={'date'} value={Date.now()} className={`input input-bordered`} />
                    <button className={'btn btn-accent mt-4'}>Submit</button>
                </form>
            </div>
        </div>
    )
}

const LogggedIn = ({username, logOut}: {username: string, logOut: () => void, setLinkToken: () => void}) => {
    const [linkToken, updateLinkToken] = useState('');
    const [accessToken, setAccessToken] = useState('')
    useEffect(() => {
        axios.post('http://localhost:3500/api/create_link_token', {username: username})
            .then((res) => {
                updateLinkToken(res.data.link_token)
            })
    }, [username])

    const options: PlaidLinkOptions = {
        onSuccess: (public_token: string, metadata: any) => {
            axios.post('http://localhost:3500/api/exchange_public_token', {public_token: public_token})
                .then((res) => {
                    console.log(res.data.access_token)
                    axios.get('http://localhost:3500/api/accounts/balance?accessToken=' + res.data.access_token)
                        .then((res) => {
                            console.log(res)
                        })
                    setAccessToken(res.data.access_token)

                })
        },
        onExit: (err: any, metadata: any) => {},
        onEvent: (eventName: string, metadata: any) => {},
        token: linkToken
    }

    const { open, ready } = usePlaidLink(options);

    return (
        <div tabIndex="0" className={'self-end dropdown dropdown-top mt-auto cursor-pointer rounded-xl p-1 w-full text-black text-xl flex flex-row gap-2 items-center dark:text-white'}
             onClick={() => {document.getElementById("drop").focus(); document.getElementById("caret").classList.add('rotate-180')}}>
            <ul tabIndex="0" id={'drop'} onBlur={() => document.getElementById("caret").classList.remove('rotate-180')}
                className="dropdown-content mb-2 menu shadow rounded-box w-full text-white">
                <button className={'w-full btn btn-primary'} onClick={logOut}>Log Out</button>
                <button className={'w-full btn mt-1 btn-primary'} onClick={() => open()} disabled={!ready}>Connect with Plaid</button>
            </ul>
            <div className={'w-6 h-6 relative'}>
                <Image src={icon} layout={'fill'} objectFit={'contain'}/>
            </div>
            <div className={'h-full'}>
                <label className={'font-bold text-2xl'}>{username}</label>
            </div>
            <div className={'ml-auto mr-2 transition-all'} id={'caret'}>⋁</div>
        </div>
    )
}

const AddModal = ({username, returnItems}: {username: string, returnItems: (balance: number, items: any[]) => void}) => {
    const [addElem, setAddElem] = useState(<TransactionsElem />);
    const [title, setTitle] = useState('Transaction');
    const [elemColors, setElemColors] = useState(['bg-accent', '', '']);

    return (
        <div className="modal-box relative text-black dark:text-white">
            <label htmlFor="addModal" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
            <h3 className={'text-center text-2xl mb-2'}>Add {title}</h3>
            <div className={'w-full flex flex-row'}>
                <div className={`w-1/3 cursor-pointer text-center border dark:border-gray-500 p-2 ${elemColors[0]}`} onClick={() => {setAddElem(<TransactionsElem username={username} returnItems={(balance: number, items: any[]) => returnItems(balance, items)}/>); setTitle('Transaction'); setElemColors(['bg-accent', '', ''])}}>Transactions</div>
                <div className={`w-1/3 cursor-pointer text-center border dark:border-gray-500 p-2 ${elemColors[1]}`} onClick={() => {setAddElem(<DepositElem username={username} returnItems={(balance: number, items: any[]) => returnItems(balance, items)}/>); setTitle('Deposit'); setElemColors(['', 'bg-accent', ''])}}>Deposit</div>
                <div className={`w-1/3 cursor-pointer text-center border dark:border-gray-500 p-2 ${elemColors[2]}`} onClick={() => {setAddElem(<InvestmentElem username={username} returnItems={(balance: number, items: any[]) => returnItems(balance, items)}/>); setTitle('Budget'); setElemColors(['', '', 'bg-accent'])}}>Budget</div>
            </div>
            {addElem}
        </div>
    )
}

const AddElems = () => {
    return (
        <div className={'h-full w-full grid grid-cols-2 gap-4'}>
            <div className={'col-span-1'}>
                <div className={'h-full w-full bg-[#38CDBE] rounded-xl'}>

                </div>
            </div>
            <div className={'col-span-1'}>
                <button className={'btn btn-accent h-full w-full shadow-lg flex flex-row justify-center items-center rounded-xl'}  onClick={() => document.getElementById('addModal').checked = true}>
                    <div className={'h-1/2 w-1/2 relative'}>
                        <Image src={plusicon} layout={'fill'} objectFit={'contain'}/>
                    </div>
                </button>
            </div>
        </div>
    )
}

const Home = () => {
    const [accountBalance, setAccountBalance] = useState(0);
    const [target, setTarget] = useState('0');
    const [setTargetAmount, setSetTargetAmount] = useState('1');
    const [dayStyles, setDayStyles] = useState(['text-white', 'text-gray-400', 'text-gray-400'])
    const [username, setUsername] = useState('');
    const [usernameValue, setUsernameValue] = useState('');
    const [password, setPassword] = useState('');
    const [usernameColor, setUsernameColor] = useState('');
    const [passwordColor, setPasswordColor] = useState('');
    const [userError, setUserError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loggedInElem, setLoggedInElem] = useState(<label htmlFor="loginModal" className="btn mt-auto modal-button text-white">Log in</label>);
    const [addElem, setAddElem] = useState(<div></div>)
    const [transactions, setTransactions] = useState<any[]>([]);
    const [linkToken, setLinkToken] = useState(null)

    const returnItems = (balance: number, items: any[]) => {
        setTransactions(items);
        setAccountBalance(balance);
    }

    const setTime = (time: '1' | '7' | '30') => {
        if (time == '1') {
            setDayStyles(['text-white', 'text-gray-400', 'text-gray-400'])
        } else if (time == '7') {
            setDayStyles(['text-gray-400', 'text-white', 'text-gray-400'])
        } else if (time == '30') {
            setDayStyles(['text-gray-400', 'text-gray-400', 'text-white'])
        }
    }

    const inputValidation = (input: string, type: 'username' | 'password') => {
        if (type === 'username') {
            if (input.length === 0) {
                setUserError('Username is required')
                setUsernameColor('border-red-500')
                return false
            }
            else {
                setUsernameColor('border-green-500')
                return true
            }
        } else if (type === 'password') {
            if (input.length === 0) {
                setPasswordError('Password is required')
                setPasswordColor('border-red-500')
                return false
            }
            else {
                setPasswordColor('border-green-500')
                return true
            }
        }
    }

    const logOut = () => {
        setLoggedInElem(<label htmlFor="loginModal" className="btn mt-auto modal-button text-white">Log in</label>);
        setAddElem(<div></div>);
    }

    const logIn = (e) => {
        e.preventDefault()
        const userval = inputValidation(usernameValue, 'username')
        const passval = inputValidation(password, 'password')
        if (userval && passval) {
            axios.post('http://localhost:3500/api/login', {
                username: usernameValue,
                password: password
            }).then(res => {
                setUsername(usernameValue)
                setLoggedInElem(<LogggedIn username={usernameValue} logOut={logOut}/>)
                setAddElem(<AddElems></AddElems>)
                setTransactions(res.data.items)
                setAccountBalance(res.data.balance)
                clearForm()
                document.getElementById('loginModal').checked = false;
            }).catch((error) => {
                console.log(error)
                if (error.response.status == 404) {
                    setUserError('Username does not exist')
                    setUsernameColor('border-red-500')
                    return
                }
                else if (error.response.status == 401) {
                    setPasswordError('Password is incorrect')
                    setPasswordColor('border-red-500')
                }
            })
        }
    }

    const clearForm = () => {
        setUsernameValue('');
        setUserError('');
        setPassword('');
        setPasswordError('');
        setUsernameColor('');
        setPasswordColor('');
    }

    const signUp = (e) => {
        e.preventDefault()
        const userval = inputValidation(usernameValue, 'username')
        const passval = inputValidation(password, 'password')
        if (userval && passval) {
            axios.post('http://localhost:3500/api/signup', {"username": usernameValue, "password": password})
                .then((response) => {
                    document.getElementById('signupModal').checked = false;
                    clearForm()
                    setUsername(usernameValue)
                    setLoggedInElem(<LogggedIn username={response.data.username}/>)
                    setAddElem(<AddElems></AddElems>)
                })
                .catch((error) => {
                    if (error.response.status == 400) {
                        setUserError('User already exists')
                        setUsernameColor('border-red-500')
                    }
                })
        }

    }

    return (
        <div>
            <input type="checkbox" id="signupModal" className="modal-toggle"/>
            <div className="modal">
                <div className="modal-box relative text-black dark:text-white">
                    <label htmlFor="signupModal" className="btn btn-sm btn-circle absolute right-2 top-2" onClick={() => clearForm()}>✕</label>
                    <h3 className="text-xl font-bold">Sign Up</h3>
                    <form className="flex flex-col mt-4">
                        <label className={'text-lg'}>Username</label>
                        <input value={usernameValue} onBlur={() => inputValidation(usernameValue, "username")} onChange={(e) => {setUsernameValue(e.target.value); setUserError(''); setUsernameColor('')}} type={'text'} className={`input input-bordered ${usernameColor}`} />
                        <label className={'text-md text-red-500'}>{userError}</label>
                        <label className={'text-lg mt-4'}>Password</label>
                        <input value={password} onBlur={() => inputValidation(password, "password")} onChange={(e) => {setPassword(e.target.value); setPasswordError(''); setPasswordColor('')}} type={'password'} className={`input input-bordered ${passwordColor}`} />
                        <label className={'text-md text-red-500'}>{passwordError}</label>
                        <button className={'btn btn-accent mt-4'} onClick={(e) => signUp(e)}>Submit</button>
                        <p className={'text-center mt-6'}>Need to <label className={'text-blue-400 cursor-pointer modal-button'} htmlFor={'loginModal'} onClick={() => {
                            document.getElementById('signupModal').checked = false;
                            clearForm()
                        }}>log in?</label></p>
                    </form>
                </div>
            </div>
            <input type="checkbox" id="loginModal" className="modal-toggle"/>
            <div className="modal">
                <div className="modal-box relative text-black dark:text-white">
                    <label htmlFor="loginModal" className="btn btn-sm btn-circle absolute right-2 top-2" onClick={() => clearForm()}>✕</label>
                    <h3 className="text-xl font-bold">Log In</h3>
                    <form className="flex flex-col mt-4">
                        <label className={'text-lg'}>Username</label>
                        <input value={usernameValue} onBlur={() => inputValidation(usernameValue, "username")} onChange={(e) => {setUsernameValue(e.target.value); setUserError(''); setUsernameColor('')}} type={'text'} className={`input input-bordered ${usernameColor}`} />
                        <label className={'text-md text-red-500'}>{userError}</label>
                        <label className={'text-lg mt-4'}>Password</label>
                        <input value={password} onBlur={() => inputValidation(password, "password")} onChange={(e) => {setPassword(e.target.value); setPasswordError(''); setPasswordColor('')}} type={'password'} className={`input input-bordered ${passwordColor}`} />
                        <label className={'text-md text-red-500'}>{passwordError}</label>
                        <button className={'btn btn-accent mt-4'} onClick={(e) => logIn(e)}>Submit</button>
                        <p className={'text-center mt-6'}>Need to <label className={'text-blue-400 cursor-pointer modal-button'} htmlFor={'signupModal'} onClick={() => {
                            document.getElementById('loginModal').checked = false;
                            clearForm()
                        }}>create an account?</label></p>
                    </form>
                </div>
            </div>
            <input type="checkbox" id="addModal" className="modal-toggle"/>
            <div className="modal">
                <AddModal username={username} returnItems={(balance, items) => returnItems(balance, items)}></AddModal>
            </div>
            <div>
                <div className={'h-screen w-screen bg-[#f7f7f7] dark:bg-[#151718] dark:text-white'}>
                    <div className={'h-full w-full grid grid-cols-4 p-4'}>
                        <div className={'h-full w-full col-span-1 pr-4'}>
                            <nav className={'h-full w-full bg-gray-200 p-4 text-black rounded-lg dark:bg-[#2e2f36] dark:text-white'}>
                                <div className={'h-full flex flex-col gap-12'}>
                                    <h1 className={'text-3xl mt-4 font-bold'}>Ouroboros</h1>
                                    <div className={'flex flex-col gap-2 text-xl w-full'}>
                                        <Link href={'/temppage'}>
                                            <a>Overview</a>
                                        </Link>
                                        <Link href={'/lending'}>
                                            <a>Lending</a>
                                        </Link>
                                    </div>
                                    {loggedInElem}
                                </div>
                            </nav>
                        </div>
                        <div className={'h-full w-full col-span-3 grid grid-rows-7 gap-2 pl-4 text-black dark:text-white'}>
                            <div className={'row-span-1 flex flex-row'}>
                                <div className={'flex flex-row items-center w-full h-full p-4'}>
                                    <div className={'flex flex-col w-2/5'}>
                                        <div className={'text-3xl'}>${accountBalance}</div>
                                        <div className={'text-md text-gray-600 dark:text-gray-400'}>Account balance:</div>
                                    </div>
                                    <div className={'flex flex-col w-2/5'}>

                                    </div>
                                    <div className={'w-1/5 h-full gap-4'}>
                                        {addElem}
                                    </div>
                                </div>
                            </div>
                            <div className={'row-span-4'}>
                                <div className={'grid grid-cols-7 gap-6 h-full w-full'}>
                                    <div className={'col-span-4'}>
                                        <div className={'flex flex-col h-full bg-gray-300 dark:bg-[#0f1112] gap-8 p-4 rounded-lg'}>
                                            <div className={'flex flex-row gap-2 ml-1'}>
                                                <div className={`text-md ${dayStyles[0]} cursor-pointer`} onClick={() => setTime('1')}>1D</div>
                                                <div className={`text-md ${dayStyles[1]} cursor-pointer`} onClick={() => setTime('7')}>7D</div>
                                                <div className={`text-md ${dayStyles[2]} cursor-pointer`} onClick={() => setTime('30')}>30D</div>
                                            </div>
                                            <div className={'w-full flex flex-row items-center'}>

                                            </div>
                                        </div>
                                    </div>
                                    <div className={'flex flex-col col-span-3 p-4 bg-gray-300 gap-2 rounded-lg dark:bg-[#0f1112]'}>
                                        <div className={'w-full flex flex-row items-center'}>
                                            <div className={'text-4xl'}>Transactions</div>
                                        </div>
                                        <div className={'flex flex-col w-full'}>
                                            <div className={'flex flex-col h-72 w-full mt-4 overflow-scroll'}>
                                                {transactions.map((item: any, index: number) => {
                                                    return (
                                                        <div key={index} className={'flex shrink-0 flex-row items-center w-full h-16 shadow-sm rounded-xl'}>
                                                            <div className={'h-full w-10 relative mr-4'}>
                                                                {item.type == 'deposit' ? <Image src={circleplus} objectFit={'contain'} layout={'fill'}></Image>
                                                                    : <Image src={circleminus} objectFit={'contain'} layout={'fill'}></Image>}
                                                            </div>
                                                            <div className={'flex flex-col gap-2'}>
                                                                <div className={'text-md'}>{item.desc}</div>
                                                                <div className={'text-sm text-gray-600'}>{item.date.substring(0, 10)}</div>
                                                            </div>
                                                            <p className={'ml-auto mr-2'}>{item.type == 'deposit' ? <p>+${item.amount}</p> : <p>-${item.amount}</p>}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={'row-span-2 mt-4'}>
                                <div className={'grid grid-cols-7 w-full h-full gap-6 bg-gray-300 rounded-lg dark:bg-[#0f1112]'}>
                                    <div className={'flex flex-col col-span-4 gap-4 p-4 w-full flex flex-row justify-center'}>
                                        <div>
                                            <div className={'text-3xl mb-2'}>Holdings</div>

                                        </div>
                                        <progress className={'progress progress-accent w-full'} value={100} max={1000}></progress>
                                    </div>
                                    <div className={'col-span-3'}>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Home