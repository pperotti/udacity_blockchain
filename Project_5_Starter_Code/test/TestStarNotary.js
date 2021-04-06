const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    let symbol = "TRS";
    await instance.createStar('Awesome Star!', symbol, tokenId, {from: accounts[0]});
    let expectedStarName = (await instance.tokenIdToStarInfo.call(tokenId)).name;
    assert.equal(expectedStarName, 'Awesome Star!');
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    let symbol = "TRS";
    await instance.createStar('awesome star', symbol, starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    let symbol = "TRS";
    await instance.createStar('awesome star', symbol, starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    let symbol = "TRS";
    await instance.createStar('awesome star', symbol, starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    let symbol = "TRS";
    await instance.createStar('awesome star', symbol, starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let user1 = accounts[1];
    let instance = await StarNotary.deployed();
    let starId = "123";
    let starName = "Test Star";
    let starSymbol = "TSR";
    await instance.createStar(starName, starSymbol, starId, {from: user1});

    // 2. Call your method lookUptokenIdToStarInfo
    let actualName = await instance.lookUptokenIdToStarInfo(starId);

    // 3. Verify if you Star name is the same
    assert.equal(actualName, "Test Star");
});

// Implement Task 2 Add supporting unit tests
it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    let user1 = accounts[1];
    let instance = await StarNotary.deployed();
    let starId = "456";
    let starName = "Test Star 456";
    let starSymbol = "TSR456";
    await instance.createStar(starName, starSymbol, starId, {from: user1});

    // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    //let s1 = instance.tokenIdToStarInfo[starId];
    let s2 = await instance.tokenIdToStarInfo.call(starId);
    assert.equal("Test Star 456", s2.name);
    assert.equal("TSR456", s2.symbol);
});


it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let user0 = accounts[0];
    let user1 = accounts[1];
    let instance = await StarNotary.deployed();
    let starId = Math.floor(Math.random() * 1000); //567;
    let starName = "Test Star " + starId;
    let starSymbol = "TSR" + starId;
    await instance.createStar(starName, starSymbol, starId, {from: user0});

    //let originalOwner = await instance.ownerOf.call(starId);
    let star = await instance.tokenIdToStarInfo.call(starId);
    
    for(var i=0; i<10 ;i++) {
        console.log("User: " + i + " Address:" + accounts[i] + " Balance: " + (await instance.balanceOf.call(accounts[i])));
    }
    console.log("\n\n");

    let owner = (await instance.ownerOf.call(starId))
    let sender = (await instance.getSender.call())

    console.log("Star Name: " + star.name + " Symbol: " + star.symbol);
    console.log("Original Owner: " + owner);
    console.log("Sender: " + sender);
    console.log("Owner == Sender: " + (owner == sender));
    console.log("Destinatary: " + user1);

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user1, starId);

    //console.log("Get Owner - " + await instance.getOwn(starId));
    let newOwner = await instance.ownerOf.call(starId);
    console.log("New Owner - " + newOwner);

    // 3. Verify the star owner changed.
    assert.equal(user0, owner);
    assert.equal(user1, newOwner);
});

it('lets 2 users exchange stars', async() => {
    let user0 = accounts[0];
    let user1 = accounts[1];
    //let user2 = accounts[2];
    let instance = await StarNotary.deployed();
     
    //Star 1
    let starId1 = Math.floor(Math.random() * 1000);
    let starName1 = "Test Star " + starId1;
    let starSymbol1 = "TSR" + starId1;
    
    //Star 2
    let starId2 = Math.floor(Math.random() * 1000);
    let starName2 = "Test Star " + starId2;
    let starSymbol2 = "TSR" + starId2;
    
    console.log("------------------------");
    console.log("Test: Exchange Stars");

    for(var i=0; i<10 ;i++) {
        console.log("User: " + i + " Address:" + accounts[i] + " Balance: " + (await instance.balanceOf.call(accounts[i])));
    }
    console.log("\n\n");

    // 1. create 2 Stars with different tokenId
    await instance.createStar(starName1, starSymbol1, starId1, {from: user0});
    await instance.createStar(starName2, starSymbol2, starId2, {from: user1});

    let star1 = await instance.tokenIdToStarInfo.call(starId1);
    let star2 = await instance.tokenIdToStarInfo.call(starId2);
    let owner1 = await instance.ownerOf.call(starId1);
    let owner2 = await instance.ownerOf.call(starId2);

    console.log("Star 1: " + star1.name + " Symbol 1: " + star1.symbol + " owner 1: " + owner1);
    console.log("Star 2: " + star2.name + " Symbol 2: " + star2.symbol + " owner 2: " + owner2);
    console.log("------------------------");

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars.call(starId1, starId2);

    // 3. Verify that the owners changed
    let owner1AfterExchange = await instance.ownerOf.call(starId1);
    let owner2AfterExchange = await instance.ownerOf.call(starId2);

    assert.equal(owner1, owner2AfterExchange);
    assert.equal(owner2, owner1AfterExchange);
    console.log("------------------------");
});

