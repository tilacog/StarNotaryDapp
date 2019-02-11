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
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
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
    await instance.createStar('awesome star', starId, {from: user1});
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
    await instance.createStar('awesome star', starId, {from: user1});
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
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    let tokenId = 404;
    let instance = await StarNotary.deployed();
    await instance.createStar('TESTING STAR', tokenId, {from: accounts[0]})
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await instance.name.call(), 'TiagoStar')
    assert.equal(await instance.symbol.call(), 'TIS')

});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();

    // 1. create 2 Stars with different tokenId
    let star1TokenId = 500
    let starOwner1 = accounts[5]
    await instance.createStar('first star', star1TokenId, {from: starOwner1})

    let star2TokenId = 302
    let starOwner2 = accounts[6]
    await instance.createStar('second star', star2TokenId, {from: starOwner2})

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(star1TokenId, star2TokenId, {from: starOwner1})

    // 3. Verify that the owners changed
    let finalOwner = await instance.ownerOf.call(star1TokenId);
    assert.equal(finalOwner, starOwner2);

});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let starOwner1 = accounts[3]
    let starOwner2 = accounts[4]
    let starTokenId = 202
    await instance.createStar('test star', starTokenId, {from: starOwner1})

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(starOwner2, starTokenId, {from: starOwner1})

    // 3. Verify the star owner changed.
    let finalOwner = await instance.ownerOf.call(starTokenId);
    assert.equal(finalOwner, starOwner2);
});

it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let starOwner = accounts[9]
    let starTokenId = 42
    let givenStarName = "Luke Starwalker";
    await instance.createStar(givenStarName, starTokenId, {from: starOwner})

    // 2. Call your method lookUptokenIdToStarInfo
    let starName = await instance.lookUptokenIdToStarInfo(starTokenId, {from: starOwner})
    // 3. Verify if you Star name is the same
    assert.equal(starName, givenStarName)
});
