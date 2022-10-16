import React, {useEffect, useState} from "react";
import Image from 'next/image';
import axios from "axios";
import Link from "next/link";
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';


import AddModal from "../components/AddModal";
import LoggedIn from "../components/LoggedInElem";

import icon from '../public/favicon.ico';
import plusicon from '../public/plusicon.svg';
import circleplus from '../public/circleplus.svg';
import circleminus from '../public/circleminus.svg';

import TransactionType from "../types/TransactionType";
import InvestmentType from "../types/InvestmentType";

//TODO input validation on forms

//TODO onsubmit instead of onclick

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
    const [chart, setChart] = useState(<></>);

    const returnItems = (balance: number, items: TransactionType[]) => {
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
        setChart(<div></div>);
        setAccountBalance(0);
    }

    const getInvestments = (user: string) => {
        axios.get('http://localhost:3500/api/investments?username=' + user)
            .then((res) => {
                console.log(res.data)
                returnInvestment(res.data.balance, res.data.items)
            })
    }

    const randomColors = (length: number) => {
        const colors = [];
        for (let i = 0; i < length; i++) {
            let color = '#'+Math.floor(Math.random()*16777215).toString(16);
            colors.push(color);
        }
        return colors;
    }

    const returnInvestment = (balance: number, items: InvestmentType[]) => {
        setAccountBalance(balance);
        console.log(items)
        const prices = items.map((item) => item.currentPrice);
        const labels = items.map((item) => item.symbol);
        console.log(labels, prices)
        const data = {
            labels: labels,
            datasets: [{
                label: 'Investments',
                data: prices,
                backgroundColor: randomColors(prices.length),
                hoverOffset: 10
            }],
        }
        const options = {
            maintainAspectRatio: false,
            responsive: true,
        }
        setChart(<Chart type={'pie'} data={data} options={options} />)
    }

    const logIn = (e: React.MouseEvent) => {
        e.preventDefault()
        const userval = inputValidation(usernameValue, 'username')
        const passval = inputValidation(password, 'password')
        if (userval && passval) {
            axios.post('http://localhost:3500/api/login', {
                username: usernameValue,
                password: password
            }).then(res => {
                setUsername(usernameValue)
                setLoggedInElem(<LoggedIn username={usernameValue} logOut={logOut}/>)
                setAddElem(<AddElems></AddElems>)
                setTransactions(res.data.items)
                setAccountBalance(res.data.balance)
                getInvestments(usernameValue)
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

    const signUp = (e: React.MouseEvent) => {
        e.preventDefault()
        const userval = inputValidation(usernameValue, 'username')
        const passval = inputValidation(password, 'password')
        if (userval && passval) {
            axios.post('http://localhost:3500/api/signup', {"username": usernameValue, "password": password})
                .then((response) => {
                    document.getElementById('signupModal').checked = false;
                    clearForm()
                    setUsername(usernameValue)
                    setLoggedInElem(<LoggedIn username={response.data.username} logOut={() => logOut()}/>)
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
                <AddModal username={username} returnItems={(balance, items) => returnItems(balance, items)} returnInvestment={(balance, items) => returnInvestment(balance, items)}></AddModal>
            </div>
            <div>
                <div className={'h-screen w-screen bg-[#f7f7f7] dark:bg-[#151718] dark:text-white'}>
                    <div className={'h-full w-full grid grid-cols-4 p-4'}>
                        <div className={'h-full w-full col-span-1 pr-4'}>
                            <nav className={'h-full w-full bg-gray-200 p-4 text-black rounded-lg dark:bg-[#2e2f36] dark:text-white'}>
                                <div className={'h-full flex flex-col gap-12'}>
                                    <h1 className={'text-3xl mt-4 font-bold'}>Ouroboros</h1>
                                    <div className={'flex flex-col gap-2 text-xl w-full'}>
                                        <Link href={'/'}>
                                            <a>Overview</a>
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
                                        <div className={'h-full bg-gray-300 dark:bg-[#0f1112] grid grid-rows-8 p-4 rounded-lg'}>
                                            <h3 className={'text-4xl row-span-1'}>Investments</h3>
                                            <div className={'row-span-7 w-full h-full relative'}>
                                                {chart}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={'flex flex-col h-full col-span-3 p-4 bg-gray-300 gap-2 rounded-lg dark:bg-[#0f1112]'}>
                                        <h3 className={'text-4xl'}>Transactions</h3>
                                        <div className={'flex flex-col w-full'}>
                                            <div className={'flex flex-col h-80 w-full mt-4 overflow-scroll'}>
                                                {transactions.map((item, index: number) => {
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