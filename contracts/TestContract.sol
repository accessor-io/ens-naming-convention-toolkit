// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TestContract
 * @dev Simple contract for testing forwarded calls
 */
contract TestContract {
    uint256 public testValue;
    address public lastCaller;

    event ValueSet(uint256 value, address caller);

    function testFunction(uint256 value) external {
        testValue = value;
        lastCaller = msg.sender;
        emit ValueSet(value, msg.sender);
    }

    function getLastCaller() external view returns (address) {
        return lastCaller;
    }
}
