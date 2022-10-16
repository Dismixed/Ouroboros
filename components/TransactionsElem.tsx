import React, {useState} from "react";
import axios from "axios";
import TransactionType from "../types/TransactionType";

const TransactionsElem = ({username, returnItems}: {username: string, returnItems: (balance: number, items: TransactionType[]) => void}) => {
    const [transAmount, setTransAmount] = useState('');
    const [transDate, setTransDate] = useState('');
    const [transType, setTransType] = useState('');

    const submitTransaction = (e: React.MouseEvent) => {
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
                    <button className={'btn bg-green-700 hover:bg-green-600 text-white mt-4'} onClick={(e) => submitTransaction(e)}>Submit</button>
                </form>
            </div>
        </div>
    )
}

export default TransactionsElem;