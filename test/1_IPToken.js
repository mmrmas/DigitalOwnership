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


  //EVENTS, STRUCTS, MAPPINGS?

  describe("setter functions (non-IP", function () {
    beforeEach(async function () {
      await ipToken.transfer(iptrade.target, 1000000000000000000000n);
      expect(await ipToken.balanceOf(iptrade.target)).to.equal(1000000000000000000000n);
    })

    it("Should set the right owner", async function () {
      expect(await iptrade.owner()).to.equal(owner.address);

      await iptrade.setNewOwner(addr2);
      expect(await iptrade.owner()).to.equal(addr2.address);

      // and the onlyOwnerHelper should have onlyOwner functionality
      await iptrade.connect(addr2).setIPCostIpt(123456789, 1);
      expect(await iptrade.registerIPCostIpt()).to.equal(123456789);
    });

    it("..not as non owner", async function () {
      await expect(iptrade.connect(addr1).setNewOwner(addr2)).to.be.revertedWith("owner only");
    });


    it("Should set the withdrawal amount to 10 ** 18", async function () {
      expect(await iptrade.freeIpTokenwithdrawal()).to.equal(500000000000000000000n);
      await iptrade.connect(owner).setFreeIpTokenwithdrawal(10000000000000000000n);
      expect(await iptrade.freeIpTokenwithdrawal()).to.equal(10000000000000000000n);

    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setFreeIpTokenwithdrawal(1)
      ).to.be.revertedWith("owner only");
    })

    it("Should set the locktime to 5 minutes", async function () {
      await iptrade.connect(owner).setLockTime(5);
      expect(await iptrade.lockTime()).to.equal(5);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setLockTime(1)
      ).to.be.revertedWith("owner only");
    })

    it("Should set the setIPCostIpt ", async function () {
      await iptrade.connect(owner).setIPCostIpt(4000000000000000000n, 1);
      expect(await iptrade.registerIPCostIpt()).to.equal(4000000000000000000n);
      expect(await iptrade.transferIPCostIpt()).to.equal(1);
    })

    it("...Should fail to set if not the owner", async function () {
      await expect(
        iptrade.connect(addr1).setIPCostIpt(1, 1)
      ).to.be.revertedWith("owner only");
    })
  })



  describe("IPT transfer functions", function () {

    beforeEach(async function () {
      await ipToken.transfer(iptrade.target, 1000000000000000000000n);
    })


    it("Should request tokens successfully", async function () {
      // request
      const addr1Balance_before = await ipToken.balanceOf(addr1.address);
      await iptrade.connect(addr1).requestTokens();
      const addr1Balance_after = await ipToken.balanceOf(addr1.address);
      expect(addr1Balance_after).to.equal(addr1Balance_before + 500000000000000000000n);

      // revert when requested again
      await ipToken.transfer(iptrade.target, 1000000000000000000000n);
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
      await ipToken.transfer(iptrade.target, 1000000000000000000000n);
      const addr1Balance_before_2 = await ipToken.balanceOf(addr1.address);
      await iptrade.connect(addr1).requestTokens();
      const addr1Balance_after_2 = await ipToken.balanceOf(addr1.address);
      expect(addr1Balance_after_2).to.equal(addr1Balance_before_2 + 500000000000000000000n);
    })

    it("Should revert a token request without tokens at owner ", async function () {
      await iptrade.setFreeIpTokenwithdrawal(1000000000000000000000000n);
      await expect(
        iptrade.connect(addr1).requestTokens()
      ).to.be.revertedWith("no IPT av");
    })

    it("Should drain the contract from unregistered IPT", async function () {
      const before = await ipToken.balanceOf(owner.address);
      const iptiniptrade = await ipToken.balanceOf(iptrade.target);
      await iptrade.unregisteredIPT();
      const after = await ipToken.balanceOf(owner.address);
      expect(after).to.equal(before + iptiniptrade );

    })

    it("... only as owner", async function () {
      await expect(iptrade.connect(addr1).unregisteredIPT()).to.be.revertedWith("owner only");
    })
  })



  describe("Fallback functions", function () {

    it("Should activate the fallback ", async function () {
      // Check the fallback option
      const valueToSend = ethers.parseEther("1.0"); // Send 1 ETH
      await expect(addr1.sendTransaction({ to: iptrade.target, value: valueToSend })).
        to.be.revertedWith("Fallback function disabled. Transfer on allowance only.");


      const zero = ethers.parseEther('0'); // Send 0 ETH
      await expect(addr1.sendTransaction({ to: iptrade.target, value: zero }))
        .to.be.revertedWith("Fallback function disabled. Transfer on allowance only.");
    })

  })


  describe("IP registration and transfer functions", function () {

    beforeEach(async function () {
      await ipToken.transfer(iptrade.target, 100000000000000000000n);

      // transer IPT to addr1
      await ipToken.transfer(addr1.address, 5000000000000000000000n);
      expect(await ipToken.balanceOf(addr1.address)).to.equal(5000000000000000000000n);

      // addr1 approves contract to spend
      await ipToken.connect(addr1).approve(iptrade.target, 4000000000000000000000n);
      expect(await ipToken.connect(addr1).readApprovalFor(iptrade.target)).to.equal(4000000000000000000000n);

      // transer IPT to addr2
      await ipToken.transfer(addr2.address, 5000000000000000000000n);
      expect(await ipToken.balanceOf(addr2.address)).to.equal(5000000000000000000000n);

      // addr1 approves contract to spend
      await ipToken.connect(addr2).approve(iptrade.target, 4000000000000000000000n);
      expect(await ipToken.connect(addr2).readApprovalFor(iptrade.target)).to.equal(4000000000000000000000n);

    })

    it("Should set IP", async function () {

      // set IP wit approval
      await iptrade.connect(addr1).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');

    })

    it("setIP should revert when exists", async function () {
      // test registration duplicate
      await iptrade.connect(addr1).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d324');
      await expect(iptrade.connect(addr1).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d324'))
        .to.be.revertedWith("is registered");

    })

    it("setIP should set the right owner", async function () {
      // set IP wit approval
      await iptrade.connect(addr1).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');

      const result = await iptrade.getIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323'); 
      const newLocal = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

      // Check the expected values of the struct members
      expect(result.owner).to.equal(newLocal);
      expect(result.creationTimeStamp).to.be.above(1698873404n);
      expect(result.exists).to.equal(true);

    })


    it("setIP should fail with incorrect input format", async function () {
      // this should fail
      await expect(iptrade.getIP('f65a88a4d7e47905325c6b71495fc0b')).to.be.revertedWith('sha512 incorr');
      await expect(iptrade.getIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d325')).to.be.revertedWith("IP does not exist");

    })


    it("Should delete IP", async function () {

      // set IP with approval
      await iptrade.connect(addr1).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');

      // delete IP, fails
      await expect(iptrade.deleteIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith('not owner');

      // delete IP, fails
      await iptrade.connect(addr1).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr2.address);
      await expect(iptrade.connect(addr1).deleteIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith("IP is for sale");

      // delete IP
      await iptrade.setLockTime(0);
      await iptrade.connect(addr1).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await iptrade.connect(addr1).deleteIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await expect(iptrade.getIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith("IP does not exist");

    })


    it("sellerCreatesSalesIntent should revert if the user is not the owner of the IP", async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      const result = await iptrade.getIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      expect(result.owner).to.equal('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');

      // try to create sales intent as addr1
      await expect(iptrade.connect(addr1).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr2.address))
        .to.be.revertedWith("not owner");
    })

    it("sellerCreatesSalesIntent should revert if the onsale instance already exists", async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr1.address);
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr1.address))
        .to.be.revertedWith("already for sale");
    })

    it('sellerCreatesSalesIntent should revert if not suffience IPT', async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      
      // remove allowance
      await ipToken.connect(addr2).approve(iptrade.target, 0);

      
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr1.address))
        .to.be.revertedWith("No allowance");
    })


    it('sellerCreatesSalesIntent should revert if selling to self', async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      // try to create sales intent as addr1
      await expect(iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr2.address))
        .to.be.revertedWith("don't sell to self");
    })


    it('sellerCreatesSalesIntent should successfully create intent wit IPT allowance', async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');


      await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 2000000000000000000000n, addr1.address);
      const struct = await iptrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      expect(struct.buyer_address).to.equal(addr1.address);
      expect(struct.salesPrice).to.equal(2000000000000000000000n);
      expect(struct.creationTimeStamp).to.be.above(1698873404n);
      expect(struct.exists).to.equal(true);
  
    })


    it("sellerCancelsSalesIntent should revert if not owner", async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000n, addr1.address);
      await expect(iptrade.connect(addr1).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).
        to.be.revertedWith("not owner");
    })

    it("sellerCancelsSalesIntent should revert if too early", async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000n, addr1.address);

      await expect(iptrade.connect(addr2).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).
        to.be.revertedWith("locked");
      await iptrade.setLockTime(0);
      const struct_before = await iptrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      expect(struct_before.exists).to.equal(true);
      await (iptrade.connect(addr2).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323'));
      await expect(iptrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith("Not for sale");
    })

    it("Should revert if not for sale", async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000n, addr1.address);

      await iptrade.setLockTime(0);
      await (iptrade.connect(addr2).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323'));
      await expect(iptrade.connect(addr2).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).
        to.be.revertedWith("Your ip is not for sale");
    })

    it("Should revert if the user is not the new owner", async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000000n, addr1.address);
      
      await expect(iptrade.connect(owner).buyerBuysIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000n))
        .to.be.revertedWith("not buyer, check sha512");
    })

    it("Should revert if the amount is not correct", async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000000n, addr1.address);

      await expect(iptrade.connect(addr1).buyerBuysIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 20000000000000000n))
        .to.be.revertedWith("incorrect price");
    })


    it("Should let addr1 buy the IP successfully with IPT credit", async function () {
      await iptrade.connect(addr2).setIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await iptrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000000n, addr1.address);

      await iptrade.connect(addr1).buyerBuysIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', 200000000000000000000n);
      const newowner = await iptrade.getIP('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');


      // 5000000000000000000000n

      // expect right address
      expect(newowner.owner).to.equal(addr1.address);

      // expect right IPT balance addr1
      expect(await ipToken.balanceOf(addr1.address)).to.equal(4800000000000000000000n); 

      // expect right IPT balance addr2
      expect(await ipToken.balanceOf(addr2.address)).to.equal(5000000000000000000000n); 

      //check the sales intent
      await expect(iptrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith("Not for sale");
    })
  })


  describe("Attack", function () {
    it ("Should not reenter UnregisteredIPT", async function(){
      await expect (attackerContract.attackUnregisteredIPT()).to.be.revertedWith("Reentrancy attack failed IPT");
    })

    it ("Should not reenter RequestTokens", async function(){
      await expect (attackerContract.attackRequestTokens()).to.be.revertedWith("Reentrancy attack failed for IPT request");
    })
  })



  });