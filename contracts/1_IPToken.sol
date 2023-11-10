// SPDX-License-Identifier: MIT
// contracts/1_IPToken.sol


import "hardhat/console.sol";

/*
Need to include:    included  tested
- initial supply            OK         OK
- max supply                OK         OK
- make burnable             OK         OK
- miners reward             OK         OK
- set transfer fee           X          X
- initialize block reward    X          X 
- set transfer to decimals?  OK        No
*/


pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract IPToken is ERC20Capped, ERC20Burnable{
    address payable public owner;
    uint256 public blockReward;

    // create token and set initial supply
    constructor(uint256 cap, uint256 reward) ERC20("IPToken", "IPT") ERC20Capped(cap * (10 ** 18)){
        owner = payable(msg.sender);
        _mint(msg.sender, 70000000 * (10 ** 18));
        blockReward = reward *  (10 ** 18);
    }

    // limit minting to capped amount
    /** FROM:
     * @dev See {ERC20-_mint}.
     */
    function _mint(address account, uint256 amount) internal virtual override(ERC20Capped, ERC20) {
        require(ERC20.totalSupply() + amount <= cap(), "ERC20Capped: cap exceeded");
        super._mint(account, amount);
    }

    // mint new coins as block rewards
    function _mintMinerReward() internal{
      _mint(block.coinbase, blockReward); //_ means from inherited contract
    }

    // set mintreward on address is real and that the block.coinbase (who gets the reward) does not get a reward for that reward
    // make it inherited 
    function _beforeTokenTransfer(address from, address to, uint256 value) internal virtual override{
      if( from != address(0) && to != block.coinbase && block.coinbase != address(0)){
        _mintMinerReward();
      }
      super._beforeTokenTransfer(from, to, value);
    }

    // set the block reward
    function setBlockReward(uint256 reward) public onlyOwner {
      blockReward = reward * (10 ** 18);
    }

      /*
    approval call functions
    */
    //__approveAmount tested
    function approveAmount(address approvedAddress, uint256 amount) public returns (bool) {
        // create token instance from msg.sender
        approve(approvedAddress, amount); 
        return true;
     }

    //__revoke approval tested
    function revokeApproval(address approvedAddress) public returns (bool) {
        approve(approvedAddress, 0);  
        return true;
    }
    
    // read the approval amount for an address
    function readApprovalFor(address contractAddress) public view returns (uint256) {
        uint256 thisAllowance = allowance(msg.sender, contractAddress);  
        return thisAllowance;
    }

   /*
   onlyOwner function
   */

    // function to supplant the only owner requirement 
    modifier onlyOwner{
      require(msg.sender == owner, "Only the owner can call this function");
      _; // placeholder for rest of the function
    }
}

