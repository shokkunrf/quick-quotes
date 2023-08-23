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

EOS
)

echo -e "\n" $query | mongo -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD
