// SPDX-License-Identifier: MIT
// contracts/1_IPToken.sol

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract IPToken is ERC20Capped, ERC20Burnable {
    address payable public owner;
    uint256 public blockReward;
    uint256 public totalMined;

    /*
    construct the contract
    */
    // create token and set initial supply
    constructor(
        uint256 cap,
        uint256 mintAtLaunch,
        uint256 reward
    ) ERC20("IPToken", "IPT") ERC20Capped(cap * (10 ** 18)) {
        owner = payable(msg.sender);
        myMint(msg.sender, mintAtLaunch * (10 ** 18));
        blockReward = reward * (10 ** 18);
        totalMined = mintAtLaunch * (10 ** 18);
    }

    /* 
    minting functions
    */
    //__myMint tested
    // limit minting to capped amount
    // FROM: @dev See {ERC20-_mint}.
    function myMint(address account, uint256 amount) internal {
        require(
            ERC20.totalSupply() + amount <= cap(),
            "ERC20Capped: cap exceeded"
        );
        super._mint(account, amount);
    }

    //__ _mintMinerReward tested
    // mint new coins as block rewards
    function _mintMinerReward() internal {
        if (blockReward > 0) {
            updateBlockReward();
            myMint(block.coinbase, blockReward);
            totalMined += blockReward;
        }
    }

    function updateBlockReward() internal {
        if (totalMined >= 100000000 * (10 ** 18)) {
            blockReward = 0; // No more rewards
        } else if (totalMined >= 98750000 * (10 ** 18)) {
            blockReward =   6250000000000000000; // 6.25 IPT
        } else if (totalMined >= 97500000 * (10 ** 18)) {
            blockReward =  12500000000000000000; // 12.5 IPT
        } else if (totalMined >= 95000000 * (10 ** 18)) {
            blockReward =  25000000000000000000; // 25 IPT
        } else if (totalMined >= 90000000 * (10 ** 18)) {
            blockReward =  50000000000000000000; // 50 IPT
        } else if (totalMined >= 80000000 * (10 ** 18)) {
            blockReward = 100000000000000000000; // 100 IPT
        }
    }

    /*
    transfer function
    */
    // _update
    // set mintreward on minter address
    // make it inherited
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20Capped, ERC20) {
        if (
            from != block.coinbase &&
            from != address(0) &&
            to != block.coinbase &&
            block.coinbase != address(0)
        ) {
            _mintMinerReward();
        }
        super._update(from, to, value);
    }


   /*
   approval helper functions
   */
    //__revoke approval tested
    function revokeApproval(address approvedAddress) external returns (bool) {
        approve(approvedAddress, 0);
        return true;
    }

    // readApprovalFor 
    // read the approval amount for an address
    function readApprovalFor(
        address contractAddress
    ) external view returns (uint256) {
        uint256 thisAllowance = allowance(msg.sender, contractAddress);
        return thisAllowance;
    }

    /*
    fallback
    */
    // refuse ether to arrive
    receive() external payable {
        // Revert the transaction if someone sends ether
        revert("Sending ether to this contract is not allowed");
    }
}
