# IPtrade: a platform for secure tracking and trading of digitized content, driven by IPT, the ownership token

**IPT** (address) is the ownership token. It is used to register and trade digital and digitized content via the smart contract **IPtrade** (address). IPtrade logs content in the form of a simple cryptographic fingerprint to a wallet address on the blockchain. This document introduces IPT together with IPtrade. Developments will be published on [github](github.com/mmrmas/IPT)

## TL;DR
- IPtrade registers SHA-512 hashes under ERC20 compatible wallet addresses. 
	- SHA-512 hashes are unique document identifiers. See this [wiki page](https://en.wikipedia.org/wiki/SHA-2) for more details (accessed on April 12, 2024)  
- IPtrade is a marketplace. Content creators can register content and offer their creations to a client. 
- The token that runs IPtrade is IPT (address), the ownership token 

## Introduction
Digital content is often shared in a way that ownership is implicitly transferred form the creator to a client. The following scenario's exemplify this:

- An architect designs a house and shares a cloud link of the design to their client.
- A freelance composer submits a music file to a studio. 
- A patient receives health information by email. 
- A bank promotes a financial product to a client by email.

In such cases, ownership is transferred in a trust-based manner, where two very important elements are often overlooked:

1. how to be sure that the received document identical to the document that was sent?
2. how to be sure that the person who sent the document identifies as the original owner of the document?

When these two questions cannot be answered affirmatively, there is a chance that the received document is flawed, and/or the sender impersonates someone else. 

IPtrade is designed to safeguard these important security aspects of data transfer and ownership. It allows any content provider to log the SHA-512 hash of their document on-chain. When this hash has been logged, everyone can verify the registration and the address. Whoever receives a document can check if this content has indeed been logged under the address of the original owner / creator. 


## Use-cases
Validation of a received document is the simplest use-case of IPtrade. This can be helpful in the context of communicating important information, where the sender sees a need that the receiver can verify the origin of the document. Examples are: medical information, financial documents, signed contracts, graduation documents, digital IDs.

Validation can be achieved as follows:

-  Owners of IPT can register the SHA-512 hash of a document  under a wallet address that belongs to them. 
	-  When a SHA-512 hash is registered in the blockchain under the user's wallet address, it means that the owner has access to a document that can produce this hash.
	- It is recommended to embed the registration address inside the document, as an additional layer of proof that the first registration of the document took place on the logged address.
- The workflow is as follows:
	1. create a document having the regiustration address inside the document
	2. create a SHA-512 hash
	3. log this hash value under the owner address
	4. send the document to the client
	5. the client creates a SHA-512 hash
	6. the client verifies that the SHA-512 hash was registered and thereby validates the owner. 

A second use-case is the creation of content, followed by a transfer. This way, a creator secures the arrival of their original content, and subsequently transfers the ownership to the receiver. This can be applied when creating original artistic works, where an artist can establish traceability and the client can certify the origin of the work; tracing and trading of digitized products such as art and jewelry; IP management of innovations and discoveries, such as software code and genomic sequences.

The ownership transfer can be achieved, after logging the SHA-512, as follows:

- Transfer is initiated by the original owner / creator, who makes an offer to a buyer's wallet address. The buyer can then complete the transaction by transferring an agreed amount of IPT, via IPtrade, to the wallet of the original owner, and has 7 days to do so.


> **How to create an SHA-512 hash from a document.**
> 
> An SHA-512 hash can be easily obtained on your own device.
> 
> - On MacOS, the command-line command is "shasum -a 512 FILENAME",
> - On Unix systems you can use "shasum -a 512 FILENAME" 
> - On Windows, in the command prompt, the command is "certUtil -hashfile FILENAME SHA512"
> - Of course there are software tools available to obtain the SHA-512 hash with a graphical user interface
> - Some websites may offer this service. Be cautious to share sensitive data online
> 
> ***The result is a 32-character string that looks as follows: 71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323***
 

## Best practices when the SHA-512 hash cannot be validated, or the registration address is incorrect
- The SHA-512 hash is a digital fingerprint of a document. Any change in the document will change the hash value. If the hash cannot be validated on IPtrade, then the received document is different from the logged one. Ask if the original owner sends you the original document. They should be able to provide it, otherwise someone else is claiming to be the sender; and that is exactly what the original sender wanted to protect you against.
- IPtrade can only register one SHA-512 hash per address. If the hash of a received document matches an address that does not belong to the original owner, then the original owner should be able to show that they own that address as well. 

## Challenges of the hash registration approach
- To help the receivers of documents to validate documents, owners have to be transparent regarding the address they use to register SHA-512 hashes.
- Those who take over ownership via IPtrade should always validate that the first registered address belongs to the original content creator; and/or use due diligence to exclude that a modified version of certain content has been logged by an impostor.



## Project key characteristics

### IPT
1. IPT is a standard, burnable ERC20 token.
2. The capped value is set to 100M and the IPT contract has no owner.
	- 80M are minted directly.
	- 20M can be introduced by rewarding miners.
		- initially, miners receive 100 IPT for each block transaction. 
		- when 10M IPT have been mined, the reward will be reduced to 50 IPT
		- when 15M IPT have been mined, the reward will be reduced to 25 IPT
		- when 17.5M IPT have been mined, the reward will be reduced to 12.5 IPT
		- when 18.75M IPT have been mined, the reward will be reduced to 6.25 IPT
		- when 20M IPT have been mined, the reward will be reduced 0 IPT
3. The strategy for IPT to grow in trading volume is to launch more contracts that accept IPT as a token.
4. Growth scenario's are as follows: 
	- Support IPtrade's normalization and develop expert support. 
	- Stimulate communities to intensify ownership registration and management.
	- Drive IPT to new directions related to intellectual property and proof of knowledge.


### IPtrade
1. IPTrade is owned by (address).
2. The initial IP registration price is 100 IPT. 
3. The initial IP transfer price is 100 IPT.
4. The initial IPT to be distributed through the faucet on IPtrade will be 10M
	- Each address can obtain initially 500 IPT each 7 days, up to a maximum of 10M IPT
	- Also 500 IPT is sent to the sender's wallet after a successfull MD5sum registration
	- Also, 500 IPT is sent to the buyer's wallet after successfully buying an existing IP
5. Registration prices, transfer prices and free IPT distribution may change in the future, depending on the number of transactions made on IPtrade. There is no implemented logic for this.


### IPT and IPtrade ownership

- The original wallet (address) will remain the owner and manager of IPT and IPtrade.
- Further implementation of logic can be introduced via additional contracts in the future, through an address that identifies as ONLY_OWNERHelper in the IPtrade contract. 
- The owner has the following benefits/capacities:
	- The owner will earn IPT at every IP registration
	- set a new owner
	- set or read the address of ONLY_OWNERHelper
	- set the locktime for the faucet and the sales offer expiry period
	- set the amount of IPT dispensed by the faucet
	- set prices for IP registration and transfer
	- see how much IPT are spent by users
	- withdraw the earned IPT
	- withdraw all IPT from the contract that is not credit of any of the users 
- The owner cannot do the following:
	- Transfer IPT credit from users (IPT that is deposited in the contract, but not spent)
	- delete registered ownerships and sales 

	
## How to connect

1. web3 (under construction)
2. Remix
	- download the contract files from Github and put them in your contracts folder in remix
	- compile the contracts under the following addresses:
		- IPT: (address)
		- IPtrade: (address) 
2. Hardhat
	- download the contract files from Github and put them in your contracts folder in visual studio code
	- make sure that you have installed Hardhat
	- then:

```
	npx hardhat console --network NETWORK`

	const IPT = await ethers.getContractFactory('IPToken');
	const ipToken = await IPT.attach(IPT ADRESS);
	        

	const IPTRADE = await ethers.getContractFactory('IPtrade');
	const iptrade = await IPTRADE.attach(IPTRADE ADDRESS); 

```


## IP registration and transfer scenarios
### Successfully register and sell with IPT allowance

The easiest way to register and trade IP is through [the web3 portal](address).
Here, all transactions can be done based on setting the approvement for IPtrade to make transactions.
For those on the command line (Hardhat), the code chunks below provide guidance on how to interact with the contract.
These are examples. Prices may change over time.
 
#### approve the contract to spend IPT

```
ipToken.connect(YOUR-ADDRESS).approveAmount(IPtrade.target, NUMBER-OF-IPT);

# number of tokens should be with 18 trailing 0's
# e.g. 100 equals 100000000000000000000n

``` 


#### you can also add credit on IPtrade

```
iptrade.connect(YOUR-ADDRESS).depositIPT(NUMBER-OF-IPT, YOUR-ADDRESS)
```

#### register your IP

```
IPtrade.connect(YOUR-ADDRESS).setIP(SHA-512, true);

# true because paying for registration "on approval" (100 IPT)
```
      
#### create offer to sell it    
```
IPtrade.connect(YOUR-ADDRESS).sellerCreatesSalesIntent(SHA-512, SALES-PRICE-IPT, BUYER-ADDRESS, true);

# true because paying for selling "on approval" (in IPT)
```

#### buyer buys on approval, or directly with IPT credit
```
# approval:
IPtrade.connect(BUYER-ADDRESS).buyerBuysIP( SALES-PRICE-IPT, SHA-512, true);

# true because paying the negotiated price to the original IP owner "on approval" 

# credit
IPtrade.connect(YOUR-ADDRESS).sellerCreatesSalesIntent(SHA-512, SALES-PRICE-IPT, BUYER-ADDRESS, false);

# false because paying the negotiated price to the original IP owner from your credit on IPtrade

```

#### withdraw your funds from the IPtrade contract

```
# withdraw your IPT
IPtrade.connect(YOUR-ADDRESS). getIptBalance() # to get the amount of your IPT in the contract
IPtrade.connect(YOUR-ADDRESS).userIptWithdrawal(AMOUNT)

```

### Useful variables/functions to check prices and ownership
- registerIPCostIpt()     
- transferIPCostIpt()      
- registerIPCostEth()   
- transferIPCostEth()   
- getIP()
- getIpTransactions()


## Support
Updates and queries can be posted on the [github account] (www.github.com/mmrmas/IPT)


## Data structures

### IPT

#### State Variables
- `uint256 public blockReward`: The block reward for miners.
- `uint256 public totalMined`: The total amount of tokens mined so far.


#### Functions
- `constructor`: Initializes the contract, setting initial values for cap, mint at launch, and reward.
- ` myMint(address account, uint256 amount)`: Private function to limit minting to the capped amount.
- ` _mintMinerReward()`: Private function to mint new coins as block rewards.
-  updateBlockReward() : Private function to update the block reward based on the total tokens mined.
- `_update( address from,  address to,   uint256 value )`: Internal function to update state variables during a transfer (overriding ERC20* transfer functions).
- `revokeApproval(address approvedAddress)`: External function to revoke approval for a certain address.
- `readApprovalFor( address contractAddress )`: External view function to read the approval amount for a specific address.
- Fallback Function: External function to refuses Ether and reverts the transaction.


### IPtrade




#### Structs
```
struct IPowner {
    address owner;
    uint256 creationTimeStamp;
    bool exists;
}

struct Onsale {
    address owner_address;
    address buyer_address;
    bool isEther;
    uint256 salesPrice;
    uint creationTimeStamp;
    bool exists;
}
```

- IPowner: Represents an IP owner with the owner's address, timestamp of creation, and existence status.
- Onsale: Represents an IP registration that is for sale, containing the owner's address, buyer's address, isEther boolean, sales price, creation timestamp, and existence status. 

#### Mappings
```
mapping(address => uint256) private iptBalances;
mapping(address => uint) private etherCredit;
mapping(bytes32 => IPowner) private md5s;
mapping(bytes32 => address[]) private md5sTransactions;
mapping(address => uint256) private nextAccessTime;
mapping(bytes32 => Onsale) private onsale;
```

- iptBalances: Mapping from an address to the credit balance of IPT tokens.
- etherCredit: Mapping from an address to the Ether credit balance.
- md5s: Mapping from an MD5sum to an IPowner struct.
- md5sTransactions: Mapping from an MD5sum to an array of addresses representing transactions related to that hash.
- nextAccessTime: Mapping from an address to the next allowed access time.
- onsale: Mapping from an MD5sum to an Onsale struct.

#### State Variables
```
address payable public owner;
address private ONLY_OWNERHelper;
IERC20 public token;
uint256 public freeIpTokenwithdrawal;
uint256 public registerIPCostIpt;
uint256 public transferIPCostIpt;
uint256 public registerIPCostEth;
uint256 public transferIPCostEth;
uint256 public lockTime;
bool public freeTokensBool;
uint256 private spentEtherOdometer;
uint256 public ethersInContract;
uint256 private spentIptOdometer;
uint256 public iptInContract;
```

- owner: The address that deployed the contract and has ownership rights.
- ONLY\_OWNERHelper: The address that can perform actions as an additional helper to the owner.
- token: An instance of the ERC20 token contract.
- freeIpTokenwithdrawal: The amount of IPTokens a user can withdraw for free.
- registerIPCostIpt: The cost in IPTokens for registering an IP.
- transferIPCostIpt: The cost in IPTokens for transferring an IP.
- registerIPCostEth: The cost in Ether for registering an IP.
- transferIPCostEth: The cost in Ether for transferring an IP.
- lockTime: The duration (in seconds) for which certain actions are locked after being performed.
- freeTokensBool: A boolean indicating whether the faucet is open for free IPTokens.
- spentEtherOdometer: The total Ether spent from the contract.
- ethersInContract: The total Ether currently in the contract.
- spentIptOdometer: The total IPTokens spent from the contract.
- iptInContract: The total IPTokens currently in the contract.

#### Modifiers
```
modifier ONLY_OWNER() {
    require(msg.sender == owner || msg.sender == ONLY_OWNERHelper, "owner or helper only");
    _;
}
```
- `ONLY_OWNER`: A modifier that restricts access to certain functions to the contract owner or the designated helper.

#### Events
```
event Withdrawal(address indexed to, uint256 indexed amount);
event EtherReceived(address indexed from, uint256 amount);
```

- Withdrawal: Event emitted when funds are withdrawn from the contract.
- EtherReceived: Event emitted when Ether is received by the contract.


#### Fallback and Receive Functions
```
receive() external payable {
    revert("Fallback function disabled. Use deposit() for Ether or depositIPT() for IPT.");
}

fallback() external payable {
    revert("Fallback function disabled. Use deposit() for Ether or depositIPT() for IPT.");
}
```

- The fallback and receive functions are disabled to prevent unintended transfers. Users are required to use specific functions for Ether or IPT transactions.
- Users should not simply transfer funds to the contract outside of the functions. 

#### All functions
- Constructor: Initializes the contract with the ERC20 token address (tokenAddress), owner, and helper.
- setHelper: Sets the designated helper address (_ONLY_OWNERHelper).
- setFreeIpTokenwithdrawal: Sets the amount of free IPTokens for user withdrawal (amount).
- setLockTime: Sets the duration for various actions lock (amount).
- setFreetokensBool: Enables or disables free token distribution (provide).
- setregisterIPCostIpt: Sets the cost of registering an IP with IPTokens (amount).
- setTransferIPCostIpt: Sets the cost of transferring an IP with IPTokens (amount).
- setRegisterIPCostEth: Sets the cost of registering an IP with Ether (amount).
- setTransferIPCostEth: Sets the cost of transferring an IP with Ether (amount).
- getHelper: Retrieves the current helper address.
- getEtherCredit: Retrieves Ether credit balance.
- getIptInContract: Retrieves total IPTokens in the contract.
- getEthersInContract: Retrieves total Ether in the contract.
- getIP: Retrieves IP owner and creation timestamp (str).
- getSalesIntent: Retrieves IP sales intent information (str).
- getIpTransactions: Retrieves addresses involved in IP transactions (str).
- getIptBalance: Retrieves IPToken balance.
- getSpentIptOdometer: Retrieves total spent IPTokens.
- getSpentEthOdometer: Retrieves total spent Ether.
- requestTokens: Allows users to request free IPTokens.
- depositIPT: Leads to the contract receiving IPT and credit it after the IPT owner approved allowance (amount, address of IPT owner).
- contractReceivesCredit: internal version of depositIPT.
- deposit: Allows users to deposit Ether into the contract.
- userEtherWithdrawal: Allows users to withdraw Ether (amount).
- userIptWithdrawal: Allows users to withdraw IPTokens (amount).
- withdrawSpentEth: Allows the owner to withdraw spent Ether.
- withdrawSpentIpt: Allows the owner to withdraw spent IPTokens.
- setIP: Registers an IP, charging the user in IPTokens or Ether (str, onApproval, isEther).
- sellerCreatesSalesIntent: Allows the IP owner to create a sales intent (str, salesPrice, buyerAddress, onApproval, isEther).
- sellerCancelsSalesIntent: Allows the IP owner to cancel a sales intent (str).
- buyerBuysIP: Allows the buyer to purchase an IP (salesPrice, str, onApproval, isEther).
- stringtoBytes: An internal function to set the storage of a string to 32 bytes





