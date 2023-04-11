// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const constructorArguments = ["Bubaleh", "...@gmail.com", 21];
  const VotingFactory = await hre.ethers.getContractFactory("VotingFactory");
  const contract = await VotingFactory.deploy(
    constructorArguments[0],
    constructorArguments[1],
    constructorArguments[2]
  );

  await contract.deployed();

  console.log(`Contract deployed to ${contarct.address}`);
  if (network.config.chainId === 97) {
    contract.deployTransaction.wait(15);
    verify(contarct.address, [constructorArguments]);
  }
}

async function verify(contractAddress, arguments) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [arguments],
    });
  } catch (e) {
    if (e.message.toLowerCase.includes("already verified")) {
      console.log("The contract already verified.");
    } else {
      console.log(e);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
