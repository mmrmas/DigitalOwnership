"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import Web3 from "web3";
import contracts from "../../../blockchain/iptest.js"; //
import "bulma/css/bulma.css";
import styles from "../../../styles/ipt.module.css";

const IPTContract = contracts.IPTContract;
const IPtrade = contracts.IPtrade;
const IPtradeAddress = IPtrade.options.address;
const buttonWidth = "15%";

const iptrade = () => {
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
  const [registeredMd5, setregisteredMd5] = useState("");
  const [test, setTest] = useState("print_test");
  const [checkedMd5, getCheckedMd5] = useState("");
  const [checkedMd5Address, getCheckedMd5Address] = useState("");
  const [offeredMd5, setOfferedMd5] = useState("");
  const [offeredAddress, setOfferedAddress] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");
  const [buyingMd5, setBuyingMd5] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [registerCost, setRegisterCost] = useState("");
  const [tradeCost, setTradeCost] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [description, setDescription] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [registrationEvent, setRegistrationEvent ] = useState("");


  /*
  CONNECT WALLET
  */
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
      setLoading(false);
      console.log(window.ethereum);
      console.log("MetaMask is installed!");
      console.log(await window.ethereum.request({ method: "eth_blockNumber" }));
    } else {
      console.log("Please install Metamask");
    }
  };

  /*
  APPROVALS
  */
  // get the approved address
  const approvalAddressChange = (event) => {
    setApproveAddress(event.target.value);
  };

  // then get the approved amount
  const approvalAmountChange = (event) => {
    setApproveAmount(event.target.value);
  };

  //set approval
  const setApprovalHandler = async () => {
    try {
      console.log(web3);
      console.log(accounts[0]);
      console.log(IPTContract.options.address);
      console.log(IPTContract.methods);

      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPTContract.options.address,
            data: IPTContract.methods
              .approve(approveAddress, approveAmount)
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
      console.log("Caller", accounts[0]);
      console.log("Address", approveAddress);
      console.log("Approval:", decimalValue);
      setReadApproval(decimalValue);
    } catch (err) {
      console.error("Allowance error:", err);
      setError(err.message);
    }
  };

  // revoke approval
  const revokeApprovalHandler = async () => {
    console.log("Pressed to revoke approval");
    try {
      const revokeApproval = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPTContract.options.address,
            data: IPTContract.methods
              .revokeApproval(approveAddress)
              .encodeABI(),
          },
          "latest",
        ],
      });
      console.log("Caller", accounts[0]);
      console.log("Address", approveAddress);
      console.log("revoked approval for: ", approveAddress);
    } catch (err) {
      console.error("revoke error:", err);
      setError(err.message);
    }
  };

  /*
  FAUCET
  */
  const getFaucetHandler = async () => {
    console.log(IPtrade);
    // Faucet
    const faucet = await window.ethereum.request({
      method: "eth_call",
      params: [
        {
          from: accounts[0], // specify the sender
          to: IPtrade.options.address,
          data: IPtrade.methods.freeIpTokenwithdrawal().encodeABI(),
        },
        "latest",
      ],
    });

    // registration
    const registrationprice = await window.ethereum.request({
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

    // transfer
    const transferprice = await window.ethereum.request({
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
    
    setFaucet(faucet);
    setRegistrationPrice(registrationprice);
    setTransferPrice(transferprice);
    console.log(faucet);
  };

  const getIPTHandler = async () => {
    console.log("get free IPT");
    console.log(IPtrade.options.address);
    console.log(IPtrade.methods);
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
      setError(txReceipt);
    } catch (err) {
      console.error("getting IPT failed:", err);
      setError(err.message);
    }
  };



  /*
    EVENTS
  */
const listenForEvents = async () => {
        try {
            // Call the contracts events method to get past events
            const events = await IPtrade.getPastEvents('TokensRequested', {
                fromBlock: 0, // Start block (you can change this)
                toBlock: 'latest' // End block (you can change this)
            });
            
            // Iterate over the events and process them
            events.forEach(event => {
                console.log('New event received:');
                console.log(event.returnValues);
            });
        } catch (error) {
            console.error('Error:', error);
        }

          try {
            // Call the contracts events method to get past events
            const events = await IPtrade.getPastEvents('IPRegistered', {
                fromBlock: 0, // Start block (you can change this)
                toBlock: 'latest' // End block (you can change this)
            });
            
            // Iterate over the events and process them
            events.forEach(event => {
                console.log('New registration received:');
                // const registeredHex = String(event.returnValues.description);
                // console.log(registeredHex);
                // setRegistrationEvent(registeredHex);
            });
        } catch (error) {
            console.error('Error:', error);
        }
};

  /*
    IP REGSITRATION
  */


  const descriptionChange = (event) => {
    setDescription(event.target.value);
  };

  // get registration , trade fee
  // register fee
  const getRegisterCostHandler = async () => {
    console.log(IPtrade);
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

  // trade fee
  const getTradeCostHandler = async () => {
    console.log(IPtrade);
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

  const registeredMd5Change = (event) => {
    setregisteredMd5(event.target.value);
  };

  useEffect(() => {
    // This code will execute after registeredMd5 has been updated
    let md5Length = registeredMd5.length;
    if (md5Length !== 32) {
      setError("This is not a valid MD5sum");
    } else {
      setError("");
    }

    console.log("set approved address for ", IPtradeAddress);
    setApproveAddress(IPtradeAddress);

    // after web3 init
    if (web3) {
      // get registratuion and trade cost
      getRegisterCostHandler();
      getTradeCostHandler();
    }
  }, [registeredMd5, web3]); // Specify registeredMd5 as a dependency

  useEffect(() => {
    // This code will run whenever approveAddress is updated
    if (web3) {
      console.log("updatig approval");
      readApprovalHandler();
    }
  }, [approveAddress, web3]);

  const setRegistrationHandler = async () => {
    console.log("set IP");

    // get the register cost and trade cost

    // check length of the md5sum
    let md5Length = registeredMd5.length;
    if (md5Length !== 32) {
      console.log("not the right MD5sum length");
      return; // Exit the function
    }

    // check allowance for the contract
    console.log("Approved:", approveAddress);

    try {
      console.log("registerCost: ", registerCost);
      console.log("readApproval: ", readApproval);
      if (readApproval < registerCost) {
        console.log("approval not sufficient");
        return;
      }
    } catch (err) {
      console.log("approval issue: ", err);
    }

    console.log("registeredMd5: ", registeredMd5);
    // register IP
    console.log("Register");
    console.log(IPtrade.options.address);
    console.log(IPtrade.methods);

    try {
      const txReceipt = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPtrade.options.address,
            data: IPtrade.methods.setIP(registeredMd5, true).encodeABI(),
          },
          "latest",
        ],
      });
      console.log("receipt:", txReceipt);
      setError(txReceipt);
    } catch (err) {
      console.error("setting IPT failed:", err);
      setError(err.message);
    }
  };

  /*
    IP CHECK
  */

  const checkedMd5Change = (event) => {
    getCheckedMd5(event.target.value);
    getCheckedMd5Address("");
  };

  useEffect(() => {
    // This code will execute after checkedMD5 has been updated
    let md5Length = checkedMd5.length;
    console.log(md5Length);
    console.log(checkedMd5);
    if (md5Length !== 32) {
      setError("This is not a valid MD5sum");
    } else {
      setError("");
    }
  }, [checkedMd5]); // Specify registeredMd5 as a dependency

  const getRegisteredIpHandler = async () => {
    console.log("get IP");
    let md5Length = checkedMd5.length;
    if (md5Length == 32) {
      console.log("checkedMd5");

      // check it and return an address
      try {
        const getCheckedMD5 = await window.ethereum.request({
          method: "eth_call",
          params: [
            {
              from: accounts[0], // specify the sender
              to: IPtrade.options.address,
              data: IPtrade.methods.getIP(checkedMd5).encodeABI(),
            },
            "latest",
          ],
        });

       console.log("web3: ", web3);

        // Decode the return value using web3.eth.abi.decodeParameters
        const decoded = await web3.eth.abi.decodeParameters(
         ["bool", "address", "uint256"],
           getCheckedMD5
        );
        console.log("checkedMD5:", decoded[1]);
        getCheckedMd5Address(decoded[1]);

        listenForEvents();
      } catch (err){
        console.error("Error in getRegisteredIpHandler:", err);
      }
    }
  };

  /*
    OFFER IP
  */
  const offeredMd5Change = (event) => {
    setOfferedMd5(event.target.value);
  };

  const offeredAddressChange = (event) => {
    setOfferedAddress(event.target.value);
  };

  const offeredPriceChange = (event) => {
    setOfferedPrice(event.target.value);
  };

  const setOfferHandler = async () => {
    console.log("Offer IP");

    // check if MD5 is valid
    if (offeredMd5.length !== 32) {
      console.log("not the right MD5sum length");
      return; // Exit the function
    }

    // check if Price is valid
    if (isNaN(offeredPrice)) {
      console.log("price is not a number");
      return; // Exit the function
    }

    // check if the address has sufficient IPT
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
      console.log("address balance:", decimalValue);
      if (decimalValue < offeredPrice) {
        return (
          decimalValue, " is lower than the requested price: ", offeredPrice
        );
      }
    } catch (err) {
      console.log("error in getting balance ", err);
    }

    try {
      const txReceipt = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPtrade.options.address,
            data: IPtrade.methods
              .sellerCreatesSalesIntent(
                offeredMd5,
                offeredPrice,
                offeredAddress,
                true
              )
              .encodeABI(),
          },
          "latest",
        ],
      });
      console.log("receipt:", txReceipt);
      setError(txReceipt);
    } catch (err) {
      console.error("offering IPT failed:", err);
      setError(err.message);
    }
  };

  /*
    BUY IP
  */

  const buyingMd5Change = (event) => {
    setBuyingMd5(event.target.value);
  };

  const buyingPriceChange = (event) => {
    setBuyingPrice(event.target.value);
  };

  const setBuyingHandler = async () => {
    console.log("Buy IP");

    // check if MD5 is valid
    if (buyingMd5.length !== 32) {
      console.log("not the right MD5sum length");
      return; // Exit the function
    }

    // check if Price is valid
    if (isNaN(buyingPrice)) {
      console.log("price is not a number");
      return; // Exit the function
    }

    // check if the approval is sufficient
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
      if (decimalValue < buyingPrice) {
        console.log(
          decimalValue,
          " is smaller then the agreed price ",
          buyingPrice
        );
        return;
      }
    } catch (err) {
      console.error("Allowance error:", err);
      setError(err.message);
    }

    // register the purchase
    try {
      const txReceipt = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // specify the sender
            to: IPtrade.options.address,
            data: IPtrade.methods
              .buyerBuysIP(buyingMd5, buyingPrice, true)
              .encodeABI(),
          },
          "latest",
        ],
      });
      console.log("receipt:", txReceipt);
      setError(txReceipt);
    } catch (err) {
      console.error("buying IPT failed:", err);
      setError(err.message);
    }
  };

  /*
  OTHER FUNCTIONS
  */
  // const xxChange = (event) => {
  //  setXx(event.target.value);
  //};

  //const setXxHandler = async () =>{
  // console.log("do sth");
  // };

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      // Success message or any other action after copying
      console.log('Text copied to clipboard:', text);
    })
    .catch((error) => {
      console.error('Error copying text to clipboard:', error);
    });
};

  useEffect(() => {
    console.log("Loading: ", loading );
  }, [loading]);

  useEffect(() => {
    getFaucetHandler();
  }, []);

  useEffect(() => {
    console.log(web3); // This will be triggered whenever web3 changes
  }, [web3]);

  useEffect(() => {
    console.log(isDropdownVisible); // This will be triggered whenever isDropdownVisible changes
  }, [isDropdownVisible]);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };


  /* 
  H5 types and code
  */

    const ConnectWallet = () =>{
    return(
      <nav className={styles.whiteBackground} style={{ position: 'absolute', zIndex: 1, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0)' }}>
        <div className={styles.container} style={{ display: 'flex', alignItems: 'center' }}>
          <div className="navbar-brand" style={{color:'white'}}>
              <div className="content">
            <h1> IP trade</h1>
            <h4> Register your creative content on chain </h4>
          </div>
          </div>
          <div className={styles.navbarEnd} style = {{width: buttonWidth}}>
            <button
              onClick={connectWalletHandler}
              className={`button  is-fullwidth`}
            >             
            Connect Wallet
            </button>
            </div>
        </div>

      </nav>
    );
  };


  const TopImage = () => {
        console.log("Top");
    return(
        <nav className={styles.whiteBackground} >
             <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
                <img 
                    src= "/img/ipt_coin.jpg"
                    alt="top_image"
                   style ={{ width: '100%', height: '100%' }}
                /> 
    
  </div> 
          </nav>
    );
  };




 

  const Faucet = ({ faucet }) => {
    if (!faucet) {

      return 
       <nav className={styles.whiteBackground}>
        <div>Please wait for faucet to connect...</div>; // Render a loading indicator while waiting for data
      </nav>
    }
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
            <h1>your connection to IP trade</h1>
          </div>
          <div className= {styles.navbarEnd}>
            <div className={styles.container}>
              <div style={{ display: 'flex', alignItems: 'center'}}>
                <p style={{ marginRight: '10px' }}> Your address: <strong> {`${loading ? " please connect wallet" : accounts[0]}` } </strong></p>
                 
                 <button 
                 onClick={() => copyToClipboard(loading ? "Address not loaded" : accounts[0])}
                 className ={`button is-small`}
                 >
                 {copied ? 'Copied!' : 'Copy Address'}
                  </button>
              </div>
              <p> Faucet height: {String(faucet) / 1000000000000000000} IPT</p>
              <p> Registration price: {String(registrationPrice) / 1000000000000000000} IPT</p>
              <p> Transfer price: {String(transferPrice) / 1000000000000000000} IPT</p>
            </div>
            <div className= {styles.navbarEnd} style = {{width:buttonWidth}}>
              <button
                onClick={getIPTHandler}
                className={`button   is-fullwidth ${loading ? "is-loading" : " "}`}
              >
                get IPT
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  const Approval = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
              <div className="content">
            <h1>set allowance</h1>
            </div>
          </div>
        </div>
        <div>
          <div>
            <div className={styles.container}  >
              <div className="has-text-left"  style={{ margin: '15px', width: '40%' }} >
              <div className="content">
                  <p>The contact needs your approval to spend IPT on your behalf.</p>
                  <p> Please make sure to approve at least the amount that you
                  need for the desired transaction. Every transaction reduces the
                  allowance until it reaches 0.</p>
              </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center'}}>
                <p  className="has-text-left"  style={{ margin: '10px', width: '50%' }}> The address of this contract is {IPtradeAddress} </p>
                 
                 <button 
                 onClick={() => copyToClipboard(IPtradeAddress)}
                 className ={`button is-small`}
                 >
                 {copied ? 'Copied!' : 'Copy Address'}
                </button>
              </div>

              <div  style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{width: '50%'}}>
                <label htmlFor="approveAddress">Address to approve:</label>

                <input
                  className="input"
                  type="text"
                  id="approveAddress"
                  value={approveAddress}
                  onChange={approvalAddressChange}
                />
              </div>
              <div className= {styles.navbarEnd} style = {{width:buttonWidth}}>
                <button
                onClick={readApprovalHandler}
                className={`button   is-fullwidth ${loading ? "is-loading" : ""}`}
                >
                check allowance
                </button>
              </div>
             </div> 




              <div style={{ display: 'flex', alignItems: 'center' }}>
               <div style = {{width: '50%'}}>
                  <label htmlFor="approveAmount">Amount to approve:</label>
                  <input
                   className="input"
                   type="text"
                   id="approveAmount"
                   value={approveAmount}
                   onChange={approvalAmountChange}
                  />
                </div>
                <div className= {styles.navbarEnd} style = {{width:buttonWidth}}>
                <button
                  onClick={setApprovalHandler}
                  className={`button   is-fullwidth ${loading ? "is-loading" : ""}`}
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

  const Allowance = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
        <div>
          Allowance for address {approveAddress}:{" "}
          {String(readApproval) / 1000000000000000000} IPT
          </div>
        </div>
      </nav>
    );
  };

  const RevokeApproval = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className= {styles.navbarEnd} style = {{width:buttonWidth}}>
            <button
              onClick={revokeApprovalHandler}
              className={`button   is-fullwidth ${loading ? "is-loading" : ""}`}
            >
              revoke allowance
            </button>
          </div>
        </div>
      </nav>
    );
  };

  const RegisterIP = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
            <h1>register content</h1>
          </div>
        </div>
    


        <div className={styles.container} style={{ display: 'flex', alignItems: 'center' }}>
          <div style = {{width:'50%'}}>
            <label htmlFor="registerMd5">MD5sum</label>
            <input
              className="input"
              type="text"
              id="registerMd5"
              value={registeredMd5}
              onChange={registeredMd5Change}
            />
          </div>
          <div className= {styles.navbarEnd} style = {{width:buttonWidth}}>
            <button
              onClick={setRegistrationHandler}
              className={`button   is-fullwidth ${loading ? "is-loading" : ""}`}
            >
              Register
            </button>
          </div>
        </div>
      </nav>
    );
  };

  const CheckIP = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
            <h1>check registered content</h1>
          </div>
        </div>
        <div className={styles.container} style={{ display: 'flex', alignItems: 'center' }}>
          <div style = {{width:'50%'}}>
            <label htmlFor="checkMd5">MD5sum</label>
            <input
              className="input"
              type="text"
              id="checkMd5"
              value={checkedMd5}
              onChange={checkedMd5Change}
            />
          </div>
          <div className= {styles.navbarEnd} style = {{width:buttonWidth}}>
            <button  
              onClick={getRegisteredIpHandler}
              className={`button is-fullwidth is-fullwidth   ${loading ? "is-loading" : ""}`}
            >
              Check IP
            </button>
          </div>
        </div>
        <div className={styles.container}>
            <p>Registered Address: {error == "This is not a valid MD5sum" && checkedMd5.length > 0 ? error : checkedMd5Address}</p>
        </div>
      </nav>
    );
  };

  const OfferIP = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
            <h1>offer content to buyer </h1>
          </div>
        </div>
        <div className={styles.container}>
          <div style = {{width: '50%' }}>
            <label htmlFor="offerIpMd5">MD5sum</label>
            <input
              className="input"
              type="text"
              id="offerIpMd5"
              value={offeredMd5}
              onChange={offeredMd5Change}
            />
          </div>

          <div style = {{width:'50%'}}>
            <label htmlFor="offerIpAddress">Address</label>
            <input
              className="input"
              type="text"
              id="offerIpAddress"
              value={offeredAddress}
              onChange={offeredAddressChange}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style = {{width:'50%'}} >
            <label htmlFor="offerIpPrice">Price</label>
            <input
              className="input"
              type="text"
              id="offerIpPrice"
              value={offeredPrice}
              onChange={offeredPriceChange}
            />
          </div>
        

          <div className= {styles.navbarEnd} style = {{width:buttonWidth}}>
            <button
              onClick={setOfferHandler}
              className={`button   is-fullwidth ${loading ? "is-loading" : ""}`}
            >
              offer IP
            </button>
          </div>
          </div>
        </div>
      </nav>
    );
  };

  const BuyIP = () => {
    return (
      <nav className={styles.whiteBackground}>
        <div className={styles.container}>
          <div className="navbar-brand">
            <h1>buy content</h1>
          </div>
        </div>
        <div className={styles.container}>
          <div  style = {{width:'50%'}}>
            <label htmlFor="buyIpMd5">MD5sum</label>
            <input
              className="input"
              type="text"
              id="buyIpMd5"
              value={buyingMd5}
              onChange={buyingMd5Change}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div  style = {{width:'50%'}}>
              <label htmlFor="buyIpPrice">Price</label>
              <input
                className="input"
                type="text"
                id="buyIpPrice"
                value={buyingPrice}
                onChange={buyingPriceChange}
              />
            </div>

            <div className= {styles.navbarEnd} style = {{width:buttonWidth}}>
              <button
                onClick={setBuyingHandler}
                className={`button   is-fullwidth ${loading ? "is-loading" : ""}`}
              >
                buy IP
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

   const WithdrawOffer = () => {
    console.log("cancel offer");
   };


  const DeleteIP = () => {
    console.log("delete registered content");
   };




  return (

    
    <div className={styles.main} >

  
      <Head>
        <title>IP trade</title>
        <meta name="description" content="An IP marketplace app" />
      </Head>




      {/* CONNECT WALLET */}
      {ConnectWallet()}

      {/* TOP IMAGE */}
      {TopImage()}

      {/* FAUCET */}
      <Faucet faucet={faucet} />
      
      {/* APPROVAL */}
      {Approval()}

      {/* ALLOWANCE */}
      {Allowance()}

      {/* REVOKE APPROVAL */}
      {RevokeApproval()}

      {/* REGISTER IP */}

      {RegisterIP()}

      {/* CHECK IP */}
      {CheckIP()}

      {/* OFFER IP */}
      {OfferIP()}

      {/* BUY IP */}
      {BuyIP()}

      {/* WITHDRAW OFFER */}
      {WithdrawOffer()}

      {/* DELETE IP */}
      {DeleteIP()}
    </div>
  );
};

const ErrorSection = ({ error }) => (
  <section>
    <div className="container has-text-danger">
      <p>{error}</p>
    </div>
  </section>
);

export default iptrade;
