import Image from "next/image";
import icon from "../public/favicon.ico";
import React from "react";

const LoggedIn = ({username, logOut}: {username: string, logOut: () => void}) => {
    return (
        <div tabIndex={0} className={'self-end dropdown dropdown-top mt-auto cursor-pointer rounded-xl p-1 w-full text-black text-xl flex flex-row gap-2 items-center dark:text-white'}
             onClick={() => {document.getElementById("drop").focus(); document.getElementById("caret").classList.add('rotate-180')}}>
            <ul tabIndex={0} id={'drop'} onBlur={() => document.getElementById("caret").classList.remove('rotate-180')}
                className="dropdown-content mb-2 menu shadow rounded-box w-full text-white">
                <button className={'w-full btn btn-primary'} onClick={logOut}>Log Out</button>
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

export default LoggedIn;