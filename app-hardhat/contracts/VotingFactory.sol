// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./Voting.sol";
import "./TokenWeightedVoting.sol";

/**
 * VotingFactory is a factory to create Votings
 * Allows user to update their basic info
 */

interface ISBT {
    function createSoul (address addrSoul, string calldata _name, uint _age) external;
    function turnKYC(address addrSoul, bool _kyc) external;
    function getRole(address addrSoul) external view returns(uint8);
    function checkKYC(address addrSoul) external view returns(bool);
    function getOwner(address addrSoul) external view returns(address);
}

contract VotingFactory {
    /**
     * Addresses array of created votings
     */
    address[] private deployedVotings;
    address[] private deployedTokenWeightedVotings;

    address public addrContr;

    /**
     * Mapping to have a copy of Votings
     */
    mapping(address => Voting) private votings;

    /**
     * Mapping to have a copy of Token-Weighted Votings
     */
    mapping(address => TokenWeightedVoting) private tokenWeightedVotings;

    /**
     * Moderators modifier
     * Moderators can add/remove users to/from KYC
     */
    modifier isModerator() {
        require(ISBT(addrContr).getRole(msg.sender) > 0, "Not a Moderator!");
        _;
    }

    /**
     * Admin modifier
     * Admin can add/remove moderators and users to/from KYC
     */
    modifier isAdmin() {
        require(ISBT(addrContr).getRole(msg.sender) == 2, "Not an Admin!");
        _;
    }

    /**
     * Identification modifier
     * Requires basic information about the user (name, email, age)
     * Indentified user can vote and create votings
     */
    modifier isIdentified(address _owner) {
        require(ISBT(addrContr).getOwner(msg.sender) != address(0), "Identity not found");
        _;
    }

    event VotingsDeployed(
        string indexed _title,
        address indexed _chairPerson,
        address _votingAddress
    );

    event TokenWeightedVotingDeployed(
        string indexed _title,
        address _votingAddress
    );

    constructor(address _addrContr) {
        addrContr = _addrContr;
    }

    function changeAddrContr(address _addr) public isAdmin() {
        addrContr = _addr;
    }

    /**
     * Function for creating voting
     * Requires KYC for only KYC'd users voting
     * Voting time from 1 hour to 1 month
     */
    function createVoting(
        string memory title,
        string[] memory proposalNames,
        uint durationMinutes,
        uint quorom,
        bool isKYC,
        bool isPrivate
    ) public isIdentified(msg.sender) returns (address) {
        if (ISBT(addrContr).checkKYC(msg.sender) == false && isKYC == true) {
            revert("Only for KYC'ed users");
        }

        Voting newVoting = new Voting(
            title,
            proposalNames,
            durationMinutes,
            msg.sender,
            quorom,
            isKYC,
            isPrivate
        );

        address newVotingAddress = address(newVoting);
        deployedVotings.push(newVotingAddress);
        votings[newVotingAddress] = newVoting;

        emit VotingsDeployed(title, msg.sender, newVotingAddress);

        return newVotingAddress;
    }

    /**
     * Function for creating token-weighted voting
     * Requires moderator or admin
     * Voting time from 1 hour to 1 month
     * Creates NFT colletcion
     * requiers token address
     * At the end of the voting users can get nft
     */
    function createTokenWeightedVoting(
        string memory title,
        string[] memory proposalNames,
        uint durationMinutes,
        address tokenAddress
    ) public isModerator returns (address) {
        TokenWeightedVoting newVoting = new TokenWeightedVoting(
            title,
            proposalNames,
            durationMinutes,
            tokenAddress
        );

        address newVotingAddress = address(newVoting);
        deployedTokenWeightedVotings.push(newVotingAddress);
        tokenWeightedVotings[newVotingAddress] = newVoting;

        emit TokenWeightedVotingDeployed(title, newVotingAddress);

        return newVotingAddress;
    }


    /**
     * Getter, return addresses array of created votings
     */
    function getDeployedVotings() public view returns (address[] memory) {
        return deployedVotings;
    }

    /**
     * Getter, return addresses array of created votings
     */
    function getDeployedTokenWeightedVotings()
        public
        view
        returns (address[] memory)
    {
        return deployedTokenWeightedVotings;
    }


    /**
     * Getter, returns winner of voting session
     */
    function getVotiongWinnerName(
        address votingAddress
    ) public view returns (string memory) {
        Voting voting = votings[votingAddress];

        return voting.getWinnerName();
    }

    /**
     * Getter, returns winner of voting session
     */
    function getTokenWeightedVotingWinnerName(
        address votingAddress
    ) public view returns (string memory) {
        TokenWeightedVoting voting = tokenWeightedVotings[votingAddress];

        return voting.getWinnerName();
    }


}
