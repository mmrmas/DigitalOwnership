"use client";

import Head from "next/head.js";
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import { useState, useEffect } from "react";
import { Web3 } from 'web3';
import { toast, ToastContainer } from 'react-toastify';
import contracts from "../../blockchain/digitalownership_w3.js"; //
import styles from "../../styles/ipt.module.css";
import Image from 'next/image.js';
import "bulma/css/bulma.css";
import '../../styles/global.css';
import 'react-toastify/dist/ReactToastify.css';


const { Alchemy } = require('alchemy-sdk');
const DigitalOwnership = contracts.DigitalOwnership;
const DigitalOwnershipAddress = DigitalOwnership.options.address;
const ethScanUrl = `https://sepolia.etherscan.io/address/${DigitalOwnershipAddress}`;
const buttonWidth = "15%";

console.log("Loading...");

const digitalOwnership = () => {
  const [currentView, setCurrentView] = useState('register');
  const [loading, setLoading] = useState(true);
  const [loadingRead, setLoadingRead] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [registeredsha512, setRegisteredsha512] = useState("");
  const [checkedsha512, setCheckedsha512] = useState("");
  const [checkedsha512Address, getCheckedsha512Address] = useState("");
  const [checkedsha512FirstRegistration, getCheckedsha512FirstRegistration] = useState("");
  const [offeredsha512, setOfferedsha512] = useState("");
  const [offeredAddress, setOfferedAddress] = useState("");
  const [buyingsha512, setBuyingsha512] = useState("");
  const [transferEvent, setTransferEvent] = useState("");
  const [DOOnAddress, setDOOnAddress] = useState("");
  const [transferAddresEvents, setTransferAddresEvents] = useState("");
  const [registrationAddresEvents, setRegistrationAddresEvents] = useState("");
  const [mdxContent, setMdxContent] = useState(null);


  // CONNECT THE WALLET
  const connectWalletHandler = async () => {
    console.log("connecting wallet...");
    try {
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
        setLoadingRead(false);

        console.log("MetaMask is installed!");
        setCurrentView("register");
      }
    } catch (e) {
      try {
        // Use  Alchemy as a fallback
        console.log("Using Alchemy connection as fallback...");
        const fallbackProvider = new Web3(
          new Web3.providers.HttpProvider("https://eth-sepolia.g.alchemy.com/v2/5zq4W6KtB5W3j8kmGC1NGbawDglgoiTU")
        );

        console.log(fallbackProvider);
        setWeb3(fallbackProvider);
        setLoadingRead(false);

        // Setting the view to checking only
        setCurrentView("check");

        showSuccess("No Metamask connected. Read-only mode");
      } catch (e) {
        showError("Connection failed");
      }
    }

  };

 
  // LISTENING FUNCTIONS
  // Function to listen for Transferred events
  const listenForTransferredEvents = async () => {
    console.log("listenForTransferredEvents...");
    try {

      setTransferEvent("No previous owners");

      // set alechemy connection
      const apikey = '5zq4W6KtB5W3j8kmGC1NGbawDglgoiTU';
      const settings = {
        apiKey: apikey,
        network: 'eth-sepolia',
      };
      const alchemy = new Alchemy(settings);

      console.log("alchemy", alchemy);

      // Set the parameters for the getPastLogs method
      const DOTransferredEvents = await alchemy.core.getLogs({
        fromBlock: 0,
        toBlock: 'latest',
        address: "0xD6E4feDBbeD296B79F27f55215D4cFfEB841860F",
        topics: ["0xf737ce5c12f743b401e513dd208c42ad021b344196fb061ff9c785894762fe73"]
      });

      console.log("DOTransferredEvents", DOTransferredEvents);

      let decodedLogs = [];
      DOTransferredEvents.forEach(event => {

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
            }
          ], event.data); // event.topics.slice(1) removes the first topic (event signature)

          // Add the transaction hash to the decoded log object
          decodedLog.blockNumber = event.blockNumber;

          // Add the transacionHash
          decodedLog.transactionHash = event.transactionHash;

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

  // Function to listenForAddressRegisterEvents
  const listenForAddressRegisterEvents = () => {
    console.log("listenForAddressRegisterEvents...");

    return new Promise(async (resolve, reject) => {
      try {


        // set alechemy connection
        const apikey = '5zq4W6KtB5W3j8kmGC1NGbawDglgoiTU';
        const settings = {
          apiKey: apikey,
          network: 'eth-sepolia',
        };
        const alchemy = new Alchemy(settings);

        // Set the parameters for the getPastLogs method
        const DORegisteredEvents = await alchemy.core.getLogs({
          fromBlock: 0x0,
          toBlock: 'latest',
          address: "0xD6E4feDBbeD296B79F27f55215D4cFfEB841860F",
          topics: ["0xb7252538cde09b5f6b60240d1b6d69286a80aab96ea3064350580843d9ed9f8f"]
        });

        console.log("DORegisteredEvents", DORegisteredEvents);


        // decode
        let decodedLogs_DORegistered = [];
        DORegisteredEvents.forEach(event => {

          console.log("DORegisteredEvents", event);
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

            decodedLogs_DORegistered.push(decodedLog);
          } catch (error) {
            console.error("Error decoding Faucet log:", error);
          }
        });

        // set previous transfers
        async function getDORegisteredEvents(decodedLogs_DORegistered) {
          const transfers = await Promise.all(
            decodedLogs_DORegistered.map(async item => {
              if (item.owner.toLowerCase() === DOOnAddress.toLowerCase()) { // Use the correct property name
                return [item.sha512];
              }
              return ""; // Return an empty string if it doesn't match
            })
          );

          console.log("DORegisteredEvents", transfers);

          if (transfers.filter(sha512 => sha512 !== "").length > 0) {
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
          } else {
            showError("No sha512 registered on this address");
            reject();
          }
        };

        getDORegisteredEvents(decodedLogs_DORegistered)
          .then(registrations => {
            console.log("DORegisteredEvents:", registrations);
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
    console.log("listenForAddressTransferEvents");

    return new Promise(async (resolve, reject) => {
      try {

        // set alechemy connection
        const apikey = '5zq4W6KtB5W3j8kmGC1NGbawDglgoiTU';
        const settings = {
          apiKey: apikey,
          network: 'eth-sepolia',
        };
        const alchemy = new Alchemy(settings);


        const DOTransferredEvents = await alchemy.core.getLogs({
          fromBlock: 0,
          toBlock: 'latest',
          address: "0xD6E4feDBbeD296B79F27f55215D4cFfEB841860F",
          topics: ["0xf737ce5c12f743b401e513dd208c42ad021b344196fb061ff9c785894762fe73"]
        });

        console.log("DOTransferredEvents", DOTransferredEvents);

        // decode
        let decodedLogs_DOTransferred = [];
        DOTransferredEvents.forEach(event => {

          console.log("DOTransferredEvents", event);
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
              }
            ], event.data); // event.topics.slice(1) removes the first topic (event signature)

            decodedLogs_DOTransferred.push(decodedLog);
          } catch (error) {
            console.error("Error decoding Faucet log:", error);
          }
        });

        // set previous transfers
        async function getDOTransferredEvents(decodedLogs_DOTransferred) {
          const transfers_from = await Promise.all(
            decodedLogs_DOTransferred.map(async item => {
              if (item.from.toLowerCase() === DOOnAddress.toLowerCase()) { // Use the correct property name
                return [item.sha512];
              }
              return ""; // Return an empty string if it doesn't match
            })
          );
          const transfers_to = await Promise.all(
            decodedLogs_DOTransferred.map(async item => {
              if (item.to.toLowerCase() === DOOnAddress.toLowerCase()) { // Use the correct property name
                return [item.sha512];
              }
              return ""; // Return an empty string if it doesn't match
            })
          );
          console.log("getDOTransferredEvents_from", transfers_from);
          console.log("getDOTransferredEvents_to", transfers_to);


          if (transfers_from.filter(sha512 => sha512 !== "").length === 0) {
            transfers_from[0] = "no transfers";
          }
          if (transfers_to.filter(sha512 => sha512 !== "").length === 0) {
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

        getDOTransferredEvents(decodedLogs_DOTransferred)
          .then(registrations => {
            console.log("DOTransferred:", registrations);
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





  // SMART CONTRACT INTERACTION
  // Function to set registration
  const setRegistrationHandler = async () => {
    console.log("setRegistrationHandler...", registeredsha512);

    const correct512 = await check512correct(registeredsha512);
    console.log("this is a SHA-512 string");
    if (!correct512) { return }

    // check if the DO is registered 
    if (!await checkIfRegistered(registeredsha512)) {
      console.log("already registered");
      return;
    };


    try {
      const txReceipt = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: DigitalOwnership.options.address,
            data: DigitalOwnership.methods.setDO(registeredsha512).encodeABI(),
          },
          "latest",
        ],
      });
      console.log("receipt:", txReceipt);
      showSuccess("Registration successful!");

    } catch (err) {
      console.error("setting DO failed:", err);
      showError(err.message);
    }
  };

  

  // Function to get registered DO
  const getRegisteredIpHandler = async () => {
    console.log("getRegisteredIpHandler", checkedsha512);

    const correct512 = await check512correct(checkedsha512);
    if (!correct512) {
      return;
    }

    console.log("checking sha512... ")

    try {
      const getCheckedsha512 = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            //from: accounts[0], // specify the sender
            to: DigitalOwnership.options.address,
            data: DigitalOwnership.methods.getDO(checkedsha512).encodeABI(),
          },
          "latest",
        ],
      });

      console.log("getCheckedsha512", getCheckedsha512);

      const decoded = await web3.eth.abi.decodeParameters(["address", "uint96", "bool"], getCheckedsha512);
      console.log("decoded", decoded);
      const first_registration = new Date(parseInt(decoded[1]) * 1000).toString();
      getCheckedsha512Address(decoded[0]);
      getCheckedsha512FirstRegistration(first_registration);

      listenForTransferredEvents();
    } catch (err) {
      console.error("Error in getRegisteredIpHandler:", err);
      showError("This sha512 has not yet been registered");
      getCheckedsha512Address("");
      getCheckedsha512FirstRegistration("");
      setTransferEvent("");
      return;
    }
  };

  // Function to get registered DO on address
  const getDOOnAddressHandler = async () => {
    console.log("getDOOnAddressHandler...");

    try {
      if (DOOnAddress.length !== 42) {
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
    console.log("setOfferHandler...");


    const correct512 = await check512correct(offeredsha512);
    if (!correct512) { return }


    // check if the seller is the owner & check if registered already
    try {
      const getCheckedsha512 = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: DigitalOwnership.options.address,
            data: DigitalOwnership.methods.getDO(offeredsha512).encodeABI(),
          },
          "latest",
        ],
      });
   
      const decoded = await web3.eth.abi.decodeParameters(["address", "uint96", "bool"], getCheckedsha512);
      console.log("address", decoded[0]);

      if (decoded[0].toLowerCase() !== accounts[0].toLowerCase()) {
        showError("This SHA512 is not registered under your address");
        setOfferedsha512("");
        return;
      }

    } catch (err) {
      console.error("Error in getRegisteredIpHandler:", err);
      showError("This SHA512 is not registered");
      return;
    }

    // check if already for sale
    try {
      const getSalesintent = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: DigitalOwnership.options.address,
            data: DigitalOwnership.methods.getSalesIntent(offeredsha512).encodeABI(),
          },
          "latest",
        ],
      });

      const decoded = await web3.eth.abi.decodeParameters(["address", "uint64", "bool"], getSalesintent);

      console.log("decoded", decoded);
      if (decoded[2]) {
        showError("This sha512 is already for sale");
        return;
      }

    } catch (err) {
      console.error("Error in getting sales intent:", err.message);
      console.log("This can be transferred...")
      //showError(err.message);
      //return;
    }


    try {
      const txReceipt = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: DigitalOwnership.options.address,
            data: DigitalOwnership.methods.sellerCreatesSalesIntent(offeredsha512, offeredAddress).encodeABI(),
          },
          "latest",
        ],
      });
      showSuccess("Successfully created transfer offer");
      console.log("receipt:", txReceipt);
    } catch (err) {
      console.error("offering DO failed:", err);
      showError(err.message);
    }
  };

  // Function to set buying
  const setBuyingHandler = async () => {
    console.log("setBuyingHandler...");

    const correct512 = await check512correct(buyingsha512);
    if (!correct512) { return }

    try {
      const getSalesintent = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: DigitalOwnership.options.address,
            data: DigitalOwnership.methods.getSalesIntent(buyingsha512).encodeABI(),
          },
          "latest",
        ],
      });

      const decoded = await web3.eth.abi.decodeParameters(["address", "uint64", "bool"], getSalesintent);
      if (decoded[0].toLowerCase() !== accounts[0].toLowerCase()) {
        showError("You are not the buyer");
        return;
      }

      if (!decoded[2]) {
        showError("This is not for sale");
        return;
      }
    } catch (err) {
      console.error("Error in getting sales intent:", err.message);
      showError(err.message);
      return;
    }

    try {
      const txReceipt = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: DigitalOwnership.options.address,
            data: DigitalOwnership.methods.buyerBuysDO(buyingsha512, true).encodeABI(),
          },
          "latest",
        ],
      });
      showSuccess("DO successfully transfered!");
      console.log("receipt:", txReceipt);
    } catch (err) {
      console.error("buying DO failed:", err);
      showError(err.message);
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    console.log("copyToClipboard...");

    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Text copied to clipboard:', text);
      })
      .catch((error) => {
        console.error('Error copying text to clipboard:', error);
      });
  };


  const resendTransaction = async () => {
    console.log("resendTransaction...");
    try {
      const tx = await web3.eth.sendTransaction({ from: accounts[0], to: accounts[0], value: 0, nonce: -1 });
      console.log(tx)
    } catch (e) {
      showError('resend failed', e);
    }
  }

  // RELOADERS
  useEffect(() => {
    console.log("reaload connectWalletHandler...");
    connectWalletHandler();
  }, []);

  useEffect(() => {
    console.log("Loading:", loading);
  }, [loading]);

  useEffect(() => {
    console.log("web3", web3);
  }, [web3]);


  // USER INTERACTION 
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



  // VARIABLE AND CONTENT TESTING
  // Function to check the sha512 string
  const check512correct = async (string) => {
    console.log("check512correct..", string);

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


  // check if registered already - redundant, should improve
  async function checkIfRegistered(string_in) {
    console.log("checkIfRegistered...", string_in);

    let getCheckedsha512;

    try {
      getCheckedsha512 = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: DigitalOwnership.options.address,
            data: DigitalOwnership.methods.getDO(string_in).encodeABI(),
          },
          "latest",
        ],
      });

      console.log("Got DO data from contract...");

      if (!getCheckedsha512 || getCheckedsha512 === "0x") {  // the sha512 does not exist yet
        console.log(getCheckedsha512);
        console.log("Revert or empty response detected, continuing execution.");
        return true; 
      } 

      // If we have a valid response, decode it
      const decoded = await web3.eth.abi.decodeParameters(
        ["address", "uint96", "bool"],
        getCheckedsha512
      );

      // Check if the returned address is valid
      if (decoded[0].length === 42) {
        showError("This SHA512 is already registered");
        setRegisteredsha512("");
        return false; // Stop further execution as the hash is already registered
      }

    } catch (err) {
      // Log the error and continue
      console.error("No registration of this SHAsum:", err);
    }

    // finsish and return
    return true;
  }


  // Function to get whitepaper
  useEffect(() => {
    console.log("Getting whitepaper...");

    const fetchMarkdown = async () => {
      const res = await fetch('/whitepaper.md'); // Fetch from the public directory
      const markdown = await res.text();
      const mdxSource = await serialize(markdown);
      setMdxContent(mdxSource);
    };

    fetchMarkdown();
  }, []);


  // H5 ENCODING
  // Component to connect wallet
  const ConnectWallet = () => {
    return (
      <nav className={styles.whiteBackground} style={{ position: 'absolute', zIndex: 1, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0)' }}>
        <div className={styles.container} style={{ display: 'flex', alignItems: 'center' }}>
          <div className="navbar-brand" style={{ color: 'white' }}>
            <div className="content">
              <h2></h2>
              <h4></h4>
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
            src="./images/DigitalOwnershipLogo_small.jpg"
            alt="top_image"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      </nav>
    );
  };

  // Component to display address information
  const addressInfo = () => {
    return (
      <div className={styles.card}>
        <nav className={styles.whiteBackground}>
          <div className={styles.container}>
            <div className="navbar-brand">
              <h1>Your connection to DigitalOwnership</h1>
            </div>
          </div>
          <div className={styles.container}>
            <div className={styles.navbarEnd}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: '10px', width: buttonWidth }}>
                  <button
                    onClick={() => window.open(ethScanUrl, '_blank')}
                    className={`button is-outlined is-small`}
                  >
                    View this contract on Arbitrumscan?
                  </button>
                </div>
              </div>
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
          </div>

          <div className={styles.container}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p style={{ marginRight: '10px' }}>DigitalOwnership contract address: {DigitalOwnershipAddress}</p>
              <button
                onClick={() => copyToClipboard(DigitalOwnershipAddress)}
                className={`button is-outlined is-small`}
              >
                Copy Address
              </button>
            </div>
          </div>
        </nav>
      </div>
    );
  };

  // Component to register DO
  const RegisterDO = () => {
    return (
      <div className={styles.card}>
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
                register DO
              </button>
            </div>
          </div>
        </nav>
      </div>
    );
  };

  // Component to check registered DO
  const CheckDO = () => {
    return (
      <div className={styles.card}>
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
                className={`button is-outlined is-fullwidth ${loadingRead ? "is-loading" : ""}`}
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


        <nav className={styles.whiteBackground}>
          <div className={styles.container}>
            <div className="navbar-brand">
              <h1>sha512 registrations and transfers per address</h1>
            </div>
          </div>
          <div className={styles.container} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '50%' }}>
              <label htmlFor="DOOnAddress">Address</label>
              <input
                className="input"
                type="text"
                id="DOOnAddress"
                value={DOOnAddress}
                onChange={(e) => setDOOnAddress(e.target.value)}
              />
            </div>
            <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
              <button
                onClick={getDOOnAddressHandler}
                className={`button is-outlined is-fullwidth ${loadingRead ? "is-loading" : ""}`}
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
      </div>
    );
  };


  // Component to offer DO
  const OfferDO = () => {
    return (
      <div className={styles.card}>
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
              <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
                <button
                  onClick={setOfferHandler}
                  className={`button is-outlined is-fullwidth ${loading ? "is-loading" : ""}`}
                >
                  offer DO
                </button>
              </div>
            </div>
          </div>
        </nav>

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
              <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
                <button
                  onClick={setBuyingHandler}
                  className={`button is-outlined is-fullwidth ${loading ? "is-loading" : ""}`}
                >
                  Accept DO
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
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
          <p>© 2025 SquaredAnt GmbH. All rights reserved.</p>
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
      <div className={styles.navbar}>
        <a href="#" data-id="register" onClick={handleClick}>Register DO</a>
        <a href="#" data-id="check" onClick={handleClick}>Check DO</a>
        <a href="#" data-id="transfer" onClick={handleClick}>Transfer DO</a>
        <a href="#" data-id="wp" onClick={handleClick}>Whitepaper</a>
      </div>
    );
  };

  return (
    <div className={styles.main}>
      <Head>
        <title>DO trade</title>
        <meta name="description" content="An DO marketplace app" />
      </Head>
      <ToastContainer />

      {/* CONNECT WALLET */}
      {ConnectWallet()}

      {/* TOP IMAGE */}
      {TopImage()}

      {/* SIDEBAR */}
      <TopBar onSelect={handleSelectView} />

      {/* FAUCET */}
      {addressInfo()}

      {/* Register DO Section */}
      <div id="register">
        {currentView === 'register' && RegisterDO()}
      </div>

      {/* Check DO Section */}
      <div id="check">
        {currentView === 'check' && CheckDO()}
      </div>

      {/* Offer DO Section */}
      <div id="transfer">
        {currentView === 'transfer' && OfferDO()}
      </div>

      {/* Resend */}
      <div id="resend">
        {currentView === 'wp' && whitePaper()}
      </div>

      {/* Whitepaper */}
      <div id="wp">
        {currentView === 'resend' && resend()}
      </div>


      {/* Footer */}
      <Footer />
    </div>

  );


};




export default digitalOwnership;
