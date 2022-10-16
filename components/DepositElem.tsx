import React, {useState} from "react";
import axios from "axios";

import TransactionType from "../types/TransactionType";

const DepositElem = ({username, returnItems}: {username: string, returnItems: (balance: number, items: TransactionType[]) => void}) => {
    const [depositAmount, setDepositAmount] = useState('');
    const [depositDate, setDepositDate] = useState('');

    const submitDeposit = (e: React.MouseEvent) => {
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
                    <button className={'btn bg-green-700 hover:bg-green-600 text-white mt-4'} onClick={(e) => submitDeposit(e)}>Submit</button>
                </form>
            </div>
        </div>
    )
}

export default DepositElem;