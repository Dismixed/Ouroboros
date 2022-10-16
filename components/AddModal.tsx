import React, {useState} from "react";

import InvestmentElem from "../components/InvestmentElem";
import TransactionsElem from "../components/TransactionsElem";
import DepositElem from "../components/DepositElem";

import TransactionType from "../types/TransactionType";
import InvestmentType from "../types/InvestmentType";

const AddModal = ({username, returnItems, returnInvestment}: {username: string, returnItems: (balance: number, items: TransactionType[]) => void, returnInvestment: (balance: number, items: any[]) => void}) => {
    const [addElem, setAddElem] = useState(<TransactionsElem username={username} returnItems={returnItems}/>);
    const [title, setTitle] = useState('Transaction');
    const [elemColors, setElemColors] = useState(['bg-green-600', '', '']);

    return (
        <div className="modal-box relative text-black dark:text-white">
            <label htmlFor="addModal" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
            <h3 className={'text-center text-2xl mb-2'}>Add {title}</h3>
            <div className={'w-full flex flex-row'}>
                <div className={`w-1/3 cursor-pointer text-center border dark:border-gray-500 p-2 ${elemColors[0]}`} onClick={() => {setAddElem(<TransactionsElem username={username} returnItems={(balance: number, items) => returnItems(balance, items)}/>); setTitle('Transaction'); setElemColors(['bg-green-600', '', ''])}}>Transactions</div>
                <div className={`w-1/3 cursor-pointer text-center border dark:border-gray-500 p-2 ${elemColors[1]}`} onClick={() => {setAddElem(<DepositElem username={username} returnItems={(balance: number, items) => returnItems(balance, items)}/>); setTitle('Deposit'); setElemColors(['', 'bg-green-600', ''])}}>Deposit</div>
                <div className={`w-1/3 cursor-pointer text-center border dark:border-gray-500 p-2 ${elemColors[2]}`} onClick={() => {setAddElem(<InvestmentElem username={username} returnInvestment={(balance: number, items: InvestmentType[] ) => returnInvestment(balance, items)} />); setTitle('Investment'); setElemColors(['', '', 'bg-green-600'])}}>Investment</div>
            </div>
            {addElem}
        </div>
    )
}

export default AddModal;