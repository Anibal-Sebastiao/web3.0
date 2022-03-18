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
    const [trasactionCount, setTrasactionCount] = useState(localStorage.getItem('trasactionCount'))
    
    const handleChange = (e, name) => {
        setFormData((prevState) => ({
            ...prevState, 
            [name]: e.target.value
        }))
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum) return alert('Please Install Metamask')

            const accounts = await ethereum.request({method: 'eth_accounts'})

            if (accounts.length) {
                setCurrentAccount(accounts[0])
            }else{
                console.log('No account found');
            }
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
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const trasactionCount = await transactionsContrat.getTransactionCount();
            setTrasactionCount(trasactionCount.toNumber())

        } catch (error) {
            console.log(error);
            throw new Error('No ethereum object')
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, [])
    return (
        <TransactionContext.Provider value={{connectWallet, currentAccount, formData, handleChange, sendTransaction}}>
            {children}
        </TransactionContext.Provider>
    )
}
