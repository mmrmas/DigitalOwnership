"use client";

import Head from "next/head.js";
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import { useState, useEffect, useCallback } from "react";
import { Web3 } from 'web3';
import contracts from "../../blockchain/iptest.js"; //
import "bulma/css/bulma.css";
import styles from "../../styles/ipt.module.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image.js';

const IPTContract = contracts.IPTContract;
const IPTAddress = contracts.IPTContract._address;
console.log("add", IPTContract);
const IPtrade = contracts.IPtrade;
const IPtradeAddress = IPtrade.options.address;
const ethScanUrl = `https://etherscan.io/address/${IPtradeAddress}`;
const buttonWidth = "15%";
const decimals = 1000000000000000000;


const IpTrade = () => {
  const [currentView, setCurrentView] = useState('approve');
  const [faucet, setFaucet] = useState("");
  const [registrationPrice, setRegistrationPrice] = useState("");
  const [transferPrice, setTransferPrice] = useState("");
  const [approveAddress, setApproveAddress] = useState(IPtradeAddress);
  const [approveAmount, setApproveAmount] = useState("");
  const [readApproval, setReadApproval] = useState("");
  const [loading, setLoading] = useState(true);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [registeredsha512, setRegisteredsha512] = useState("");
  const [checkedsha512, setCheckedsha512] = useState("");
  const [checkedsha512Address, getCheckedsha512Address] = useState("");
  const [checkedsha512FirstRegistration, getCheckedsha512FirstRegistration] = useState("");
  const [offeredsha512, setOfferedsha512] = useState("");
  const [offeredAddress, setOfferedAddress] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");
  const [buyingsha512, setBuyingsha512] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [transferEvent, setTransferEvent] = useState("");
  const [thisLockTime, setThisLockTime] = useState("");
  const [IPOnAddress, setIPOnAddress] = useState("");
  const [transferAddresEvents, setTransferAddresEvents] = useState("");
  const [registrationAddresEvents, setRegistrationAddresEvents] = useState("");
  const [mdxContent, setMdxContent] = useState(null);





  const connectWalletHandler = async () => {
    console.log("connect wallet");
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        let provider = window.ethereum;
        if (window.ethereum.providers?.length) {
          window.ethereum.providers.forEach(async (p) => {
            if (p.isMetaMask) provider = p;
          });
        } 

        let accounts = await provider.request({
          method: "eth_requestAccounts",
          params: [],
        });
        setAccounts(accounts);


        let web3 = new Web3(window.ethereum);
        setWeb3(web3);
        setLoading(false);

        console.log("MetaMask is installed!");
      } else {
        console.log("Please install Metamask");
        showError("Please install Metamask");
        return;
      }

  };





  // Common function to handle errors
  const handleError = (err, addressErrorMessage, uintErrorMessage) => {
    if (err && err.message) {
      err = err.message;
    }
    const errorMessage = err.toString();
    const match_address = errorMessage.match(/value "([^"]+)" at "\/0" must pass "address" validation/);
    const match_uint = errorMessage.match(/value "([^"]+)" at "\/1" must pass "uint256" validation/);
    const match_denied = errorMessage.match(/denied/);
    console.log(errorMessage);
    if (match_denied) {
      console.log("Match found:", match_denied[0]);
  } else {
      console.log("No match found");
  }

    if (match_address && match_address[0]) {
      console.error('Caught specific error:', match_address[0]);
      showError(addressErrorMessage);
    } else if (match_uint && match_uint[0]) {
      console.error('Caught specific error:', match_uint[0]);
      showError(uintErrorMessage);
    } else if (match_denied && match_denied[0]) {
      console.error('Caught specific error:', match_denied[0]);
      showError("User denied transaction");
    } else {
      console.error('Caught an error:', errorMessage);
      showError(errorMessage);
    }
  };

  // Function to set approval
  const setApprovalHandler = async () => {
    try {
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPTContract.options.address,
            data: IPTContract.methods.approve(approveAddress, approveAmount * decimals).encodeABI(),
          },
        ],
      });
      console.log("Approval successful");
    } catch (err) {
      handleError(err, "Please type a valid address", "Please type a whole number as amount");
    }
  };

  // Function to read approval
  const readApprovalHandler = async () => {
    console.log("Pressed to read approval");
    try {
      const readApproval = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPTContract.options.address,
            data: IPTContract.methods.readApprovalFor(approveAddress).encodeABI(),
          },
          "latest",
        ],
      });
      if (readApproval === "0x") {
        console.log("Approval:", readApproval);
        setReadApproval(0);
      } else {
        const decimalValue = web3.utils.hexToNumber(readApproval);
        console.log("Approval:", decimalValue);
        setReadApproval(decimalValue);
      }
    } catch (err) {
      handleError(err, "Please type a valid address", "");
    }
  };

  // Function to revoke approval
  const revokeApprovalHandler = async () => {
    console.log("Pressed to revoke approval");
    try {
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPTContract.options.address,
            data: IPTContract.methods.revokeApproval(approveAddress).encodeABI(),
          },
          "latest",
        ],
      });
      console.log("revoked approval for:", approveAddress);
    } catch (err) {
      handleError(err, "Please type a valid address", "");
    }
  };

  // Fetch faucet information
  const getFaucetHandler = useCallback(async () => {
    try {
      const faucet = await window.ethereum.request({
        method: "eth_call",
        params: [{
          from: accounts[0],
          to: IPtrade.options.address,
          data: IPtrade.methods.freeIpTokenwithdrawal().encodeABI(),
        }, "latest"],
      });
      setFaucet(faucet);

      const registrationPrice = await window.ethereum.request({
        method: "eth_call",
        params: [{
          from: accounts[0],
          to: IPtrade.options.address,
          data: IPtrade.methods.registerIPCostIpt().encodeABI(),
        }, "latest"],
      });
      setRegistrationPrice(registrationPrice);

      const transferPrice = await window.ethereum.request({
        method: "eth_call",
        params: [{
          from: accounts[0],
          to: IPtrade.options.address,
          data: IPtrade.methods.transferIPCostIpt().encodeABI(),
        }, "latest"],
      });
      setTransferPrice(transferPrice);

      const thisLockTime = await window.ethereum.request({
        method: "eth_call",
        params: [{
          from: accounts[0],
          to: IPtrade.options.address,
          data: IPtrade.methods.lockTime().encodeABI(),
        }, "latest"],
      });
      setThisLockTime(thisLockTime);


    } catch (err) {
     // showError(err.toString());
      showError("Failed to load faucet info");
    }
  }, [accounts]);

  // Function to get free IPT
  const getIPTHandler = async () => {
    console.log("get free IPT");

    // test if you have the right to get it 

    const timePassedCheck = await listenForFaucetEvents();
    console.log("timePassedCheck", timePassedCheck);
    if (!timePassedCheck) {
      showError("Not enough time since last transfer");
      return;
    }


    try {
      const txReceipt = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPtrade.options.address,
            data: IPtrade.methods.requestTokens().encodeABI(),
          },
          "latest",
        ],
      });
      console.log("receipt:", txReceipt);
      showSuccess("IPT collection successful!");
    } catch (err) {
      console.error("getting IPT failed:", err);
      showError(err.data.message);
    }
  };

  // Function to listen for Transferred events
  const listenForTransferredEvents = async () => {
    try {

      setTransferEvent("No previous owners");

      // Set the parameters for the getPastLogs method
      const params = {
        fromBlock: 0,
        toBlock: 'latest',
        address: "0x9BadAa81fF2748b44A272D5957CD631E0B4021aA",
        topics: ["0xca00f8032cdcf162c969609d82f6c8d2f473b3321c01f6323283abfa6abbdfbc"]
      };

      const IPTransferredEvents = await web3.eth.getPastLogs(params);
      console.log("IPTransferredEvents", IPTransferredEvents);

      let decodedLogs = [];
      IPTransferredEvents.forEach(event => {

        console.log("event", event);
        try {
          // Decode the log, ensuring proper handling of the BigInt
          let decodedLog = web3.eth.abi.decodeLog([
            {
              type: 'address',
              name: 'from',
              indexed: false
            },
            {
              type: 'address',
              name: 'to',
              indexed: false
            },
            {
              type: 'string',
              name: 'sha512',
              indexed: false
            },
            {
              type: 'uint256',
              name: 'amount',
              indexed: false
            }
          ], event.data); // event.topics.slice(1) removes the first topic (event signature)

          // Add the transaction hash to the decoded log object
          decodedLog.blockNumber = event.blockNumber;

          // Add the transacionHash
          decodedLog.transactionHash = event.transactionHash;

          // Ensure `amount` is handled as BigInt
          console.log(decodedLog.amount);

          decodedLogs.push(decodedLog);
        } catch (error) {
          console.error("Error decoding log:", error);
        }
      });

      // set previous owners
      async function getTransferTimestamps(decodedLogs, checkedsha512) {
        const transfers = await Promise.all(
          decodedLogs.map(async item => {
            if (item.sha512 === checkedsha512) { // Use the correct property name
              const transferBlock = await web3.eth.getBlock(item.blockNumber);
              const transferTs = new Date(parseInt(Number(transferBlock.timestamp) * 1000)).toString();
              return [item.from, transferTs, item.transactionHash];
            }
            return ""; // Return an empty string if it doesn't match
          })
        );

        console.log("transfers", transfers);
        if (transfers.filter(date => date !== "").length > 0) {
          return (
            <table className="table is-striped is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th>Previous Owner</th>
                  <th>Transfered on</th>
                  <th>transactionHash</th>
                </tr>
              </thead>
              <tbody>
                {transfers.filter(date => date !== "").map((date, index) => (
                  <tr key={index}>
                    <td>{date[0]}</td>
                    <td>{date[1]}</td>
                    <td>{date[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }
      };


      getTransferTimestamps(decodedLogs, checkedsha512).then(prevTransfers => {
        console.log("Previous Transfers:", prevTransfers);
        setTransferEvent(prevTransfers);
      }).catch(error => {
        console.error("Error:", error);
      });



    } catch (error) {
      console.error('Error:', error);
    }
  };





  // Function to listen for Faucet events
  const listenForFaucetEvents = () => {
    return new Promise(async (resolve, reject) => {
      try {

        // Set the parameters for the getPastLogs method
        const params = {
          fromBlock: 0,
          toBlock: 'latest',
          address: "0x9BadAa81fF2748b44A272D5957CD631E0B4021aA",
          topics: ["0xc3fb6c98272d7a0d5dc26727b61c00ece2e5bf3dbdc0284659e28d441c1ce06c"]
        };

        const IPTransferredEvents = await web3.eth.getPastLogs(params);
        console.log("IPTransferredEvents", IPTransferredEvents);

        let decodedLogs = [];
        IPTransferredEvents.forEach(event => {

          console.log("FaucetEvents", event);
          try {
            // Decode the log, ensuring proper handling of the BigInt
            let decodedLog = web3.eth.abi.decodeLog([
              {
                type: 'address',
                name: 'requester',
                indexed: false
              },
              {
                type: 'uint256',
                name: 'amount',
                indexed: false
              }
            ], event.data); // event.topics.slice(1) removes the first topic (event signature)

            // Add the transaction hash to the decoded log object
            decodedLog.blockNumber = event.blockNumber;

            // Ensure `amount` is handled as BigInt
            console.log(decodedLog.amount);

            decodedLogs.push(decodedLog);
          } catch (error) {
            console.error("Error decoding Faucet log:", error);
          }
        });

        // set previous transfers
        async function getFaucetTimestamps(decodedLogs) {
          const transfers = await Promise.all(
            decodedLogs.map(async item => {
              if (item.requester.toLowerCase() === accounts[0].toLowerCase()) { // Use the correct property name
                const transferBlock = await web3.eth.getBlock(item.blockNumber);
                const transferTs = new Date(parseInt(Number(transferBlock.timestamp) * 1000)).toString();
                return [transferTs];
              }
              return ""; // Return an empty string if it doesn't match
            })
          );

          console.log("transfers", transfers);

          // Filter out empty strings and convert to Date objects
          const validTransfers = transfers.filter(date => date !== "").map(date => new Date(date));

          console.log("validTransfers", validTransfers);

          // Find the latest date
          const latestDate = new Date(Math.max.apply(null, validTransfers));

          console.log("latest faucet transfer", latestDate);

          // Get the current time
          const currentTime = new Date();

          // Calculate the difference in milliseconds
          const differenceInMs = currentTime - latestDate;

          // Convert the difference to a readable format
          const differenceInSeconds = Math.floor(differenceInMs / 1000);

          console.log("differenceInSeconds", differenceInSeconds);

          if (differenceInSeconds < thisLockTime && !isNaN(differenceInSeconds)) {
            return false;
          } else {
            return true;
          }
        };


        getFaucetTimestamps(decodedLogs)
          .then(prevTransfers => {
            console.log("Previous Faucet:", prevTransfers);
            resolve(prevTransfers);
          }).
          catch(error => {
            console.error("Error:", error);
            reject(error);
          });


      } catch (error) {
        console.error('Error:', error);
        reject(error);
      }
    });
  };




   // Function to listenForAddressRegisterEvents
   const listenForAddressRegisterEvents = () => {
    return new Promise(async (resolve, reject) => {
      try {

        // Set the parameters for the getPastLogs method
        const params_IPRegistered= {
          fromBlock: 0,
          toBlock: 'latest',
          address: "0x9BadAa81fF2748b44A272D5957CD631E0B4021aA",
          topics: ["0x5bad4487d7b168048a56fc9dcab8014e86f128b0b713f7db167188fc05d844fa"]
        }
        const IPRegisteredEvents = await web3.eth.getPastLogs(params_IPRegistered);
        console.log("IPRegisteredEvents", IPRegisteredEvents);


        // decode
        let decodedLogs_IPRegistered = [];
        IPRegisteredEvents.forEach(event => {

          console.log("IPRegisteredEvents", event);
          try {
            // Decode the log, ensuring proper handling of the BigInt
            let decodedLog = web3.eth.abi.decodeLog([
                {
                  type: 'address',
                  name: 'owner',
                  indexed: false
                },
                {
                  type: 'string',
                  name: 'sha512',
                  indexed: false
                },
            ], event.data); // event.topics.slice(1) removes the first topic (event signature)

            decodedLogs_IPRegistered.push(decodedLog);
          } catch (error) {
            console.error("Error decoding Faucet log:", error);
          }
        });

        // set previous transfers
        async function getIPRegisteredEvents(decodedLogs_IPRegistered) {
          const transfers = await Promise.all(
            decodedLogs_IPRegistered.map(async item => {
              if (item.owner.toLowerCase() === IPOnAddress.toLowerCase()) { // Use the correct property name
                return [item.sha512];
              }
              return ""; // Return an empty string if it doesn't match
            })
          );
      
          console.log("IPRegisteredEvents", transfers);
  
          if (transfers.filter(sha512 => sha512 !== "").length > 0 ) {
            return (
              <table className="table is-striped is-hoverable is-fullwidth">
                <thead>
                  <tr>
                    <th>First registration on this address</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.filter(sha512 => sha512 !== "").map((sha512, index) => (
                    <tr key={index}>
                      <td>{sha512}</td>
                    </tr>
                  ))}
                </tbody>
              </table> 
            );
          }else {
            showError("No sha512 registered on this address");
            reject();
          }
        };

        getIPRegisteredEvents(decodedLogs_IPRegistered)
          .then(registrations => {
            console.log("IPRegisteredEvents:", registrations);
            setRegistrationAddresEvents(registrations);
            resolve();
          }).
          catch(error => {
            console.error("Error:", error);
            reject(error);
          });


      } catch (error) {
        console.error('Error:', error);
        reject(error);
      }
    });
  };




   // Function to listenForTransferEvents
   const listenForAddressTransferEvents = () => {
    return new Promise(async (resolve, reject) => {
      try {

        const params_IPTransferred= {
          fromBlock: 0,
          toBlock: 'latest',
          address: "0x9BadAa81fF2748b44A272D5957CD631E0B4021aA",
          topics: ["0xca00f8032cdcf162c969609d82f6c8d2f473b3321c01f6323283abfa6abbdfbc"]
        }
        const IPTransferredEvents = await web3.eth.getPastLogs(params_IPTransferred);
        console.log("IPTransferredEvents", IPTransferredEvents);

        // 
        //const params_IpDeleted= {
        //  fromBlock: 0,
        //  toBlock: 'latest',
        //  address: "0x9de04769ddC87b9196Ed5c9595A9b113F1193b5c",
        //  topics: ["0xc3fb6c98272d7a0d5dc26727b61c00ece2e5bf3dbdc0284659e28d441c1ce06c"]
        //}
        //const IpDeletedEvents = await web3.eth.getPastLogs(params_IpDeleted);
        //console.log("IPTransferredEvents", IpDeletedEvents);

        // decode
        let decodedLogs_IPTransferred = [];
        IPTransferredEvents.forEach(event => {

          console.log("IPTransferredEvents", event);
          try {
            // Decode the log, ensuring proper handling of the BigInt
            let decodedLog = web3.eth.abi.decodeLog([
                {
                  type: 'address',
                  name: 'from',
                  indexed: false
                },
                {
                  type: 'address',
                  name: 'to',
                  indexed: false
                },
                {
                  type: 'string',
                  name: 'sha512',
                  indexed: false
                },
                {
                  type: 'uint256',
                  name: 'amount',
                  indexed: false
                }
            ], event.data); // event.topics.slice(1) removes the first topic (event signature)

            decodedLogs_IPTransferred.push(decodedLog);
          } catch (error) {
            console.error("Error decoding Faucet log:", error);
          }
        });

        // set previous transfers
        async function getIPTransferredEvents(decodedLogs_IPTransferred) {
          const transfers_from = await Promise.all(
            decodedLogs_IPTransferred.map(async item => {
              if (item.from.toLowerCase() === IPOnAddress.toLowerCase()) { // Use the correct property name
                return [item.sha512];
              }
              return ""; // Return an empty string if it doesn't match
            })
          );
          const transfers_to = await Promise.all(
            decodedLogs_IPTransferred.map(async item => {
              if (item.to.toLowerCase() === IPOnAddress.toLowerCase()) { // Use the correct property name
                return [item.sha512];
              }
              return ""; // Return an empty string if it doesn't match
            })
          );
          console.log("getIPTransferredEvents_from", transfers_from);
          console.log("getIPTransferredEvents_to", transfers_to);
  

          if (transfers_from.filter(sha512 => sha512 !== "").length === 0){
            transfers_from[0] = "no transfers";
          } 
          if (transfers_to.filter(sha512 => sha512 !== "").length  === 0){
            transfers_to[0] = "no sales";
          }
            return (
              <table className="table is-striped is-hoverable is-fullwidth">
               <thead>
                 <tr>
                   <th>Received via Transfer</th>
                 </tr>
               </thead>
               <tbody>
                  {transfers_to.filter(sha512 => sha512 !== "").map((sha512, index) => (
                    <tr key={index}>
                      <td>{sha512}</td>
                    </tr>
                  ))}
                </tbody>               
                <thead>
                  <tr>
                    <th>Sold via Transfer</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers_from.filter(sha512 => sha512 !== "").map((sha512, index) => (
                    <tr key={index}>
                      <td>{sha512}</td>
                    </tr>
                  ))}
                </tbody>
              </table> 
            );
          
        };

        getIPTransferredEvents(decodedLogs_IPTransferred)
          .then(registrations => {
            console.log("IPTransferred:", registrations);
            setTransferAddresEvents(registrations);
            resolve();
          }).
          catch(error => {
            console.error("Error:", error);
            reject(error);
          });


      } catch (error) {
        console.error('Error:', error);
        reject(error);
      }
    });
  };





  // Function to set registration
  const setRegistrationHandler = async () => {

    console.log("c", registeredsha512);
    const correct512 = await check512correct(registeredsha512);
    if (!correct512) { return }

    // check if registered already
    try {
      const getCheckedsha512 = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPtrade.options.address,
            data: IPtrade.methods.getIP(registeredsha512).encodeABI(),
          },
          "latest",
        ],
      });
      console.log(getCheckedsha512, "ge");
      const decoded = await web3.eth.abi.decodeParameters(["address", "uint96", "bool"], getCheckedsha512);
      console.log(decoded[0]);
      if(decoded[0].length === 42){
        showError("This SHA512 is already registered");
        setRegisteredsha512("");
        return;
      } 
      
    } catch (err) {
      console.error("Error in getRegisteredIpHandler:", err);
    }


    try {
      const readApproval = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPTContract.options.address,
            data: IPTContract.methods.readApprovalFor(approveAddress).encodeABI(),
          },
          "latest",
        ],
      });
      const decimalValue = web3.utils.hexToNumber(readApproval);
      if (readApproval === "0x") {
        showError("Approval not sufficient");
        return;
      }
      if (decimalValue < registrationPrice) {
        showError("Approval not sufficient");
        return;
      }
    } catch (err) {
      console.error("Allowance error:", err.data.message);
      showError(err.data.message);
      return;
    }

    try {
      const txReceipt = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPtrade.options.address,
            data: IPtrade.methods.setIP(registeredsha512).encodeABI(),
          },
          "latest",
        ],
      });
      console.log("receipt:", txReceipt);
      showSuccess("Registration successful!");

    } catch (err) {
      console.error("setting IPT failed:", err);
      showError(err.data.message);
    }
  };

  // Function to get registered IP
  const getRegisteredIpHandler = async () => {
    console.log("c", checkedsha512);
    const correct512 = await check512correct(checkedsha512);
    if (!correct512) { return }

    try {
      const getCheckedsha512 = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPtrade.options.address,
            data: IPtrade.methods.getIP(checkedsha512).encodeABI(),
          },
          "latest",
        ],
      });
      
      const decoded = await web3.eth.abi.decodeParameters(["address", "uint96", "bool"], getCheckedsha512);
      console.log("decoded", decoded);
      const first_registration = new Date(parseInt(decoded[1]) * 1000).toString();
      getCheckedsha512Address(decoded[0]);
      getCheckedsha512FirstRegistration(first_registration);

      listenForTransferredEvents();
    } catch (err) {
      console.error("Error in getRegisteredIpHandler:", err);
      showError(err.message);
      getCheckedsha512Address("");
      getCheckedsha512FirstRegistration("");
      setTransferEvent("");
      return;
    }
  };




  
