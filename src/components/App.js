import { useEffect, useState } from 'react';
import './App.css';
import Web3 from 'web3';
import DaiToken from '../abis/DaiToken.json';
import DappToken from '../abis/DappToken.json';
import TokenFarm from '../abis/TokenFarm.json';

function App() {
  // State variables
  const [account, setAccount] = useState('0x0');
  const [daiTokenBalance, setDaiTokenBalance] = useState(0);
  const [dappTokenBalance, setDappTokenBalance] = useState(0);
  const [stakingBalance, setStakingBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [daiToken, setDaiToken] = useState(null);
  const [dappToken, setDappToken] = useState(null);
  const [tokenFarm, setTokenFarm] = useState(null);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      // eslint-disable-next-line
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  };

  // Function is fetching data from the blockchain and load it to the state
  const loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    const networkId = await web3.eth.net.getId();

    // Load DaiToken
    // This is to load the address of the smart contract
    const daiTokenData = DaiToken.networks[networkId];
    if (daiTokenData) {
      const tempDaiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address);
      const daiBalance = await tempDaiToken.methods.balanceOf(accounts[0]).call();
      setDaiToken(tempDaiToken);
      setDaiTokenBalance(daiBalance.toString());
    } else {
      window.alert('DaiToken contract not deployed to detected network.');
    }

    // Load DappToken
    // This is to load the address of the smart contract
    const dappTokenData = DappToken.networks[networkId];
    if (dappTokenData) {
      const tempDappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address);
      const dappBalance = await tempDappToken.methods.balanceOf(accounts[0]).call();
      setDappToken(tempDappToken);
      setDappTokenBalance(dappBalance.toString());
    } else {
      window.alert('DappToken contract not deployed to detected network.');
    }

    // Load TokenFarm
    // This is to load the address of the smart contract
    const tokenFarmData = TokenFarm.networks[networkId];
    if (tokenFarmData) {
      const tempTokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address);
      const tempStakingBalance = await tempTokenFarm.methods.stakingBalance(accounts[0]).call();
      setTokenFarm(tempTokenFarm);
      setStakingBalance(tempStakingBalance.toString());
    } else {
      window.alert('TokenFarm contract not deployed to detected network.');
    }
  };

  // Stake tokens function
  const stakeTokens = async (weiAmount) => {
    // set loading
    setIsLoading(true);
    // approve the transfer of DAI tokens
    await daiToken.methods
      .approve(tokenFarm._address, weiAmount)
      .send({ from: account })
      .on('receipt', (receipt) => {
        console.log(receipt);
      });

    await tokenFarm.methods
      .stakeTokens(weiAmount)
      .send({ from: account })
      .on('receipt', (receipt) => {
        console.log(receipt);
      });

    console.log(weiAmount);
    setIsLoading(false);
  };

  // Unstake tokens function
  const unStakeTokens = async () => {
    // set loading
    setIsLoading(true);

    await tokenFarm.methods
      .unstakeToken()
      .send({ from: account })
      .on('receipt', (receipt) => {
        console.log(receipt);
      });
    setIsLoading(false);
  };

  useEffect(async () => {
    await loadWeb3();
    await loadBlockchainData();
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="">Loading...</div>;
  }
  return (
    <>
      <div>Staking balance: {Web3.utils.fromWei(stakingBalance, 'Ether')} mDAI</div>
      <div>Reward balance: {Web3.utils.fromWei(dappTokenBalance, 'Ether')} DApp</div>
      <div>DAI balance: {Web3.utils.fromWei(daiTokenBalance, 'Ether')} DAI</div>
      <div>
        Stake Tokens:{' '}
        <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            stakeTokens(Web3.utils.toWei(amount, 'ether'));
          }}
        >
          Stake
        </button>
        <button
          type="button"
          onClick={() => {
            unStakeTokens();
          }}
        >
          Unstake
        </button>
      </div>
    </>
  );
}

export default App;
