// test file to test database connection 

const {MongoClient} = require('mongodb');

async function main(){
  const uri = "mongodb+srv://GroupUser:cs410project@cluster0.gjnf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  const client = new MongoClient(uri);

  try {
      // Connect to the MongoDB cluster
      await client.connect();

      // Create a character and add it to the database
      await createCharacter(client, {
        name: "Gorgug Thistlespring",
        race: "Half-orc",
        class: "Barbarian",
        level: 8,
        AC: 14,
        HP: 112
      });

  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
}

main().catch(console.error);

async function createCharacter(client, newCharacter) {
  // New character inserted into collection
  const result = await client.db("dnd_screen").collection("character_sheets").insertOne(newCharacter);

  console.log(`New character created with the following id: ${result.insertedId}`);
}

async function listDatabases(client){
  databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};