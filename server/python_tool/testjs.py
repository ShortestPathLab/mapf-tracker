import pymongo

# Replace with your MongoDB connection string
connection_string = "mongodb://dev:isfuhewyug372j4u@118.138.234.90:8987/?directConnection=true"
connection_string= "mongodb://dev:isfuhewyug372j4u@118.138.234.90:8987/test?directConnection=true&authSource=admin"

try:
    # Connect to MongoDB
    client = pymongo.MongoClient(connection_string)

    # List all databases

    # # Select a database
    db = client.get_database("test")  # Replace with your actual database name

    # # List all collections in the selected database
    print(db.list_collection_names())

    # # Insert a document into a collection
    # collection = db.users  # Replace with your actual collection name
    # result = collection.insert_one({
    #     "u": "test",
    #     "password":"34567890"
    # })
    # print(f"Inserted document ID: {result.inserted_id}")

    # # Query documents in the collection
    # documents = collection.find()
    # for doc in documents:
    #     print(doc)

except pymongo.errors.ConnectionFailure as e:
    print(f"Could not connect to MongoDB: {e}")
