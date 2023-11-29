"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import Web3 from "web3";
import IPTContract from "../../../blockchain/iptest";
import "bulma/css/bulma.css";
import styles from "../../../styles/ipt.module.css";

let web3;
let accounts;

const ipttest = () => {
  const [error, setError] = useState("");
  const [inventory, setInventory] = useState("");
  const [approveAddress, setApproveAddress] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [readApproval, setReadApproval] = useState("");

  useEffect(() => {
    getInventoryHandler();
  });

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
        method: "eth_sendTransaction",
        params: [
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
      try {
        accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        web3 = new Web3(window.ethereum);
      } catch (err) {
        setError(err.message);
      }
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
              className="button is-primary"
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
                  className="button is-primary"
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
                  class="input"
                  type="text"
                  id="approveAddress"
                  value={approveAddress}
                  onChange={approvalAddressChange}
                />
                <p class="help">You typed: {approveAddress}</p>
              </div>
              <div>
                <label htmlFor="myInput">Amount:</label>
                <input
                  class="input"
                  type="text"
                  id="approveAmount"
                  value={approveAmount}
                  onChange={approvalAmountChange}
                />
                <p class="help">You typed: {approveAmount}</p>
              </div>
              <div className="navbar-end">
                <button
                  onClick={setApprovalHandler}
                  className="button is-primary"
                >
                  Approve
                </button>
              </div>
              <div className="container">
                <p> Allowance for this address: {String(readApproval)} </p>
                <div className="navbar-end">
                  <button
                    onClick={readApprovalHandler}
                    className="button is-primary"
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
