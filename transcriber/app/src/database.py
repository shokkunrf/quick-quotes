import pymongo


class Database:
    _client: pymongo.MongoClient
    _database: str

    def __init__(
        self, username: str, password: str, host: str, port: int, database: str
    ):
        self._client = pymongo.MongoClient(
            f"mongodb://{username}:{password}@{host}:{port}/{database}"
        )
        self._database = database

    def create(self, collection: str, dic):
        self._client[self._database][collection].insert_one(dic)

    def close(self):
        self._client.close()
