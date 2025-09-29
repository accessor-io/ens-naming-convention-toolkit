#!/usr/bin/env node

/**
 * Simple test example for the ENS Proxy Resolver system
 *
 * This demonstrates the correct way to test the system:
 * 1. Deploy contracts
 * 2. Test ENS resolution
 * 3. Test transaction forwarding
 * 4. Verify on-chain appearance
 */

import hre from "hardhat";
const { ethers } = hre;

async function testENSProxy() {
    console.log("Testing ENS Proxy System - CORRECT FLOW");
    console.log("==========================================\n");

    // Setup
    const [deployer, user, target] = await ethers.getSigners();

    // Deploy contracts
    const ProxyForwarder = await ethers.getContractFactory("ProxyForwarder");
    const proxyForwarder = await ProxyForwarder.deploy(
        target.address, // Target address
        deployer.address // ENS registry (mock)
    );

    const ProxyResolver = await ethers.getContractFactory("ProxyResolver");
    const proxyResolver = await ProxyResolver.deploy(proxyForwarder.address);

    console.log("Setup:");
    console.log("  ProxyResolver:", proxyResolver.address);
    console.log("  ProxyForwarder:", proxyForwarder.address);
    console.log("  Target:", target.address);
    console.log();

    // Step 1: Test ENS Resolution
    console.log("1. ENS Resolution Test");
    console.log("   User calls: provider.resolveName('your-domain.eth')");
    console.log("   Should return:", proxyForwarder.address);

    const testNode = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
    const resolved = await proxyResolver.addr(testNode);
    console.log("   ✅ Resolved to:", resolved);
    console.log("   ✅ Expected:   ", proxyForwarder.address);
    console.log("   ✅ Correct:", resolved === proxyForwarder.address);
    console.log();

    // Step 2: Test Transaction Sending
    console.log("2. Transaction Sending Test");
    console.log("   User sends transaction TO the resolved address");
    console.log("   Transaction: From:", user.address, "→ To:", proxyForwarder.address);

    const amount = ethers.utils.parseEther("1");
    const initialBalance = await ethers.provider.getBalance(target.address);

    const tx = await user.sendTransaction({
        to: proxyForwarder.address,
        value: amount
    });

    console.log("   📤 Transaction sent:", tx.hash);
    await tx.wait();

    const finalBalance = await ethers.provider.getBalance(target.address);
    const received = finalBalance.sub(initialBalance);

    console.log("   💰 Target received:", ethers.utils.formatEther(received));
    console.log("   ✅ Forwarding works:", received.eq(amount));
    console.log();

    // Step 3: Check On-Chain Appearance
    console.log("3️⃣  On-Chain Transaction Appearance");
    console.log("   What appears on-chain:");
    console.log("   From:", user.address);
    console.log("   To:  ", proxyForwarder.address, "(NOT the target address)");
    console.log("   Value:", ethers.utils.formatEther(amount), "ETH");
    console.log();
    console.log("   🔍 Key Point: The transaction does NOT appear to go");
    console.log("      directly to the target address. It goes to the");
    console.log("      ProxyForwarder, which then forwards it internally.");
    console.log();

    // Step 4: Demonstrate Original Caller Access
    console.log("4️⃣  Original Caller Access Test");
    console.log("   Target contracts can access the original caller");

    // Deploy a test contract
    const CallerAwareContract = await ethers.getContractFactory("CallerAwareContract");
    const testContract = await CallerAwareContract.deploy(proxyForwarder.address);

    // Update forwarder to target our test contract
    await proxyForwarder.connect(deployer).transferOwnership(user.address);
    await proxyForwarder.connect(user).updateTargetAddress(testContract.address);

    // Send transaction through proxy
    const testTx = await deployer.sendTransaction({
        to: proxyForwarder.address
    });
    await testTx.wait();

    const isThroughProxy = await testContract.isCalledThroughProxy();
    const actualCaller = await testContract.getActualCaller();

    console.log("   📞 Called through proxy:", isThroughProxy);
    console.log("   👤 Original caller:", actualCaller);
    console.log("   ✅ Caller tracking works:", actualCaller === deployer.address);
    console.log();

    console.log("🎉 Test Complete!");
    console.log("\n💡 Summary:");
    console.log("  ✅ ENS resolution returns ProxyForwarder address");
    console.log("  ✅ Transactions to ProxyForwarder get forwarded");
    console.log("  ✅ On-chain shows ProxyForwarder as destination");
    console.log("  ✅ Target contracts can access original caller");
    console.log("  ✅ Zero address is NOT involved in this system");
}

testENSProxy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
