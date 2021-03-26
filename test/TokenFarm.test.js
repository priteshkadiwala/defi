// Import packages
const { assert } = require('chai');

// Import helper functions
const utils = require('./helpers/utils');

// Import the contracts to be tested
const TokenFarm = artifacts.require('TokenFarm');
const DappToken = artifacts.require('DappToken');
const DaiToken = artifacts.require('DaiToken');

require('chai').use(require('chai-as-promised')).should();

// Tests for TokenFarm contract.
// Account arg contains the accounts on the network.
contract('TokenFarm', (accounts) => {
  // Initialize global variables that will be used by multiple tests.
  let daiToken, dappToken, tokenFarm;
  let [owner, investor] = accounts;

  // before function is called before any of the tests below are run.
  before(async () => {
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    // tokenFarm's constructor requires @dappToken and @daiToken addresses as args
    // to initialize the contract.
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

    // Transfer all the DAPP tokens to TokenFarm (1 million)
    await dappToken.transfer(tokenFarm.address, utils.tokens('1000000'));

    // Send initial DAI to the investor for testing purposes.
    // The last argument is to mention who is sending the tokens for the tests.
    await daiToken.transfer(investor, utils.tokens('100'), { from: owner });
  });

  // check if the deployment of the
  // DaiToken Contract was successful.
  describe('Mock DAI deployment', async () => {
    // Test if the name of the contract is correct
    it('has a name', async () => {
      const name = await daiToken.name();
      assert.equal(name, 'Mock DAI Token');
    });
  });

  // check if the deployment of the
  // DappToken Contract was successful.
  describe('Dapp Token deployment', async () => {
    // Test if the name of the contract is correct
    it('has a name', async () => {
      const name = await dappToken.name();
      assert.equal(name, 'DApp Token');
    });
  });

  // check if the deployment of the
  // TokenFarm Contract was successful.
  describe('Token Farm deployment', async () => {
    // Test if the name of the contract is correct
    it('has a name', async () => {
      const name = await tokenFarm.name();
      assert.equal(name, 'Dapp Token Farm');
    });

    // Test if all the DApp tokens were transferred
    // to the Token farm address.
    it('has tokens', async () => {
      const balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), utils.tokens('1000000'));
    });
  });

  // Check if the farming aspect of the contract works.
  describe('Farming Tokens', async () => {
    // Test whether the investor is being rewarded for staking.
    it('rewards investors for staking mDAI tokens', async () => {
      let result;

      // Check investor balance before staking.
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        utils.tokens('100'),
        'Investor mDAI wallet balance is correct before staking.'
      );

      // Approve the tokenFarm address to transfer mDAI tokens.
      await daiToken.approve(tokenFarm.address, utils.tokens('100'), { from: investor });
      // Stake mDAI tokens
      await tokenFarm.stakeTokens(utils.tokens('100'), { from: investor });

      // Check investor balance after staking.
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        utils.tokens('0'),
        'Investor mDAI wallet balance is correct after staking.'
      );

      // Check tokenFarm address balance after staking.
      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        utils.tokens('100'),
        'tokenFarm wallet balance is correct after staking.'
      );

      // Check tokenFarm stakingBalance for the investor.
      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        utils.tokens('100'),
        'Investor staking balance is correct after staking.'
      );

      // Check is the investor is currently staking.
      result = await tokenFarm.isStaking(investor);
      assert.equal(result.toString(), 'true', 'Investor is currently staking.');

      // Ensure that only the owner can call the issueToken function
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

      // Issue tokens to all investors
      await tokenFarm.issueTokens({ from: owner });

      // Check DApp token balance after issuing to the investor.
      result = await dappToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        utils.tokens('100'),
        "Investor's DApp wallet balance is correct after staking."
      );

      // Unstake the tokens
      await tokenFarm.unstakeToken({ from: investor });

      // Check investor balance after unstaking.
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        utils.tokens('100'),
        'Investor mDAI wallet balance is correct after unstaking.'
      );

      // Check the tokenFarm balance after unstaking.
      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        utils.tokens('0'),
        'tokenFarm mDAI wallet balance is correct after unstaking.'
      );

      // Check the tokenFarm balance after unstaking.
      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        utils.tokens('0'),
        'Staking balance for the investor is correct after unstaking.'
      );
    });
  });
});
