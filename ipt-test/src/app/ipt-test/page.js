"use client";

// need to reload after eth_sendTransaction

import Head from "next/head";
import { useState, useEffect } from "react";
import Web3 from "web3";
import IPTContract from "../../../blockchain/iptest";
import "bulma/css/bulma.css";
import styles from "../../../styles/ipt.module.css";

const ipttest = () => {
  const [error, setError] = useState("");
  const [inventory, setInventory] = useState("");
  const [approveAddress, setApproveAddress] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [readApproval, setReadApproval] = useState("");
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
  getInventoryHandler();
}, []);

  /* 
   =================== 0x4a845E3Af338Ec8ae3696a4f6cB786bCF0688a08 
   ========== approval 
  */
  // first get the address
  const approvalAddressChange = (event) => {
    setApproveAddress(event.target.value);
  };

  // then get the amount
  const approvalAmountChange = (event) => {
    setApproveAmount(event.target.value);
  };

  //set approval
  const setApprovalHandler = async () => {
    try {
      console.log(web3);
      console.log(accounts[0]);
      await window.ethereum.request({
     
        "method": "eth_sendTransaction",
        "params": [
          {
            from: accounts[0], // specify the sender
            to: IPTContract.options.address,
            data: IPTContract.methods
              .approveAmount(approveAddress, approveAmount)
              .encodeABI(),
          },
        ],
      });
      console.log("Approval successful");
    } catch (err) {
      console.error("Approval error:", err);
      setError(err.message);
    }
  };

  // read approval
  const readApprovalHandler = async () => {
    console.log("Pressed to read approval");
    try {
      const readApproval = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPTContract.options.address,
            data: IPTContract.methods
              .readApprovalFor(approveAddress)
              .encodeABI(),
          },
          "latest",
        ],
      });
      const decimalValue = web3.utils.hexToNumber(readApproval);
      // const readApproval = await IPTContract.methods.readApprovalFor(approveAddress).call();
      console.log("Caller", accounts[0]);
      console.log("Address", approveAddress);
      console.log("Approval:", decimalValue);
      setReadApproval(readApproval);
    } catch (err) {}
    const allowance = await IPTContract.methods
      .allowance(accounts[0], approveAddress)
      .call();
    alert(allowance);
  };

  const getInventoryHandler = async () => {
    const inventory = await IPTContract.methods.getBlockReward().call();
    setInventory(inventory);
    console.log(inventory);
  };

  //window.ethereum
  const connectWalletHandler = async () => {
    console.log("connect wallet");
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
        let provider = window.ethereum;
        // edge case if MM and CBW are both installed
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
      console.log("MetaMask is installed!");
    } else {
      //
      console.log("Please install Metamask");
    }
  };

  return (
    <div className={styles.main}>
      <Head>
        <title>ipt-test</title>
        <meta name="description" content="An IP marketplace app" />
      </Head>
      <nav className="navbar mt-4 mb-4">
        <div className="container">
          <div className="navbar-brand">
            <h1>ipt-test</h1>
          </div>
          <div className="navbar-end">
            <button
              onClick={connectWalletHandler}
              className={`button is-primary ${loading ? 'is-loading' : ''}`}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>
      <section className={styles.whiteBackground}>
        <div>
          <div className="container">
            <div className="navbar-brand">
              <h1>IPT faucet</h1>
            </div>
          <div className="navbar-end">
            <div className="container">
               <p> Faucet hight: {String(inventory) / 1000000000000000000}</p>
            </div>
            <div className="navbar-end">
                <button
                  onClick={null}
                  className={`button is-primary ${loading ? 'is-loading' : ''}`}
                >
                  get IPT
                </button>
              </div>
            </div>
          </div>
          </div>
      </section>

      <section className={styles.whiteBackground}>
        <div className="container">
          <div className="navbar-brand">
            <h1>approval</h1>
          </div>
        </div>
        <div>
          <div>
            <div className="container">
              <div>
                <label htmlFor="myInput">Type address:</label>

                <input
                  className="input"
                  type="text"
                  id="approveAddress"
                  value={approveAddress}
                  onChange={approvalAddressChange}
                />
                <p className="help">You typed: {approveAddress}</p>
              </div>
              <div>
                <label htmlFor="myInput">Amount:</label>
                <input
                  className="input"
                  type="text"
                  id="approveAmount"
                  value={approveAmount}
                  onChange={approvalAmountChange}
                />
                <p className="help">You typed: {approveAmount}</p>
              </div>
              <div className="navbar-end">
                <button
                  onClick={setApprovalHandler}
                  className={`button is-primary ${loading ? 'is-loading' : ''}`}
                >
                  Approve
                </button>
              </div>
              <div className="container">
                <p> Allowance for this address: {String(readApproval)} </p>
                <div className="navbar-end">
                  <button
                    onClick={readApprovalHandler}
                    className={`button is-primary ${loading ? 'is-loading' : ''}`}
                  >
                    Allowance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container has-text-danger">
          <p>{error}</p>
        </div>
      </section>
    </div>
  );
};

export default ipttest;
