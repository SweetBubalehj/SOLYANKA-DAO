// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

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

    function decimals() external view returns (uint8);
}
