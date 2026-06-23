const crypto = require('crypto');
const { Level } = require('level');
const path = require('path');

// The private key provided by the user
const userPrivateKeyHex = '308204bc020100300d06092a864886f70d0101010500048204a6308204a20201000282010100d5076133fe867b2def83d7de7c4550546bec78d32e53f0d1dccdd1bf9be19e3587808f0aa238db0ecdf24ec9a5c92c0556ce4d813815b28c3c56570dadc251e3060805fcd453be6fdabd52ff9563b7c2abff989370c157efef70febe2aaf407ccbf5266982aebbb2af5adf054b02617f8fdc917dec6ef93b5858a41e00d29c2a762cf2f62364d6b751c0fbbeadef4ac0a099e4f41eb39af57cda90c519827ceab0d11cdfe3ea4095650d9c57b97662bc7a707ee8ba95a890dfdabd7129b74207b015907438072e31f8d4fcec3667ee31f48139f132a93b63f9aa2b7a951a564e38407b79fb12fd033572a9aa9ac69fae07d941adc9788743816e834e7fa3c6c102030100010282010001f98af47f130103d1ea00c6a6221923108ab8c820294a35af61d84801134999ead22da14813dd043796cdc01dbc2e347b772911453a775fc87b8486e82f4fb76859eef79c022a2c5ae2c6939be846d26614d5f5b90ce4018c507d339c5f134036b05d738aff39d6b5e727ff9b41d1a49d7f7c31e69d0dbe77bae2d9ec3d6b2039ddf9681782cbd7d998458ad6ecefc1b6fae87c0ec87ab516c6564ac62e820ac9083d7e0ad2dc205710a522e45484ae9aa08ee0eb8791aa0274a9c8c9f7bc93acd291eb20f676b1b76bb71fe66b510e588ee2a52ecd4338b40124e26624e12271c2efeb39f6f3429d0508789fb860905d2e1f96b89db58ee8f84b99fbda563502818100ee71f21f1e7b8c0ea3c6d79a57630e44d3e73b3747512a257195ae6539db5dfa39e42ab1c61793b0f53275c8ad8dbf76b577a42d79ba0ecedb62a181ab1fa34c4e2c3a13a2230d857824bff0948b9c9594f7d82e43c2ae7077a01ffdfdc9d10e4ae3e8ab4a4c8a338af14afa13f6c826c1243ecf4da3c51b1e326ed68dae8e5502818100e4b667a9f45f59e84c8a4ff7259c23051dd1fd20718314059418b770c6673efb27af07274cbe2178c692ab9e080680f8e0b400d12830346504806f8186727f156fb0b96057cad3554f7f65c5e64a5531bd4735b2d376b313bdf0872abcdd27dc0ba2425f36e307edf22bff5b3eca627b6ee848675b8afd85a72479db4dffeabd02818047d03595bdbe83ee1cd15439fdbbad9e791b99300ae09d0aedeca0bb87f353987b3b06c8c7da6df6cbc248cb09ca3931ed717d16dd24763542c9afceb7d52d7f5bc3e231eb91170f6da1d3d507480cfed800d53109e3665a250d2ad57a4c001487e5a03b86830ad47f3230dca48a9cb95f4e254496238ec79e0e9e672c00b8890281805f1011f66a4457b25e5dfeeed30b1ae33d89d2947199f1f07fa5e659519e08678c0f0c0221bbc55dd5eb90b996cc5d3f14e6bc90330c163b06abfbacf29d14856c6f201e135f92879b0b70d9d8e67c92b801a928330cdb521158b055eb3a611eed16fc4f6718e66ad885c115c3fb8b03930da94a8c9a30d624aadc9b72c834610281802dc36cf10c50d450ab859ca3a17eff791ea9813bfcbb160c28336fa424d11c0d12f1eb370c6b30ae7f1d3ce966151240d46ac6f99530eb3c821bda63ab4feb5a9372a3e07c193b7cf9dd00f6cda16ab78a99ff85743797367b9dab3b145a5fbc083861f538609edf05587e7b03bbd84e7ac90419cdf1e023abc8eff4f71fa18a';

// Helper to convert hex to Buffer
const hexToBuffer = (hex) => Buffer.from(hex, 'hex');

async function main() {
  // Derive public key from the private key
  const privKeyBuffer = hexToBuffer(userPrivateKeyHex);
  
  // Parse private key to PEM format
  const privKeyPem = crypto.createPrivateKey({
    key: privKeyBuffer,
    format: 'der',
    type: 'pkcs8'
  });
  
  // Extract public key
  const pubKeyPem = crypto.createPublicKey(privKeyPem);
  const pubKeyHex = pubKeyPem.export({ format: 'der', type: 'spki' }).toString('hex');
  
  console.log('Derived Public Key hex prefix (100 chars):');
  console.log(pubKeyHex.substring(0, 100));

  const dbPath = path.join(__dirname, 'secure-vault-db');
  const db = new Level(dbPath, { valueEncoding: 'json' });

  for await (const [key, value] of db.iterator({ gte: 'user:', lte: 'user:~' })) {
    const isMatch = value.publicKey === pubKeyHex;
    console.log(`Checking against user "${value.username}":`, isMatch ? 'MATCH! 🎉' : 'NO MATCH');
  }

  await db.close();
}

main().catch(console.error);
