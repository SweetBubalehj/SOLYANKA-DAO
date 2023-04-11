// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "contracts/IVotingFactory.sol";

interface IToken {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (uint256);
}

/**
 * Voting is a session to vote for proposals
 */
contract TokenWeightedVoting is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint public endTime;
    string public title;
    string private baseURI;

    IToken private solyankaToken;
    IVotingFactory private votingFactory;
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
        require(votingFactory.getIsIdentified(_owner), "Identity not found");
        require(votingFactory.getIsKYC(_owner), "Is not KYC'ed");
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
        address _tokenAddress,
        string memory nftName,
        string memory nftSymbol,
        string memory __baseURI
    ) ERC721(nftName, nftSymbol) {
        require(
            address(_tokenAddress) != address(0),
            "Token Address cannot be address 0"
        );
        require(
            isNotBlank(_title) && isNotBlank(nftName) && isNotBlank(nftSymbol),
            "Empty string"
        );
        require(_proposalNames.length >= 2, "At least 2 proposals");
        require(
            _durationMinutes >= 60 && _durationMinutes <= 43800,
            "Duration from 1 hour to 1 month"
        );

        solyankaToken = IToken(_tokenAddress);
        title = _title;
        baseURI = __baseURI;

        endTime = block.timestamp + _durationMinutes * 1 minutes;

        votingFactory = IVotingFactory(msg.sender);

        for (uint i = 0; i < _proposalNames.length; i++) {
            require(isNotBlank(_proposalNames[i]), "Empty proposal string");

            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0}));
        }
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireMinted(tokenId);
        return
            bytes(_baseURI()).length > 0
                ? string(
                    abi.encodePacked(_baseURI(), tokenId.toString(), ".json")
                )
                : "";
    }

    function changeBaseURI(string memory _newBaseURI) public {
        require(votingFactory.getIsModerator(msg.sender), "Not a moderator");
        baseURI = _newBaseURI;
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
            voteWeight > 0 && voteWeight < 10000,
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
        _safeMint(msg.sender, totalSupply());

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
        require(votingFactory.getIsModerator(msg.sender), "Not a moderator");
        require(isNotBlank(_title), "Empty title string");

        title = _title;
    }

    /**
     * Function for adding voting time
     * Requires chair person and voting time is not up
     */
    function addDurationTime(uint256 _durationMinutes) public votingNotEnded {
        require(
            _durationMinutes >= 1 && _durationMinutes <= 10080,
            "Addition duration must be from 1 minute to 1 week"
        );

        endTime += _durationMinutes * 1 minutes;
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
