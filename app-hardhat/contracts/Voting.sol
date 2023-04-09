// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./VotingFactory.sol";

/**
* Voting is a session to vote for proposals
*/
contract Voting{

    struct Proposal {
        string name;
        uint voteCount;
    }

    struct Voter {
        bool voted;
        uint vote;
    }

    uint public endTime;
    uint public quorum;
    string public title;
    address public chairPerson;
    address public votingFactoryAddress;
    bool public isKYC;

    IVotingFactory private votingFactory;
    Proposal[] private proposals;

    mapping(address => Voter) public voters;

    event VoteReceived(address voter, uint proposal);

    /**
    * Moderators requiers chair person
    */
    modifier onlyChairPerson(){
        require(msg.sender == chairPerson, "Not a chair Person");
        _;
    }

    /**
    * Moderators requiers voting time is not up
    */
    modifier votingNotEnded(){
        require(block.timestamp < endTime, "Voting has ended");
        _;
    }

    /** 
    * Requires basic information about the user. 
    * If it's required KYC - check user's KYC
    */
    modifier isIdentified(address _owner){
        require(votingFactory.getIsIdentified(_owner), "Identity not found");

        if (isKYC) {
            require(votingFactory.getIsKYC(_owner), "Is not KYC'ed");
        }
        _;
    }

    /**
    * Voting constructor
    * Creates voting with parametrs
    * Voting title, proposals list (at least 2, not empty),
    * voting duration, creater is chair person (he can't vote), 
    * quorum, if KYC'd only users
    */
    constructor(
    string memory _title, 
    string[] memory _proposalNames,
    uint _durationMinutes, 
    address _chairPerson,
    uint _quorum,
    bool _isKYC) {
        require(_proposalNames.length >= 2, "At least 2 proposals");
        require(isNotBlank(_title), "Empty title string");
        require(_durationMinutes >= 1 && _durationMinutes <= 43800, 
        "Duration must be from 1 minute to 1 month");

        title = _title;
        quorum = _quorum;
        isKYC = _isKYC;

        chairPerson = _chairPerson;
        voters[chairPerson].voted = true;

        endTime = block.timestamp + _durationMinutes * 1 minutes;

        votingFactoryAddress = msg.sender;
        votingFactory = IVotingFactory(votingFactoryAddress);

        for (uint i = 0; i < _proposalNames.length; i++) {
            require(isNotBlank(_proposalNames[i]), "Empty proposal string");

            proposals.push(Proposal({
                name: _proposalNames[i],
                voteCount: 0
            }));
        }
    }

    /**
    * Internal function
    * Checks if string not empty or with spaces only
    */
    function isNotBlank(string memory _string) private pure returns (bool) {
    bytes memory stringBytes = bytes(_string);
    if (stringBytes.length == 0) {
        return false;
    }
    for (uint i = 0; i < stringBytes.length; i++) {
        if (stringBytes[i] != 0x20) { // 0x20 is space in ASCII
            return true;
        }
    }
    return false;
    }

    /**
    * Vote function 
    * Requires user didn't vote, right proposal
    * And voting time is not up
    */
    function vote(uint proposal) public isIdentified(msg.sender) {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted");
        require(proposal < proposals.length, "Invalid proposal");
        require(block.timestamp < endTime, "Voting has ended");

        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += 1;

        emit VoteReceived(msg.sender, proposal);
    }

    /**
    * Function for changing voting title
    * Requires chair person or moderator and voting time is not up
    */
    function changeTitle(string memory _title) public votingNotEnded{
        require(votingFactory.getIsModerator(msg.sender) || 
            chairPerson == msg.sender, "Not a moderator or chair person");
        require(isNotBlank(_title), "Empty title string");

        title = _title;
    }

    /**
    * Function for changing voting quorum
    * Requires chair person and voting time is not up
    */
    function changeQuorum(uint256 _quorum) 
    public onlyChairPerson votingNotEnded{

        quorum = _quorum;
    }

    /**
    * Function for adding voting time
    * Requires chair person and voting time is not up
    */
    function addDurationTime(uint256 _durationMinutes) 
    public onlyChairPerson votingNotEnded{
        require(_durationMinutes >= 1 && _durationMinutes <= 10080, 
        "Addition duration must be from 1 minute to 1 week");

        endTime += _durationMinutes * 1 minutes;
    }

    /**
    * Getter, returns winner score of the voting
    * Requires missing tie, voting time is not up, enough quorum
    */
    function getWinningProposal() private view returns (uint) {
        uint winningVoteCount = 0;
        uint winningProposalIndex = 0;
        uint _quorum;
        bool hasWinner = false;

        for (uint i = 0; i < proposals.length; i++) {
            _quorum += proposals[i].voteCount;
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalIndex = i;
                hasWinner = true;
            } else if (proposals[i].voteCount == winningVoteCount) {
            hasWinner = false;
            }
        }
        
        require(_quorum >= quorum, "Voting faild. Not enough quorom");
        require(hasWinner, "The vote ended in a tie");

        return winningProposalIndex;
    }

    /**
    * Getter, gets count of proposals
    */
    function getProposalsCount() public view returns(uint) {
        return proposals.length;
    }

    /**
    * Getter, gets array of proposal names
    */
    function getProposalsNames() public view returns(string[] memory) {
        string[] memory names = new string[](proposals.length);

        for (uint i; i < proposals.length; i++) {
            names[i] = proposals[i].name;
        }

        return names;
    }

    /**
    * Getter, gets array of proposal votes
    */
    function getProposalsVotes() public view returns(uint[] memory) {
        uint[] memory votes = new uint[](proposals.length);

        for (uint i; i < proposals.length; i++) {
            votes[i] = proposals[i].voteCount;
        }

        return votes;
    }

    /**
    * Getter, returns winner name of the voting
    * Using getWinningProposal function
    */
    function getWinnerName() public view returns (string memory)
    {
        require(block.timestamp >= endTime, "Voting has not ended yet");

        return proposals[getWinningProposal()].name;
    }

    /**
    * Getter, gets array of proposals and score
    */
    function getProposals() public view 
    returns (Proposal[] memory){

        return proposals;
    }
}