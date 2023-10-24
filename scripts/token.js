const fs = require("fs");
const colors = require("colors");
const { ethers } = require("hardhat");
async function main() {
  let [owner] = await ethers.getSigners();
  console.log("owner address", owner.address);
  let network = await owner.provider._networkPromise;

  const ERC20TOKEN = await ethers.getContractFactory("ERC20");
  hirokiToken = await ERC20TOKEN.deploy("Token1", "T1");
  await hirokiToken.deployed();

  console.log("token address", hirokiToken.address);
}

main()
  .then(() => {
    console.log("complete".green);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
