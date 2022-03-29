// run.js
async function main() {

    // あなたのコレクションの Base Token URI（JSON の CID）に差し替えてください
	// 注: 十分な NFT を確保するために、下記のサンプル Token URI を使用しても問題ありません。
    const baseTokenURI = "ipfs://QmdJwhJ5nxsKzMPDcipFuAeZCVQm6kZyVTvFQPerdacTug/";

    // オーナー/デプロイヤーのウォレットアドレスを取得する
    const [owner] = await hre.ethers.getSigners();

    // デプロイしたいコントラクトを取得
    const contractFactory = await hre.ethers.getContractFactory("NFTCollectible");

    // 正しいコンストラクタ引数（baseTokenURI）でコントラクトをデプロイします。
    const contract = await contractFactory.deploy(baseTokenURI);

    // このトランザクションがマイナーに承認（mine）されるのを待つ
    await contract.deployed();

    // コントラクトアドレスをターミナルに出力
    console.log("Contract deployed to:", contract.address);

    // NFTを 10 点、コントラウト所有者のためにキープする
    let txn = await contract.reserveNFTs();
    await txn.wait();
    console.log("10 NFTs have been reserved");

    // 0.03 ETH を送信して3つ NFT を mint する
    txn = await contract.mintNFTs(3, { value: hre.ethers.utils.parseEther('0.03') });
    await txn.wait()

    // コントラクト所有者の保有するtokenIdsを取得
    let tokens = await contract.tokenOfOwner(owner.address);
    console.log("Owner has token: ", tokens);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });const { utils } = require("ethers");