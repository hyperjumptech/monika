# Monika CouchDB Integration

## CouchDB

CouchDB is an open-source NoSQL database that uses a schema-free JSON document format to store data. It's known for its scalability and ease of use, particularly in distributed environments. One of the important feature is its capability for replicating data between DB in multiple servers.

CouchDB has the ability to replicate from local to remote database using pull or push mechanicsm. By using push mechanism, changes made from local database are "pushed" to the remote database. Whenever a document is added, updated, or deleted in the local database, that change is immediately replicated to the remote database.

## Monika configuration using couch DB replication system

To use the couchDB reporting feature, monika has to be running in symon mode and should set the flag e.g `--symonCouchDb http://admin:admin@localhost:5984/symon` to connect to remote couchDB.

## Mechanism

In Monika, there are multiple ways to report probe requests and response data to symon. Probe reporting mechanism can be done through symon reporting API or through CouchDB replication process.

Sending probe reports using symon API will also be saving to local sqlite file, while reporting through CouchDB will create local pouchDB file. This is to prevent data lost while there is a connection error between monika and symon. The difference is in the data sending mechanism. The first step is through direct symon API hit, while the later is handled through CouchDB data replication process.

To activate this feature, all you have to do is add `--symonCouchDb` flag while running monika. Monika will stop sending report through Symon API and stop writing to local sqlite file, meanwhile replacing it with writing to local pouchDB data file and duplicating it to CouchDB url set through the flag. Currently the couchDB replication options is set to live, which means the data is replicated directly to the main CouchDB server right after the data is saved to local pouchDB.ß

```bash
{
    live: true,
    retry: true,
    back_off_function: (delay: number) => (delay === 0 ? 1000 : delay * 3),
    filter: (doc: PouchDB.Core.ExistingDocument<any>) => {
        return doc._deleted !== true
    },
}
```

## Troubleshoot

1. **unsent probe report** : For missing data sent to couchdb, you need to check the couchdb url set from the flag `--symonCouchDb`, it should be an active couchdb server.
2. **big local data size** : Check symon folder size inside the monika project, if it is too big and you are sure that all the data is already replicated to remote couchDB you could remove this folder and run the monika with couchDb flag again. this is the location of the local pouch database before replicating it to the remote couchdb.
