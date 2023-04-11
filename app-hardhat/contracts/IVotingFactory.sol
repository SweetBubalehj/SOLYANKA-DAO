// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

interface IVotingFactory {
    function getIsIdentified(address _owner) external returns (bool);

    function getIsKYC(address _owner) external returns (bool);

    function getIsModerator(address _owner) external returns (bool);
}
