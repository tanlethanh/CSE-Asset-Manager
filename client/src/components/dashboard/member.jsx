import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import './member.css';
import Waiting from './member/memberWaiting';
import Borrow from './member/memberBorrow';
import Returned from './member/memberReturn';


export default function Member(props) {
    const tabs = ['Waiting list', 'Borrowing list', 'Returned list']
    const arrWait = []
    const arrBorrow = []
    const arrReturn = []
    const [currentTab, setCurrentTab] = useState('Waiting list')
    const [waitingList, setWaitingList] = useState([])
    const [borrowList, setBorrowList] = useState([])
    const [returnList, setReturnList] = useState([])
    const [change, setChange] = useState(Boolean)

    useEffect(() => {
        // setChange(!change)
    }, [returnList])

    useEffect(() => {
        props.user.orders.map((orderid, index) => {
            Axios.get(`http://localhost:8266/api/order/${orderid}`)
                .then((response) => {
                    const testWait = response.data.order.status != "done" && currentTab === "Waiting list"
                    const testBorrow = response.data.order.status == "ok" && currentTab === "Borrowing list"
                    if (testWait) {
                        arrWait.push(response.data.order)
                    } else if (testBorrow) {
                        arrBorrow.push(response.data.order)
                    } else {
                        arrReturn.push(response.data.order)
                    }
                    if (index === props.user.orders.length - 1) {
                        setWaitingList(arrWait)
                        setBorrowList(arrBorrow)
                        setReturnList(arrReturn)
                    }
                });
        });

    }, [])



    return (
        <div className="content">
            <div className="menu">
                <h1 className="menu_title" >LIST</h1>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={currentTab === tab ? "menu_list chosen" : "menu_list"}
                        onClick={() => { setCurrentTab(tab) }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div id="list">
                <div class="list-search">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Search item" />
                </div>

                {currentTab == "Waiting list" &&
                    <Waiting currentList={waitingList} setCurrentList={setWaitingList} />}
                {currentTab == "Borrowing list" &&
                    <Borrow currentList={borrowList} setCurrentList={setBorrowList} />}
                {currentTab == "Returned list" &&
                    <Returned currentList={returnList} setCurrentList={setReturnList} />}
            </div>
        </div>

    )
}