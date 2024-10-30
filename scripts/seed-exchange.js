const config=require('../src/config.json')
const { ethers } = require("hardhat");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(),'ether')
}

const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

async function main() {
    const accounts = await ethers.getSigners()   

    const { chainId } = await ethers.provider.getNetwork()
    console.log("using chainId:",chainId);
    


    const Dapp = await ethers.getContractAt('Token', config[chainId].DApp.address)
    console.log(`Dapp Token fetched :${Dapp.address}`);

    const mEth = await ethers.getContractAt('Token', config[chainId].mETH.address)
    console.log(`mEth Token fetched :${mEth.address}`); 

    const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
    console.log(`mDAI Token fetched :${mDAI.address}`);

    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
    console.log(`Exchange fetched :${exchange.address}`);

    const sender = accounts[0];
    const reciever = accounts[1];
    let amount = tokens(10000);

    let transaction, result
    transaction = await mEth.connect(sender).transfer(reciever.address, amount)
    
    console.log(`Transferred ${amount} tokens from ${sender.address} to ${reciever.address}\n`);
    

    const user1 = accounts[0]
    const user2 = accounts[1]
    amount = tokens(10000)
    
    transaction = await Dapp.connect(user1).approve(exchange.address, amount);
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user1.address}\n`)

    transaction = await exchange.connect(user1).depositToken(Dapp.address, amount);
    await transaction.wait()
    console.log(`Deposited ${amount} Ether from ${user1.address}\n`)

    transaction = await mEth.connect(user2).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user2.address}`);

    transaction = await exchange.connect(user2).depositToken(mEth.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount}tokens from ${user2.address}\n`)
    
    let orderId;
    transaction = await exchange.connect(user1).makeOrder(mEth.address, tokens(50), Dapp.address, tokens(15));
result = await transaction.wait();
console.log(`Made order from ${user1.address}`);

    orderId = result.events[0].args.id; 
    transaction = await exchange.connect(user1).cancelOrder(orderId);
    result = await transaction.wait();
    console.log(`Cancelled order from ${user1.address}\n`);


  // Wait 1 second
  await wait(1)

  /////////////////////////////////////////////////////////////
  // Seed Filled Orders
  //

  // User 1 makes order
  transaction = await exchange.connect(user1).makeOrder(mEth.address, tokens(100), Dapp.address, tokens(10))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // User 2 fills order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  // User 1 makes another order
  transaction = await exchange.makeOrder(mEth.address, tokens(50), Dapp.address, tokens(15))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // User 2 fills another order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  // User 1 makes final order
  transaction = await exchange.connect(user1).makeOrder(mEth.address, tokens(200), Dapp.address, tokens(20))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // User 2 fills final order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  /////////////////////////////////////////////////////////////
  // Seed Open Orders
  //

  // User 1 makes 10 orders
  for(let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user1).makeOrder(mEth.address, tokens(10 * i), Dapp.address, tokens(10))
    result = await transaction.wait()

    console.log(`Made order from ${user1.address}`)

    // Wait 1 second
    await wait(1)
  }

  // User 2 makes 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user2).makeOrder(Dapp.address, tokens(10), mEth.address, tokens(10 * i))
    result = await transaction.wait()

    console.log(`Made order from ${user2.address}`)

    // Wait 1 second
    await wait(1)
  }

}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })