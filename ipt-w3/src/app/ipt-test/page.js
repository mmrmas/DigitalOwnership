"use client";

import Head from "next/head.js";
import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import contracts from "../../../blockchain/iptest.js"; //
import "bulma/css/bulma.css";
import styles from "../../../styles/ipt.module.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image.js';

const IPTContract = contracts.IPTContract;
const IPtrade = contracts.IPtrade;
const IPtradeAddress = IPtrade.options.address;
const buttonWidth = "15%";

const IpTrade = () => {
  const [currentView, setCurrentView] = useState('approve');
  const [error, setError] = useState("");
  const [faucet, setFaucet] = useState("");
  const [registrationPrice, setRegistrationPrice] = useState("");
  const [transferPrice, setTransferPrice] = useState("");
  const [approveAddress, setApproveAddress] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [readApproval, setReadApproval] = useState("");
  const [loading, setLoading] = useState(true);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [registeredsha512, setregisteredsha512] = useState("");
  const [checkedsha512, getCheckedsha512] = useState("");
  const [checkedsha512Address, getCheckedsha512Address] = useState("");
  const [checkedsha512FirstRegistration, getCheckedsha512FirstRegistration] = useState("");
  const [offeredsha512, setOfferedsha512] = useState("");
  const [offeredAddress, setOfferedAddress] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");
  const [buyingsha512, setBuyingsha512] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [registerCost, setRegisterCost] = useState("");
  const [tradeCost, setTradeCost] = useState("");
  const [copied, setCopied] = useState(false);
  const [registrationEvent, setRegistrationEvent] = useState("");
  const [transferEvent, setTransferEvent] = useState("");
 
  // Function to connect wallet
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
    }
  };

  // Common function to handle errors
  const handleError = (err, addressErrorMessage, uintErrorMessage) => {
    const errorMessage = err.toString();
    const match_address = errorMessage.match(/value "([^"]+)" at "\/0" must pass "address" validation/);
    const match_uint = errorMessage.match(/value "([^"]+)" at "\/1" must pass "uint256" validation/);

    if (match_address && match_address[0]) {
      console.error('Caught specific error:', match_address[0]);
      showError(addressErrorMessage);
    } else if (match_uint && match_uint[0]) {
      console.error('Caught specific error:', match_uint[0]);
      showError(uintErrorMessage);
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
            data: IPTContract.methods.approve(approveAddress, approveAmount).encodeABI(),
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
      const decimalValue = web3.utils.hexToNumber(readApproval);
      console.log("Approval:", decimalValue);
      setReadApproval(decimalValue);
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
    } catch (err) {
      showError(err.toString());
    }
  }, [accounts]);

  // Function to get free IPT
  const getIPTHandler = async () => {
    console.log("get free IPT");
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
    } catch (err) {
      console.error("getting IPT failed:", err);
      showError(err.data.message);
    }
  };

  // Function to listen for events
  const listenForEvents = async () => {
    try {
      const registrationEvents = await IPtrade.getPastEvents('IPRegistered', {
        fromBlock: 0,
        toBlock: 'latest'
      });

      let registrationString = '';
      registrationEvents.forEach(event => {
        if (event.returnValues[1].toLowerCase() === checkedsha512.toLowerCase()) {
          console.log("registered by", event.returnValues[0]);
          registrationString = `${registrationString}\n${event.returnValues[0]}`;
        }
      });
      setRegistrationEvent(registrationString);

      const transferEvents = await IPtrade.getPastEvents('IPTransferred', {
        fromBlock: 0,
        toBlock: 'latest'
      });

      let transferString = '';
      transferEvents.forEach(event => {
        if (event.returnValues[2].toLowerCase() === checkedsha512.toLowerCase()) {
          console.log("transferred to", event.returnValues[1]);
          transferString = `${transferString}\n${event.returnValues[1]}`;
        }
      });
      setTransferEvent(transferString);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Function to get registration cost
  const getRegisterCostHandler = async () => {
    const registerCostToGet = await window.ethereum.request({
      method: "eth_call",
      params: [
        {
          from: accounts[0], // specify the sender
          to: IPtrade.options.address,
          data: IPtrade.methods.registerIPCostIpt().encodeABI(),
        },
        "latest",
      ],
    });
    const registerCostToSet = web3.utils.hexToNumber(registerCostToGet);
    setRegisterCost(registerCostToSet);
  };

  // Function to get trade cost
  const getTradeCostHandler = async () => {
    const tradeCostToGet = await window.ethereum.request({
      method: "eth_call",
      params: [
        {
          from: accounts[0], // specify the sender
          to: IPtrade.options.address,
          data: IPtrade.methods.transferIPCostIpt().encodeABI(),
        },
        "latest",
      ],
    });
    const tradeCostToSet = web3.utils.hexToNumber(tradeCostToGet);
    setTradeCost(tradeCostToSet);
  };

  // Function to set registration
  const setRegistrationHandler = async () => {
    if (registeredsha512.length !== 128) {
      showError("This is not a valid sha512. The length should be 128 characters.");
      return;
    }

    if (readApproval < registerCost) {
      showError("Approval not sufficient");
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
    } catch (err) {
      console.error("setting IPT failed:", err);
      showError(err.data.message);
    }
  };

  // Function to get registered IP
  const getRegisteredIpHandler = async () => {
    if (checkedsha512.length !== 128) {
      showError("This is not a valid sha512. The length should be 128 characters.");
      return;
    }

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
      const first_registration = new Date(parseInt(decoded[1]) * 1000).toString();
      getCheckedsha512Address(decoded[0]);
      getCheckedsha512FirstRegistration(first_registration);

      listenForEvents();
    } catch (err) {
      console.error("Error in getRegisteredIpHandler:", err);
      showError(err.data.message);
    }
  };

  // Function to set offer
  const setOfferHandler = async () => {
    if (offeredsha512.length !== 128) {
      showError("This is not a valid sha512. The length should be 128 characters.");
      return;
    }

    if (isNaN(offeredPrice) || offeredPrice.length < 1) {
      showError("Please type a whole number as amount");
      return;
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
      if (decimalValue < offeredPrice) {
        showError(`The balance of buyer (${decimalValue} IPT) is lower than the requested price: ${offeredPrice} IPT`);
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
            data: IPtrade.methods.sellerCreatesSalesIntent(offeredsha512, offeredPrice, offeredAddress).encodeABI(),
          },
          "latest",
        ],
      });
      console.log("receipt:", txReceipt);
    } catch (err) {
      console.error("offering IPT failed:", err);
      showError(err.data.message);
    }
  };

  // Function to set buying
  const setBuyingHandler = async () => {
    if (buyingsha512.length !== 128) {
      showError("This is not a valid sha512. The length should be 128 characters.");
      return;
    }

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
      if (Number(decoded[1]) !== Number(buyingPrice)) {
        showError("Not the right buying price");
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
      if (decimalValue < buyingPrice) {
        showError(`Approval ${decimalValue} is smaller than the agreed price ${buyingPrice}`);
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
      if (decimalValue < buyingPrice) {
        showError(`The balance of buyer (${decimalValue} IPT) is lower than the requested price: ${buyingPrice} IPT`);
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
            data: IPtrade.methods.buyerBuysIP(buyingsha512, buyingPrice, true).encodeABI(),
          },
          "latest",
        ],
      });
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

  useEffect(() => {
    console.log("Loading:", loading);
  }, [loading]);

  useEffect(() => {
    console.log(web3);
  }, [web3]);

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

  // Component to connect wallet
  const ConnectWallet = () => {
    return (
      <nav className={styles.whiteBackground} style={{ position: 'absolute', zIndex: 1, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0)' }}>
        <div className={styles.container} style={{ display: 'flex', alignItems: 'center' }}>
          <div className="navbar-brand" style={{ color: 'white' }}>
            <div className="content">
              <h2>IP trade</h2>
              <h4>Register your creative content on chain</h4>
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
            src="/img/ipt_coin.jpg"
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
            <div className={styles.container}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ marginRight: '10px' }}>Your address: <strong>{`${loading ? " please connect wallet" : accounts[0]}`}</strong></p>
                <button
                  onClick={() => copyToClipboard(loading ? "Address not loaded" : accounts[0])}
                  className={`button is-outlined is-small`}
                >
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
              <p>Faucet height: {String(faucet) / 1000000000000000000} IPT</p>
              <p>Registration price: {String(registrationPrice) / 1000000000000000000} IPT</p>
              <p>Transfer price: {String(transferPrice) / 1000000000000000000} IPT</p>
            </div>
            <div className={styles.navbarEnd} style={{ width: buttonWidth }}>
              <button
                onClick={getIPTHandler}
                className={`button is-outlined is-fullwidth ${loading ? "is-loading" : " "}`}
              >
                get IPT
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
                  {copied ? 'Copied!' : 'Copy Address'}
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
            Allowance for address {approveAddress}: {String(readApproval) / 1000000000000000000} IPT
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
            <label htmlFor="registersha512">sha512 string</label>
            <input
              className="input"
              type="text"
              id="registersha512"
              value={registeredsha512}
              onChange={(e) => setregisteredsha512(e.target.value)}
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
              onChange={(e) => getCheckedsha512(e.target.value)}
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
          <p>Current owner: {error === "This is not a valid sha512" && checkedsha512.length > 0 ? error : checkedsha512Address}</p>
          <p>First registered at: {error === "This is not a valid sha512" && checkedsha512.length > 0 ? error : checkedsha512FirstRegistration}</p>
          <p>First registered by: {error === "This is not a valid sha512" && checkedsha512.length > 0 ? error : registrationEvent}</p>
          <p>Transferred to: {error === "This is not a valid sha512" && checkedsha512.length > 0 ? error : transferEvent}</p>
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
              <label htmlFor="offerIpPrice">Price</label>
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
              <label htmlFor="buyIpPrice">Price</label>
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
                buy IP
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  // Component for footer
  const Footer = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.footer}>
          <p>© 2024 SquaredAnt GmbH. All rights reserved.</p>
          <p>Contact us on ...</p>
          <p>Follow this project on <a href="https://github.com">Github</a></p>
        </div>
      </nav>
    );
  };

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
      </div>

      {/* Offer IP Section */}
      <div id="transfer">
        {currentView === 'transfer' && OfferIP()}
        {currentView === 'transfer' && BuyIP()}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default IpTrade;
