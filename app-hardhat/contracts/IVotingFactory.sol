// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IVotingFactory {
    function getIsIdentified(address _owner) external returns (bool);

    function getIsKYC(address _owner) external returns (bool);

    function getIsModerator(address _owner) external returns (bool);
}
