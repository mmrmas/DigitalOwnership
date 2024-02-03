const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = require("hardhat");

describe("IPtoken contract", function () {
  // global vars
  let Token;
  let ipToken;
  let IPtrade;
  let iptrade;
  let AttackerContract;
  let attackerContract;
  let owner;
  let addr1;
  let addr2;
  let tokenCap = 100000000;
  let tokenFirstMint = 80000000;
  let tokenBlockReward = 100n;

  beforeEach(async function () {
    // Get the contractfactory and signers here
    Token = await ethers.getContractFactory("IPToken");
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    ipToken = await Token.deploy(tokenCap, tokenFirstMint, tokenBlockReward);

    IPtrade = await ethers.getContractFactory("IPtrade");
    iptrade = await IPtrade.deploy(ipToken.target);

    // Deploy the attacker contract
    AttackerContract = await ethers.getContractFactory("AttackerContract");
    attackerContract = await AttackerContract.deploy(iptrade.target);
  });

  it("Should print owner's address", async function () {
    console.log(owner.address);
    console.log(iptrade.target);
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
      const capInEther = hre.ethers.formatEther(cap);
      const expectedCap = tokenCap; // Convert tokenCap to wei

      console.log(capInEther);
      console.log(expectedCap);

      expect(Number(capInEther)).to.equal(expectedCap, "Max capped supply is not set correctly");

    });

  });


