import { JsonRpcProvider, Contract, Wallet, parseEther } from "ethers";
import { promises as fs } from 'fs';
import { configDotenv } from "dotenv";
configDotenv();
async function loadABI() {
    const data = await fs.readFile('./abi.json', 'utf-8');
    return JSON.parse(data);
}
async function loadTokenABI() {
    const data = await fs.readFile('./tokenABI.json', 'utf-8');
    return JSON.parse(data);
}
const contractABI = await loadABI();
const tokenABI = await loadTokenABI();
const tokenAddress = '0xDDf7d080C82b8048BAAe54e376a3406572429b4e';//token
const agentAddress = '0x89DF18047398F909207057cF1Ab53Ce4dfA5A884';//AgentAddress
const provider = new JsonRpcProvider('https://1rpc.io/scroll');
const signer = new Wallet(process.env.PRIVATE_KEY, provider);
const tokenContract = new Contract(tokenAddress, tokenABI, signer);
const agentContract = new Contract(agentAddress, contractABI, signer);

try {
    const tokenAmount = 250000 * 1e18;
    const approveTx = await tokenContract.approve(agentAddress, BigInt(tokenAmount));
    console.log("Approve Transaction sent! Hash:", approveTx.hash);
    await approveTx.wait();
    console.log("approve transaction success")
} catch (err) {
    console.log("approve failed: ", err);
}

try {
    const params = "0x01ffe1dfff1e01001e20000b66c99F4fF34311F078aaA40346B04f3aD726Da61001e40001e44a9059cbb000bb05cf01231cf2ff99499682e64d3780d57c80fdd0015d3c21bcecceda1001e";
    const dParams = {
        hToken: "0xcD76d2947F55baD0bEBCe536a8b3dA7a864260c4",//local Address
        token: "0xDDf7d080C82b8048BAAe54e376a3406572429b4e",//underlying Address
        amount: "250000000000000000000000",
        deposit: "250000000000000000000000"
    };
    const gParams = {
        gasLimit: "500000",
        remoteBranchExecutionGas: "100000000000000"
    };
    const hasFallbackToggled = true;
    const depositTx = await agentContract.callOutSignedAndBridge(
        params, dParams, gParams, hasFallbackToggled, {value: parseEther("0.01")}
    );
    console.log("Deposit Transaction sent! Hash:", depositTx.hash);
    await depositTx.wait();
} catch (err) {
    console.log("deposit transaction failed: ", err);
}


