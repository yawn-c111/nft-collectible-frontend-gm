import React, { useEffect, useState } from "react";
import './App.css';
import squirrelImg from './assets/rinkeby_squirrels.gif';
import contract from './contracts/NFTCollectible.json';
import { Fragment } from 'react/cjs/react.production.min';
import { ethers } from 'ethers';

const OPENSEA_LINK = 'https://testnets.opensea.io/collection/nft-collectible-aboe6qthhv';
const contractAddress = "0x193CB439097031AB8D6bB261D99B05D4365e8193";
const abi = contract.abi;

function App() {

  const [currentAccount, setcurrentAccount] = useState(null);
  const [metamaskError, setMetamaskError] = useState(null);
  const [mineStatus, setMineStatus] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: 'eth_accounts'});
    const network = await ethereum.request({ method: 'eth_chainId' });

    if (accounts.length !== 0 && network.toString() === '0x13881') {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setMetamaskError(false);
      setcurrentAccount(account);
    } else {
      setMetamaskError(true);
      console.log("No authorized account found");
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install MetaMask!");
    }

    try {
      const network = await ethereum.request({ method: 'eth_chainId' });

      if (network.toString() === '0x13881') {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Found an account! Address: ", accounts[0]);
        setcurrentAccount(accounts[0]);
      } else {
        setMetamaskError(true);
      }
    } catch (err) {
      console.log(err)
    }
  }

  const mintNftHandler = async () => {
    try {

      setMineStatus('mining');

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Initialize payment");
        let nftTxn = await nftContract.mintNFTs(1, { value: ethers.utils.parseEther("0.01")});

        console.log("Mining...please wait");
        await nftTxn.wait();

        console.log(`Mined, see transaction: ${nftTxn.hash}`);
        setMineStatus('success');

      } else {
        setMineStatus('error');
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      setMineStatus('error');
      console.log(err);
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
        Mint NFT
      </button>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();

    if (window.ethereum) {
      window.ethereum.on('chainChanged', (_chainId) => window.location.reload());
    }
  }, [])

  return (
    <Fragment>
      {metamaskError && <div className='metamask-error'>Please make sure you are connected to the Polygon Testnet on Metamask!</div>}
      <div className='main-app'>
        <header>
          <h1>Scrappy Squirrels GM</h1>
          <button className='os-button'>
              <a href={OPENSEA_LINK} target='_blank' rel="noopener noreferrer">
                  View Collection on Opensea
              </a>
          </button>
        </header>
        <div class="container">
          <div className='banner-img'>
            <img src={squirrelImg} alt="Polygon Squirrels" />
          </div>
          {currentAccount && mineStatus !== 'mining' && mintNftButton()}
          {!currentAccount && !mineStatus && connectWalletButton()}
          <div>
              {mineStatus === 'success' &&
                <div className={mineStatus}>
                  <p>NFT minting successful!</p>
                  <p className='success-link'>
                    <a href={`https://testnets.opensea.io/${currentAccount}/`} target='_blank' rel='noopener noreferrer'>Click here</a>
                    <span> to view your NFT on OpenSea.</span>
                  </p>
                </div>
              }
              {mineStatus === 'mining' &&
                <div className={mineStatus}>
                  <p>Transaction is mining</p>
                </div>
              }
              {mineStatus === 'error' &&
                <div className={mineStatus}>
                  <p>Transaction failed. Make sure you have at least 0.01 MATIC in your Metamask wallet and try again</p>
                </div>
              }
          </div>
          {currentAccount &&
            <div className='show-user-address'>
              <p>
                Your address being connected: &nbsp;<br/>
                <span><a className='user-address'>{currentAccount}</a></span>
              </p>
            </div>
          }
        </div>
        <footer>
          <p>
            SMART CONTRACT ADDRESS:&nbsp;<br />
            <span>
              <a className='contract-link' href={`https://mumbai.polygonscan.com/address/${contractAddress}`} target='_blank' rel='noopener noreferrer'>
                  {contractAddress}
              </a>
            </span>
          </p>

        </footer>
      </div>
    </Fragment>
  );
};

export default App;