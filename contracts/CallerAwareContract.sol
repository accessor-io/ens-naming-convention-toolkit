// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CallerAwareContract
 * @dev Example contract that demonstrates how to access original caller information
 * @notice This contract shows how contracts can detect when they're being called through the proxy
 */
contract CallerAwareContract {

    // Events
    event DirectCall(address caller, bytes data);
    event ProxiedCall(address actualCaller, address proxy, bytes data);

    // State variables
    address public proxyForwarderAddress;

    constructor(address _proxyForwarder) {
        proxyForwarderAddress = _proxyForwarder;
    }

    /**
     * @dev Fallback function that handles all calls
     */
    fallback() external payable {
        _handleCall(msg.data);
    }

    /**
     * @dev Receive function for plain ether transfers
     */
    receive() external payable {
        _handleCall("");
    }

    /**
     * @dev Internal function to handle calls and detect proxy usage
     * @param data The call data
     */
    function _handleCall(bytes memory data) internal {
        address actualCaller = msg.sender;

        // Check if this is being called through our proxy forwarder
        if (actualCaller == proxyForwarderAddress) {
            // This is a proxied call - get the original caller
            address originalCaller = _getOriginalCaller();

            emit ProxiedCall(originalCaller, actualCaller, data);

            // Apply special logic for proxied calls
            _handleProxiedCall(originalCaller, data);
        } else {
            // This is a direct call
            emit DirectCall(actualCaller, data);

            // Apply normal logic for direct calls
            _handleDirectCall(actualCaller, data);
        }
    }

    /**
     * @dev Get the original caller from the proxy forwarder
     * @return The original caller address
     */
    function _getOriginalCaller() internal view returns (address) {
        // Try to call the proxy forwarder to get original caller
        // This uses a low-level staticcall to avoid state changes
        (bool success, bytes memory result) = proxyForwarderAddress.staticcall(
            abi.encodeWithSignature("getOriginalCaller()")
        );

        if (success && result.length >= 32) {
            return abi.decode(result, (address));
        }

        // Fallback: return msg.sender if we can't get original caller
        return msg.sender;
    }

    /**
     * @dev Handle proxied calls with original caller information
     * @param originalCaller The original caller address
     * @param data The call data
     */
    function _handleProxiedCall(address originalCaller, bytes memory data) internal virtual {
        // Override this function to implement custom logic for proxied calls
        // For example, you could apply different business logic based on the original caller

        if (data.length >= 4) {
            bytes4 selector = bytes4(data[:4]);

            if (selector == 0xa9059cbb) { // transfer(address,uint256)
                // Handle ERC-20 transfer with original caller context
                _handleProxiedTransfer(originalCaller, data);
            } else if (selector == 0x70a08231) { // balanceOf(address)
                // Handle balanceOf query
                _handleProxiedBalanceOf(originalCaller, data);
            }
        }
    }

    /**
     * @dev Handle direct calls
     * @param caller The direct caller address
     * @param data The call data
     */
    function _handleDirectCall(address caller, bytes memory data) internal virtual {
        // Override this function to implement normal direct call logic
        // This is the standard behavior when called directly (not through proxy)
    }

    /**
     * @dev Example handler for proxied ERC-20 transfers
     * @param originalCaller The original caller
     * @param data The transfer data
     */
    function _handleProxiedTransfer(address originalCaller, bytes memory data) internal virtual {
        // Extract transfer parameters
        (address to, uint256 amount) = abi.decode(data[4:], (address, uint256));

        // Apply custom logic based on original caller
        // For example, you could modify the transfer based on the caller's identity
        // or apply different fees/conditions

        // For demonstration, just emit an event
        emit ProxiedCall(originalCaller, msg.sender, data);
    }

    /**
     * @dev Example handler for proxied balanceOf queries
     * @param originalCaller The original caller
     * @param data The balanceOf data
     */
    function _handleProxiedBalanceOf(address originalCaller, bytes memory data) internal virtual {
        // Extract balanceOf parameters
        address account = abi.decode(data[4:], (address));

        // Apply custom logic based on original caller
        // For example, return different balances based on caller permissions
        // or show aggregated data from multiple sources

        // For demonstration, just emit an event
        emit ProxiedCall(originalCaller, msg.sender, data);
    }

    /**
     * @dev Check if currently being called through proxy
     * @return True if called through proxy
     */
    function isCalledThroughProxy() external view returns (bool) {
        return msg.sender == proxyForwarderAddress;
    }

    /**
     * @dev Get the actual caller (either direct or original through proxy)
     * @return The actual caller address
     */
    function getActualCaller() external view returns (address) {
        if (msg.sender == proxyForwarderAddress) {
            // Try to get original caller from proxy
            (bool success, bytes memory result) = proxyForwarderAddress.staticcall(
                abi.encodeWithSignature("getOriginalCaller()")
            );

            if (success && result.length >= 32) {
                return abi.decode(result, (address));
            }
        }

        return msg.sender;
    }
}
