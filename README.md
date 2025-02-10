# DigitalOwnership (DO) 
## An on-chain content ownership tracking platform

 The smart contract **DigitalOwnership** () registers and trades ownership for digital and digitized content. DigitalOwnership registers content in the form of a cryptographic fingerprint to a wallet address on the blockchain. The contract can be connected through [web3](https://digitalownership.squaredant.com/index.html)

## TL;DR
- DigitalOwnership registers SHA-512 hashes under ERC20 compatible wallet addresses. 
	- SHA-512 hashes are unique document identifiers. 
	- See this [wiki page](https://en.wikipedia.org/wiki/SHA-2) for more details (accessed on April 12, 2024)  
- DigitalOwnership is a registration and transfer platform. Content creators can register content and transfer ownership to their clients. 

## Introduction
DigitalOwnership allows any content provider to log the SHA-512 hash of their document on-chain. Whoever receives a document can check if this content has indeed been logged under the address of the original owner / creator. 

## Use-cases
The simplest use-case of DigitalOwnership is the validation of a document. This can be helpful in the context of communicating important information, where the sender wants to allow the receiver to verify the origin of the document. Examples are: medical reports, financial documents, signed contracts, graduation documents, digital IDs.

### Validation can be achieved when:

- Holders of ETH on the Arbitrum Net can register content. 
	- A SHA-512 hash that is registered in the blockchain under the user's wallet address serves as proof that the owner has access to a document that can produce this hash.
	- It is recommended to embed the registration address inside the document, as an additional layer of proof that the first registration of the document took place on the logged address.

### The workflow is as follows:

	1. Create a document (if possible, include the registration address inside the document)
	2. Create a SHA-512 hash with this document
	3. Log this hash value under your wallet address
	4. Send the document to the client
	5. The client creates a SHA-512 hash from the document
	6. The client verifies that the SHA-512 hash was registered on the address of the owner. 

A second use-case is the creation of content, followed by ownership transfer. This way, a creator secures the arrival of their original content, and subsequently transfers the ownership to the receiver. This can be applied when creating original artistic works, where an artist can establish traceability and the client can certify the origin of the work; tracing and trading of digitized products such as art and graphic design; IP management of innovations and discoveries, such as software code and genomic sequences.

### Ownership transfer can be achieved, after logging the SHA-512, as follows:

- Transfer is initiated by the original owner / creator by tagging a "buyer". 
- The "buyer" can then complete the transaction by accepting the offer via DigitalOwnership and has 7 days to do so before the "seller" can withdraw their offer.

----
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
----

## Best practices 
- Tip: document SHA-512 hashes from documents that are not intended to modify, such as pdf files, zip/tar archives, images. 
- Tip: Keep DigitalOwnership-logged files in a write-protected folder named after your wallet address.
- Tip: Share with care. Register your valuable original creations and innovartions before you distribute content to others. This can be done in any stage of the process.
- Tip: If you intend to share content, make the wallet address that you use for DigitalOwnership registrations is public. This way, your ownership address can be easily linked to the correct individual or organization. 
- You may also choose to not reveal your address, if you intend to prove the origin and existence of your work at a later timepoint. 
- Owners should be transparent regarding the address they use to register SHA-512 hashes.
	- Ways to achieve this are:
		- Including their wallet address inside the shared documents
		- Publishing their wallet address in the  public domain (website, channels)

## What to do when the SHA-512 hash cannot be validated, or the registration address is incorrect
- The SHA-512 hash is a digital fingerprint of a document. Any change in the document will change the hash value. If the hash cannot be validated on DigitalOwnership, then the received document is different from the registered one. Ask the sender to send you the original, verifyable document. They should be able to provide it, otherwise someone else is claiming to be the sender; and that is exactly what the original sender wanted to protect you against.
- DigitalOwnership can only link one wallet address to a certain SHA-512 hash. If the hash of a received document matches an unknown address, then the original owner should be able to show that they own this address as well, or re-register the same document under the known address.

## Challenges of the hash registration approach
- A SHA-512 hash does not contain any interpretable information about the document it describes. It is only an abstract representation.
- Due dilligence might be required in certain cases. Those who take over document ownership via DigitalOwnership should always validate that the first registered address belongs to the original content creator.

## A note on patents and trademarks
Patents and trademarks require originality and therefore the IP related to patent and trademark registrations should not be available in the public domain before such a status has been granted. DigitalOwnership is primarily aimed at content and ownership validation of shared documents; it does and cannot provide patent or trademark status to documents, since such a status is legally provided by regional and international regulations and requirements. 
The position of blockchain technology in patent and trademark registration is evolving and it is yet unclear if DigitalOwnership-registered hashes can play a role in it. Time-stamped registration of SHA-512 hashes have the potential to add value in this process, for those who need to provide evidence for the moment of conception of an original idea to get an appliction granted; or for those who try to avoid the exploitation of their own IP by others.  


## Project key characteristics

### DigitalOwnership
1. DigitalOwnership () is owned by .


### DigitalOwnership smart contract ownership

- The owner has the following benefits/capacities:
	- set a new owner
	- set the locktime for the faucet and the sales offer expiry period
- The owner cannot do the following:
	- delete SHA-512 registrations of platform users 

	
## How to connect

1.  [The web3 portal](https://digitalownership.squaredant.com/index.html)
	- The easiest way to connect via your metamask wallet
	- At the moment implements the faucet, hash registration, ownership check, and trade
	- Still to be implemented: check initiated ownership transfers, cancellation of these, and IP deletion.
2. Remix
	- download the contract files from Github and put them in your contracts folder in remix
	- compile the contracts under the following addresses:
		- DigitalOwnership: 
2. Hardhat
	- download the contract files from Github and put them in your contracts folder in visual studio code
	- make sure that you have installed Hardhat
	- then:

```
	npx hardhat console --network NETWORK`

	const DigitalOwnership = await ethers.getContractFactory('DigitalOwnership');
	const DigitalOwnership = await DigitalOwnership.attach(DigitalOwnership ADDRESS); 

```


## IP registration and transfer scenarios
### Successfully register and sell with IPT allowance
 
#### approve the contract to spend IPT

```
ipToken.connect(YOUR-ADDRESS).approveAmount(DigitalOwnership.target);

``` 

#### register your IP

```
DigitalOwnership.connect(YOUR-ADDRESS).setDO(SHA-512);
```
      
#### create offer to sell it    

```
DigitalOwnership.connect(YOUR-ADDRESS).sellerCreatesSalesIntent(SHA-512, BUYER-ADDRESS);
```

#### buyer buys on approval, or directly with IPT credit

```
DigitalOwnership.connect(BUYER-ADDRESS).buyerBuysDO(SHA-512);
```

### Useful variables/functions to check prices and ownership     
- getDO(SHA-512)
- getSalesIntent(SHA-512)


## Contact and Support
Updates and queries can be posted on the [github account](https://github.com/mmrmas/digitalownership/discussions)  
You can also reach out via LinkedIn: [LinkedIn](https://www.linkedin.com/in/sam-linsen/)