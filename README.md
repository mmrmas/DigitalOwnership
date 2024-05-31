# IPtrade: an on-chain digitized content ownership tracking platform
## driven by IPT, the ownership token

 The smart contract **IPtrade** (address) registers, tracks and manages ownership for digitized content.IPtrade logs content in the form of a simple cryptographic fingerprint to a wallet address on the blockchain. It runs on **IPT** (address), the ownership token. This document introduces IPT together with IPtrade. Developments will be published on [github](github.com/mmrmas/IPT)

## TL;DR
- IPtrade registers SHA-512 hashes under ERC20 compatible wallet addresses. 
	- SHA-512 hashes are unique document identifiers. 
	- See this [wiki page](https://en.wikipedia.org/wiki/SHA-2) for more details (accessed on April 12, 2024)  
- IPtrade is a marketplace. Content creators can register content and transfer ownership to their clients. 
- The token that runs IPtrade is IPT (address), the ownership token.

## Introduction
Digital content is often shared in a way that ownership is implicitly transferred from the creator to a client. The following scenario's exemplify this:

- An architect designs a house and shares a link of the design to their client.
- A freelance composer submits a music file to a studio. 
- A patient receives health information by email. 
- A bank promotes a financial product to a client by email.

In such cases, ownership is transferred in a trust-based manner, where two very important elements are often overlooked:

1. is the received document identical to the document that was sent?
2. does the person who sent the document identify as the original owner of the document?

When these two questions cannot be answered affirmatively, there is a chance that the received document is flawed, and/or the sender impersonates someone else. 

IPtrade is designed to safeguard these important security aspects of data transfer and ownership. It allows any content provider to log the SHA-512 hash of their document on-chain. When this hash has been logged, everyone can verify the registration and the address. Whoever receives a document can check if this content has indeed been logged under the address of the original owner / creator. 


## Use-cases
Validation of a received document is the simplest use-case of IPtrade. This can be helpful in the context of communicating important information, where the sender sees a need for the receiver to verify the origin of the document. Examples are: medical information, financial documents, signed contracts, graduation documents, digital IDs.

Validation can be achieved as follows:

-  Owners of IPT can register the SHA-512 hash of a document under a wallet address that belongs to them. 
	-  When a SHA-512 hash is registered in the blockchain under the user's wallet address, it means that the owner has access to a document that can produce this hash.
	- It is recommended to embed the registration address inside the document, as an additional layer of proof that the first registration of the document took place on the logged address.
- The workflow is as follows:
	1. create a document (if possible, including the registration address inside the document)
	2. create a SHA-512 hash
	3. log this hash value under the owner address
	4. send the document to the client
	5. the client creates a SHA-512 hash from the document
	6. the client verifies that the SHA-512 hash was registered and thereby validates the owner. 

A second use-case is the creation of content, followed by a transfer. This way, a creator secures the arrival of their original content, and subsequently transfers the ownership to the receiver. This can be applied when creating original artistic works, where an artist can establish traceability and the client can certify the origin of the work; tracing and trading of digitized products such as art and jewelry; IP management of innovations and discoveries, such as software code and genomic sequences.

Ownership transfer can be achieved, after logging the SHA-512, as follows:

- Transfer is initiated by the original owner / creator, who makes an offer to a buyer's wallet address. The buyer can then complete the transaction by transferring an agreed amount of IPT, via IPtrade, to the wallet of the original owner, and has 7 days to do so.


> **How to create an SHA-512 hash from a document.**
> 
> An SHA-512 hash can be easily obtained on your own device.
> 
> - On MacOS, the command-line command is "shasum -a 512 FILENAME",
> - On Unix systems you can run "shasum -a 512 FILENAME" 
> - On Windows, in the command prompt, the command is "certUtil -hashfile FILENAME SHA512"
> - Of course there are software tools available to obtain the SHA-512 hash with a graphical user interface
> - Some websites may offer this service. Be cautious to share sensitive data online
> 
> ***The result is a 128-character string that looks as follows: 71ab8abcd670ef62a1f47dd2a24b17e7025c5fd0a1365dda0dd7cb6d4c5fc7ee9f9ce2981ad64e1f6b77999bcc065912ebf4ee71d5776edc4c3fdba30341d323***
 

## Best practices when the SHA-512 hash cannot be validated, or the registration address is incorrect
- The SHA-512 hash is a digital fingerprint of a document. Any change in the document will change the hash value. If the hash cannot be validated on IPtrade, then the received document is different from the logged one. Ask if the original owner sends you the original document. They should be able to provide it, otherwise someone else is claiming to be the sender; and that is exactly what the original sender wanted to protect you against.
- IPtrade can only link one wallet address to a SHA-512 hash. If the hash of a received document matches an address that does not belong to the original owner, then the original owner should be able to show that they own that address as well. 
- Wwners should be transparent regarding the address they use to register SHA-512 hashes.
	- Ways to achieve this are:
		- Including their wallet address inside the shared documents
		- Publishing their wallet address in the  public domain 
		- Publishing registered SHA-512 hashes in the public domain, for verification purposes

## Challenges of the hash registration approach
- There is no limit on changing ownership. Those who take over ownership via IPtrade should always validate that the first registered address belongs to the original content creator.


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
	- Each address can obtain initially 1000 IPT each 7 days, up to a maximum of 10M IPT
5. Registration prices, transfer prices and free IPT distribution may change in the future, depending on the number of transactions made on IPtrade. There is no implemented logic for this.


### IPtrade ownership

- The owner has the following benefits/capacities:
	- The owner will earn IPT at every IP registration
	- set a new owner
	- set the locktime for the faucet and the sales offer expiry period
	- set the amount of IPT dispensed by the faucet
	- set prices for IP registration and transfer
	- withdraw all IPT from the contract
- The owner cannot do the following:
	- delete sha-512 registrations of platform users 

	
## How to connect

1.  [The web3 portal](address)
	- The easiest way to connect via your metamask wallet
	- At the moment implements the faucet, hash registration, ownership check, and trade
	- Still to be implemented: check initiated ownership transfers, cancellation of these, and IP deletion.
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
 
#### approve the contract to spend IPT

```
ipToken.connect(YOUR-ADDRESS).approveAmount(IPtrade.target, NUMBER-OF-IPT);

# number of tokens should be with 18 trailing 0's
# e.g. 100 equals 100000000000000000000n

``` 

#### register your IP

```
IPtrade.connect(YOUR-ADDRESS).setIP(SHA-512);
```
      
#### create offer to sell it    
```
IPtrade.connect(YOUR-ADDRESS).sellerCreatesSalesIntent(SHA-512, TRANSFER-PRICE-IPT, BUYER-ADDRESS);
```

#### buyer buys on approval, or directly with IPT credit
```
IPtrade.connect(BUYER-ADDRESS).buyerBuysIP(SHA-512,TRANSFER-PRICE-IPT);
```

### Useful variables/functions to check prices and ownership
- registerIPCostIpt()     
- transferIPCostIpt()      
- registerIPCostEth()   
- transferIPCostEth()   
- getIP(SHA-512)
- getSalesIntent(SHA-512)


## Support
Updates and queries can be posted on the [github account] (www.github.com/mmrmas/IPT)