// Function to get registered IP
const getIPOnAddressHandler = async () => {

  try {
    if (IPOnAddress.length !== 42){
      showError("This is probably not a valid address");
      return;
    }
    listenForAddressRegisterEvents();
    listenForAddressTransferEvents();
  } catch (err) {
    console.error("Error in listenForAddressTransferEvents:", err);
    return;
  }
};


  // Function to set offer
  const setOfferHandler = async () => {


    const correct512 = await check512correct(offeredsha512);
    if (!correct512) { return }

    if (isNaN(offeredPrice) || offeredPrice.length < 1) {
      showError("Please type a whole number as amount");
      return;
    }

    // check if the seller is the owner
   // check if registered already
    try {
      const getCheckedsha512 = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPtrade.options.address,
            data: IPtrade.methods.getIP(offeredsha512).encodeABI(),
          },
          "latest",
        ],
      });
      console.log(getCheckedsha512, "ge");
      const decoded = await web3.eth.abi.decodeParameters(["address", "uint96", "bool"], getCheckedsha512);
      console.log("address", decoded[0]);
      if(decoded[0].toLowerCase() !== accounts[0].toLowerCase()){
        showError("This SHA512 is not registered under your address");
        setOfferedsha512("");
        return;
      } 
      
    } catch (err) {
      console.error("Error in getRegisteredIpHandler:", err);
    }

    try {
      const addressBalance = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPTContract.options.address,
            data: IPTContract.methods.balanceOf(offeredAddress).encodeABI(),
          },
          "latest",
        ],
      });
      const decimalValue = web3.utils.hexToNumber(addressBalance);
      if (decimalValue < offeredPrice * decimals) {
        showError(`The balance of buyer (${decimalValue / decimals} IPT) is lower than the requested price: ${offeredPrice} IPT`);
        return;
      }
    } catch (err) {
      handleError(err, "Please type a valid address", "");
      return;
    }

    try {
      const txReceipt = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPtrade.options.address,
            data: IPtrade.methods.sellerCreatesSalesIntent(offeredsha512, offeredPrice * decimals, offeredAddress).encodeABI(),
          },
          "latest",
        ],
      });
      showSuccess("Successfully created transfer offer");
      console.log("receipt:", txReceipt);
    } catch (err) {
      console.error("offering IP failed:", err);
      showError(err.data.message);
    }
  };

  // Function to set buying
  const setBuyingHandler = async () => {

    const correct512 = await check512correct(buyingsha512);
    if (!correct512) { return }

    if (isNaN(buyingPrice) || buyingPrice.length < 1) {
      showError("Please type a whole number as amount");
      return;
    }

    try {
      const getSalesintent = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPtrade.options.address,
            data: IPtrade.methods.getSalesIntent(buyingsha512).encodeABI(),
          },
          "latest",
        ],
      });

      const decoded = await web3.eth.abi.decodeParameters(["address", "uint192", "uint64", "bool"], getSalesintent);
      if (decoded[0].toLowerCase() !== accounts[0].toLowerCase()) {
        showError("You are not the buyer");
        return;
      }
      if (Number(decoded[1]) !== Number(buyingPrice) * decimals) {
        console.log("buying price", decoded[1]);
        showError("Not the right buying price, should be:", decoded[1] / decimals);
        return;
      }
      if (!decoded[3]) {
        showError("This is not for sale");
        return;
      }
    } catch (err) {
      console.error("Error in getting sales intent:", err.data.message);
      showError(err.data.message);
      return;
    }

    try {
      const readApproval = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPTContract.options.address,
            data: IPTContract.methods.readApprovalFor(approveAddress).encodeABI(),
          },
          "latest",
        ],
      });
      const decimalValue = web3.utils.hexToNumber(readApproval);
      if (readApproval === "0x") {
        showError(`Approval 0 is smaller than the agreed price ${buyingPrice}`);
      }
      else if (decimalValue < buyingPrice * decimals) {
        showError(`Approval ${decimalValue / decimals} is smaller than the agreed price ${buyingPrice}`);
        return;
      }
    } catch (err) {
      console.error("Allowance error:", err.data.message);
      showError(err.data.message);
      return;
    }

    try {
      const addressBalance = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPTContract.options.address,
            data: IPTContract.methods.balanceOf(accounts[0]).encodeABI(),
          },
          "latest",
        ],
      });
      const decimalValue = web3.utils.hexToNumber(addressBalance);
      if (decimalValue < buyingPrice * decimals) {
        showError(`The balance of buyer (${decimalValue / decimals} IPT) is lower than the requested price: ${buyingPrice} IPT`);
        return;
      }
    } catch (err) {
      handleError(err, "Please type a valid address", "");
      return;
    }

    try {
      const txReceipt = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPtrade.options.address,
            data: IPtrade.methods.buyerBuysIP(buyingsha512, buyingPrice * decimals, true).encodeABI(),
          },
          "latest",
        ],
      });
      showSuccess("IP successfully transfered!");
      console.log("receipt:", txReceipt);
    } catch (err) {
      console.error("buying IPT failed:", err);
      showError(err.data.message);
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Text copied to clipboard:', text);
      })
      .catch((error) => {
        console.error('Error copying text to clipboard:', error);
      });
  };


  const resendTransaction = async () => {
    try {
      const tx = await web3.eth.sendTransaction({ from: accounts[0], to: accounts[0], value: 0, nonce: -1 });
      console.log(tx)
    } catch (e) {
      showError('resend failed', e);
    }
  }


  useEffect(() => {
    connectWalletHandler();
  }, []);

  useEffect(() => {
    console.log("Loading:", loading);
  }, [loading]);

  useEffect(() => {
    console.log(web3);
  }, [web3]);

  useEffect(() => {
    getFaucetHandler();
  }, [getFaucetHandler, accounts]);


  // Function to display error message using toast
  const showError = (message) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  // Function to display success message using toast
  const showSuccess = (message) => {
    toast.success(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  // Function to scroll to a specific section
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle view selection and scroll to the section
  const handleSelectView = (view) => {
    setCurrentView(view);
    scrollToSection(view);
  };

  // Function to check the sha512 string
  const check512correct = async (string) => {

    try {
      let error = 0;
      console.log("string", string);
      if (string.length !== 128) {
        console.log("length", string.length);
        showError("This is not a valid sha512. The length should be 128 characters.");
        error = 1;
      }

      // Test the string against the pattern
      // Define a regular expression pattern for valid hex characters
      const hexPattern = /^[0-9a-fA-F]+$/;

      if (!hexPattern.test(string)) {
        console.log("hex", hexPattern.test(string));
        showError("This is not a valid sha512. It contains illegal characters.")
        error = 1;
      }

      if (error === 1) {
        getCheckedsha512Address("");
        getCheckedsha512FirstRegistration("");
        setTransferEvent("");
        return false;
      }

      return true;
    } catch (err) {
      console.log(err);
    }
  }


  // Function to get whitepaper
  useEffect(() => {
    const fetchMarkdown = async () => {
      const res = await fetch('/whitepaper.md'); // Fetch from the public directory
      const markdown = await res.text();
      const mdxSource = await serialize(markdown);
      setMdxContent(mdxSource);
    };

    fetchMarkdown();
  }, []);



  // Component to connect wallet
  const ConnectWallet = () => {
    return (
      <nav className={styles.whiteBackground} style={{ position: 'absolute', zIndex: 1, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0)' }}>
        <div className={styles.container} style={{ display: 'flex', alignItems: 'center' }}>
          <div className="navbar-brand" style={{ color: 'white' }}>
            <div className="content">
              <h2>IP trade </h2>
              <h4>Register your creative content on-chain</h4>
            </div>
          </div>
          <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
            <button
              onClick={connectWalletHandler}
              className={`button is-fullwidth`}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>
    );
  };

  // Component to display top image
  const TopImage = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          <Image
            src="./images/ipt_coin.jpg"
            alt="top_image"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      </nav>
    );
  };

  // Component to display faucet information
  const Faucet = ({ faucet }) => {
    if (!faucet) {
      return (
        <nav className={styles.whiteBackground}>
          <div>Please wait for faucet to connect...</div>
        </nav>
      );
    }
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
            <h1>Your connection to IP trade</h1>
          </div>
          <div className={styles.navbarEnd}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ marginRight: '10px', width: buttonWidth }}>
                <button
                  onClick={() => window.open(ethScanUrl, '_blank')}
                  className={`button is-outlined is-small`}
                >
                  View this contract on Etherscan
                </button>
              </div>
            </div>
            <div className={styles.container}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ marginRight: '10px' }}>Your address: <strong>{`${loading ? " please connect wallet" : accounts[0]}`}</strong></p>

                <button
                  onClick={() => copyToClipboard(loading ? "Address not loaded" : accounts[0])}
                  className={`button is-outlined is-small`}
                >
                  Copy Address
                </button>

              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
              <p style={{ marginRight: '10px' }}>IPT address: <strong>{IPTAddress}</strong></p>
              <button
                  onClick={() => copyToClipboard(loading ? "Address not loaded" : IPTAddress)}
                  className={`button is-outlined is-small`}
                >
                  Copy Address
                </button>
                </div>

              <p>Faucet height: {String(faucet) / 1000000000000000000} IPT every {thisLockTime / 86400} days </p>
              <p>IP Registration : {String(registrationPrice) / 1000000000000000000} IPT</p>
              <p>IP Transfer : {String(transferPrice) / 1000000000000000000} IPT</p>
            </div>
            <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
              <button
                onClick={getIPTHandler}
                className={`button is-outlined is-fullwidth ${loading ? "is-loading" : " "}`}
              >
                get IPT here
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  // Component to display approval form
  const Approval = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
            <div className="content">
              <h1>Set allowance</h1>
            </div>
          </div>
        </div>
        <div>
          <div>
            <div className={styles.container}>
              <div className="has-text-left" style={{ margin: '15px', width: '40%' }}>
                <div className="content">
                  <p>The contract needs your approval to spend IPT on your behalf.</p>
                  <p>Please make sure to approve at least the amount that you need for the desired transaction. Every transaction reduces the allowance until it reaches 0.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p className="has-text-left" style={{ margin: '10px', width: '50%' }}>The address of this contract is {IPtradeAddress}</p>
                <button
                  onClick={() => copyToClipboard(IPtradeAddress)}
                  className={`button is-outlined is-small`}
                >
                  Copy Address
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '50%' }}>
                  <label htmlFor="approveAddress">Address to approve:</label>
                  <input
                    className="input"
                    type="text"
                    id="approveAddress"
                    value={approveAddress}
                    onChange={(e) => setApproveAddress(e.target.value)}
                  />
                </div>
                <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
                  <button
                    onClick={readApprovalHandler}
                    className={`button is-outlined is-fullwidth ${loading ? "is-loading" : ""}`}
                  >
                    check allowance
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '50%' }}>
                  <label htmlFor="approveAmount">Amount to approve:</label>
                  <input
                    className="input"
                    type="text"
                    id="approveAmount"
                    value={approveAmount}
                    onChange={(e) => setApproveAmount(e.target.value)}
                  />
                </div>
                <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
                  <button
                    onClick={setApprovalHandler}
                    className={`button is-outlined is-fullwidth ${loading ? "is-loading" : ""}`}
                  >
                    set allowance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  // Component to display allowance
  const Allowance = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div>
            Allowance for address {approveAddress}: {String(readApproval) / decimals} IPT
          </div>
        </div>
      </nav>
    );
  };

  // Component to revoke approval
  const RevokeApproval = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
            <button
              onClick={revokeApprovalHandler}
              className={`button is-outlined is-fullwidth ${loading ? "is-loading" : ""}`}
            >
              revoke allowance
            </button>
          </div>
        </div>
      </nav>
    );
  };

  // Component to register IP
  const RegisterIP = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
            <h1>Register content</h1>
          </div>
        </div>
        <div className={styles.container} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '50%' }}>
            <label htmlFor="registersha512">sha512</label>
            <input
              className="input"
              type="text"
              id="registersha512"
              value={registeredsha512}
              onChange={(e) => setRegisteredsha512(e.target.value)}
            />
          </div>
          <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
            <button
              onClick={setRegistrationHandler}
              className={`button is-outlined is-fullwidth ${loading ? "is-loading" : ""}`}
            >
              register IP
            </button>
          </div>
        </div>
      </nav>
    );
  };

  // Component to check registered IP
  const CheckIP = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
            <h1>Check registered content</h1>
          </div>
        </div>
        <div className={styles.container} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '50%' }}>
            <label htmlFor="checksha512">sha512</label>
            <input
              className="input"
              type="text"
              id="checksha512"
              value={checkedsha512}
              onChange={(e) => setCheckedsha512(e.target.value)}
            />
          </div>
          <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
            <button
              onClick={getRegisteredIpHandler}
              className={`button is-outlined is-fullwidth ${loading ? "is-loading" : ""}`}
            >
              check registration
            </button>
          </div>
        </div>
        <div className={styles.container}>
          <p><strong>Current owner</strong>: {checkedsha512Address}</p>
          <p><strong>First registered at</strong>: {checkedsha512FirstRegistration}</p>{"\n"}
          {transferEvent}
        </div>
      </nav>
    );
  };



   // Component to check my address registrations
   const addresRegistrations = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
            <h1>sha512 registrations and transfers per address</h1>
          </div>
        </div>
        <div className={styles.container} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '50%' }}>
            <label htmlFor="IPOnAddress">Address</label>
            <input
              className="input"
              type="text"
              id="IPOnAddress"
              value={IPOnAddress}
              onChange={(e) => setIPOnAddress(e.target.value)}
            />
          </div>
          <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
            <button
              onClick={getIPOnAddressHandler}
              className={`button is-outlined is-fullwidth ${loading ? "is-loading" : ""}`}
            >
              check address
            </button>
          </div>
        </div>
        <div className={styles.container}>
          {registrationAddresEvents}
          {transferAddresEvents}
        </div>
      </nav>
    );
  };


  // Component to offer IP
  const OfferIP = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
            <h1>Offer content to another address</h1>
          </div>
        </div>
        <div className={styles.container}>
          <div style={{ width: '50%' }}>
            <label htmlFor="offerIpsha512">sha512</label>
            <input
              className="input"
              type="text"
              id="offerIpsha512"
              value={offeredsha512}
              onChange={(e) => setOfferedsha512(e.target.value)}
            />
          </div>
          <div style={{ width: '50%' }}>
            <label htmlFor="offerIpAddress">Address</label>
            <input
              className="input"
              type="text"
              id="offerIpAddress"
              value={offeredAddress}
              onChange={(e) => setOfferedAddress(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '50%' }}>
              <label htmlFor="offerIpPrice">Price in IPT</label>
              <input
                className="input"
                type="text"
                id="offerIpPrice"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
              />
            </div>
            <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
              <button
                onClick={setOfferHandler}
                className={`button is-outlined is-fullwidth ${loading ? "is-loading" : ""}`}
              >
                offer IP
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  // Component to buy IP
  const BuyIP = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
            <h1>Accept offer</h1>
          </div>
        </div>
        <div className={styles.container}>
          <div style={{ width: '50%' }}>
            <label htmlFor="buyIpsha512">sha512</label>
            <input
              className="input"
              type="text"
              id="buyIpsha512"
              value={buyingsha512}
              onChange={(e) => setBuyingsha512(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '50%' }}>
              <label htmlFor="buyIpPrice">Price in IPT</label>
              <input
                className="input"
                type="text"
                id="buyIpPrice"
                value={buyingPrice}
                onChange={(e) => setBuyingPrice(e.target.value)}
              />
            </div>
            <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
              <button
                onClick={setBuyingHandler}
                className={`button is-outlined is-fullwidth ${loading ? "is-loading" : ""}`}
              >
                Accept IP
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  // whitepaper
  const whitePaper = () => {
    return (
      <div className={styles.markdownBody}>
         {mdxContent ? <MDXRemote {...mdxContent} /> : <p>Loading...</p>}
      </div>
    );
  }

  // Component for footer
  const Footer = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.footer}>
          <p>© 2024 SquaredAnt GmbH. All rights reserved.</p>
        </div>
      </nav>
    );
  };


  // non-stanard
  const resend = () => {
    return (
      <button
        onClick={resendTransaction}
        className={`button is-outlined is-fullwidth`}
      >
        resend
      </button>
    )
  }

  // Sidebar component
  const TopBar = ({ onSelect }) => {
    const handleClick = (e) => {
      e.preventDefault();
      const sectionId = e.target.getAttribute('data-id');
      onSelect(sectionId);
    };

    return (
      <div className={styles.topbar}>
        <a href="#" data-id="approve" onClick={handleClick}>Approve spending</a>
        <a href="#" data-id="register" onClick={handleClick}>Register IP</a>
        <a href="#" data-id="check" onClick={handleClick}>Check IP</a>
        <a href="#" data-id="transfer" onClick={handleClick}>Transfer IP</a>
        <a href="#" data-id="wp" onClick={handleClick}>Whitepaper</a>
      </div>
    );
  };

  return (
    <div className={styles.main}>
      <Head>
        <title>IP trade</title>
        <meta name="description" content="An IP marketplace app" />
      </Head>
      <ToastContainer />

      {/* CONNECT WALLET */}
      {ConnectWallet()}

      {/* TOP IMAGE */}
      {TopImage()}

      {/* SIDEBAR */}
      <TopBar onSelect={handleSelectView} />

      {/* FAUCET */}
      <Faucet faucet={faucet} />

      {/* Approve Section */}
      <div id="approve">
        {currentView === 'approve' && Approval()}
        {currentView === 'approve' && Allowance()}
        {currentView === 'approve' && RevokeApproval()}
      </div>

      {/* Register IP Section */}
      <div id="register">
        {currentView === 'register' && RegisterIP()}
      </div>

      {/* Check IP Section */}
      <div id="check">
        {currentView === 'check' && CheckIP()}
        {currentView === 'check' && addresRegistrations()}
      </div>

      {/* Offer IP Section */}
      <div id="transfer">
        {currentView === 'transfer' && OfferIP()}
        {currentView === 'transfer' && BuyIP()}
      </div>

      {/* Resend */}
      <div id="resend">
        {currentView === 'wp' && whitePaper()}
      </div>

      {/* Whitepaper */}
      <div id = "wp">
      {currentView === 'resend' && resend()}
      </div>


      {/* Footer */}
      <Footer />
    </div>

  );




};

export default IpTrade;
