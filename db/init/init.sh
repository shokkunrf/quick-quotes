#!/bin/sh

query=$(cat <<EOS
use $MONGO_INITDB_DATABASE \n

db.createUser({
    user: '$USERNAME',
    pwd: '$PASSWORD',
    roles: [{
        role: 'readWrite',
        db: '$MONGO_INITDB_DATABASE'
    }]
}) \n

db.createCollection('$COLLECTION') \n

db.getCollection('$COLLECTION').createIndex({ "time": 1 }, { expireAfterSeconds: ${LOG_TTL_SECONDS:-259200} }) \n

EOS
)

echo -e "\n" $query | mongo -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD
