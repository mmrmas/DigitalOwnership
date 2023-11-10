const { expect } = require("chai");
const hre = require("hardhat");

/*
todos
- set the amounts straight: 18 zeros when owner sets; 0 zero's in case of payment; check zero's in EtH!
*/


describe("IPtoken contract", function () {
  // global vars
  let Token;
  let ipToken;
  let IPtrade;
  let iptrade;
  let owner;
  let addr1;
  let addr2;
  let tokenCap = 100000000;
  let tokenBlockReward = 50;

  beforeEach(async function () {
    // Get the contractfactory and signers here
    Token = await ethers.getContractFactory("IPToken");
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    ipToken = await Token.deploy(tokenCap, tokenBlockReward);

    IPtrade = await ethers.getContractFactory('IPtrade');
    iptrade = await IPtrade.deploy(ipToken.address);
  });

  it("Should print owner's address", async function () {
    console.log(owner.address);
    // Add assertions or other test code here
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ipToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await ipToken.balanceOf(owner.address);
      expect(await ipToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the max capped supply to the argument provided during deployment", async function () {
      const cap = await ipToken.cap();
      expect(Number(hre.ethers.utils.formatEther(cap))).to.equal(tokenCap);
    });

    it("Should set the blockReward to the argument provided during deployment", async function () {
      const blockReward = await ipToken.blockReward();
      expect(Number(hre.ethers.utils.formatEther(blockReward))).to.equal(tokenBlockReward);
    });
  });



  describe("translate variables helper functions", function () {
    it("CheckMd5Length should return 32", async function () {
      await expect(iptrade.checkMd5Length('f65a88a4d7e47905325c6b71495fc0b'))
        .to.be.revertedWith("md5 incorr");
      await expect(iptrade.checkMd5Length('f65a88a4d7e47905325c6b71495fc0b4'))
        .to.be.not.reverted;
    })

    it("Should convert string to bytes32", async function () {
      console.log(await ethers.provider.getBalance(addr1.address));
      const stringInput = 'f65a88a4d7e47905325c6b71495fc0b4';
      const expectedOutput = await iptrade.stringToBytes32(stringInput);
      console.log(expectedOutput);
      const rawBytes32 = ethers.utils.hexZeroPad(ethers.utils.hexlify(expectedOutput), 32); // Converting bytes32 to a standard 0x-prefixed string format
      console.log(rawBytes32);
      expect(rawBytes32).to.equal(expectedOutput); // Compare the raw bytes32 output with ethers.js formatted representation})  
    })
  })


  describe("Setter and Getter functions", function () {
    it("Should set the withdrawal amount to 10 ** 18", async function () {
      await iptrade.connect(owner).setWithdrawalAmount(10000000000000000000n);
      expect(await iptrade.getWithdrawalAmount()).to.equal(10000000000000000000n);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setWithdrawalAmount(1)
      ).to.be.revertedWith("owner only");
    })

    it("Should set the locktime to 5 minutes", async function () {
      await iptrade.connect(owner).setLockTime(5);
      expect(await iptrade.getLockTime()).to.equal(5);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setLockTime(1)
      ).to.be.revertedWith("owner only");
    })

    it("Should set the provideFreeTokens bool", async function () {
      await iptrade.connect(owner).setFreetokensBool(false);
      expect(await iptrade.getFreetokensBool()).to.equal(false);
      await iptrade.connect(owner).setFreetokensBool(true);
      expect(await iptrade.getFreetokensBool()).to.equal(true);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setFreetokensBool(true)
      ).to.be.revertedWith("owner only");
    })

    it("Should set the registerIPCostIpt ", async function () {
      await iptrade.connect(owner).setIptRegistrationPrice(4000000000000000000n);
      expect(await iptrade.getIptRegistrationPrice()).to.equal(4000000000000000000n);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setIptRegistrationPrice(1)
      ).to.be.revertedWith("owner only");
    })

    it("Should set the transferIPCostIpt ", async function () {
      await iptrade.connect(owner).setIptTransferPrice(4000000000000000000n);
      expect(await iptrade.getIptTransferPrice()).to.equal(4000000000000000000n);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setIptTransferPrice(1)
      ).to.be.revertedWith("owner only");
    })

    it("Should set the registerIPCostEth ", async function () {
      await iptrade.connect(owner).setEthRegistrationPrice(4000000000000000n);
      expect(await iptrade.getEthRegistrationPrice()).to.equal(4000000000000000n);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setEthRegistrationPrice(1)
      ).to.be.revertedWith("owner only");
    })

    it("Should set the transferIPCostEth ", async function () {
      await iptrade.connect(owner).setEthTransferPrice(4000000000000000n);
      expect(await iptrade.getEthTransferPrice()).to.equal(4000000000000000n);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setEthTransferPrice(1)
      ).to.be.revertedWith("owner only");
    })

    it("Should check the deposit function and ethercredit ", async function () {
      // Check the deposit function
      const depositAmount = ethers.utils.parseEther('1'); // Send 1 ETH
      await iptrade.connect(owner).deposit({ value: depositAmount });
      const etherCredit_2 = await iptrade.connect(owner).getEtherCredit();
      expect(etherCredit_2).to.equal(depositAmount);

      const zero = ethers.utils.parseEther('0'); // Send 0 ETH
      await expect(iptrade.connect(owner).deposit({ value: zero }))
        .to.be.revertedWith("not allow 0");
    })

    it("Should check the fallback ", async function () {
      // Check the fallback option
      const valueToSend = ethers.utils.parseEther('1'); // Send 1 ETH
      await addr1.sendTransaction({ to: iptrade.address, value: valueToSend });
      const etherCredit_2 = await iptrade.connect(addr1).getEtherCredit();
      expect(etherCredit_2).to.equal(valueToSend);

      const zero = ethers.utils.parseEther('0'); // Send 0 ETH
      await expect(addr1.sendTransaction({ to: iptrade.address, value: zero }))
        .to.be.revertedWith("not allow 0");
    })

    it("Should test IP registration successfully", async function () {
      console.log(await ethers.provider.getBalance(addr1.address));
      // set IP with approval to fail
      await expect(iptrade.connect(addr1).setIP('f65a88a4d7e47905325c6b71495fc0b4', true, false))
        .to.be.revertedWith("No funds");

      // set IP with tokenbalance to fail
      await expect(iptrade.connect(addr1).setIP('f65a88a4d7e47905325c6b71495fc0b4', false, false))
        .to.be.revertedWith("no IPT");

      // set IP with Ether to fail
      await expect(iptrade.connect(addr1).setIP('f65a88a4d7e47905325c6b71495fc0b4', false, true))
        .to.be.revertedWith("no ETH");

      // test IP with approval and ETH
      await expect(iptrade.connect(addr1).setIP('f65a88a4d7e47905325c6b71495fc0b4', true, true))
        .to.be.revertedWith("cant approve ETH");

      // test stringlength check
      await expect(iptrade.connect(addr1).setIP('abc', false, false))
        .to.be.revertedWith("md5 incorr");
    })

    it("Should set IP", async function () {

      // transer IPT to addr1
      await ipToken.transfer(addr1.address, 50000000000000000000n);
      expect(await ipToken.balanceOf(addr1.address)).to.equal(50000000000000000000n);

      // addr1 approves contract to spend
      await ipToken.connect(addr1).approveAmount(iptrade.address, 40000000000000000000n);
      expect(await ipToken.connect(addr1).readApprovalFor(iptrade.address)).to.equal(40000000000000000000n);

      // addr1 sends tokens to contract
      await iptrade.connect(addr1).contractReceivesCredit(10000000000000000000n, addr1.address);
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(10000000000000000000n);

      //addr1 sends Ether to contract
      const valueToSend = ethers.utils.parseEther('1'); // Send 1 ETH
      await addr1.sendTransaction({ to: iptrade.address, value: valueToSend });

      // set IP wit approval
      await iptrade.connect(addr1).setIP('f65a88a4d7e47905325c6b71495fc0b4', true, false);

      // set IP with ETH
      await expect(iptrade.connect(addr1).setIP('f65a88a4d7e47905325c6b71495fc0b4', true, true))
        .to.be.revertedWith("cant approve ETH");

      // test registration duplicate
      await iptrade.connect(addr1).setIP('f65a88a4d7e47905325c6b71495fc0b5', false, false);
      await expect(iptrade.connect(addr1).setIP('f65a88a4d7e47905325c6b71495fc0b4', false, false))
        .to.be.revertedWith("is registered");

      await iptrade.connect(addr1).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, true);

      // check who is the owner
      console.log(addr1.address);

      const result = await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b6'); // Replace with your struct-returning function

      // Check the expected values of the struct members
      expect(result.owner).to.equal('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
      expect(result.creationTimeStamp).to.be.above(hre.ethers.BigNumber.from("1698873404"));
      expect(result.exists).to.equal(true);
      // this should fail
      await expect(iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b')).
        to.be.revertedWith("md5 incorr");
      await expect(iptrade.getIP('f65a88a4d7e47905325c6b71495fc0sdsb')).
        to.be.revertedWith("md5 incorr");

      // check transactions
      console.log(await iptrade.getIpTransactions('f65a88a4d7e47905325c6b71495fc0b6'));

      // calculate remains IPT
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(9000000000000000000n);
      expect(await ipToken.connect(addr1).readApprovalFor(iptrade.address)).to.equal(29000000000000000000n);
      console.log(await ethers.provider.getBalance(addr1.address));

      // should fail if not owner
      await expect(iptrade.connect(addr1).getSpentIptOdometer())
        .to.be.revertedWith("owner only");
      await expect(iptrade.connect(addr1).getSpentIptTotal())
        .to.be.revertedWith("owner only");

      expect(await iptrade.connect(owner).getSpentIptOdometer()).to.equal(2000000000000000000n);
      expect(await iptrade.connect(owner).getSpentIptTotal()).to.equal(2000000000000000000n);

      // calculate remains ETH
      expect(await iptrade.connect(addr1).getEtherCredit()).to.equal(999000000000000000n);

      // should fail if not owner
      await expect(iptrade.connect(addr1).getSpentEthOdometer())
        .to.be.revertedWith("owner only");
      await expect(iptrade.connect(addr1).getSpentEthTotal())
        .to.be.revertedWith("owner only");

      expect(await iptrade.connect(owner).getSpentEthOdometer()).to.equal(1000000000000000n);
      expect(await iptrade.connect(owner).getSpentEthTotal()).to.equal(1000000000000000n);
    })
  })



  it("Should request tokens successfully when funds are transferred to contract and adhere to the time limit and the freetoken bool is true", async function () {
    // transfer
    await ipToken.transfer(iptrade.address, 1000000000000000000n);
    const iptradeBalance = await ipToken.balanceOf(iptrade.address);
    expect(iptradeBalance).to.equal(1000000000000000000n);

    // request
    const addr1Balance_before = await ipToken.balanceOf(addr1.address);
    await iptrade.connect(addr1).requestTokens();
    const addr1Balance_after = await ipToken.balanceOf(addr1.address);
    expect(addr1Balance_after).to.equal(addr1Balance_before + 1000000000000000000n);

    // request again
    await ipToken.transfer(iptrade.address, 1000000000000000000n);
    await expect(
      iptrade.connect(addr1).requestTokens()
    ).to.be.revertedWith("try later");

    // request from 0 account

    // balance lower than freeIpTokenwithdrawal

    // set freetokensbool to false
    await iptrade.setFreetokensBool(false);
    await expect(
      iptrade.connect(addr1).requestTokens()
    ).to.be.revertedWith("faucet closed");
  })

  describe("Request tokens", function () {
    it("Should revert a token request without tokens in the contract", async function () {
      await expect(
        iptrade.connect(addr1).requestTokens()
      ).to.be.revertedWith("no IPT av");
    })

    it("Should revert a token request when repeated", async function () {
      // transfer
      await ipToken.transfer(iptrade.address, 1000000000000000000n);
      const iptradeBalance = await ipToken.balanceOf(iptrade.address);
      expect(iptradeBalance).to.equal(1000000000000000000n);

      // request
      const freeIpTokenwithdrawal = await iptrade.getWithdrawalAmount();
      const addr1Balance_before = await ipToken.balanceOf(addr1.address);
      await iptrade.connect(addr1).requestTokens();
      const iptradeBalance_after = await ipToken.balanceOf(iptrade.address);
      const addr1Balance_after = await ipToken.balanceOf(addr1.address);
      expect(addr1Balance_after).to.equal(addr1Balance_before + freeIpTokenwithdrawal);
      expect(iptradeBalance_after).to.equal(iptradeBalance - freeIpTokenwithdrawal);

      // request again
      await ipToken.transfer(iptrade.address, 1000000000000000000n);
      await expect(
        iptrade.connect(addr1).requestTokens()
      ).to.be.revertedWith("try later");
    })

    /* it("Should revert a token request when from 0 account", async function () {
       // request from 0 account
       //const zeroAccount = new ethers.Wallet(ethers.Wallet.createRandom().privateKey, ethers.provider);
        // Send some test Ether to the zero account
        const zeroAddress = ethers.constants.AddressZero;
        //const valueToSend = ethers.utils.parseEther('1'); // Send 1 ETH
        //await owner.sendTransaction({ to: zeroAccount.address, value: valueToSend });
       await expect(
         iptrade.connect(zeroAddress).requestTokens()
       ).to.be.revertedWith("request from 0");
     })
     */

    it("Should revert a token request when bool set to false", async function () {
      // set freetokensbool to false
      await iptrade.setFreetokensBool(false);
      await expect(
        iptrade.connect(addr1).requestTokens()
      ).to.be.revertedWith("faucet closed");
    })
  })

  describe("Request tokens", function () {

    it("Should revert if owner balance is too low", async function () {
      await expect(
        iptrade.connect(addr2).contractReceivesCredit(1500000000000000000n, addr2.address))
        .to.be.revertedWith("No funds");
    })

    it("Should revert if allowance for the spender is too low", async function () {
      await ipToken.transfer(addr2.address, 1500000000000000000n);
      await expect(
        iptrade.connect(addr2).contractReceivesCredit(1500000000000000000n, addr2.address))
        .to.be.revertedWith("No allowance");
    })

    it("Should transfer with the right allowance", async function () {
      await ipToken.transfer(addr2.address, 3500000000000000000n);
      await ipToken.connect(addr2).approveAmount(iptrade.address, 2500000000000000000n);
      await expect(
        iptrade.connect(addr2).contractReceivesCredit(3500000000000000000n, addr2.address))
        .to.be.revertedWith("No allowance");
      await iptrade.connect(addr2).contractReceivesCredit(1500000000000000000n, addr2.address);
      // confirm balance addr2
      expect(await ipToken.balanceOf(addr2.address)).to.equal(2000000000000000000n);
      // confirm balance iptrade
      expect(await ipToken.balanceOf(iptrade.address)).to.equal(1500000000000000000n);
      // confirm iptbalane
      expect(await iptrade.connect(addr2).getIptBalance()).to.equal(1500000000000000000n);
      // confirm remaining allowance
      expect(await ipToken.connect(addr2).readApprovalFor(iptrade.address)).to.equal(1000000000000000000n);

      // revoke
      await ipToken.connect(addr2).revokeApproval(iptrade.address);
      expect(await ipToken.connect(addr2).readApprovalFor(iptrade.address)).to.equal(0);
    })
  })

  describe("withdraw Ether funds by user (not owner)", function () {
    it("Should not withdraw Ethers if no credit", async function () {
      await expect(iptrade.connect(addr1).userSomeEtherWithdrawal(1000000000000000000n)).
        to.be.revertedWith("no IPT");
    })
    it("Should withdraw some Ethers with credit", async function () {
      //addr1 sends Ether to contract
      const ether_start = (await ethers.provider.getBalance(addr1.address));
      const valueToSend = ethers.utils.parseEther('1'); // Send 1 ETH
      await addr1.sendTransaction({ to: iptrade.address, value: valueToSend });
      const ether_middle = (await ethers.provider.getBalance(addr1.address));
      console.log(await ethers.provider.getBalance(addr1.address));
      // ethercredit check
      expect(await iptrade.connect(addr1).getEtherCredit()).to.equal(1000000000000000000n);
      // withdraw
      await iptrade.connect(addr1).userSomeEtherWithdrawal(500000000000000000n);
      console.log(await ethers.provider.getBalance(addr1.address));
      // check balances
      // ethercredit
      expect(await iptrade.connect(addr1).getEtherCredit()).to.equal(500000000000000000n);
      // etherincontract
      const ether_end = (await ethers.provider.getBalance(addr1.address));
      expect(await ethers.provider.getBalance(iptrade.address)).to.equal(500000000000000000n);
      expect(ether_start).to.be.above(ether_end);
      expect(ether_end).to.be.above(ether_middle);
      expect(await ethers.provider.getBalance(iptrade.address)).to.equal(await iptrade.getEthersInContract());
    })

    it("Should withdraw all Ethers with credit", async function () {
      //addr1 sends Ether to contract
      const valueToSend = ethers.utils.parseEther('1'); // Send 1 ETH
      await addr1.sendTransaction({ to: iptrade.address, value: valueToSend });
      // ethercredit check
      expect(await iptrade.connect(addr1).getEtherCredit()).to.equal(1000000000000000000n);
      // withdraw
      await iptrade.connect(addr1).userAllEtherWithdrawal();
      // check balances
      // ethercredit
      expect(await iptrade.connect(addr1).getEtherCredit()).to.equal(0);
      // etherincontract
      expect(await ethers.provider.getBalance(iptrade.address)).to.equal(0);
      // test requirement
      await expect(iptrade.connect(addr1).userAllEtherWithdrawal())
        .to.be.revertedWith("no ETH");
    })
  })









  describe("withdraw IPT funds by user (not owner)", function () {
    it("Should not withdraw IPT if no credit", async function () {
      await expect(iptrade.connect(addr1).userSomeIptWithdrawal(1000000000000000000n)).
        to.be.revertedWith("no IPT");
    })
    it("Should withdraw some IPT with credit", async function () {
      //addr1 sends Ether to contract
      // allowance and transfer
      await ipToken.transfer(addr1.address, 3500000000000000000n);
      const ipt_start = (await ipToken.balanceOf(addr1.address)); //35 , 25 30
      await ipToken.connect(addr1).approveAmount(iptrade.address, 1000000000000000000n);
      await iptrade.connect(addr1).contractReceivesCredit(1000000000000000000n, addr1.address);
      const ipt_middle = (await ipToken.balanceOf(addr1.address));
      // ipt credit check
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(1000000000000000000n);
      // withdraw
      await iptrade.connect(addr1).userSomeIptWithdrawal(500000000000000000n);

      // check balances
      // iptcredit
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(500000000000000000n);
      // iptincontract
      const ipt_end = (await ipToken.balanceOf(addr1.address));
      expect(await ipToken.balanceOf(iptrade.address)).to.equal(500000000000000000n);
      expect(ipt_start).to.equal(ipt_end.add(500000000000000000n));
      expect(ipt_end).to.equal(ipt_middle.add(500000000000000000n));
      expect(await ipToken.balanceOf(iptrade.address)).to.equal(await iptrade.getIptInContract());
    })

    it("Should withdraw all Ipt with credit", async function () {
      // allowance and transfer
      await ipToken.transfer(addr1.address, 3500000000000000000n);
      await ipToken.connect(addr1).approveAmount(iptrade.address, 1000000000000000000n);
      await iptrade.connect(addr1).contractReceivesCredit(1000000000000000000n, addr1.address);
      // ethercredit check
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(1000000000000000000n);
      // withdraw
      await iptrade.connect(addr1).userAllIptWithdrawal();
      // check balances
      // ethercredit
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(0);
      // etherincontract
      expect(await ipToken.balanceOf(iptrade.address)).to.equal(0);
      // test requirement
      await expect(iptrade.connect(addr1).userAllIptWithdrawal())
        .to.be.revertedWith("no IPT");
    })
  })

  describe("Withdrawals made by owner", function () {
    it("Should withdraw Ether to the owner balance", async function () {
      // test requirement
      await expect(iptrade.withdrawSpentEth()).to.be.revertedWith("no ETH");
      await expect(iptrade.connect(addr2).withdrawSpentEth()).to.be.revertedWith("owner only");

      // send ether to addr2
      const valueToSend = ethers.utils.parseEther('1'); // Send 1 ETH
      const ownerBalanceInitial = await ethers.provider.getBalance(owner.address);
      const registerIPCostEth = await iptrade.getEthRegistrationPrice();
      await addr2.sendTransaction({ to: iptrade.address, value: valueToSend });
      // set IP
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, true);
      expect(await iptrade.getSpentEthOdometer()).to.equal(registerIPCostEth);
      // transfer spent ETH to the owner
      const ownerBalancePrior = await ethers.provider.getBalance(owner.address);
      await iptrade.connect(owner).withdrawSpentEth();
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      console.log(await ethers.provider.getBalance(owner.address));
      console.log(await ethers.provider.getBalance(iptrade.address));
      expect(ownerBalanceAfter).to.be.above(ownerBalancePrior);
      expect(ownerBalanceInitial).to.be.below(ownerBalanceAfter);
      expect(await iptrade.getSpentEthTotal()).to.equal(registerIPCostEth);
      expect(await iptrade.getSpentEthOdometer()).to.equal(0);

      // check balances
      // balance user
      const remaining = BigInt(valueToSend - registerIPCostEth);
      expect(await iptrade.connect(addr2).getEtherCredit()).to.equal(remaining);
      // balance contract
      expect(await ethers.provider.getBalance(iptrade.address)).to.equal(remaining);
      // ethersincontract
      expect(await iptrade.getEthersInContract()).to.equal(remaining);
    })



    it("Should withdraw IPT to the owner balance", async function () {
      // test requirement
      await expect(iptrade.withdrawSpentIpt()).to.be.revertedWith("no IPT");
      await expect(iptrade.connect(addr2).withdrawSpentIpt()).to.be.revertedWith("owner only");

      // send ether to addr2
      await ipToken.transfer(addr2.address, 10000000000000000000n);
      await ipToken.connect(addr2).approveAmount(iptrade.address, 10000000000000000000n);
      const ownerBalanceInitial = await ipToken.balanceOf(owner.address);
      const registerIPCostIpt = await iptrade.getIptRegistrationPrice();

      // set IP
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);
      expect(await iptrade.getSpentIptOdometer()).to.equal(registerIPCostIpt);
      // transfer spent IPT to the owner
      const ownerBalancePrior = await ipToken.balanceOf(owner.address);
      await iptrade.connect(owner).withdrawSpentIpt();
      const ownerBalanceAfter = await ipToken.balanceOf(owner.address);
      expect(ownerBalanceAfter).to.equal(ownerBalancePrior.add(registerIPCostIpt));
      expect(ownerBalanceInitial).to.equal(ownerBalanceAfter.sub(registerIPCostIpt));
      expect(await iptrade.getSpentIptTotal()).to.equal(registerIPCostIpt);
      expect(await iptrade.getSpentIptOdometer()).to.equal(0);

      // check balances
      // balance user
      const remaining = 0;
      expect(await iptrade.connect(addr2).getIptBalance()).to.equal(remaining);
      // balance contract
      expect(await ipToken.balanceOf(iptrade.address)).to.equal(remaining);
      // ethersincontract
      expect(await iptrade.getIptInContract()).to.equal(remaining);
    })
  })

  describe("The owner creates a Sales Intent", function () {
    it("Should revert if the onsale instance does not exist", async function () {
      await expect(iptrade.connect(addr1).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 20000000000000000000n, addr2.address, false, false))
        .to.be.revertedWith("ip not exist");
    })

    it("Should revert if the user is not the owner of the IP", async function () {
      await ipToken.transfer(addr2.address, 10000000000000000000n);
      await ipToken.connect(addr2).approveAmount(iptrade.address, 10000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);
      console.log(await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b6'));
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr1).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 20000000000000000000n, addr2.address, false, false))
        .to.be.revertedWith("not owner");
    })

    it('Should revert if both ETH and on Allowance', async function () {
      await ipToken.transfer(addr2.address, 10000000000000000000n);
      await ipToken.connect(addr2).approveAmount(iptrade.address, 10000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);
      console.log(await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b6'));
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 20000000000000000000n, addr2.address, true, true))
        .to.be.revertedWith("cant approve ETH");
    })

    it('Should revert if not suffience IPT in account', async function () {
      await ipToken.transfer(addr2.address, 1000000000000000000n);
      await ipToken.connect(addr2).approveAmount(iptrade.address, 1000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);
      console.log(await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b6'));
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 20000000000000000000n, addr2.address, false, false))
        .to.be.revertedWith("no IPT");
    })

    it('Should revert if not suffience IPT balance', async function () {
      await ipToken.transfer(addr2.address, 1000000000000000000n);
      await ipToken.connect(addr2).approveAmount(iptrade.address, 1000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);

      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 20000000000000000000n, addr2.address, true, false))
        .to.be.revertedWith("No allowance");
    })

    it('Should revert if not suffience ETH in account balance', async function () {
      await ipToken.transfer(addr2.address, 1000000000000000000n);
      await ipToken.connect(addr2).approveAmount(iptrade.address, 1000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 20000000000000000000n, addr2.address, false, true))
        .to.be.revertedWith("no ETH");
    })

    it('Should successfully create intent wit IPT allowance', async function () {
      await ipToken.transfer(addr2.address, 10000000000000000000n);
      await ipToken.connect(addr2).approveAmount(iptrade.address, 10000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 20000000000000000000n, addr2.address, true, false);
      const struct = await iptrade.getSalesIntent('f65a88a4d7e47905325c6b71495fc0b6');
      expect(struct.owner_address).to.equal(addr2.address);
    })

    it('Should successfully create intent wit IPT balance', async function () {
      await ipToken.transfer(addr2.address, 10000000000000000000n);
      await ipToken.connect(addr2).approveAmount(iptrade.address, 10000000000000000000n);
      await iptrade.connect(addr2).contractReceivesCredit(5000000000000000000n, addr2.address);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, false);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 20000000000000000000n, addr2.address, false, false);
      const struct = await iptrade.getSalesIntent('f65a88a4d7e47905325c6b71495fc0b6');
      expect(struct.owner_address).to.equal(addr2.address);
    })

    it('Should successfully create intent wit ETH balance', async function () {
      const valueToSend = ethers.utils.parseEther('1'); // Send 1 ETH
      await addr2.sendTransaction({ to: iptrade.address, value: valueToSend });
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, true);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n, addr2.address, false, true);
      const struct = await iptrade.getSalesIntent('f65a88a4d7e47905325c6b71495fc0b6');
      expect(struct.owner_address).to.equal(addr2.address);

      // should fail
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n, addr2.address, false, true))
        .to.be.revertedWith("not exists or for sale");
    })
  })

  // cancel sales intent
  describe("The sales intent cancellation", function () {

    beforeEach(async function () {
      const valueToSend = ethers.utils.parseEther('1'); // Send 1 ETH
      await addr2.sendTransaction({ to: iptrade.address, value: valueToSend });
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, true);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n, addr2.address, false, true);
    })

    it("Should revert if not owner", async function () {
      await expect(iptrade.connect(addr1).sellerCancelsSalesIntent('f65a88a4d7e47905325c6b71495fc0b6')).
        to.be.revertedWith("not owner");
    })

    it("Should revert if too early", async function () {
      await expect(iptrade.connect(addr2).sellerCancelsSalesIntent('f65a88a4d7e47905325c6b71495fc0b6')).
        to.be.revertedWith("locked");
      await iptrade.setLockTime(1);
      const struct_before = await iptrade.getSalesIntent('f65a88a4d7e47905325c6b71495fc0b6');
      expect(struct_before.exists).to.equal(true);
      await (iptrade.connect(addr2).sellerCancelsSalesIntent('f65a88a4d7e47905325c6b71495fc0b6'));
      const struct_after = await iptrade.getSalesIntent('f65a88a4d7e47905325c6b71495fc0b6');
      expect(struct_after.exists).to.equal(false);
    })

    it("Should revert if not for sale", async function () {
      await iptrade.setLockTime(1);
      await (iptrade.connect(addr2).sellerCancelsSalesIntent('f65a88a4d7e47905325c6b71495fc0b6'));
      await expect(iptrade.connect(addr2).sellerCancelsSalesIntent('f65a88a4d7e47905325c6b71495fc0b6')).
        to.be.revertedWith("Your ip is not for sale");
    })
  })

  describe("The buyer takes over the IP but fails", function () {

    beforeEach(async function () {
      const valueToSend = ethers.utils.parseEther('1'); // Send 1 ETH
      await addr2.sendTransaction({ to: iptrade.address, value: valueToSend });
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, true);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n, addr1.address, false, true);
    })

    it("Should revert if ether and approval", async function () {
      await expect(iptrade.connect(owner).buyerBuysIP(200000000000000000n, 'f65a88a4d7e47905325c6b71495fc0b6', true, true))
        .to.be.revertedWith("cant approve ETH");
    })

    it("Should revert if the user is not the new owner", async function () {
      await expect(iptrade.connect(owner).buyerBuysIP(200000000000000000n, 'f65a88a4d7e47905325c6b71495fc0b6', false, true))
        .to.be.revertedWith("not buyer");
    })

    it("Should revert if the amount is not correct", async function () {
      await expect(iptrade.connect(addr1).buyerBuysIP(20000000000000000n, 'f65a88a4d7e47905325c6b71495fc0b6', false, true))
        .to.be.revertedWith("incorrect price");
    })

    it("Should revert if wrong currency", async function () {
      await expect(iptrade.connect(addr1).buyerBuysIP(200000000000000000n, 'f65a88a4d7e47905325c6b71495fc0b6', false, false))
        .to.be.revertedWith("wrong currency");
    })

    it("Should revert if too late", async function () {
      async function delay(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
      }
      await delay(1);
      await iptrade.setLockTime(1);
      await expect(iptrade.connect(addr1).buyerBuysIP(200000000000000000n, 'f65a88a4d7e47905325c6b71495fc0b6', false, true))
        .to.be.revertedWith("expired");
    })
  })


  describe("The buyer takes over the IP", function () {

    beforeEach(async function () {

      // send ETH to seller IPT
      const valueToSend = ethers.utils.parseEther('1'); // Send 1 ETH
      await addr2.sendTransaction({ to: iptrade.address, value: valueToSend });
      //send ETH to buyer IPT
      await addr1.sendTransaction({ to: iptrade.address, value: valueToSend });
      // send IPT to seller
      await ipToken.transfer(addr2.address, 10000000000000000000n);
      ipToken.connect(addr2).approveAmount(iptrade.address, 10000000000000000000n);
      iptrade.connect(addr2).contractReceivesCredit(5000000000000000000n, addr2.address)
      // send IPT to buyer
      await ipToken.transfer(addr1.address, 10000000000000000000n,);
      ipToken.connect(addr1).approveAmount(iptrade.address, 10000000000000000000n);
      iptrade.connect(addr1).contractReceivesCredit(5000000000000000000n, addr1.address);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, true);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b7', false, true);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b8', false, true);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n, addr1.address, false, true);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b7', 2000000000000000000n, addr1.address, false, false);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b8', 2000000000000000000n, addr1.address, true, false);
    })

    it("Should let addr1 buy the IP successfully with ETH", async function () {
      await iptrade.connect(addr1).buyerBuysIP(200000000000000000n, 'f65a88a4d7e47905325c6b71495fc0b6', false, true);
      // addr1 should be owner of 'f65a88a4d7e47905325c6b71495fc0b6'
      const newowner = await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b6');
      expect(newowner.owner).to.equal(addr1.address);
      // addr1 has spent eth 200000000000000000n, balance should be 800000000000000000n 
      expect(await iptrade.connect(addr1).getEtherCredit()).to.equal(800000000000000000n);
      // addr2 should have gained  eth 200000000000000000n, balance should be 1200000000000000000n
      expect(await iptrade.connect(addr2).getEtherCredit()).to.equal(1195000000000000000n);  //10 + 2 - 0.05 (3 x registration and 1 time transfer)
      // check the transactions 
      console.log(await iptrade.getIpTransactions('f65a88a4d7e47905325c6b71495fc0b6'));
      // check spent ETH
      expect(await iptrade.getSpentEthOdometer()).to.equal(5000000000000000n);

    })

    it("Should let addr1 buy the IP successfully with IPT credit", async function () {
      await iptrade.connect(addr1).buyerBuysIP(2000000000000000000n, 'f65a88a4d7e47905325c6b71495fc0b7', false, false);
      // addr1 should be owner of 'f65a88a4d7e47905325c6b71495fc0b6'
      const newowner = await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b7');
      expect(newowner.owner).to.equal(addr1.address);
      // addr1 has spent ipt 2000000000000000000n, balance should be 3000000000000000000n 
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(3000000000000000000n);
      // addr2 should have gained  ipt 2000000000000000000n, balance should be 3000000000000000000n
      expect(await iptrade.connect(addr2).getIptBalance()).to.equal(3000000000000000000n); // 5 - 2 (cost of sales intent)
      expect(await ipToken.balanceOf(addr2.address)).to.equal(5000000000000000000n); // 5 + 2(sales) - 2 (setIP)
      // check the transactions 
      console.log(await iptrade.getIpTransactions('f65a88a4d7e47905325c6b71495fc0b7'));
      //check spent IPT
      expect(await iptrade.getSpentIptOdometer()).to.equal(4000000000000000000n);
    })

    it("Should let addr1 buy the IP successfully with IPT allowance", async function () {
      // set allowance, addr2 can spend money from addr1
      await ipToken.connect(addr1).approveAmount(addr2.address, 2000000000000000000n);
      console.log(await ipToken.connect(addr1).readApprovalFor(addr2.address));
      await iptrade.connect(addr1).buyerBuysIP(2000000000000000000n, 'f65a88a4d7e47905325c6b71495fc0b8', true, false);
      // addr1 should be owner of 'f65a88a4d7e47905325c6b71495fc0b8'
      const newowner = await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b8');
      expect(newowner.owner).to.equal(addr1.address);
      //addr1 has spent ipt 0, balance should be 5000000000000000000n 
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(5000000000000000000n);
      // addr2 should have gained  eth 200000000000000000n, balance should be 1200000000000000000n
      expect(await iptrade.connect(addr2).getIptBalance()).to.equal(3000000000000000000n); // 5 - 2 (cost of sales intent of ...7)
      expect(await ipToken.balanceOf(addr2.address)).to.equal(5000000000000000000n); // 5 + 2 (sales) - 2 (setIP) 
      // check the transactions 
      console.log(await iptrade.getIpTransactions('f65a88a4d7e47905325c6b71495fc0b8'));
      //check spent IPT
      expect(await iptrade.getSpentIptOdometer()).to.equal(4000000000000000000n);
    })

    // test without sufficient funds after allowance
    // test without allowance
    // test without Ether balance
    // test when too expensive

  })

});
