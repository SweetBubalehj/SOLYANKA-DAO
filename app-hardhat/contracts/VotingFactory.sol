// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./Voting.sol";

interface IVotingFactory{

    function getIsIdentified(address _owner) external returns (bool);

    function getIsKYC(address _owner) external returns (bool);
    
    function getIsModerator(address _owner) external  returns (bool);
}

/**
* VotingFactory is a factory to create Votings
* Allows user to update their basic info
*/
contract VotingFactory {
    
    /** 
    * Addresses array of created votings
    */
    address[] private deployedVotings;

    
    /**
    * if KYC = false it's not authorizated user;
    * if KYC = true it's authorizated user;
    *
    * if roleWeight = 0 it's user; 
    * if roleWeight = 1 it's moderator; 
    * if roleWeight = 2 it's admin;
    */
    struct Identity {
        string name;
        string email;
        uint age;
        bool KYC;
        uint roleWeight;
        address owner;
    }

    mapping (address => Identity) private identities;

    /**
    * Mapping to have a copy of Votings
    */
    mapping (address => Voting) private votings;

    /**
    * Moderators modifier
    * Moderators can add/remove users to/from KYC
    */
    modifier isModerator(){
        require(identities[msg.sender].roleWeight > 0, "Not a Moderator!");
        _;
    }

    /**
    * Admin modifier
    * Admin can add/remove moderators and users to/from KYC
    */
    modifier isAdmin(){
        require(identities[msg.sender].roleWeight == 2, "Not an Admin!");
        _;
    }

    /**
    * Identification modifier
    * Requires basic information about the user (name, email, age)
    * Indentified user can vote and create votings
    */
    modifier isIdentified(address _owner){
        require(identities[_owner].owner != address(0), "Identity not found");
        _;
    }

    event VotingsDeployed(string indexed _title, address indexed _chairPerson, address _votingAddress);

    /**
    * Contructor creates admin
    * Contract creator creates profile with Admin role
    * Adds it to KYC
    */
    constructor(
    string memory adminName, 
    string memory adminEmail, 
    uint adminAge){
        createIdentity(adminName, adminEmail, adminAge);

        identities[msg.sender].KYC = true;
        identities[msg.sender].roleWeight = 2;
    }

    /**
    * Function for creating voting
    * Requires KYC for only KYC'd users voting
    * Voting time from 1 minute to 1 month
    */
    function createVoting(string memory title, 
    string[] memory proposalNames,
    uint durationMinutes, 
    uint quorom,
    bool isKYC) 
    public isIdentified(msg.sender)
    returns (address) {
        if(identities[msg.sender].KYC == false && isKYC == true){
            revert("Only KYC'ed users can create KYC votings");
        }

        Voting newVoting = new Voting(title, proposalNames, durationMinutes, msg.sender, quorom, isKYC);

        address newVotingAddress = address(newVoting);
        deployedVotings.push(newVotingAddress);
        votings[newVotingAddress] = newVoting;

        emit VotingsDeployed(title, msg.sender, newVotingAddress);

        return newVotingAddress;
    }

    /**
    * Identity creator, registration
    * Allows user to create their info
    * (name, email, age)
    * GP-13
    */
    function createIdentity(
    string memory _name, 
    string memory _email, 
    uint _age) public {
        require(identities[msg.sender].owner == address(0), "Identity already exists");
        require(_age >= 13, "PG-13");

        Identity memory newIdentity = Identity(_name, _email, _age, false, 0, msg.sender);
        identities[msg.sender] = newIdentity;
    }

    /**
    * Identity updater
    * Allows user to change their info
    * (name, email, age)
    * GP-13
    */
    function updateIdentity(
    string memory _name, 
    string memory _email, 
    uint _age) public isIdentified(msg.sender) {
        require(_age >= 13, "PG-13");

        Identity storage identity = identities[msg.sender];

        identity.name = _name;
        identity.email = _email;
        identity.age = _age;
    }
    
    /**
    * Getter, return addresses array of created votings
    */
    function getDeployedVotings() public view returns (address[] memory) {
        return deployedVotings;
    }

    /**
    * Getter, returns user's identification info 
    * (name, email, age, KYC, roleWeight)
    */
    function getIdentityInfo(address _owner) 
    public view 
    isIdentified(_owner) 
    returns (
        string memory, 
        string memory, 
        uint, 
        bool,
        uint)  {
        Identity memory identity = identities[_owner];

        return (identity.name, identity.email, identity.age, identity.KYC, identity.roleWeight);
    }
    
    /**
    * Getter, returns true/false of identification
    * If user created profile (registered) return true, else false
    */
    function getIsIdentified(address _owner) 
    public view returns (bool) {
        if(identities[_owner].owner != address(0)) {
            return true;
        } else {
            return false;
        }
    }

    /**
    * Getter, returns true/false of authorization
    * If user authorizated return true, else false
    */
    function getIsKYC(address _owner)
    public view returns (bool) {
        if(identities[_owner].KYC == true) {
            return true;
        } else {
            return false;
        }
    }

    /**
    * Getter, returns true/false of moderation
    * If user is moderator return true, else false
    */
    function getIsModerator(address _owner)
    public view returns (bool) {
        if(identities[_owner].roleWeight > 0) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
    * Getter, returns winner of voting session
    */
    function getVotiongWinnerName(address votingAddress) public view returns (string memory) {
        Voting voting = votings[votingAddress];

        return voting.getWinnerName();
    }
    
    /**
    * Only moderators and admin can add to KYC
    * Adding adding to KYC requires user's identification
    */
    function addToKYC(address user) public isModerator isIdentified(user){
        identities[user].KYC = true;
    }

    /**
    * Only moderators and admin can remove from KYC
    */
    function removeFromKYC(address user) public isModerator{
        identities[user].KYC = false;
    }

    /**
    * Only admin can add moderators
    * Adding moderator requires user's identification
    */
    function addModerator(address user) public isAdmin isIdentified(user){
        require(identities[user].roleWeight < 1, "Already has role");
        identities[user].roleWeight = 1;
    }

    /**
    * Only admin can remove moderators
    */
    function removeModerator(address user) public isAdmin{
        require(identities[user].roleWeight != 2, "Admin can't be deleted");
        identities[user].roleWeight = 0;
    }
}