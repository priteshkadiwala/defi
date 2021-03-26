// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

// Import Contracts
import "./DaiToken.sol";
import "./DappToken.sol";
import "./Ownable.sol";

/// @title A contract for a token yeild farm
/// @author Pritesh Kadiwala
/// @notice For now, this contract takes in a Mock DAI
///         and the investor yeilds a DApp Token by farming.
contract TokenFarm is Ownable {
    // Initialize state variable.
    // name variable to set the name for the contract.
    // dappToken is going to reference the DappToken contract address.
    // daiToken is going to reference the DaiToken contract address.
    // stakingBalance is going to keep track of the amount staked by a user.
    // hasStaked will keep track of whether the user has already staked.
    // isStaking will keep track of whether the user is currently staking.
    // stakers will keep track of the users who have staked.
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;
    address[] public stakers;

    /// @notice The constructor will run once when the contract is deployed.
    ///         It is to initialize the Dapp and Dai token instances.
    /// @param _dappToken DappToken instance.
    /// @param _daiToken DaiToken instance.
    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
    }

    /// @notice This function will let investor stake their DAI tokens to the contract.
    /// @param _amount The total amount transferred by the investor.
    function stakeTokens(uint256 _amount) public {
        // The amount staked needs to be greater than 0.
        require(_amount > 0, "Amount cannot be 0.");

        // Tranfer Mock Dai tokens to this contract for staking.
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance for the user
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add user to stakers array *only* if they haven't staked already.
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update the user's staking status.
        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }

    /// @notice This function will reward DApp tokens to the investors for staking mDAI tokens.
    /// @dev Only the owner of tokenFarm contract can call this function.
    function issueTokens() public onlyOwner {
        for (uint256 i = 0; i < stakers.length; i++) {
            // Only issue tokens if the investor has a stake.
            if (stakingBalance[stakers[i]] > 0) {
                // Transfer ratio is 1-1.
                // So for every mDAI token staked, this contract
                // will issue the same amount of DApp tokens.
                dappToken.transfer(stakers[i], stakingBalance[stakers[i]]);
            }
        }
    }

    /// @notice The investor can withdraw their mDAI tokens through unstaking them.
    function unstakeToken() public {
        // Fetch the staking balance of the investor
        uint256 balance = stakingBalance[msg.sender];
        // Check if the balance is greater than 0.
        require(balance > 0, "Staking balance cannot be 0");
        // Transfer mDAI tokens to the investor
        daiToken.transfer(msg.sender, balance);
        // Reset the staking balance of the investor
        stakingBalance[msg.sender] = 0;
        // Update the staking status of the investor
        isStaking[msg.sender] = false;
    }
}
