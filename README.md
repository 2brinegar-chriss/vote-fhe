# 🗳️ PlatformVoting - Privacy-Preserving Voting System

A decentralized voting platform built with **Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine)** that enables completely private and secure on-chain voting.

![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)
![Solidity](https://img.shields.io/badge/solidity-^0.8.24-363636.svg)
![Hardhat](https://img.shields.io/badge/hardhat-2.26.0-yellow.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)

## 🌟 Features

### 🔐 **Full Privacy Protection**
- **Encrypted Votes**: All votes are encrypted using FHE (Fully Homomorphic Encryption) and stored on-chain in encrypted form
- **Zero Knowledge Voting**: Vote choices remain completely private until poll finalization
- **Secure Decryption**: Results can only be decrypted by authorized platform members after voting completion

### 🏢 **Platform Management**
- **Create Platforms**: Set up voting platforms with custom member limits
- **Member Management**: Join platforms and manage member access
- **Multi-Platform Support**: Multiple independent voting platforms can coexist

### 📊 **Advanced Voting System**
- **Flexible Polls**: Create polls with multiple options (minimum 2)
- **One Vote Per Member**: Guaranteed single vote per member per poll
- **Real-time Tracking**: Monitor voting progress and participation
- **Encrypted Results**: View encrypted vote counts only after finalization

### 🚀 **Modern Tech Stack**
- **Smart Contracts**: Solidity 0.8.27 with FHEVM support
- **Frontend**: React 18 with TypeScript and Vite
- **Development**: Hardhat development environment
- **Blockchain**: Deployed on Sepolia testnet with local development support

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Smart Contract](#smart-contract)
- [Frontend Application](#frontend-application)
- [Deployment](#deployment)
- [Usage Guide](#usage-guide)
- [Testing](#testing)
- [Security](#security)
- [Contributing](#contributing)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌───────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  Wallet   │  │  Contract  │  │  Relayer SDK     │  │
│  │  (MetaMask)│  │  Interface │  │  (FHE Encrypt)   │  │
│  └───────────┘  └────────────┘  └──────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Ethereum (Sepolia Testnet)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │         PlatformVoting Smart Contract            │  │
│  │                                                   │  │
│  │  • Platform Management                           │  │
│  │  • Poll Creation & Voting                        │  │
│  │  • FHE Encrypted Vote Storage                    │  │
│  │  • Member Authentication                         │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Zama FHEVM Network                      │
│  • Homomorphic Encryption Operations                   │
│  • Secure Vote Counting                                │
│  • Decryption Oracle                                   │
└─────────────────────────────────────────────────────────┘
```

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.x
- **npm** >= 7.0.0
- **Git**
- **MetaMask** browser extension

### Required Knowledge
- Basic understanding of Ethereum and smart contracts
- Familiarity with React and TypeScript
- Understanding of Web3 wallet connections

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fhevm-hardhat-template
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Configure Environment Variables

Set up your Hardhat configuration variables:

```bash
npx hardhat vars set PRIVATE_KEY
# Enter your private key (for Sepolia deployment)

npx hardhat vars set INFURA_API_KEY
# Enter your Infura API key

npx hardhat vars set ETHERSCAN_API_KEY
# Enter your Etherscan API key (for contract verification)
```

## 📝 Smart Contract

### Contract Overview

The `PlatformVoting` contract (`contracts/vote.sol`) provides the following functionality:

#### Core Functions

**Platform Management:**
- `createPlatform(name, memberLimit)` - Create a new voting platform
- `joinPlatform(platformId)` - Join an existing platform
- `getAllPlatforms()` - Get list of all platforms

**Poll Management:**
- `createPoll(platformId, title, options)` - Create a new poll in a platform
- `vote(platformId, pollId, optionIndex, oneEncrypted, inputProof)` - Cast an encrypted vote
- `finalize(platformId, pollId)` - Finalize poll and allow result decryption

**Query Functions:**
- `getPlatform(platformId)` - Get platform information
- `getPoll(platformId, pollId)` - Get poll details
- `hasUserVoted(platformId, pollId, user)` - Check if user has voted
- `getEncryptedCounts(platformId, pollId)` - Get encrypted vote counts (after finalization)

### Compile Contracts

```bash
npm run compile
```

This will:
- Compile all Solidity contracts
- Generate TypeScript types
- Create artifacts in the `artifacts/` directory

### Contract Structure

```solidity
struct Platform {
    string name;
    uint256 memberLimit;
    address[] members;
    mapping(address => bool) isMember;
    mapping(uint256 => Poll) polls;
}

struct Poll {
    string title;
    string[] options;
    euint32[] counts;  // Encrypted vote counts
    uint256 totalVoted;
    bool finalized;
    mapping(address => bool) hasVoted;
}
```

## 🎨 Frontend Application

### Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ConfirmModal.tsx      # Confirmation dialogs
│   │   ├── CreatePlatform.tsx    # Platform creation form
│   │   ├── CreatePoll.tsx        # Poll creation form
│   │   ├── Modal.tsx             # Base modal component
│   │   ├── PlatformList.tsx      # Platform listing
│   │   ├── PollList.tsx          # Poll listing
│   │   ├── ResultsModal.tsx      # Poll results display
│   │   └── VoteModal.tsx         # Voting interface
│   ├── hooks/
│   │   ├── useContract.ts        # Smart contract interactions
│   │   ├── useRelayerSDK.ts      # FHE encryption/decryption
│   │   └── useWallet.ts          # Wallet connection
│   ├── App.tsx                    # Main application
│   ├── App.css                    # Styling
│   └── main.tsx                   # Entry point
├── index.html
├── package.json
└── vite.config.ts
```

### Key Components

#### 1. **useWallet Hook**
Manages MetaMask wallet connection and state:
- Wallet connection/disconnection
- Account and network information
- Connection status tracking

#### 2. **useContract Hook**
Handles all smart contract interactions:
- Platform CRUD operations
- Poll creation and voting
- Result querying
- Transaction management

#### 3. **useRelayerSDK Hook**
Manages FHE encryption operations:
- SDK initialization
- Encrypted input creation
- Vote decryption

### Run Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Build for Production

```bash
cd frontend
npm run build
```

Production files will be generated in `frontend/dist/`

## 🚀 Deployment

### Deploy to Local Network

1. Start local Hardhat node:
```bash
npm run chain
```

2. Deploy contract (in new terminal):
```bash
npm run deploy:localhost
```

### Deploy to Sepolia Testnet

1. Ensure you have:
   - SepoliaETH in your wallet ([Get from faucet](https://sepoliafaucet.com/))
   - Configured `PRIVATE_KEY` and `INFURA_API_KEY`

2. Deploy:
```bash
npm run deploy:sepolia
```

3. Verify contract on Etherscan:
```bash
npm run verify:sepolia
```

### Update Frontend Contract Address

After deployment, update the contract address in `frontend/src/App.tsx`:

```typescript
// Line 38-40
const address = '0xYourDeployedContractAddress';
setContractAddress(address);
```

Also update `frontend/src/PlatformVoting.json` with the new ABI from `deployments/sepolia/PlatformVoting.json`.

## 📖 Usage Guide

### For Users

#### 1. **Connect Wallet**
- Install MetaMask browser extension
- Switch to Sepolia testnet
- Click "Connect MetaMask Wallet" button

#### 2. **Join or Create Platform**
- Browse available platforms in the "Platform Management" tab
- Click "Join Platform" to join an existing one
- Or create a new platform with custom settings

#### 3. **Create Poll** (Platform Members Only)
- Navigate to "Poll Management" tab
- Click "Create New Poll"
- Enter poll title and options (minimum 2)
- Submit to create encrypted poll

#### 4. **Cast Vote**
- View available polls in your platform
- Click "Vote" on an active poll
- Select your choice
- Confirm transaction to submit encrypted vote

#### 5. **View Results**
- After all members vote, poll can be finalized
- Click "Finalize Poll" (requires all members to vote)
- Once finalized, click "View Results" to see decrypted counts

### For Developers

#### Contract Interaction Example

```typescript
import { ethers } from 'ethers';
import PlatformVotingABI from './PlatformVoting.json';

const contract = new ethers.Contract(
  contractAddress,
  PlatformVotingABI.abi,
  signer
);

// Create platform
const tx = await contract.createPlatform("My Platform", 10);
await tx.wait();

// Create poll
const pollTx = await contract.createPoll(
  platformId,
  "What's your favorite color?",
  ["Red", "Blue", "Green"]
);
await pollTx.wait();
```

#### FHE Vote Encryption

```typescript
import { useRelayerSDK } from './hooks/useRelayerSDK';

const relayerSDK = useRelayerSDK(provider);

// Create encrypted input
const { encryptedValue, inputProof } = await relayerSDK.createEncryptedInput(
  contractAddress,
  userAddress
);

// Add encrypted uint32 (value = 1 for vote)
await encryptedValue.addUint32(1);

// Vote with encrypted input
await contract.vote(
  platformId,
  pollId,
  optionIndex,
  encryptedValue.getHandle(),
  inputProof
);
```

## 🧪 Testing

### Run Tests

```bash
npm run test
```

### Test Coverage

Generate coverage report:

```bash
npm run coverage
```

### Gas Report

Enable gas reporting in tests:

```bash
REPORT_GAS=true npm run test
```

## 🔒 Security

### Encryption Model

1. **Vote Encryption**: Each vote is encrypted client-side using Zama's FHE SDK
2. **On-Chain Storage**: Encrypted votes (euint32) are stored on the blockchain
3. **Homomorphic Operations**: Vote counting happens on encrypted data
4. **Controlled Decryption**: Only platform members can decrypt finalized results

### Security Features

- ✅ **Access Control**: Only platform members can vote
- ✅ **Single Vote**: One vote per member per poll enforced
- ✅ **Immutable Results**: Votes cannot be changed after submission
- ✅ **Privacy Protection**: Individual votes never revealed
- ✅ **Transparent Process**: All operations verifiable on blockchain

### Known Limitations

⚠️ **Important Considerations:**

1. **Finalization Requirement**: All members must vote before results can be decrypted
2. **Gas Costs**: FHE operations are more expensive than regular transactions
3. **Decryption Time**: Result decryption may take several seconds
4. **Network Dependency**: Requires connection to Zama's FHE network

## 🛠️ Development Scripts

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm run clean` | Clean build artifacts |
| `npm run typechain` | Generate TypeScript types |
| `npm run lint` | Run linters (Solidity + TypeScript) |
| `npm run prettier:write` | Format code |
| `npm run test` | Run all tests |
| `npm run chain` | Start local Hardhat node |
| `npm run deploy:localhost` | Deploy to local network |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |

## 📄 Contract Deployment

### Sepolia Testnet

- **Contract Address**: `0x05A99E0875cEB6F1cD8Aa7497a7866BdE257d2C9`
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x05A99E0875cEB6F1cD8Aa7497a7866BdE257d2C9)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow existing code formatting
- Run `npm run lint` before committing
- Use `npm run prettier:write` to format code
- Write meaningful commit messages

## 📚 Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [React Documentation](https://react.dev/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [MetaMask Documentation](https://docs.metamask.io/)

## 🐛 Troubleshooting

### Common Issues

**Issue**: MetaMask connection fails
- **Solution**: Ensure MetaMask is installed and unlocked, refresh the page

**Issue**: Transaction fails with "Only member" error
- **Solution**: Join the platform before attempting to create polls or vote

**Issue**: Cannot decrypt results
- **Solution**: Ensure poll is finalized and all members have voted

**Issue**: FHE SDK initialization fails
- **Solution**: Check network connection and ensure you're on Sepolia testnet

**Issue**: Gas estimation failed
- **Solution**: Ensure you have enough SepoliaETH for transaction fees

### Debug Mode

Enable verbose logging in frontend:

```typescript
// In useRelayerSDK.ts or useContract.ts
console.log('Debug:', { /* state variables */ });
```

## 📞 Support

For questions and support:
- Open an issue on GitHub
- Check existing issues for solutions
- Review Zama documentation for FHE-specific questions

## 📜 License

This project is licensed under the BSD-3-Clause-Clear License.

---

**Built with ❤️ using Zama FHEVM**

*Empowering private and secure decentralized voting*

