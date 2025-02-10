const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = require("hardhat");

describe("DO contract", function () {
  // global vars
  let DOtrade;
  let dotrade;
  let owner;
  let addr1;
  let addr2;


  beforeEach(async function () {
    // Get the contractfactory and signers here

    DOtrade = await ethers.getContractFactory("DigitalOwnership");
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    dotrade = await DOtrade.deploy();

  });

  it("Should print owner's address", async function () {
    console.log(owner.address);
    console.log(dotrade.target);
  });

  //EVENTS, STRUCTS, MAPPINGS?

  describe("setter functions (non-IP)", function () {

    it("Should set the right owner", async function () {
      expect(await dotrade.owner()).to.equal(owner.address);

      await dotrade.setNewOwner(addr2);
      expect(await dotrade.owner()).to.equal(addr2.address);

    });

    it("..not as non owner", async function () {
      await expect(dotrade.connect(addr1).setNewOwner(addr2)).to.be.revertedWithCustomError(
        dotrade,
        "OwnableUnauthorizedAccount");
    });

    it("Should set the locktime to 5 minutes", async function () {
      await dotrade.connect(owner).setLockTime(5);
      expect(await dotrade.lockTime()).to.equal(5);
    })
    it("...Should fail to set if not the owner", async function () {
      await expect(
        dotrade.connect(addr1).setLockTime(1)
      ).to.be.revertedWithCustomError(
        dotrade,
        "OwnableUnauthorizedAccount");
    })

  });



  describe("Fallback functions", function () {

    it("Should activate the fallback ", async function () {
      // Check the fallback option
      const valueToSend = ethers.parseEther("1.0"); // Send 1 ETH
      await expect(addr1.sendTransaction({ to: dotrade.target, value: valueToSend })).
        to.be.revertedWithoutReason();


      const zero = ethers.parseEther('0'); // Send 0 ETH
      await expect(addr1.sendTransaction({ to: dotrade.target, value: zero }))
        .to.be.revertedWithoutReason();
    })
  })



  describe("IP registration and transfer functions", function () {



    it("Should set IP", async function () {

      // set IP wit approval
      await dotrade.connect(addr1).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');

    });

    it("Should not set IP for illegal hash", async function () {

      // set IP wit approval
      await expect(dotrade.connect(addr1).setDO('71fb8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d32g'))
        .to.be.revertedWith("illegal hash");

    })



    it("setDO should revert when exists", async function () {
      // test registration duplicate
      await dotrade.connect(addr1).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d324');
      await expect(dotrade.connect(addr1).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d324'))
        .to.be.revertedWith("is registered");

    })

    it("setDO should set the right owner", async function () {
      // set IP wit approval
      await dotrade.connect(addr1).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');

      const result = await dotrade.getDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      const newLocal = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

      // Check the expected values of the struct members
      expect(result.owner).to.equal(newLocal);
      expect(result.creationTimeStamp).to.be.above(1698873404n);
      expect(result.exists).to.equal(true);

    })


    it("setDO should fail with incorrect input format", async function () {
      // this should fail
      await expect(dotrade.getDO('f65a88a4d7e47905325c6b71495fc0b')).to.be.revertedWith('sha512 incorr');
      await expect(dotrade.getDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d325')).to.be.revertedWith("DO does not exist");

    })


    it("Should delete IP", async function () {

      // set IP with approval
      await dotrade.connect(addr1).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');

      // delete IP, fails
      await expect(dotrade.deleteDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith('not owner');

      // delete IP, fails
      await dotrade.connect(addr1).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', addr2.address);
      await expect(dotrade.connect(addr1).deleteDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith("DO is for sale");

      // delete IP
      await dotrade.setLockTime(0);
      await dotrade.connect(addr1).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await dotrade.connect(addr1).deleteDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await expect(dotrade.getDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith("DO does not exist");

    })


    it("sellerCreatesSalesIntent should revert if the user is not the owner of the IP", async function () {
      await dotrade.connect(addr2).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      const result = await dotrade.getDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      expect(result.owner).to.equal('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');

      // try to create sales intent as addr1
      await expect(dotrade.connect(addr1).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', addr2.address))
        .to.be.revertedWith("not owner");
    })

    it("sellerCreatesSalesIntent should revert if the onsale instance already exists", async function () {
      await dotrade.connect(addr2).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await dotrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', addr1.address);
      await expect(dotrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', addr1.address))
        .to.be.revertedWith("already for sale");
    })

    it('sellerCreatesSalesIntent should revert if not suffience IPT', async function () {
      await dotrade.connect(addr2).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
    })

    it('sellerCreatesSalesIntent should revert if selling to self', async function () {
      await dotrade.connect(addr2).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      // try to create sales intent as addr1
      await expect(dotrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', addr2.address))
        .to.be.revertedWith("don't sell to self");
    })


    it('sellerCreatesSalesIntent should successfully create intent wit IPT allowance', async function () {
      await dotrade.connect(addr2).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');


      await dotrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', addr1.address);
      const struct = await dotrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      expect(struct.buyer_address).to.equal(addr1.address);
      expect(struct.creationTimeStamp).to.be.above(1698873404n);
      expect(struct.exists).to.equal(true);

    })


    it("sellerCancelsSalesIntent should revert if not owner", async function () {
      await dotrade.connect(addr2).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await dotrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', addr1.address);
      await expect(dotrade.connect(addr1).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).
        to.be.revertedWith("not owner");
    })

    it("sellerCancelsSalesIntent should revert if too early", async function () {
      await dotrade.connect(addr2).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await dotrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', addr1.address);

      await expect(dotrade.connect(addr2).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).
        to.be.revertedWith("locked");
      await dotrade.setLockTime(0);
      const struct_before = await dotrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      expect(struct_before.exists).to.equal(true);
      await (dotrade.connect(addr2).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323'));
      await expect(dotrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith("Not for sale");
    })

    it("Should revert if not for sale", async function () {
      await dotrade.connect(addr2).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await dotrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', addr1.address);

      await dotrade.setLockTime(0);
      await (dotrade.connect(addr2).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323'));
      await expect(dotrade.connect(addr2).sellerCancelsSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).
        to.be.revertedWith("Your DO is not for sale");
    })

    it("Should revert if the user is not the new owner", async function () {
      await dotrade.connect(addr2).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await dotrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', addr1.address);

      await expect(dotrade.connect(owner).buyerBuysDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323'))
        .to.be.revertedWith("not buyer, check sha512");
    })

    it("Should revert if the amount is not correct", async function () {
      await dotrade.connect(addr2).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await dotrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', addr1.address);

    })


    it("Should let addr1 buy the IP successfully with IPT credit", async function () {
      await dotrade.connect(addr2).setDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      await dotrade.connect(addr2).sellerCreatesSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323', addr1.address);

      await dotrade.connect(addr1).buyerBuysDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');
      const newowner = await dotrade.getDO('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323');


      // 5000000000000000000000n

      // expect right address
      expect(newowner.owner).to.equal(addr1.address);

      //check the sales intent
      await expect(dotrade.getSalesIntent('71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323')).to.be.revertedWith("Not for sale");
    })
  })
});


