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

  describe("Deployment IPT", function () {
    /* it("Should set the right owner", async function () {
       expect(await ipToken.owner()).to.equal(owner.address);
     });
     */

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

  describe("Deployment iptrade, setter functions", function () {
    it("Should set the right owner", async function () {
      expect(await iptrade.owner()).to.equal(owner.address);

      await iptrade.setNewOwner(addr2);
      expect(await iptrade.owner()).to.equal(addr2.address);

      // and the onlyOwnerHelper should have onlyOwner functionality
      await iptrade.connect(addr2).setIPCostIpt(123456789, 1);
      expect(await iptrade.registerIPCostIpt()).to.equal(123456789);
    });

    it("..not as non owner", async function () {
      await expect(iptrade.connect(addr1).setNewOwner(addr2)).to.be.revertedWith("owner or helper only");
    });


    it("Should set addr1 as onlyOwnerHelper", async function () {
      await iptrade.setHelper(addr1.address);
      expect(await iptrade.ONLY_OWNERHelper()).to.equal(addr1.address);

      // and the onlyOwnerHelper should have onlyOwner functionality
      await iptrade.connect(addr1).setIPCostIpt(123456789, 1);
      expect(await iptrade.registerIPCostIpt()).to.equal(123456789);
    })

    it("..not as non owner", async function () {
      await expect(iptrade.connect(addr1).setHelper(addr2)).to.be.revertedWith("owner or helper only");
    });

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

    it("Should set the setIPCostIpt ", async function () {
      await iptrade.connect(owner).setIPCostIpt(4000000000000000000n, 1);
      expect(await iptrade.registerIPCostIpt()).to.equal(4000000000000000000n);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setIPCostIpt(1,1)
      ).to.be.revertedWith("owner or helper only");
    })


  });

  describe("transfer fucntions: request tokens" , function () {
    beforeEach(async function () {
      await ipToken.approve(iptrade.target, 1000000000000000000000n);
      await iptrade.depositIPT(1000000000000000000000n);
      expect(await ipToken.balanceOf(iptrade.target)).to.equal(1000000000000000000000n);
      expect(await iptrade.getIptBalance(owner)).to.equal(1000000000000000000000n);
    
    })

    it("Should request tokens successfully", async function(){
        // request
        const addr1Balance_before = await ipToken.balanceOf(addr1.address);
        await iptrade.connect(addr1).requestTokens();
        const addr1Balance_after = await ipToken.balanceOf(addr1.address);
        expect(addr1Balance_after).to.equal(addr1Balance_before + 100000000000000000000n);

        // revert when requested again
        await ipToken.approve(iptrade.target, 1000000000000000000000n);
        await iptrade.depositIPT(1000000000000000000000n);
        await expect(
          iptrade.connect(addr1).requestTokens()
        ).to.be.revertedWith("try later");

        // and work with a shorter lock time
        await iptrade.setLockTime(0);
       
        /* async function delay(seconds) {
          return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }
        await delay(1);
        */
        await ipToken.approve(iptrade.target, 1000000000000000000000n);
        await iptrade.depositIPT(1000000000000000000000n);
        const addr1Balance_before_2 = await ipToken.balanceOf(addr1.address);
        await iptrade.connect(addr1).requestTokens();
        const addr1Balance_after_2 = await ipToken.balanceOf(addr1.address);
        expect(addr1Balance_after_2).to.equal(addr1Balance_before_2 + 100000000000000000000n);


    })

    it("Should revert when setFreetokensBool to false ", async function(){
      // set freetokensbool to false
      await iptrade.setFreetokensBool(false);
      await expect(
        iptrade.connect(addr1).requestTokens()
      ).to.be.revertedWith("faucet closed");
    })

      it("Should revert a token request without tokens at owner ", async function () {
        await iptrade.setFreeIpTokenwithdrawal(1000000000000000000000000n);
        await expect(
          iptrade.connect(addr1).requestTokens()
        ).to.be.revertedWith("no IPT av");
      })
    })
  

    describe("transfer fucntions: depositIPT" , function () {

      it("Should transfer  if there is approval", async function(){
        await ipToken.approve(iptrade.target, 100000000000000000000n);
        await iptrade.depositIPT(100000000000000000000n);

        await ipToken.transfer(addr1.address, 200000000000000000000n);
        await ipToken.connect(addr1).approve(iptrade.target, 200000000000000000000n);
        await iptrade.connect(addr1).depositIPT(200000000000000000000n);

        expect (await ipToken.balanceOf(iptrade.target)).to.equal(300000000000000000000n);
      })


    it("Should not transfer if there is no approval", async function(){
      await ipToken.transfer(addr1.address, 200000000000000000000n);
        await expect(iptrade.connect(addr1).depositIPT(1)).to.be.revertedWith("No allowance");
    })


  it("Should not transfer with if there is no funds", async function(){
    await ipToken.connect(addr1).approve(iptrade.target, 100000000000000000000n);
    await expect (iptrade.connect(addr1).depositIPT(200000000000000000000n)).to.be.revertedWith( "No funds");
  })
})


describe("fallbacks", function () {
  
  it("Should activate the fallback ", async function () {
    // Check the fallback option
    const valueToSend = ethers.parseEther("1.0"); // Send 1 ETH
    await expect(addr1.sendTransaction({ to: iptrade.target, value: valueToSend })).
      to.be.revertedWith("Fallback function disabled. Use deposit() for Ether or depositIPT() for IPT.");


    const zero = ethers.parseEther('0'); // Send 0 ETH
    await expect(addr1.sendTransaction({ to: iptrade.target, value: zero }))
      .to.be.revertedWith("Fallback function disabled. Use deposit() for Ether or depositIPT() for IPT.");
  })

})


describe("withdraw IPT funds from user", function () {

  it("Should withdraw  IPT with credit", async function () {
    // allowance and transfer
    // send 35 to addr1
    // addr 1 deposits 10 in contract
    // addr 1 withdraws 5 from contract
    await ipToken.transfer(addr1.address, 3500000000000000000n);
    const ipt_start = (await ipToken.balanceOf(addr1.address)); //35

    await ipToken.connect(addr1).approve(iptrade.target, 1000000000000000000n);
    await iptrade.connect(addr1).depositIPT(1000000000000000000n);
    const ipt_middle = (await ipToken.balanceOf(addr1.address)); //25

    // ipt credit check
    expect(await iptrade.connect(addr1).getIptBalance()).to.equal(1000000000000000000n);
    // withdraw
    await iptrade.connect(addr1).userIptWithdrawal(500000000000000000n); //5 left 

    // check balances
    expect(await iptrade.connect(addr1).getIptBalance()).to.equal(500000000000000000n);
    const ipt_end = (await ipToken.balanceOf(addr1.address));  // 30
    expect(await ipToken.balanceOf(iptrade.target)).to.equal(500000000000000000n);
    expect(ipt_start).to.equal(ipt_end + 500000000000000000n);
    expect(ipt_end).to.equal(ipt_middle + 500000000000000000n);
    expect(await ipToken.balanceOf(iptrade.target)).to.equal(await iptrade.iptInContract());
  })

  it("Should not withdraw IPT if no credit", async function () {
    await expect(iptrade.connect(addr1).userIptWithdrawal(1000000000000000000n)).
      to.be.revertedWith("no IPT");
  })

})

describe("withdraw  IPT that is not registered", function(){
  beforeEach(async function(){
    await ipToken.transfer(iptrade.target, 100000000000000000000n);
  })

  it("Should drain the contract from unregistered IPT", async function(){
    const before = await ipToken.balanceOf(owner.address);
    await iptrade.unregisteredIPT();
    const after = await ipToken.balanceOf(owner.address);
    expect (after).to.equal(before + 100000000000000000000n);

  })

  it("... only as owner", async function(){
    await expect (iptrade.connect(addr1).unregisteredIPT()).to.be.revertedWith("owner or helper only");
  })
})

describe("withdraw  IPT", function(){

    beforeEach(async function(){
      await ipToken.transfer(addr1.address, 500000000000000000000n);
      await ipToken.transfer(addr2.address, 500000000000000000000n);
      await ipToken.approve(iptrade.target, 500000000000000000000n);
      await ipToken.connect(addr1).approve(iptrade.target, 500000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 500000000000000000000n);
      await iptrade.connect(addr1).depositIPT(500000000000000000000n);
      await iptrade.depositIPT(500000000000000000000n);
    })

      //  withdrawSpentIpt
      it("withdrawSpentIpt, no expenses", async function(){

       await expect (iptrade.withdrawSpentIpt()).to.be.revertedWith("no IPT");
        expect(await iptrade.iptInContract()).to.equal(1000000000000000000000n);
        ipToken.transfer(iptrade.target, 1000000000000000000000n);
        expect(await iptrade.iptInContract()).to.equal(1000000000000000000000n);
        expect(await ipToken.balanceOf(iptrade.target)).to.equal(2000000000000000000000n);
      })

      it("withdrawSpentIpt, with expenses", async function(){
  
        // once again, now with an actual expenditure
        ipToken.transfer(iptrade.target, 1000000000000000000000n);  // balance up, IPTinC not
        await iptrade.connect(addr2).depositIPT(500000000000000000000n);  // now 25 in total
        await iptrade.connect(addr1).setIP("71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323", false);  // spentIP +1 , 1 paid
        await iptrade.connect(addr1).sellerCreatesSalesIntent("71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323", 200000000000000000000n, addr2, false); // + 2 spent 
        await iptrade.connect(addr2).buyerBuysIP("71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323", 200000000000000000000n, false); // - 1 donated , 1 paid (external)
        expect (await ipToken.balanceOf(iptrade.target)).to.equal(2100000000000000000000n);
        expect (await iptrade.iptInContract()).to.equal(1100000000000000000000n);// 
        expect (await iptrade.spentIptOdometer()).to.equal(200000000000000000000n)//
        await iptrade.withdrawSpentIpt();  // remove 300 + 1000
        expect (await ipToken.balanceOf(iptrade.target)).to.equal(1900000000000000000000n);// 
        expect (await iptrade.iptInContract()).to.equal(900000000000000000000n);// 
        await iptrade.unregisteredIPT();
        expect (await ipToken.balanceOf(iptrade.target)).to.equal(900000000000000000000n);//
        expect (await iptrade.spentIptOdometer()).to.equal(0)// spentIPTOdometer should be 100 + 200
      })

    })
  

    describe("set IP", function(){

      beforeEach(async function(){
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
  

      })

      it("Should set IP", async function () {
       
        // set IP wit approval
        await iptrade.connect(addr1).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', true);
  
        // test registration duplicate
        await iptrade.connect(addr1).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d324', false);
        await expect(iptrade.connect(addr1).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', false))
          .to.be.revertedWith("is registered");
  
  
        // check who is the owner
        console.log(addr1.address);
       
  
        const result = await iptrade.getIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323'); // Replace with your struct-returning function
        console.log(result);
        const newLocal = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

        // Check the expected values of the struct members
        expect(result.owner).to.equal(newLocal);
        expect(result.creationTimeStamp).to.be.above(1698873404n);
        expect(result.exists).to.equal(true);
        
        // this should fail
        await expect (iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b')).to.be.revertedWith('sha512 incorr');
        await expect (iptrade.getIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d325')).to.be.revertedWith("IP does not exist");
    

        // calculate remains IPT
        expect(await iptrade.connect(addr1).getIptBalance()).to.equal(900000000000000000000n);
        expect(await ipToken.connect(addr1).readApprovalFor(iptrade.target)).to.equal(2900000000000000000000n);
        expect(await iptrade.connect(owner).spentIptOdometer()).to.equal(200000000000000000000n);
  
      })

    it("Should test IP registration successfully", async function () {
      console.log(await ethers.provider.getBalance(addr1.address));
      // set IP with approval to fail
      await expect(iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', true))
        .to.be.revertedWith("No funds");

      // set IP with tokenbalance to fail
      await expect(iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', false))
        .to.be.revertedWith("no IPT");

      // test stringlength check
      await expect(iptrade.connect(addr1).setIP('abc', false))
        .to.be.revertedWith("sha512 incorr");
    })
  })



  describe("delete IP", function(){

    beforeEach(async function(){
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);

      // transer IPT to addr1
      await ipToken.transfer(addr1.address, 5000000000000000000000n);
      expect(await ipToken.balanceOf(addr1.address)).to.equal(5000000000000000000000n);

      // addr1 approves contract to spend
      await ipToken.connect(addr1).approve(iptrade.target, 4000000000000000000000n);
      await iptrade.connect(addr1).depositIPT(1000000000000000000000n);
    })

    it("Should delete IP", async function () {
     
      // set IP with approval
      await iptrade.connect(addr1).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', true);

      // delete IP, fails
      await expect (iptrade.deleteIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith('not owner');

      // delete IP, fails
      await iptrade.connect(addr1).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr2.address, false);
      await expect (iptrade.connect(addr1).deleteIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith("IP is for sale");
    
      // delete IP
      await iptrade.setLockTime(0);
      await iptrade.connect(addr1).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await iptrade.connect(addr1).deleteIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await expect (iptrade.getIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith("IP does not exist");
      const transactions_1 = await iptrade.getIpTransactions('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      expect (transactions_1[1]).to.equal('0x0000000000000000000000000000000000000000');

      // set IP again with approval
      await iptrade.connect(addr1).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', true);
      console.log(await iptrade.getIpTransactions('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323'));
      const transactions_2 = await iptrade.getIpTransactions('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      expect (transactions_2[2]).to.equal('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');





    })

    })

  describe("The owner creates a Sales Intent", function () {

    beforeEach(async function(){
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await ipToken.transfer(addr2.address, 1000000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 1000000000000000000000n);
    })


    it("Should revert if the user is not the owner of the IP", async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', true);
      const result = await iptrade.getIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      expect(result.owner).to.equal('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
      
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr1).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr2.address, false))
        .to.be.revertedWith("not owner");
    })

    it("Should revert if the onsale instance already exists", async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', true);
      await ipToken.transfer(addr2.address, 2000000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 2000000000000000000000n);
      await iptrade.connect(addr2).depositIPT(2000000000000000000000n);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr1.address, false);
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr1.address, false))
        .to.be.revertedWith("already for sale");
    })

    it('Should revert if not suffience IPT in account', async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', true);
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr1.address, false))
        .to.be.revertedWith("no IPT");
    })


    it('Should revert if selling to self', async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', true);
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr2.address, false))
        .to.be.revertedWith("don't sell to self");
    })

    it('Should revert if not suffience IPT balance', async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 100000000000000000000n);
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', true);

      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr1.address, true))
        .to.be.revertedWith("No allowance");
    })

    it('Should successfully create intent wit IPT allowance', async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', true);
  

      await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr1.address, true);
      const struct = await iptrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      expect(struct.owner_address).to.equal(addr2.address);
      expect(struct.buyer_address).to.equal(addr1.address);
    })

    it('Should successfully create intent wit IPT balance', async function () {
      await ipToken.approve(iptrade.target, 100000000000000000000n);
      await iptrade.depositIPT(100000000000000000000n);
      await ipToken.transfer(addr2.address, 1000000000000000000000n);
      await ipToken.connect(addr2).approve(iptrade.target, 1000000000000000000000n);
      await iptrade.connect(addr2).depositIPT(500000000000000000000n);
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', false);
      await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr1.address, false);
      const struct = await iptrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      expect(struct.owner_address).to.equal(addr2.address);
      expect(struct.buyer_address).to.equal(addr1.address);
    })
  })


    // cancel sales intent
    describe("The sales intent cancellation", function () {
  
      beforeEach(async function () {
        await ipToken.approve(iptrade.target, 200000000000000000000n);
        await iptrade.depositIPT(200000000000000000000n);
        await ipToken.transfer(addr2.address,600000000000000000000n);
        await ipToken.connect(addr2).approve(iptrade.target, 600000000000000000000n);
        await iptrade.connect(addr2).depositIPT(300000000000000000000n);
        await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', true);
        await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000n, addr1.address, true);
        await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d324', false);
        await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d324', 200000000000000000n, addr1.address, false);
     
      })
  
      it("Should revert if not owner", async function () {
        await expect(iptrade.connect(addr1).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).
          to.be.revertedWith("not owner");
      })
  
      it("Should revert if too early", async function () {
        await expect(iptrade.connect(addr2).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).
          to.be.revertedWith("locked");
        await iptrade.setLockTime(0);
        const struct_before = await iptrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
        expect(struct_before.exists).to.equal(true);
        await (iptrade.connect(addr2).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323'));
        await expect (iptrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith("Not for sale");    
      })
  
      it("Should revert if not for sale", async function () {
        await iptrade.setLockTime(1);
        await (iptrade.connect(addr2).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323'));
        await expect(iptrade.connect(addr2).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).
          to.be.revertedWith("Your ip is not for sale");
      })

    })



    describe("The buyer takes over the IP", function () {
  
      beforeEach(async function () {
        await ipToken.approve(iptrade.target, 500000000000000000000n);
        await iptrade.depositIPT(500000000000000000000n);

        await ipToken.transfer(addr1.address, 600000000000000000000n );
        await ipToken.connect(addr1).approve(iptrade.target, 600000000000000000000n);
        await iptrade.connect(addr1).depositIPT(300000000000000000000n);

        await ipToken.transfer(addr2.address, 600000000000000000000n );
        await ipToken.connect(addr2).approve(iptrade.target, 600000000000000000000n);
        await iptrade.connect(addr2).depositIPT(300000000000000000000n);

        await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', false);
        await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000000n, addr1.address, false);
      })
  
  
      it("Should revert if the user is not the new owner", async function () {
        await expect(iptrade.connect(owner).buyerBuysIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000n, false))
          .to.be.revertedWith("not buyer, check sha512");
      })
  
      it("Should revert if the amount is not correct", async function () {
        await expect(iptrade.connect(addr1).buyerBuysIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 20000000000000000n, false))
          .to.be.revertedWith("incorrect price");
      })
  
      
      it("Should let addr1 buy the IP successfully with IPT credit", async function () {
        await iptrade.connect(addr1).buyerBuysIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000000n, false);
        const newowner = await iptrade.getIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
        
        // expect right address
        expect(newowner.owner).to.equal(addr1.address);

        // expect right IPT balance addr1
        expect(await iptrade.connect(addr1).getIptBalance()).to.equal(100000000000000000000n);
        expect(await ipToken.balanceOf(addr1.address)).to.equal(400000000000000000000n); //

        // expect right IPT balance addr2
        expect(await iptrade.connect(addr2).getIptBalance()).to.equal(100000000000000000000n); 
        expect(await ipToken.balanceOf(addr2.address)).to.equal(600000000000000000000n); //
        
        // check the transactions 
        const transactions = await iptrade.getIpTransactions('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
        console.log(transactions[0]);
  
        //check spent IPT
        expect(await iptrade.spentIptOdometer()).to.equal(200000000000000000000n);

        // check owners credit
        expect (await iptrade.getIptBalance()).to.equal(300000000000000000000n);

        //check the sales intent
        await expect (iptrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith("Not for sale");
      })
  
      it("Should let addr1 buy the IP successfully with IPT allowance", async function () {
        await ipToken.approve(iptrade.target, 300000000000000000000n);
        await iptrade.depositIPT(300000000000000000000n);

        // set allowance, addr2 can spend money from addr1. Does nothing here
        await ipToken.connect(addr1).approve(addr2.address, 200000000000000000000n);
        expect(await ipToken.connect(addr1).readApprovalFor(addr2.address)).to.equal(200000000000000000000n);

        // buy IP 
        await iptrade.connect(addr1).buyerBuysIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000000n, true);

        
        // addr1 should be owner of 'f65a88a4d7e47905325c6b71495fc0b8'
        const newowner = await iptrade.getIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
        expect(newowner.owner).to.equal(addr1.address);

        //addr1 has spent ipt 0, balance should be 5000000000000000000n 
        expect(await iptrade.connect(addr1).getIptBalance()).to.equal(300000000000000000000n);

        // addr2 balanceOf should have gained  eth 200000000000000000000n, balance should be 200000000000000000000n
        expect(await iptrade.connect(addr2).getIptBalance()).to.equal(100000000000000000000n); // 
        expect(await ipToken.balanceOf(addr2.address)).to.equal(600000000000000000000n); // 

        // check the transactions 
        const transactions = await iptrade.getIpTransactions('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
        expect(transactions[0]).to.equal(addr2.address);

        //check spent IPT
        expect(await iptrade.spentIptOdometer()).to.equal(200000000000000000000n);
      })
  
    })

});