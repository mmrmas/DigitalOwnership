// SPDX-License-Identifier: MIT
// contracts/1_IPToken.sol


pragma solidity ^0.8.20;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract IPToken is ERC20Capped, ERC20Burnable{
    address payable public owner;
    uint256 public blockReward;

    // create token and set initial supply
    constructor(uint256 cap, uint256 reward) ERC20("IPToken", "IPT") ERC20Capped(cap * (10 ** 18))  {
        owner = payable(msg.sender);
        mint(msg.sender, 70000000 * (10 ** 18));
        blockReward = reward;
    }

    // limit minting to capped amount
    /** FROM:
     * @dev See {ERC20-_mint}.
     */
    function mint(address account, uint256 amount) internal  {
        require(ERC20.totalSupply() + amount <= cap(), "ERC20Capped: cap exceeded");
        _mint(account, amount);
    }

    // mint new coins as block rewards
    function _mintMinerReward() internal{
      _mint(block.coinbase, blockReward); //_ means from inherited contract
    }

    // modify the payment function 
    function _update(address from, address to, uint256 value) internal virtual override (ERC20Capped, ERC20) {
      if( from != address(0) && to != block.coinbase && block.coinbase != address(0)){
        _mintMinerReward();
      }
      super._update(from, to, value);
    }

    // set the block reward
    function setBlockReward(uint256 reward) public onlyOwner {
      blockReward = reward;
    }


    // get the block reward
    function getBlockReward() external view returns (uint256) {
      return (blockReward);
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
      _; 
    }


    /*
    fallback
    */
    // refuse ether
    receive() external payable {
        // Revert the transaction if someone sends ether
        revert("Sending ether to this contract is not allowed");
    }
}

