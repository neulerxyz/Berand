# Berand: A Chrome Extension for Real Rewards Interaction

Berand is a Chrome extension designed to seamlessly integrate users with our NFT ecosystem by generating a smart contract wallet (SCWallet). This SCWallet provides users with secure and automated interaction with NFT contracts, leveraging two Berachain wallets: an **operator wallet** and a **proxy wallet**.

## Key Components

### 1. SCWallet
- **SCWallet** is a smart contract-based wallet generated for each user. It acts as the primary interface between the user and the NFTs, ensuring secure and efficient transactions.
- The SCWallet is designed to interact with NFT contracts, allowing users to claim campaign NFTs or perform other operations with ease.

### 2. Operator Wallet
- The **operator wallet** is the wallt that owns the generated SCWallet.
- It is **encrypted with the user’s password**, ensuring that only the user can unlock it. This wallet is used for administrative and withdrawal calls.

### 3. Proxy Wallet
- The **proxy wallet** is a hot wallet within the SCWallet. It is responsible for executing **Claim Transactions** automatically, without user interaction.


## Features

### 1. Wallet Generation
- Upon installation, Berand generates a SCWallet for each user, which includes both the operator wallet and the proxy wallet.
- The operator wallet is securely encrypted using the user’s password, while the proxy wallet is available for limited, predefined transactions.

### 2. NFT Campaign Interaction
- Users can participate in various NFT Campaign(Real Rewards) across the ecosystem by claiming NFTs through their SCWallet.
- **Claiming an NFT** involves discovering a secret message provided in the campaign. Once the user finds the secret, they can use it to claim the NFT directly from the campaign’s smart contract.

## Current Status

- **Wallet Generation**: The extension currently generates a SCWallet with both the operator and proxy wallets for each user.
- **NFT Claiming**: Users can claim any arbitrary campaign NFT by providing the correct secret message. This functionality is currently available for testing, and users can experience a smooth interaction with campaign NFTs.

