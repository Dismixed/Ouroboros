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

import bellIcon from '../public/bell-svgrepo-com.svg';
import chainIcon from '../public/chain-svgrepo-com.svg';
import overviewIcon from '../public/site-map-svgrepo-com.svg';
import stockIcon from '../public/stock-up-svgrepo-com.svg';

import TransactionType from "../types/TransactionType";
import InvestmentType from "../types/InvestmentType";

import {ResponsiveLine} from '@nivo/line';

import {
    usePlaidLink,
    PlaidLinkOptions,
    PlaidLinkOnSuccess,
} from 'react-plaid-link';

//TODO input validation on forms

//TODO onsubmit instead of onclick

//TODO allocations (show how much you should invest x amount into y to meet your % goals)

const Home = () => {
    const [accountBalance, setAccountBalance] = useState(0);
    const [dayStyles, setDayStyles] = useState(['text-dark dark:text-white', 'text-gray-400', 'text-gray-400', 'text-gray-400', 'text-gray-400', 'text-gray-400'])
    const [username, setUsername] = useState('');
    const [usernameValue, setUsernameValue] = useState('');
    const [password, setPassword] = useState('');
    const [usernameColor, setUsernameColor] = useState('');
    const [passwordColor, setPasswordColor] = useState('');
    const [userError, setUserError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [colorMode, setColorMode] = useState("light");
    const [navWidth, setNavWidth] = useState("w-16");
    const [navOut, setNavOut] = useState(false);
    const [linkToken, updateLinkToken] = useState('');
    const [accessToken, setAccessToken] = useState('')

    const options: PlaidLinkOptions = {
        onSuccess: (public_token: string, metadata: any) => {
            axios.post('https://ouroboros-123.herokuapp.com/api/exchange_public_token', {public_token: public_token})
                .then((res) => {
                    console.log(res.data.access_token)
                    axios.get('https://ouroboros-123.herokuapp.com/accounts/balance?accessToken=' + res.data.access_token)
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

    useEffect(() => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setColorMode("dark");
        } else {
            setColorMode("light");
        }
    }, [])

    useEffect(() => {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
                const color = event.matches ? "dark" : "light";
                setColorMode(color)
            });
        }
    )

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
        setUsername('');
        setAccountBalance(0);
    }

    const getInvestments = (user: string) => {
        axios.get('http://localhost:3500/api/investments?username=' + user)
            .then((res) => {
                console.log(res.data)
                returnInvestment(res.data.balance, res.data.items)
            })
    }

    const returnInvestment = (balance: number, items: InvestmentType[]) => {
        setAccountBalance(balance);
        console.log(items)
    }

    const logIn = (e: React.MouseEvent) => {
        e.preventDefault()
        const userval = inputValidation(usernameValue, 'username')
        const passval = inputValidation(password, 'password')
        if (userval && passval) {
            axios.post('https://ouroboros-123.herokuapp.com/api/login', {
                username: usernameValue,
                password: password
            }).then(res => {
                setUsername(usernameValue)
                setTransactions(res.data.items)
                setAccountBalance(res.data.balance)
                clearForm()
                const ele = document.getElementById('loginModal') as HTMLInputElement
                ele.checked = false;
                axios.post('https://ouroboros-123.herokuapp.com/api/create_link_token', {username: username})
                    .then((res) => {
                        updateLinkToken(res.data.link_token)
                    })
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
            axios.post('https://ouroboros-123.herokuapp.com/api/signup', {"username": usernameValue, "password": password})
                .then((response) => {
                    const ele = document.getElementById('signupModal') as HTMLInputElement
                    ele.checked = false;
                    clearForm()
                    setUsername(usernameValue)
                })
                .catch((error) => {
                    console.log(error)
                    if (error) {
                        if (error.response.status == 400) {
                            setUserError('User already exists')
                            setUsernameColor('border-red-500')
                        }
                    }
                })
        }

    }

    const data = [
        {
            id: "total",
            "color": "#085910",
            "data": [
                {
                    "x": "2020-01-01",
                    "y": 2
                },
                {
                    "x": "2020-01-02",
                    "y": 3
                },
                {
                    "x": "2020-01-03",
                    "y": 5
                },
                {
                    "x": "2020-01-04",
                    "y": 4
                },
                {
                    "x": "2020-01-05",
                    "y": 6
                }
            ]
        }
    ]

    const navHover = (bool: boolean) => {
        if (bool) {
            setNavWidth('w-64')
            setNavOut(true)
        } else{
            setNavWidth('w-16')
            setNavOut(false)
        }
    }

    return (
        <div>
            <button className={'rounded-full text-white bg-gradient-to-br from-green-400 to-green-700 ' +
                'flex flex-row items-center justify-center h-12 w-12 fixed bottom-4 right-4 text-2xl'}
                    onClick={() => document.getElementById('addModal').checked = true}>+</button>
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
                        <button className={'btn bg-green-600 hover:bg-green-500 text-white mt-4'} onClick={(e) => logIn(e)}>Submit</button>
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
                <div className={'h-[56rem] w-screen bg-[#f7f7f7] dark:bg-[#151718] dark:text-white'}>
                    <div className={'h-full w-full'}>
                        <nav onMouseEnter={() => navHover(true)} onMouseLeave={() => navHover(false)}
                             className={`transition-all z-20 h-screen ${navWidth} bg-gray-300 p-4 text-black fixed left-0 top-0 bottom-0 dark:bg-[#2e2f36] dark:text-white`}>
                            <div className={'h-full flex flex-col items-center gap-12'}>
                                {navOut ? <h1 className={'text-3xl mt-4 font-bold'}>Ouroboros</h1> : <h1 className={'text-3xl mt-4 font-bold'}>O</h1>}
                                <div className={'w-full h-full flex flex-col items-center gap-6'}>
                                    <Link href={'/portfolio'}>
                                        <div className={'flex flex-row gap-2'}>
                                            <div className={'h-6 w-6 relative transition-all'}>
                                                <Image id={"filter"} src={overviewIcon} layout={'fill'} objectFit={'contain'}/>
                                            </div>
                                            {navOut ? <h2 className={'text-lg font-bold '}>Portfolio</h2> : null}
                                        </div>
                                    </Link>
                                    <Link href={'/stocks'}>
                                        <div className={'flex flex-row gap-2'}>
                                            <div className={'h-8 w-8 relative transition-all'}>
                                                <Image id={"filter"} src={stockIcon} layout={'fill'} objectFit={'contain'}/>
                                            </div>
                                            {navOut ? <h2 className={'text-lg font-bold '}>Stocks</h2> : null}
                                        </div>
                                    </Link>
                                    <Link href={'/crypto'}>
                                        <div className={'flex flex-row gap-2'}>
                                            <div className={'h-6 w-6 relative transition-all'}>
                                                <Image id={"filter"} src={chainIcon} layout={'fill'} objectFit={'contain'}/>
                                            </div>
                                            {navOut ? <h2 className={'text-lg font-bold '}>Crypto</h2> : null}
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </nav>
                        <div className={'w-screen pl-20 text-black dark:text-white pr-4 pt-4'}>
                            <div className={'flex flex-row justify-between'}>
                                <form className="flex items-center">
                                    <label htmlFor="simple-search" className="sr-only">Search</label>
                                    <div className="relative w-96">
                                        <div
                                            className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                            <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                                 fill="currentColor" viewBox="0 0 20 20"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd"
                                                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                                      clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <input type="text" id="simple-search"
                                               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                               placeholder="Search" />
                                    </div>
                                </form>
                                <div className={'flex flex-row items-center gap-4'}>
                                    {username === "" ? <label htmlFor="loginModal" className="btn mt-auto modal-button text-white">Log in</label>
                                        : <div className={'mr-1 flex flex-row items-center gap-6'}>
                                            <div className={'h-6 w-6 relative'}>
                                                <Image src={bellIcon} layout={'fill'} objectFit={'contain'} id={"filter"}/>
                                                <div className={'absolute bottom-0 left-0 h-2 w-2 rounded-xl bg-sky-400 opacity-75 animate-ping'}>

                                                </div>
                                            </div>
                                            <div tabIndex={0} className={'flex flex-row gap-2 items-center dropdown dropdown-left'}>
                                                <div className={'h-8 w-8 relative rounded-full bg-white'}>

                                                </div>
                                                <h2 className={'text-lg font-bold'}>{username}</h2>
                                                <ul tabIndex={0}
                                                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                                    <button className={'w-full btn btn-ghost'} onClick={() => logOut()}>Log Out</button>
                                                    <button className={'w-full btn btn-ghost'} onClick={() => open()} disabled={!ready}>Connect with Plaid</button>
                                                </ul>
                                            </div>
                                        </div>}
                                </div>
                            </div>
                            <div className={'flex flex-col bg-gray-200 dark:bg-[#101112] mt-8 p-4 rounded-xl'}>
                                <div className={'flex flex-row justify-between '}>
                                    <div className={'flex flex-row'}>
                                        <h3 className={'text-3xl font-bold'}>Portfolio Value:</h3>
                                        <h3 className={'text-3xl font-bold ml-2'}>${accountBalance}</h3>
                                    </div>
                                    <div className={'flex flex-row gap-4'}>
                                        <p className={`${dayStyles[0]} cursor-pointer transition-all p-1`} onClick={() => setDayStyles(['text-black dark:text-white', 'text-gray-400', 'text-gray-400', 'text-gray-400', 'text-gray-400', 'text-gray-400'])}>1D</p>
                                        <p className={`${dayStyles[1]} cursor-pointer transition-all p-1`} onClick={() => setDayStyles(['text-gray-400', 'text-black dark:text-white', 'text-gray-400', 'text-gray-400', 'text-gray-400', 'text-gray-400'])}>7D</p>
                                        <p className={`${dayStyles[2]} cursor-pointer transition-all p-1`} onClick={() => setDayStyles(['text-gray-400', 'text-gray-400', 'text-black dark:text-white', 'text-gray-400', 'text-gray-400', 'text-gray-400'])}>1M</p>
                                        <p className={`${dayStyles[3]} cursor-pointer transition-all p-1`} onClick={() => setDayStyles(['text-gray-400', 'text-gray-400', 'text-gray-400', 'text-black dark:text-white', 'text-gray-400', 'text-gray-400'])}>3M</p>
                                        <p className={`${dayStyles[4]} cursor-pointer transition-all p-1`} onClick={() => setDayStyles(['text-gray-400', 'text-gray-400', 'text-gray-400', 'text-gray-400', 'text-black dark:text-white', 'text-gray-400'])}>1Y</p>
                                        <p className={`${dayStyles[5]} cursor-pointer transition-all p-1`} onClick={() => setDayStyles(['text-gray-400', 'text-gray-400', 'text-gray-400', 'text-gray-400', 'text-gray-400', 'text-black dark:text-white'])}>ALL</p>
                                    </div>
                                </div>
                                <div className={'w-full h-96'}>
                                    <ResponsiveLine
                                        data={data}
                                        colors={["#0fd923"]}
                                        margin={{ top: 50, right: 70, bottom: 50, left: 60 }}
                                        xScale={{ type: 'point' }}
                                        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
                                        theme={{background: colorMode == 'dark' ? "#101112" : "rgb(229 231 235)", textColor: colorMode == 'dark' ? "#ffffff" : "#000000", fontSize: 12, grid: {line: {stroke: "#5c5c5c", strokeWidth: 1}}, axis: {domain: {line: {stroke: "#2b2b2b", strokeWidth: 1}}, ticks: {line: {stroke: "#2b2b2b", strokeWidth: 1}}}}}
                                        enablePoints={true}
                                        pointSize={7}
                                    ></ResponsiveLine>
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