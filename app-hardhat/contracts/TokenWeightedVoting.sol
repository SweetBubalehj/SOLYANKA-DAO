// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ISBToken.sol";
import "./IToken.sol";
import "./IVotingFactory.sol";

/**
 * Voting is a session to vote for proposals
 */
contract TokenWeightedVoting is ReentrancyGuard {
    address public votingFactoryAddress;
    address public sbtAddress;

    uint public endTime;
    string public title;

    IToken private solyankaToken;
    Proposal[] private proposals;

    struct Proposal {
        string name;
        uint voteCount;
    }

    struct Voter {
        uint tokenVoteWeight;
        uint choice;
        bool voted;
        bool claimed;
    }

    event VoteReceived(address voter, uint proposal);

    mapping(address => Voter) public addressToVoter;

    /**
     * Moderators requiers voting time is not up
     */
    modifier votingNotEnded() {
        require(block.timestamp < endTime, "Voting has ended");
        _;
    }

    /**
     * Requires basic information about the user.
     * If it's required KYC - check user's KYC
     */
    modifier isIdentified(address _owner) {
        require(
            ISBToken(sbtAddress).checkIdentity(_owner),
            "Identity not found"
        );
        require(ISBToken(sbtAddress).checkKYC(_owner), "Is not KYC'ed");
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
        address _tokenAddress
    ) {
        require(address(_tokenAddress) != address(0), "Token address(0)");
        require(isNotBlank(_title), "Empty string");
        require(_proposalNames.length >= 2, "At least 2 proposals");
        require(
            _durationMinutes >= 60 && _durationMinutes <= 43800,
            "Duration from 1 hour to 1 month"
        );

        solyankaToken = IToken(_tokenAddress);

        endTime = block.timestamp + _durationMinutes * 1 minutes;

        votingFactoryAddress = msg.sender;
        sbtAddress = IVotingFactory(votingFactoryAddress).getSBTAddress();

        for (uint i = 0; i < _proposalNames.length; i++) {
            require(isNotBlank(_proposalNames[i]), "Empty proposal string");

            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0}));
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
            if (stringBytes[i] != 0x20) {
                // 0x20 is space in ASCII
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
    function vote(
        uint voteWeight,
        uint proposal
    ) public nonReentrant votingNotEnded isIdentified(msg.sender) {
        Voter storage _user = addressToVoter[msg.sender];

        require(
            voteWeight > 0 &&
                voteWeight <= 10000 * 10 ** solyankaToken.decimals(), // <= bug was here
            "Vote weigth should be correct"
        );
        require(
            solyankaToken.balanceOf(msg.sender) >= voteWeight,
            "Insufficient Balance"
        );
        require(!_user.voted, "Already voted");
        require(proposal < proposals.length, "Invalid proposal");

        solyankaToken.transferFrom(msg.sender, address(this), voteWeight);

        _user.voted = true;
        _user.choice = proposal;
        _user.tokenVoteWeight = voteWeight;

        proposals[proposal].voteCount += voteWeight;

        emit VoteReceived(msg.sender, proposal);
    }

    function claimTokens() public nonReentrant returns (bool) {
        Voter storage _user = addressToVoter[msg.sender];

        require(_user.voted, "You are not participated");
        require(!_user.claimed, "Already claimed");

        uint256 totalTokens = _user.tokenVoteWeight;

        _user.claimed = true;
        solyankaToken.transfer(msg.sender, totalTokens);

        return true;
    }

    /**
     * Function for changing voting title
     * Requires chair person or moderator and voting time is not up
     */
    function changeTitle(string memory _title) public votingNotEnded {
        require(isNotBlank(_title), "Empty title string");

        title = _title;
    }

    /**
     * Function for changing voting title for moderator
     * Requires moderator and voting time is not up
     */
    function moderateTitle(string memory _title) public {
        require(
            ISBToken(sbtAddress).getRole(msg.sender) > 0,
            "Not a moderator"
        );
        require(isNotBlank(_title), "Empty title string");

        title = _title;
    }

    /**
     * Getter, returns winner score of the voting
     * Requires missing tie, voting time is not up, enough quorum
     */
    function getWinningProposal() private view returns (uint) {
        uint winningVoteCount = 0;
        uint winningProposalIndex = 0;
        bool hasWinner = false;

        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalIndex = i;
                hasWinner = true;
            } else if (proposals[i].voteCount == winningVoteCount) {
                hasWinner = false;
            }
        }

        require(hasWinner, "The vote ended in a tie");

        return winningProposalIndex;
    }

    /**
     * Getter, gets count of proposals
     */
    function getProposalsCount() public view returns (uint) {
        return proposals.length;
    }

    /**
     * Getter, gets array of proposal names
     */
    function getProposalsNames() public view returns (string[] memory) {
        string[] memory names = new string[](proposals.length);

        for (uint i; i < proposals.length; i++) {
            names[i] = proposals[i].name;
        }

        return names;
    }

    /**
     * Getter, gets array of proposal votes
     */
    function getProposalsVotes() public view returns (uint[] memory) {
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
    function getWinnerName() public view returns (string memory) {
        require(block.timestamp >= endTime, "Voting has not ended yet");

        return proposals[getWinningProposal()].name;
    }

    /**
     * Getter, gets array of proposals and score
     */
    function getProposals() public view returns (Proposal[] memory) {
        return proposals;
    }
}
