// SPDX-License-Identifier: MIT
// contracts/DigitalOwnership_arb.sol

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DigitalOwnership is ReentrancyGuard, Ownable {
    /////////////////////
    // token variables  /
    /////////////////////

    /////////////////////
    // public variables /
    /////////////////////

    // lockTime: the time that locks and delays, such as IP offerings
    uint256 public lockTime = 604800 seconds;

    /////////////////////
    //   events         /
    /////////////////////

    // DORegistered: emits owner and the SHA512 document fingerprint
    event DORegistered(address owner, string sha512);

    // SalesIntentCreated: emits wallet address and SHA512 document fingerprint when an do is offered
    event SalesIntentCreated(address seller, string sha512);

    // SalesIntentCancelled: emits wallet address and SHA512 document fingerprint when an DO is cancelled
    event SalesIntentCancelled(address seller, string sha512);

    // DODeleted: emits the original owner of DO and the SHA512 document fingerprint that is deleted from the chain
    event DODeleted(address dOwner, string sha512);

    // DOTransferred: emits old and new DO owner; and SHA512 document fingerprint
    event DOTransferred(address from, address to, string sha512);

    /////////////////////
    //   structs        /
    /////////////////////

    // dOwner: This struct contains data about DO owners, i.e. wallet address, moment of creation,
    // and a boolean value to show if it exists
    struct dOwner {
        address owner;
        uint96 creationTimeStamp;
        bool exists;
    }

    // Onsale: This struct contains data about DO on offer / for sale, i.e. the owner, buyer addresses,
    // salesprice, the moment of creationa an a boolean value to show if it exists
    struct Onsale {
        address buyer_address;
        uint64 creationTimeStamp;
        bool exists;
    }

    /////////////////////
    //   mappings       /
    /////////////////////

    // sha512s: the main dataframe of this contract, holds hashes as keys and DO ownership info as values
    mapping(bytes32 => dOwner) private sha512s;

    // lastAccessTime: a mapping to keep track on the last access time to prevent wallets to drain the faucet
    mapping(address => uint256) private lastAccessTime;

    // onsale: a data frame with hash as keys and onsale info as value, used for
    // keeping track on which DO is being registered for DO tranfer
    mapping(bytes32 => Onsale) private onsale;

    /////////////////////
    //   constructor   /
    /////////////////////

    // one-time function to establish the contract
    constructor() Ownable(msg.sender) {}

    /////////////////////
    //  data  test      /
    //  functions       /
    /////////////////////

    // checkSha512:  takes a string and reports if it has the correct length of 128 chars
    function checkSha512(string memory str) private pure returns (bool) {
        bytes memory stringInBytes = bytes(str);
        uint256 strLength = stringInBytes.length;
        require(strLength == 128, "sha512 incorr");

        bool valid = true;

        assembly {
            let len := mload(stringInBytes)
            let data := add(stringInBytes, 0x20)
            for {
                let i := 0
            } lt(i, len) {
                i := add(i, 1)
            } {
                let char := byte(0, mload(add(data, i)))
                switch char
                case 0x30 {
                    continue
                } // '0'
                case 0x31 {
                    continue
                } // '1'
                case 0x32 {
                    continue
                } // '2'
                case 0x33 {
                    continue
                } // '3'
                case 0x34 {
                    continue
                } // '4'
                case 0x35 {
                    continue
                } // '5'
                case 0x36 {
                    continue
                } // '6'
                case 0x37 {
                    continue
                } // '7'
                case 0x38 {
                    continue
                } // '8'
                case 0x39 {
                    continue
                } // '9'
                case 0x61 {
                    continue
                } // 'a'
                case 0x62 {
                    continue
                } // 'b'
                case 0x63 {
                    continue
                } // 'c'
                case 0x64 {
                    continue
                } // 'd'
                case 0x65 {
                    continue
                } // 'e'
                case 0x66 {
                    continue
                } // 'f'
                case 0x41 {
                    continue
                } // 'A'
                case 0x42 {
                    continue
                } // 'B'
                case 0x43 {
                    continue
                } // 'C'
                case 0x44 {
                    continue
                } // 'D'
                case 0x45 {
                    continue
                } // 'E'
                case 0x46 {
                    continue
                } // 'F'
                default {
                    valid := 0
                    break
                }
            }
        }

        require(valid, "illegal hash");

        return valid;
    }

    // stringToBytes32: Takes any string and returns it in 32 bytes hash
    function stringToBytes32(string memory str) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(str));
    }

    /////////////////////
    //  setter          /
    //  functions       /
    //  (non-DO)        /
    /////////////////////


    function setNewOwner(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
    }

    // setLockTime: set the locktime in seconds, for the faucet waiting time, or offer expiration period
    function setLockTime(uint256 _amount) external onlyOwner {
        lockTime = _amount * 1 seconds;
    }


    /////////////////////
    //  DO registration /
    //  and transfer    /
    //  functions       /
    /////////////////////

    // setDO:  The function to set the DO inside the contract
    // The DO holder should provide
    // - the SHA512
    // and approve the contract to transfer the fee on its behalf
    function setDO(string calldata str) external nonReentrant {
        require(checkSha512(str));
        bytes32 sha512 = stringToBytes32(str);
        require(!sha512s[sha512].exists, "is registered");

        // store the sha512 (key) to the address (value)
        sha512s[sha512].owner = msg.sender;
        sha512s[sha512].creationTimeStamp = uint96(block.timestamp);
        sha512s[sha512].exists = true;

        // Emit DORegistered event
        emit DORegistered(msg.sender, str);
    }

    // deleteDO: function to remobe an DO from the contract
    // Can be executed by the owner if the DO is not for sale
    function deleteDO(string calldata str) external {
        require(checkSha512(str));
        bytes32 sha512 = stringToBytes32(str);

        // should be owner of the DO
        require(sha512s[sha512].owner == msg.sender, "not owner");

        // DO cannot be for sale
        require(!onsale[sha512].exists, "DO is for sale");

        // delete the DO
        delete sha512s[sha512];

        // emit
        emit DODeleted(msg.sender, str);
    }

    // sellerCreatesSalesIntent: the seller creates an onsale object to transfer the DO
    // The DO holder should provide
    // - the sha512 hash,
    // - the salesprice
    // - the address of the buyer
    // and approve the contract to transfer the fee on its behalf

    function sellerCreatesSalesIntent(
        string calldata str,
        address buyerAddress
    ) external nonReentrant {
        // you cannot sell to yourself
        require(buyerAddress != msg.sender, "don't sell to self");

        // needs to be the sha512 owner
        require(checkSha512(str));

        // check if exists and is owner
        bytes32 sha512 = stringToBytes32(str);
        require(!onsale[sha512].exists, "already for sale");
        require(sha512s[sha512].owner == msg.sender, "not owner");

        // set the onsale instance
        onsale[sha512] = Onsale(buyerAddress, uint64(block.timestamp), true);

        // Emit
        emit SalesIntentCreated(msg.sender, str);
    }

    // sellerCancelsSalesIntent: a function to revoke the sales offer
    // It can only be successfully run when the time elapsed since creating the offer
    // has surpassed the lockTime
    function sellerCancelsSalesIntent(string calldata str) external {
        require(checkSha512(str));

        // needs to be the sha512 owner
        bytes32 sha512 = stringToBytes32(str);
        require(sha512s[sha512].owner == msg.sender, "not owner");
        require(
            block.timestamp > onsale[sha512].creationTimeStamp + lockTime,
            "locked"
        );
        require(onsale[sha512].exists, "Your DO is not for sale");

        // delete the sales intent
        delete onsale[sha512];

        // Emit
        emit SalesIntentCancelled(msg.sender, str);
    }

    // buyerBuysDO: the function to tranfer the DO to the buyer
    // The buyer runs this function with the following input:
    // - the sha512 hash

    function buyerBuysDO(string calldata str) external nonReentrant {
        require(checkSha512(str));
        bytes32 sha512 = stringToBytes32(str);
        require(
            onsale[sha512].buyer_address == msg.sender,
            "not buyer, check sha512"
        );

        // set temporary variable
        address prevOwner = sha512s[sha512].owner;

        // transfer  virtually
        sha512s[sha512].owner = msg.sender;

        // set Onsale record to false
        delete onsale[sha512];

        // Emit events
        emit DOTransferred(prevOwner, msg.sender, str);
    }

    /////////////////////
    //   getter         /
    //  functions       /
    /////////////////////

    // getDO: Check who is the owner of an DO, need to provide the SHA-512
    function getDO(string calldata str) external view returns (dOwner memory) {
        require(checkSha512(str));
        bytes32 sha512 = stringToBytes32(str);
        require(sha512s[sha512].exists, "DO does not exist");
        return
            dOwner(
                sha512s[sha512].owner,
                sha512s[sha512].creationTimeStamp,
                sha512s[sha512].exists
            );
    }

    // getSalesIntent: Function check if an SHA-512 is on sale, need to provide an SHA-512
    function getSalesIntent(
        string calldata str
    ) external view returns (Onsale memory) {
        bytes32 sha512 = stringToBytes32(str);
        require(onsale[sha512].exists, "Not for sale");
        return
            Onsale(
                onsale[sha512].buyer_address,
                onsale[sha512].creationTimeStamp,
                onsale[sha512].exists
            );
    }
}
