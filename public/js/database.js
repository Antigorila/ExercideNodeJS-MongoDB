var client = null;
var dbName = null;

async function setDatabaseConnectionDatas(Client, DBName)
{
    client = Client;
    dbName = DBName;
}

async function createDb() 
{
    const dbObject = await client.db(dbName);
    console.log(`${dbName} was created successfully.`);
}
  
async function createCollection(collectionName) 
{
    const dbObject = await client.db(dbName);
    const collection = await dbObject.createCollection(collectionName);
    console.log(`${collectionName} was created successfully`);
}
  
async function createDoc(collectionName, doc) 
{
    const dbObject = await client.db(dbName);
    const collection = dbObject.collection(collectionName);
    const result = await collection.insertOne(doc);
    console.log(
      `The new document was created with the following id: ${result.insertedId}`
    );
}
  
async function createDocs(collectionName, docs) 
{
    const dbObject = await client.db(dbName);
    const collection = dbObject.collection(collectionName);
    const result = await collection.insertMany(docs);
    console.log(`The new document was created with the following ids:`);
    console.log(result.insertedIds);
}
  
async function listAll(collectionName) 
{
    const dbObject = await client.db(dbName);
    const collection = dbObject.collection(collectionName);
    const result = await collection.find({}).toArray();
    return result;
}
  
async function findOne(collectionName, key, value) 
{
    const dbObject = await client.db(dbName);
    const collection = dbObject.collection(collectionName);
    const result = await collection.find({ [key]: value }).toArray();
    return result[0];
}
  
//$eq (==), $gt (>), $gte (>=), lt (<), lte  (<=), $ne (!=), $nin (!= with any value (NOT IN)), $in (= with any value (IN))
async function QueryBuilder(collectionName,key,operator,conditionValue)
{
    const dbObject = await client.db(dbName);
    const collection = dbObject.collection(collectionName);
    const result = collection
      .find({ [key]: { [operator]: conditionValue } })
      .toArray();
    return result;
}
  
async function SortBy(collectionName, sortByKey, direction) 
{
    const dbObject = await client.db(dbName);
    const collection = dbObject.collection(collectionName);
    const result = collection
      .find({})
      .sort({ [sortByKey]: direction })
      .toArray();
    return result;
}
  
async function deleteOne(collectionName, key, value) 
{
    const dbObject = await client.db(dbName);
    const collection = dbObject.collection(collectionName);
    const result = await collection.deleteOne({ [key]: value });
    console.log(`${value} was deleted successfully!`);
}

async function deleteMany(collectionName, key, condition, conditionValue) 
{
    const dbObject = await client.db(dbName);
    const collection = dbObject.collection(collectionName);
    await collection.deleteMany({ [key]: { [condition]: conditionValue } });
    console.log(`The items was deleted successfully!`);
}
  
async function deleteCollection(collectionName) 
{
    const dbObject = await client.db(dbName);
    const collection = dbObject.collection(collectionName);
    await collection.drop();
    console.log(`The collection was deleted successfully!`);
}
  
async function updateOne(collectionName, filter, set) 
{
    const updateTo = { $set: set };
    const dbObject = await client.db(dbName);
    const collection = dbObject.collection(collectionName);
    await collection.updateOne(filter, updateTo);
    console.log("The collection's data was updated successfully.");
}
  
async function updateMany(collectionName, filter, set) 
{
    const updateTo = { $set: set };
    const dbObject = await client.db(dbName);
    const collection = dbObject.collection(collectionName);
    await collection.updateMany(filter, updateTo);
    console.log("The collection's data was updated successfully.");
}

async function joinDocuments(collectionName_1, collectionName_2, localKey, foreignKey, nameAs) 
{
    const dbObject = await client.db(dbName);
    const collection = dbObject.collection(collectionName_1);
  
    const result = await collection
      .aggregate([
        {
          $lookup: {
            from: collectionName_2,
            localField: localKey,
            foreignField: foreignKey,
            as: nameAs,
          },
        },
      ])
      .toArray();
  
      return result;
}

module.exports = {
    setDatabaseConnectionDatas : setDatabaseConnectionDatas,
    createDb : createDb,
    createCollection : createCollection,
    createDoc : createDoc,
    createDocs : createDocs,
    listAll : listAll,
    findOne : findOne,
    QueryBuilder : QueryBuilder,
    SortBy : SortBy,
    deleteOne : deleteOne,
    deleteMany: deleteMany,
    deleteCollection : deleteCollection,
    updateOne : updateOne,
    updateMany : updateMany,
    joinDocuments : joinDocuments
}