/* this is an interal function now
  describe("translate variables onlyOwnerHelper functions", function () {
    it("CheckMd5Length should return 32", async function () {
      await expect(iptrade.checkMd5Length('f65a88a4d7e47905325c6b71495fc0b'))
        .to.be.revertedWith("md5 incorr");
      await expect(iptrade.checkMd5Length('f65a88a4d7e47905325c6b71495fc0b4'))
        .to.be.not.reverted;
    })

  });
*/


  describe("Setter and Getter functions", function () {
    it("Should set the withdrawal amount to 10 ** 18", async function () {
      await iptrade.connect(owner).setFreeIpTokenwithdrawal(10000000000000000000n);
      expect(await iptrade.freeIpTokenwithdrawal()).to.equal(10000000000000000000n);

    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setFreeIpTokenwithdrawal(1)
      ).to.be.revertedWith("owner or helper only");
    })

    it("Should set the locktime to 5 minutes", async function () {
      await iptrade.connect(owner).setLockTime(5);
      expect(await iptrade.lockTime()).to.equal(5);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setLockTime(1)
      ).to.be.revertedWith("owner or helper only");
    })

    it("Should set the provideFreeTokens bool", async function () {
      await iptrade.connect(owner).setFreetokensBool(false);
      expect(await iptrade.freeTokensBool()).to.equal(false);
      await iptrade.connect(owner).setFreetokensBool(true);
      expect(await iptrade.freeTokensBool()).to.equal(true);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setFreetokensBool(true)
      ).to.be.revertedWith("owner or helper only");
    })

    it("Should set the registerIPCostIpt ", async function () {
      await iptrade.connect(owner).setIPCostIpt(4000000000000000000n, 1);
      expect(await iptrade.registerIPCostIpt()).to.equal(4000000000000000000n);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setIPCostIpt(1,1)
      ).to.be.revertedWith("owner or helper only");
    })

    it("Should set the transferIPCostIpt ", async function () {
      await iptrade.connect(owner).setIPCostIpt(1, 4000000000000000000n);
      expect(await iptrade.transferIPCostIpt()).to.equal(4000000000000000000n);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setIPCostIpt(1,1)
      ).to.be.revertedWith("owner or helper only");
    })

    it("Should set the registerIPCostEth ", async function () {
      await iptrade.connect(owner).setIPCostEth(4000000000000000n, 1);
      expect(await iptrade.registerIPCostEth()).to.equal(4000000000000000n);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setIPCostEth(1,1)
      ).to.be.revertedWith("owner or helper only");
    })

    it("Should set the transferIPCostEth ", async function () {
      await iptrade.connect(owner).setIPCostEth(1, 4000000000000000n);
      expect(await iptrade.transferIPCostEth()).to.equal(4000000000000000n);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setIPCostEth(1,1)
      ).to.be.revertedWith("owner or helper only");
    })

  })

  describe("Setter and Getter functions for transactions", function () {

    it("Should check the deposit function and ethercredit ", async function () {
      // Check the deposit function
      const depositAmount = ethers.parseEther('1'); // Send 1 ETH
      await iptrade.connect(owner).deposit({ value: depositAmount });
      const etherCredit_2 = await iptrade.connect(owner).getEtherCredit();
      expect(etherCredit_2).to.equal(depositAmount);

      const zero = ethers.parseEther('0'); // Send 0 ETH
      await expect(iptrade.connect(owner).deposit({ value: zero }))
        .to.be.revertedWith("not allow 0");
    })

    it("Should check the fallback ", async function () {
      // Check the fallback option
      const valueToSend = ethers.parseEther("1.0"); // Send 1 ETH
      await expect(addr1.sendTransaction({ to: iptrade.target, value: valueToSend })).
        to.be.revertedWith("Fallback function disabled. Use deposit() for Ether or depositIPT() for IPT.");


      const zero = ethers.parseEther('0'); // Send 0 ETH
      await expect(addr1.sendTransaction({ to: iptrade.target, value: zero }))
        .to.be.revertedWith("Fallback function disabled. Use deposit() for Ether or depositIPT() for IPT.");
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
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);

      // transer IPT to addr1
      await ipToken.transfer(addr1.address, 5000000000000000000000n);
      expect(await ipToken.balanceOf(addr1.address)).to.equal(5000000000000000000000n);

      // addr1 approves contract to spend
      await ipToken.connect(addr1).approve(iptrade.target, 4000000000000000000000n);
      expect(await ipToken.connect(addr1).readApprovalFor(iptrade.target)).to.equal(4000000000000000000000n);

      // addr1 sends tokens to contract
      await iptrade.connect(addr1).depositIPT(1000000000000000000000n);
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(1000000000000000000000n);

      //addr1 sends Ether to contract
      const valueToSend = ethers.parseEther('1'); // Send 1 ETH
      await iptrade.connect(addr1).deposit({ value: valueToSend });

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
      expect(result.creationTimeStamp).to.be.above(1698873404n);
      expect(result.exists).to.equal(true);
      // this should fail
      console.log( await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b'));
      const result_false = await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b');
      expect(result_false[0]).to.equal(false);
      //await expect(iptrade.getIP('f65a88a4d7e47905325c6b71495fc0sdsb')).
       // to.be.rejected();//revertedWith("md5 incorr");

      // check transactions
      console.log(await iptrade.getIpTransactions('f65a88a4d7e47905325c6b71495fc0b6'));

      // calculate remains IPT
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(900000000000000000000n);
      expect(await ipToken.connect(addr1).readApprovalFor(iptrade.target)).to.equal(2900000000000000000000n);
      console.log(await ethers.provider.getBalance(addr1.address));

      expect(await iptrade.connect(owner).spentIptOdometer()).to.equal(200000000000000000000n);

      // calculate remains ETH
      expect(await iptrade.connect(addr1).getEtherCredit()).to.equal(999000000000000000n);

      expect(await iptrade.connect(owner).spentEtherOdometer()).to.equal(1000000000000000n);
    })
  })




  it("Should request tokens successfully when funds are transferred to contract and adhere to the time limit and the freetoken bool is true", async function () {
    // transfer
    await ipToken.approve(iptrade.target, 100000000000000000000n);
    await iptrade.depositIPT(100000000000000000000n);
    const iptradeBalance = await ipToken.balanceOf(iptrade.target);
    expect(iptradeBalance).to.equal(100000000000000000000n);

    // request
    const addr1Balance_before = await ipToken.balanceOf(addr1.address);
    await iptrade.connect(addr1).requestTokens();
    const addr1Balance_after = await ipToken.balanceOf(addr1.address);
    expect(addr1Balance_after).to.equal(addr1Balance_before + 100000000000000000000n);

    // request again
    await ipToken.approve(iptrade.target, 100000000000000000000n);
    await iptrade.depositIPT(100000000000000000000n);
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
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      const iptradeBalance = await ipToken.balanceOf(iptrade.target);
      expect(iptradeBalance).to.equal(100000000000000000000n);

      // request
      const freeIpTokenwithdrawal = await iptrade.freeIpTokenwithdrawal();
      const addr1Balance_before = await ipToken.balanceOf(addr1.address);
      await iptrade.connect(addr1).requestTokens();
      const iptradeBalance_after = await ipToken.balanceOf(iptrade.target);
      const addr1Balance_after = await ipToken.balanceOf(addr1.address);
      expect(addr1Balance_after).to.equal(addr1Balance_before + freeIpTokenwithdrawal);
      expect(iptradeBalance_after).to.equal(iptradeBalance - freeIpTokenwithdrawal);

      // request again
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await expect(
        iptrade.connect(addr1).requestTokens()
      ).to.be.revertedWith("try later");
    })



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
        iptrade.connect(addr2).depositIPT(1500000000000000000n))
        .to.be.revertedWith("No funds");
    })

    it("Should revert if allowance for the spender is too low", async function () {
      await ipToken.transfer(addr2.address, 1500000000000000000n);
      await expect(
        iptrade.connect(addr2).depositIPT(1500000000000000000n))
        .to.be.revertedWith("No allowance");
    })

    it("Should transfer with the right allowance", async function () {
      await ipToken.transfer(addr2.address, 3500000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 2500000000000000000n);
      await expect(
        iptrade.connect(addr2).depositIPT(3500000000000000000n))
        .to.be.revertedWith("No allowance");
      await iptrade.connect(addr2).depositIPT(1500000000000000000n);
      // confirm balance addr2
      expect(await ipToken.balanceOf(addr2.address)).to.equal(2000000000000000000n);
      // confirm balance iptrade
      expect(await ipToken.balanceOf(iptrade.target)).to.equal(1500000000000000000n);
      // confirm iptbalane
      expect(await iptrade.connect(addr2).getIptBalance()).to.equal(1500000000000000000n);
      // confirm remaining allowance
      expect(await ipToken.connect(addr2).readApprovalFor(iptrade.target)).to.equal(1000000000000000000n);

      // revoke
      await ipToken.connect(addr2).revokeApproval(iptrade.target);
      expect(await ipToken.connect(addr2).readApprovalFor(iptrade.target)).to.equal(0);
    })
  })

  describe("withdraw Ether funds by user (not owner)", function () {
    it("Should not withdraw Ethers if no credit", async function () {
      await expect(iptrade.connect(addr1).userEtherWithdrawal(1000000000000000000n)).
        to.be.revertedWith("no ETH");
    })
    it("Should withdraw Ethers with credit", async function () {
      //addr1 sends Ether to contract
      const ether_start = (await ethers.provider.getBalance(addr1.address));
      const valueToSend = ethers.parseEther('1'); // Send 1 ETH
      await iptrade.connect(addr1).deposit({ value: valueToSend });
      const ether_middle = (await ethers.provider.getBalance(addr1.address));
      console.log(await ethers.provider.getBalance(addr1.address));
      // ethercredit check
      expect(await iptrade.connect(addr1).getEtherCredit()).to.equal(1000000000000000000n);
      // withdraw
      await iptrade.connect(addr1).userEtherWithdrawal(500000000000000000n);
      console.log(await ethers.provider.getBalance(addr1.address));
      // check balances
      // ethercredit
      expect(await iptrade.connect(addr1).getEtherCredit()).to.equal(500000000000000000n);
      // etherincontract
      const ether_end = (await ethers.provider.getBalance(addr1.address));
      expect(await ethers.provider.getBalance(iptrade.target)).to.equal(500000000000000000n);
      expect(ether_start).to.be.above(ether_end);
      expect(ether_end).to.be.above(ether_middle);
      expect(await ethers.provider.getBalance(iptrade.target)).to.equal(await iptrade.ethersInContract());
    })
  })




  describe("withdraw IPT funds by user (not owner)", function () {
    it("Should not withdraw IPT if no credit", async function () {
      await expect(iptrade.connect(addr1).userIptWithdrawal(1000000000000000000n)).
        to.be.revertedWith("no IPT");
    })
    it("Should withdraw  IPT with credit", async function () {
      //addr1 sends Ether to contract
      // allowance and transfer
      await ipToken.transfer(addr1.address, 3500000000000000000n);
      const ipt_start = (await ipToken.balanceOf(addr1.address)); //35 , 25 30
      await ipToken.connect(addr1).approve(iptrade.target, 1000000000000000000n);
      await iptrade.connect(addr1).depositIPT(1000000000000000000n);
      const ipt_middle = (await ipToken.balanceOf(addr1.address));
      // ipt credit check
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(1000000000000000000n);
      // withdraw
      await iptrade.connect(addr1).userIptWithdrawal(500000000000000000n);

      // check balances
      // iptcredit
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(500000000000000000n);
      // iptincontract
      const ipt_end = (await ipToken.balanceOf(addr1.address));
      expect(await ipToken.balanceOf(iptrade.target)).to.equal(500000000000000000n);
      expect(ipt_start).to.equal(ipt_end + 500000000000000000n);
      expect(ipt_end).to.equal(ipt_middle + 500000000000000000n);
      expect(await ipToken.balanceOf(iptrade.target)).to.equal(await iptrade.iptInContract());
    })

  })

  describe("Withdrawals made by owner", function () {
    it("Should withdraw Ether to the owner balance", async function () {

      // test requirement
      await expect(iptrade.withdrawSpentEth()).to.be.revertedWith("no ETH");
      await expect(iptrade.connect(addr2).withdrawSpentEth()).to.be.revertedWith("owner or helper only");

      // send ether to addr2
      const valueToSend = ethers.parseEther('1'); // Send 1 ETH
      const ownerBalanceInitial = await ethers.provider.getBalance(owner.address);
      const registerIPCostEth = await iptrade.registerIPCostEth();
      await iptrade.connect(addr2).deposit({ value: valueToSend });
      // set IP
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, true);
      expect(await iptrade.spentEtherOdometer()).to.equal(registerIPCostEth);
      
      // transfer spent ETH to the owner
      const ownerBalancePrior = await ethers.provider.getBalance(owner.address);
      await iptrade.connect(owner).withdrawSpentEth();
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      console.log(await ethers.provider.getBalance(owner.address), "owner");
      console.log(await ethers.provider.getBalance(iptrade.target), "iptrade");
      console.log(ownerBalancePrior, "prior");
      console.log(ownerBalanceAfter, "after");
      expect(ownerBalanceAfter).to.be.above(ownerBalancePrior);
      expect(ownerBalanceInitial).to.be.below(ownerBalanceAfter);
      expect(await iptrade.spentEtherOdometer()).to.equal(0);

      // check balances
      // balance user
      const remaining = BigInt(valueToSend - registerIPCostEth);
      expect(await iptrade.connect(addr2).getEtherCredit()).to.equal(remaining);
      // balance contract
      expect(await ethers.provider.getBalance(iptrade.target)).to.equal(remaining);
      // ethersincontract
      expect(await iptrade.ethersInContract()).to.equal(remaining);
    })



    it("Should withdraw IPT to the owner balance", async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);

      // test requirement
      await expect(iptrade.withdrawSpentIpt()).to.be.revertedWith("no IPT");
      await expect(iptrade.connect(addr2).withdrawSpentIpt()).to.be.revertedWith("owner or helper only");

      // send ether to addr2
      await ipToken.transfer(addr2.address, 1000000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 1000000000000000000000n);
      const ownerBalanceInitial = await ipToken.balanceOf(owner.address);
      console.log(ownerBalanceInitial);
      const registerIPCostIpt = await iptrade.registerIPCostIpt();

      // set IP
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);
      expect(await iptrade.spentIptOdometer()).to.equal(registerIPCostIpt);

      // transfer spent IPT to the owner
      const ownerBalancePrior = await ipToken.balanceOf(owner.address);
      await iptrade.connect(owner).withdrawSpentIpt();
      const ownerBalanceAfter = await ipToken.balanceOf(owner.address);
      console.log(ownerBalanceAfter);
      expect(ownerBalanceAfter).to.equal(ownerBalancePrior + registerIPCostIpt);
      expect(ownerBalanceInitial).to.equal(ownerBalanceAfter - registerIPCostIpt);
      expect(await iptrade.spentIptOdometer()).to.equal(0);


      // check balances
      // balance user
      const remaining = 0;
      expect(await iptrade.connect(addr2).getIptBalance()).to.equal(remaining);
      // balance contract
      expect(await ipToken.balanceOf(iptrade.target)).to.equal(remaining);
      // ethersincontract
      expect(await iptrade.iptInContract()).to.equal(remaining);
    })
  })

  describe("The owner creates a Sales Intent", function () {
    it("Should revert if the onsale instance does not exist", async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await expect(iptrade.connect(addr1).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 2000000000000000000000n, addr2.address, false, false))
        .to.be.revertedWith("ip not exist");
    })

    it("Should revert if the user is not the owner of the IP", async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await ipToken.transfer(addr2.address, 1000000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 1000000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);
      console.log(await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b6'));
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr1).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 2000000000000000000000n, addr2.address, false, false))
        .to.be.revertedWith("not owner");
    })

    it('Should revert if both ETH and on Allowance', async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await ipToken.transfer(addr2.address, 1000000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 1000000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);
      console.log(await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b6'));
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 2000000000000000000000n, addr2.address, true, true))
        .to.be.revertedWith("cant approve ETH");
    })

    it('Should revert if not suffience IPT in account', async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await ipToken.transfer(addr2.address, 100000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 100000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);
      console.log(await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b6'));
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 2000000000000000000000n, addr2.address, false, false))
        .to.be.revertedWith("no IPT");
    })

    it('Should revert if not suffience IPT balance', async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await ipToken.transfer(addr2.address, 100000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 100000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);

      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 2000000000000000000000n, addr2.address, true, false))
        .to.be.revertedWith("No allowance");
    })

    it('Should revert if not suffience ETH in account balance', async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await ipToken.transfer(addr2.address, 100000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 100000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 2000000000000000000000n, addr2.address, false, true))
        .to.be.revertedWith("no ETH");
    })

    it('Should successfully create intent wit IPT allowance', async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await ipToken.transfer(addr2.address, 1000000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 1000000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', true, false);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 2000000000000000000000n, addr1.address, true, false);
      const struct = await iptrade.getSalesIntent('f65a88a4d7e47905325c6b71495fc0b6');
      expect(struct.owner_address).to.equal(addr2.address);
      expect(struct.buyer_address).to.equal(addr1.address);
    })

    it('Should successfully create intent wit IPT balance', async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await ipToken.transfer(addr2.address, 1000000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 1000000000000000000000n);
      await iptrade.connect(addr2).depositIPT(500000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, false);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 2000000000000000000000n, addr1.address, false, false);
      const struct = await iptrade.getSalesIntent('f65a88a4d7e47905325c6b71495fc0b6');
      expect(struct.owner_address).to.equal(addr2.address);
      expect(struct.buyer_address).to.equal(addr1.address);
    })

    it('Should successfully create intent wit ETH balance', async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      const valueToSend = ethers.parseEther('1'); // Send 1 ETH
      await iptrade.connect(addr2).deposit({ value: valueToSend });
      await ipToken.approve(iptrade.target, 100000000000000000000n);
await iptrade.depositIPT(100000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, true);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n, addr1.address, false, true);
      const struct = await iptrade.getSalesIntent('f65a88a4d7e47905325c6b71495fc0b6');
      expect(struct.owner_address).to.equal(addr2.address);
      expect(struct.buyer_address).to.equal(addr1.address);

      // should fail
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n, addr2.address, false, true))
        .to.be.revertedWith("not exists or for sale");
    })
  })

  // cancel sales intent
  describe("The sales intent cancellation", function () {

    beforeEach(async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      const valueToSend = ethers.parseEther('1'); // Send 1 ETH
      await iptrade.connect(addr2).deposit({ value: valueToSend });
      await ipToken.approve(iptrade.target, 100000000000000000000n);
await iptrade.depositIPT(100000000000000000000n);
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

    it("Should be successful after time elapsed", async function(){
      async function delay(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
      }
      await delay(1);
      await iptrade.setLockTime(1);
      await (iptrade.connect(addr2).sellerCancelsSalesIntent('f65a88a4d7e47905325c6b71495fc0b6'));
      const struct_after = await iptrade.getSalesIntent('f65a88a4d7e47905325c6b71495fc0b6');
      expect(struct_after.exists).to.equal(false);
      await expect(iptrade.connect(addr2).sellerCancelsSalesIntent('f65a88a4d7e47905325c6b71495fc0b6')).
      to.be.revertedWith("Your ip is not for sale");

    })
  })

  describe("The buyer takes over the IP but fails", function () {

    beforeEach(async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      const valueToSend = ethers.parseEther('1'); // Send 1 ETH
      await iptrade.connect(addr2).deposit({ value: valueToSend });
      await ipToken.approve(iptrade.target, 100000000000000000000n);
await iptrade.depositIPT(100000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, true);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n, addr1.address, false, true);
    })

    it("Should revert if ether and approval", async function () {
      await expect(iptrade.connect(owner).buyerBuysIP('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n,  true, true))
        .to.be.revertedWith("cant approve ETH");
    })

    it("Should revert if the user is not the new owner", async function () {
      await expect(iptrade.connect(owner).buyerBuysIP('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n, false, true))
        .to.be.revertedWith("not buyer");
    })

    it("Should revert if the amount is not correct", async function () {
      await expect(iptrade.connect(addr1).buyerBuysIP('f65a88a4d7e47905325c6b71495fc0b6', 20000000000000000n, false, true))
        .to.be.revertedWith("incorrect price");
    })

    it("Should revert if wrong currency", async function () {
      await expect(iptrade.connect(addr1).buyerBuysIP('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n, false, false))
        .to.be.revertedWith("wrong currency");
    })
  })


  describe("The buyer takes over the IP", function () {

    beforeEach(async function () {
      await ipToken.approve(iptrade.target, 300000000000000000000n);
      await iptrade.depositIPT(300000000000000000000n);

      // send ETH to seller IPT
      const valueToSend = ethers.parseEther('1'); // Send 1 ETH

      await iptrade.connect(addr2).deposit({ value: valueToSend });
      //send ETH to buyer IPT
      await iptrade.connect(addr1).deposit({ value: valueToSend });
      // send IPT to seller
      await ipToken.transfer(addr2.address, 1000000000000000000000n);
      ipToken.connect(addr2).approve(iptrade.target, 1000000000000000000000n);
      iptrade.connect(addr2).depositIPT(500000000000000000000n)
      // send IPT to buyer
      await ipToken.transfer(addr1.address, 1000000000000000000000n,);
      ipToken.connect(addr1).approve(iptrade.target, 1000000000000000000000n);
      iptrade.connect(addr1).depositIPT(500000000000000000000n);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, true);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b7', false, true);
      await iptrade.connect(addr2).setIP('f65a88a4d7e47905325c6b71495fc0b8', false, true);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n, addr1.address, false, true);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b7', 200000000000000000000n, addr1.address, false, false);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('f65a88a4d7e47905325c6b71495fc0b8', 200000000000000000000n, addr1.address, true, false);
    })

    it("Should let addr1 buy the IP successfully with ETH", async function () {
      const before  = await ethers.provider.getBalance(addr2.address);
      await iptrade.connect(addr1).buyerBuysIP('f65a88a4d7e47905325c6b71495fc0b6', 200000000000000000n,  false, true);
      const after = await ethers.provider.getBalance(addr2.address);
      // addr1 should be owner of 'f65a88a4d7e47905325c6b71495fc0b6'
      const newowner = await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b6');
      expect(newowner.owner).to.equal(addr1.address);
      // addr1 has spent eth 200000000000000000n, balance should be 800000000000000000n 
      expect(await iptrade.connect(addr1).getEtherCredit()).to.equal(800000000000000000n);
      // addr2 should have gained  eth 200000000000000000n, balance should be 1200000000000000000n
      expect(await iptrade.connect(addr2).getEtherCredit()).to.equal(995000000000000000n);   //1 - 0.003 -0.002   //10 + 2 - 0.05 (3 x registration and 1 time transfer)
      expect(await before).to.equal(after - 200000000000000000n);   // just gained 0.2 Eth
      // check the transactions 
      console.log(await iptrade.getIpTransactions('f65a88a4d7e47905325c6b71495fc0b6'));
      // check spent ETH
      expect(await iptrade.spentEtherOdometer()).to.equal(5000000000000000n);

    })

    it("Should let addr1 buy the IP successfully with IPT credit", async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await iptrade.connect(addr1).buyerBuysIP('f65a88a4d7e47905325c6b71495fc0b7', 200000000000000000000n, false, false);
      // addr1 should be owner of 'f65a88a4d7e47905325c6b71495fc0b6'
      const newowner = await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b7');
      expect(newowner.owner).to.equal(addr1.address);
      // addr1 has spent ipt 2000000000000000000n, balance should be 3000000000000000000n 
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(300000000000000000000n);
      // addr2 should have gained  ipt 2000000000000000000n, balance should be 3000000000000000000n
      expect(await iptrade.connect(addr2).getIptBalance()).to.equal(300000000000000000000n); // 5 - 2 (cost of sales intent)
      expect(await ipToken.balanceOf(addr2.address)).to.equal(800000000000000000000n); // 5 + 2(sales) - 2 (setIP) + 3 bonues
      // check the transactions 
      console.log(await iptrade.getIpTransactions('f65a88a4d7e47905325c6b71495fc0b7'));
      //check spent IPT
      expect(await iptrade.spentIptOdometer()).to.equal(400000000000000000000n);
    })

    it("Should let addr1 buy the IP successfully with IPT allowance", async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      // set allowance, addr2 can spend money from addr1
      await ipToken.connect(addr1).approve(addr2.address, 200000000000000000000n);
      console.log(await ipToken.connect(addr1).readApprovalFor(addr2.address));
      await iptrade.connect(addr1).buyerBuysIP('f65a88a4d7e47905325c6b71495fc0b8', 200000000000000000000n, true, false);
      // addr1 should be owner of 'f65a88a4d7e47905325c6b71495fc0b8'
      const newowner = await iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b8');
      expect(newowner.owner).to.equal(addr1.address);
      //addr1 has spent ipt 0, balance should be 5000000000000000000n 
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(500000000000000000000n);
      // addr2 should have gained  eth 200000000000000000n, balance should be 1200000000000000000n
      expect(await iptrade.connect(addr2).getIptBalance()).to.equal(300000000000000000000n); // 5 - 2 (cost of sales intent of ...7)
      expect(await ipToken.balanceOf(addr2.address)).to.equal(800000000000000000000n); // 5 + 2 (sales) - 2 (setIP) + 3 (bonus) 
      // check the transactions 
      console.log(await iptrade.getIpTransactions('f65a88a4d7e47905325c6b71495fc0b8'));
      //check spent IPT
      expect(await iptrade.spentIptOdometer()).to.equal(400000000000000000000n);
    })

    // test without sufficient funds after allowance
    // test without allowance
    // test without Ether balance
    // test when too expensive

  })

  describe("Setting and getting the onlyOwnerHelper", function () {

    it("Should get the onlyOwnerHelper as owner", async function () {
      expect(await iptrade.ONLY_OWNERHelper()).to.equal(owner.address);
    })

    it("Should set addr1 as onlyOwnerHelper", async function () {
      await iptrade.setHelper(addr1.address);
      expect(await iptrade.ONLY_OWNERHelper()).to.equal(addr1.address);

      // and the onlyOwnerHelper should have onlyOwner functionality
      await iptrade.connect(addr1).setIPCostIpt(123456789, 1);
      expect(await iptrade.registerIPCostIpt()).to.equal(123456789);
    })

  })


  describe("Reentrancy", function () {

    beforeEach(async function () {


      // addr1 is the attacker
      // first add ether and spend by addr1

      attackAddress = attackerContract.target;
      const depositAmount = ethers.parseEther('1'); // Send 1 ETH
      await iptrade.connect(owner).deposit({ value: depositAmount });
      await iptrade.connect(addr1).deposit({ value: depositAmount });
      await ipToken.approve(iptrade.target, 100000000000000000000n);
await iptrade.depositIPT(100000000000000000000n);
      await iptrade.connect(addr1).setIP('f65a88a4d7e47905325c6b71495fc0b5', false, true);

      // and addr1 spends IPT
      await ipToken.transfer(addr1.address, 1000000000000000000000n,);
      ipToken.connect(addr1).approve(iptrade.target, 1000000000000000000000n);
      iptrade.connect(addr1).depositIPT(500000000000000000000n);
      await ipToken.approve(iptrade.target, 100000000000000000000n);
await iptrade.depositIPT(100000000000000000000n);
      await iptrade.connect(addr1).setIP('f65a88a4d7e47905325c6b71495fc0b6', false, false);

      // Set the contract address in the attacker contract
      await attackerContract.setTargetContract(iptrade.target);


    })

    // Trigger the reentrancy attack
    it("Should revert withdrawing Ether by attacker in onlyOwner", async function () {
      await expect(attackerContract.connect(addr1).attackEth()).
        to.be.revertedWith("Reentrancy attack failed ETH");
    })

    it("Should revert withdrawing Ether by attacker in onlyOwner", async function () {
      await expect(attackerContract.connect(addr1).attackIpt()).
        to.be.revertedWith("Reentrancy attack failed IPT");
    })

    it("Should revert withdrawing Ether by attacker as user", async function () {
      await expect(attackerContract.connect(addr1).attackEthUser()).
        to.be.revertedWith("Reentrancy attack failed Eth user");

      // but just collecting should be ok
      await (iptrade.connect(addr1).userEtherWithdrawal(10000000000000000n));
    })

    it("Should revert withdrawing Ipt by attacker as user", async function () {
      await expect(attackerContract.connect(addr1).attackIptUser()).
        to.be.revertedWith("Reentrancy attack failed IPT user");
    })
  })


  // check if we can burn
  describe("Burn", function () {
    it("should burn tokens", async () => {

      // Get the initial balance of the account
      const initialBalance = await ipToken.balanceOf(owner.address);

      // Specify the amount to burn
      const burnAmount = 100n;

      // Burn tokens
      await ipToken.burn(burnAmount);
      console.log(burnAmount);

      // Verify the balance after burning 
      const finalBalance = await ipToken.balanceOf(owner.address);
      console.log(finalBalance);
      expect(finalBalance).to.equal(initialBalance - burnAmount, "Incorrect balance after burning");
    })
  })



  describe("No block reward", function () {
      /* this was done with an original function to test what happens if the cap is reached
    it("Should surpass the capped limit", async function () {
      await ipToken.setBlockReward(9000000000000000000000000n);
      await ipToken.transfer(addr1.address, 1000);
      console.log(await(ipToken.totalMined()));
      console.log(await(ipToken.totalSupply()));
      console.log(await ipToken.getBlockReward());
      await ipToken.setBlockReward(20000000000000000000000000n);
      await expect(ipToken.transfer(addr1.address, 1000)).
        to.be.revertedWith("ERC20Capped: cap exceeded");
      await ipToken.setBlockReward(0);
      await ipToken.transfer(addr1.address, 1000);
      expect(await ipToken.balanceOf(addr1.address)).to.equal(2000);
    })
    */

    it("Should return the block reward", async function () {
      expect(await ipToken.blockReward()).to.equal(100000000000000000000n);
    })
  })

  describe("Fallback", function () {

    it("ipToken should not accept ether", async function () {
      const depositAmount = ethers.parseEther('1');
      await expect(addr1.sendTransaction({ to: ipToken.target, value: depositAmount })).to.be.revertedWith("Sending ether to this contract is not allowed")
    })
  })

  describe("steal Ether or IPT", function () {
    it("Transfers ETH from the contract", async function(){

      /* will not work
      // first get ether in the contract
      const depositAmount = ethers.parseEther('1'); // Send 1 ETH
      await iptrade.connect(owner).deposit({ value: depositAmount });
      await iptrade.connect(addr1).deposit({ value: depositAmount });
      expect (await iptrade.ethersInContract()).to.equal(2000000000000000000n);
      // then send it to owner's wallet
      
      await (iptrade.address.sendTransaction({ to: owner.target, value: depositAmount }));
      //expect (await iptrade.ethersInContract()).to.equal(1000000000000000000n);
    */

     // transfer IPT into the contract
     await ipToken.transfer(addr2, 100000000000000000000n);
     await ipToken.connect(addr2).transfer(iptrade.target, 100000000000000000000n);
     expect (await ipToken.balanceOf(iptrade)).to.equal(100000000000000000000n);

     // transfer back to owner
     let before = await ipToken.balanceOf(owner);
     await iptrade.withdrawSpentIpt();
     expect (await ipToken.balanceOf(iptrade)).to.equal(0);
     let after = await ipToken.balanceOf(owner);
     expect (before + 100000000000000000000n).to.equal(after);

    
     // transfer through allowance and  depositIPT()
     await ipToken.transfer(addr1, 100000000000000000000n);
     await ipToken.connect(addr1).approve(iptrade, 100000000000000000000n );
     await iptrade.connect(addr1).depositIPT(100000000000000000000n);
     expect (await ipToken.balanceOf(iptrade)).to.equal(100000000000000000000n);

     // transfer back to owner
     await expect(iptrade.withdrawSpentIpt()).
     to.be.revertedWith('no IPT');
    })
  })


  //iptInContract
  describe("iptInContract", function () {

    beforeEach(async function () {
      await ipToken.approve(iptrade.target, 1000000000000000000000n);
      await ipToken.transfer(addr1,  1000000000000000000000n);
      await ipToken.transfer(addr2,  1000000000000000000000n);
      await iptrade.depositIPT(1000000000000000000000n);
      await ipToken.connect(addr1).approve(iptrade.target, 1000000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 1000000000000000000000n);
    })


    it("deposits IPT", async function(){
      await iptrade.connect(addr1).depositIPT(500000000000000000000n);
      expect(await iptrade.iptInContract()).to.equal(1500000000000000000000n);
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(500000000000000000000n);
    })

    //  userIptWithdrawal
    it("userIptWithdrawal ", async function(){
      await iptrade.connect(addr1).depositIPT(500000000000000000000n);
      await iptrade.connect(addr1).userIptWithdrawal(500000000000000000000n);
      expect(await iptrade.iptInContract()).to.equal(1000000000000000000000n);
    })


    //  setIP
    it("setIP ", async function(){
      await iptrade.connect(addr1).depositIPT(500000000000000000000n);
      await iptrade.connect(addr1).setIP("d816f97b2046cf5cdb43d808ef1e1ab0", false, false);
      // where are the IPT?
      expect(await iptrade.iptInContract()).to.equal(1400000000000000000000n);
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(400000000000000000000n);
      expect(await iptrade.connect(owner).getIptBalance()).to.equal(900000000000000000000n);
      expect(await iptrade.spentIptOdometer()).to.equal(100000000000000000000n);
      expect(await ipToken.balanceOf(iptrade.target)).to.equal(1400000000000000000000n);
    })

    //  setIP wo freetokens
    it("setIP ", async function(){
      await iptrade.connect(addr1).depositIPT(500000000000000000000n);
      await iptrade.setFreetokensBool(false);
      // where are the IPT?
      await iptrade.connect(addr1).setIP("d816f97b2046cf5cdb43d808ef1e1ab0", false, false);
      expect(await iptrade.iptInContract()).to.equal(1500000000000000000000n);
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(400000000000000000000n);
      expect(await iptrade.connect(owner).getIptBalance()).to.equal(1000000000000000000000n);
      expect(await iptrade.spentIptOdometer()).to.equal(100000000000000000000n);
      expect(await ipToken.balanceOf(iptrade.target)).to.equal(1500000000000000000000n);
    })

      //  setIP wit approval
      it("setIP on approval ", async function(){
        await iptrade.connect(addr1).depositIPT(500000000000000000000n);
        // where are the IPT?
        await iptrade.connect(addr1).setIP("d816f97b2046cf5cdb43d808ef1e1ab0", true, false);
        expect(await iptrade.iptInContract()).to.equal(1500000000000000000000n);
        expect(await iptrade.connect(addr1).getIptBalance()).to.equal(500000000000000000000n);
        expect(await iptrade.connect(owner).getIptBalance()).to.equal(900000000000000000000n);
        expect(await iptrade.spentIptOdometer()).to.equal(100000000000000000000n);
        expect(await ipToken.balanceOf(iptrade.target)).to.equal(1500000000000000000000n);
      })

       //  setIP with Ether
      it("setIP with ether ", async function(){
      const depositAmount = ethers.parseEther('1'); // Send 1 ETH
      await iptrade.connect(addr1).deposit({ value: depositAmount });
      await iptrade.connect(addr1).depositIPT(500000000000000000000n);
      await iptrade.connect(addr1).setIP("d816f97b2046cf5cdb43d808ef1e1ab0", false, true);
      // where are the IPT?
      expect(await iptrade.iptInContract()).to.equal(1400000000000000000000n);
      expect(await iptrade.connect(addr1).getIptBalance()).to.equal(500000000000000000000n);
      expect(await iptrade.connect(owner).getIptBalance()).to.equal(900000000000000000000n);
      expect(await iptrade.spentIptOdometer()).to.equal(0);
      expect(await ipToken.balanceOf(iptrade.target)).to.equal(1400000000000000000000n);
      // where are the ETH?
      expect(await iptrade.connect(addr1).getEtherCredit()).to.equal(999000000000000000n);
      expect(await iptrade.connect(owner).getEtherCredit()).to.equal(0n);
      expect(await iptrade.spentEtherOdometer()).to.equal(1000000000000000n);
      expect(await ethers.provider.getBalance(iptrade.target)).to.equal(1000000000000000000n);
      expect(await iptrade.ethersInContract()).to.equal(1000000000000000000n);
      // remove as user
      await iptrade.connect(addr1).userEtherWithdrawal(999000000000000000n);
      expect(await iptrade.connect(addr1).getEtherCredit()).to.equal(0n);
      expect(await iptrade.ethersInContract()).to.equal(1000000000000000n);
      // remove spentEther
      await iptrade.withdrawSpentEth();
      expect(await iptrade.ethersInContract()).to.equal(0);
      expect(await iptrade.spentEtherOdometer()).to.equal(0);
      expect(await ethers.provider.getBalance(iptrade.target)).to.equal(0);
    })



    //  withdrawSpentIpt
    it("withdrawSpentIpt", async function(){
      await iptrade.connect(addr1).depositIPT(500000000000000000000n);
      await expect (iptrade.withdrawSpentIpt()).to.be.revertedWith("no IPT");
      expect(await iptrade.iptInContract()).to.equal(1500000000000000000000n);
      ipToken.transfer(iptrade.target, 1000000000000000000000n);
      expect(await iptrade.iptInContract()).to.equal(1500000000000000000000n);
      expect(await ipToken.balanceOf(iptrade.target)).to.equal(2500000000000000000000n);
      await iptrade.withdrawSpentIpt();
      expect(await ipToken.balanceOf(iptrade.target)).to.equal(1500000000000000000000n);

      // once again, now with an actual expenditure
      ipToken.transfer(iptrade.target, 1000000000000000000000n);  // balance up, IPTinC not
      await iptrade.connect(addr2).depositIPT(500000000000000000000n);  // + 500 IPTinC
      await iptrade.connect(addr1).setIP("d816f97b2046cf5cdb43d808ef1e1ab0", false, false);  // + 100 spent, - 100 donated 
      await iptrade.connect(addr1).sellerCreatesSalesIntent("d816f97b2046cf5cdb43d808ef1e1ab0", 100000000000000000000n, addr2, false, false); // + 200 spent 
      await iptrade.connect(addr2).buyerBuysIP("d816f97b2046cf5cdb43d808ef1e1ab0", 100000000000000000000n, false, false); // - 100 donated , -100 paid (external)
      expect (await ipToken.balanceOf(iptrade.target)).to.equal(2700000000000000000000n);// balance should be should be 1500 + 1000 + 500 - 100 -100 - 100
      expect (await iptrade.iptInContract()).to.equal(1700000000000000000000n);// iptinContract should be 1500  + 500 - 100 -100 - 100
      expect (await iptrade.spentIptOdometer()).to.equal(300000000000000000000n)// spentIPTOdometer should be 100 + 200
      await iptrade.withdrawSpentIpt();  // remove 300 + 1000
      expect (await ipToken.balanceOf(iptrade.target)).to.equal(1400000000000000000000n);// balance should be should be 1500 + 1000 + 500 - 100 -100 - 100
      expect (await iptrade.iptInContract()).to.equal(1400000000000000000000n);// iptinContract should be 1500  + 500 - 100 -100 - 100
      expect (await iptrade.spentIptOdometer()).to.equal(0)// spentIPTOdometer should be 100 + 200

    })

  })

  
});


describe("IPToken Contract", function () {
  let IPToken;
  let ipToken;
  let owner;
  const cap = 100000000; // 100 IPT cap

  beforeEach(async function () {
      [owner] = await ethers.getSigners();
      const IPTokenFactory = await ethers.getContractFactory("IPToken");
      ipToken = await IPTokenFactory.deploy(cap, 0, 0); // No tokens minted at launch, no block reward
  });

});