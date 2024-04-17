import Web3 from 'web3';

import { useEffect, useState } from 'react';
import { contract_t_Abi, contract_t_Address } from './utils/constants';

const web3 = new Web3("ws://127.0.0.1:8545");
console.log(web3);
const ipCoin = new web3.eth.Contract(contract_t_Abi, contract_t_Address);
console.log(ipCoin);

console.log(contract_t_Address);
const balance_1_f = await ipCoin.methods.balanceOf("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");
const balance_1 =  await balance_1_f.call();
console.log("balance", balance_1);


const App = () => {

const [currentAccount, setCurrentAccount] = useState('');
const [amount, setAmount] = useState("");
const [correctNetwork, setCorrectNetwork] = useState(false);


useEffect(() => {
  const fetchData = async () => {
    await connectWallet();
    //await checkCorrectNetwork();
    //const amount = await getAmount();
    //setAmount(amount);
  };
  fetchData();
}, []);


  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
   
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Metamask not detected')
        return
      }
      let chainId = await ethereum.request({ method: 'eth_chainId'})
      console.log('Connected to chain:' + chainId)

      const hardhatChainID = '0x7a69'

      if (chainId !== hardhatChainID) {
        alert('You are not connected to the Hardhat Testnet!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Found account', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log('Error connecting to metamask', error)
    }
  }


/*
  // Checks if wallet is connected to the correct network
  const checkCorrectNetwork = async () => {
    const { ethereum } = window
    let chainId = await ethereum.request({ method: 'eth_chainId' })
    console.log('Connected to chain:' + chainId)

    const hardhatChainID = '0x7a69'

    if (chainId !== hardhatChainID) {
      setCorrectNetwork(false)
    } else {
      setCorrectNetwork(true)
    }
  }

  const getAmount = async () => {
    try {
      console.log("test_1");
      const amount = await ipCoin.methods.getBlockReward().call().then((balance) => {
        console.log(balance)
     });
      console.log("test_2");
      return amount;
    } catch (error) {
      console.error("Error fetching IPT transfer price:", error.message);
      return "N/A"; // Set a default value or handle the error as needed
    }
  };


  return (
    <div className="App">
      <h2>
        Current IPT Transfer Price:
        <span style={{ color: "blueviolet" }}>
          {amount}
        </span>
      </h2>
    </div>
  );
  */
};


export default App;


/*

import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { contract_t_Abi, contract_t_Address } from './utils/constants';

const web3 = new Web3("ws://localhost:8545");
const iptradeContract = new web3.eth.Contract(contract_t_Abi, contract_t_Address);

const App = () => {
  const [contractFunctions, setContractFunctions] = useState([]);

  useEffect(() => {
    const fetchContractFunctions = async () => {
      try {
        const contractMethods = iptradeContract.methods;
        const contractMethodsList = Object.keys(contractMethods).filter(
          (key) => typeof contractMethods[key] === 'function'
        );
        setContractFunctions(contractMethodsList);
      } catch (error) {
        console.error("Error fetching contract functions:", error.message);
      }
    };

    fetchContractFunctions();
  }, []);

  return (
    <div className="App">
      <h2>Contract Functions:</h2>
      <ul>
        {contractFunctions.map((func, index) => (
          <li key={index}>{func}</li>
        ))}
      </ul>
    </div>
  );
};


export default App;
*/