const { Level } = require('level');
const path = require('path');

async function main() {
  const dbPath = path.join(__dirname, 'server', 'secure-vault-db');
  console.log('Opening database at:', dbPath);
  const db = new Level(dbPath, { valueEncoding: 'json' });
  
  console.log('--- USERS ---');
  for await (const [key, value] of db.iterator({ gte: 'user:', lte: 'user:~' })) {
    console.log(key, {
      userId: value.userId,
      username: value.username,
      name: value.name,
      publicKeyLength: value.publicKey?.length,
      publicKeyPrefix: value.publicKey?.substring(0, 100),
      storageId: value.storageId
    });
  }

  console.log('--- FILES ---');
  for await (const [key, value] of db.iterator({ gte: 'filemeta:', lte: 'filemeta:~' })) {
    console.log(key, {
      fileId: value.fileId,
      ownerId: value.ownerId,
      encryptedKeyLength: value.encryptedKey?.length,
      encryptedMetadataLength: value.encryptedMetadata?.length
    });
  }

  await db.close();
}

main().catch(console.error);
