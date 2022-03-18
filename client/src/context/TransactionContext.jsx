import React, {useEffect, useState} from 'react'
import { ethers } from 'ethers' 
import { contractABI, contractAddress } from '../utils/constants'

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionsContrat = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionsContrat;
}

export const TransactionsProvider = ({children}) => {
    const [currentAccount, setCurrentAccount] = useState()
    const [formData, setFormData] = useState({addressTo: '', amount: '', keyword: '', message: '' })
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setFormData((prevState) => ({
            ...prevState, 
            [name]: e.target.value
        }))
    }

    const getAllTransactions = async() => {
        try {
            if(!ethereum) return alert('Please Install Metamask')
            const transactionsContrat = getEthereumContract();
            const availableTransactions = await transactionsContrat.getAllTransactions();
            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
              }));      
              setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error);
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum) return alert('Please Install Metamask')

            const accounts = await ethereum.request({method: 'eth_accounts'})

            if (accounts.length) {
                setCurrentAccount(accounts[0])
                getAllTransactions();
            }else{
                console.log('No account found');
            }
        } catch (error) {
            console.log(error);
            throw new Error('No ethereum object')
        }
    }

    const checkIfTrasactionsExixt = async () => {
        try {
            const transactionsContrat = getEthereumContract();
            const transactionCount = await transactionsContrat.TansactionsCount();
            window.localStorage.setItem('transactionCount', transactionCount)
        } catch (error) {
            console.log(error);
            throw new Error('No ethereum object')
        }
    }

    const connectWallet = async() => {
        try {
            if(!ethereum) return alert('Please Install Metamask')
            const accounts = await ethereum.request({method: 'eth_requestAccounts'})
            setCurrentAccount(accounts);
            window.location.reload(); 
        } catch (error) {
            console.log(error);
            throw new Error('No ethereum object')
        }
    }

    const sendTransaction = async() => {
        try {
            if(!ethereum) return alert('Please Install Metamask')

            const {addressTo, amount, keyword, message } = formData;
            const transactionsContrat = getEthereumContract();

            const ParseAmount = ethers.utils.parseEther(amount)

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', // 2100
                    value: ParseAmount._hex
                }]
            });

            const transactionHash = await transactionsContrat.addToBlockchain(addressTo, ParseAmount, message, keyword );
            setIsLoading(true);
            await transactionHash.wait();
            setIsLoading(false);


            const transactionCount = await transactionsContrat.getTransactionCount();
            setTransactionCount(transactionCount.toNumber())

        } catch (error) {
            console.log(error);
            throw new Error('No ethereum object')
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTrasactionsExixt();
    }, [transactionCount])
    return (
        <TransactionContext.Provider value={{connectWallet, currentAccount, formData, handleChange, sendTransaction, isLoading, transactions}}>
            {children}
        </TransactionContext.Provider>
    )
}
