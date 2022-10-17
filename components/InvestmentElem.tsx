import React, {useState} from "react";
import axios from 'axios'

import InvestmentType from '../types/InvestmentType'

const InvestmentElem = ({username, returnInvestment}: {username: string, returnInvestment: (balance: number, items: InvestmentType[]) => void}) => {
    const [investmentType, setInvestmentType] = useState('');
    const [investmentSymbol, setInvestmentSymbol] = useState('');
    const [investmentAmount, setInvestmentAmount] = useState('');
    const [investmentPrice, setInvestmentPrice] = useState(0);

    const getPrice = () => {
        if (investmentType === 'Stock') {
            axios.get('http://localhost:3500/api/currentPrice?symbol=' + investmentSymbol + '&type=stock')
                .then((res) => {
                    console.log(res)
                    setInvestmentPrice(res.data.price)
                })
        }
        else {
            axios.get(`https://api.coingecko.com/api/v3/coins/${investmentSymbol}`)
                .then((res) => {
                    setInvestmentPrice(res.data.market_data.current_price.usd)
                })
        }
    }

    const submitForm = (e: React.MouseEvent) => {
        e.preventDefault();
        axios.post('http://localhost:3500/api/investment', {
            type: investmentType,
            symbol: investmentSymbol,
            amount: investmentAmount,
            price: investmentPrice,
            username: username,
        }).then((response) => {
            console.log(response);
            const ele = document.getElementById('addModal') as HTMLInputElement
            ele.checked = false
            returnInvestment(response.data.balance, response.data.items);
        })
    }
    return (
        <div className={'h-full w-full mt-4'}>
            <div className={'flex flex-col items-center justify-center'}>
                <form className="flex flex-col">
                    <label className={'text-lg'}>Investment Type</label>
                    <select value={investmentType} onChange={(e) => setInvestmentType(e.target.value)} className="select select-bordered w-full max-w-xs">
                        <option>Cryptocurrency</option>
                        <option>Stock</option>
                    </select>
                    <label className={'text-lg'}>Investment Symbol</label>
                    <input value={investmentSymbol} onChange={(e) => setInvestmentSymbol(e.target.value)} type={'text'} className={`input input-bordered`} />
                    <label className={'text-lg'}>Investment Amount</label>
                    <input value={investmentAmount} min={'1'} step={'any'} onChange={(e) => setInvestmentAmount(e.target.value)} type={'number'} className={`input input-bordered`} />
                    <label className={'text-lg'}>Investment Price</label>
                    <div className={'flex flex-row'}>
                        <input value={investmentPrice} min={'0.01'} step={'any'} onChange={(e) => setInvestmentPrice(Number(e.target.value))} type={'number'} className={`input w-3/4 input-bordered`} />
                        <label className={'text-blue-500 w-1/4 text-sm text-end cursor-pointer'} onClick={() => getPrice()}>Current Price</label>
                    </div>
                    <button className={'btn bg-green-700 hover:bg-green-600 text-white mt-4'} onClick={(e) => submitForm(e)}>Submit</button>
                </form>
            </div>
        </div>
    )
}

export default InvestmentElem;