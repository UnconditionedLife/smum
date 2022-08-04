# Dynamo DB
Dynamo DB stores data in _tables_, which contain individual _items_ (or records). Each item consists of a collection of _attributes_. The attributes are similar to columns in a relational database, but different items in a table can have different attributes. Except for the attributes that make up the primary key for the table (described below), the set of attributes for any item is arbitrary.

## Partition Key and Sort Key
Every table or index has a Partition Key and an optional Sort Key, each of which is a single attribute in the table. The combination of Partition Key and Sort Key defines the _primary key_, which means that it must be unique for every item in the table or index. Some important considerations for the Partition Key and Sort Key are as follows:
- Dynamo DB uses a hash function applied to the Partition Key to determine the physical partition where the data is stored. In order to distribute the data efficiently, the Partition Key should have many distinct values (high cardinality) that are fairly evenly distributed. All items with the same Partition Key will be stored together, and there can be many different Partition Key values in the same partition. Unique sequential or random IDs such as Client ID or Service ID are natural choices for Partition Key.
- Every query must include an equality comparison on the Partition Key in order to identify the partition where the data is stored. The query can also include expressions (not just equality comparison) involving the Sort Key to narrow the set of records returned. The query condition is limited to the Partition Key and Sort Key attributes because other attributes are not guaranteed to exist for all items.
- The combination of Partition Key and Sort Key must be unique for every item. It _may_ also be true that the Partition Key or Sort Key by itself is unique. In this case, of course, the combination will also be unique.
- Every index belongs to a particular table (called the _base table_), but the index may have a Primary Key or Sort Key that is different from the base table.

## Item Size
Items are written in units of 1K bytes, so a record less than this size will require one write unit to update. Records larger than 1K will consume extra write units, but there is no savings for smaller sizes. It may still be advantageous to abbreviate attribute names for code readability.

## Index Special Cases
While uniform ID values are often good choices for Partition Keys, there are some special cases that may be useful for certain query indexes.
- For reports that are time based, a Partition Key consisting of the largest granularity time unit (e.g. year) will ensure that all the items for a particular report are stored together in the same partition. This also makes it possible to provision more read and write units for the current year, where most of the activity will occur, and provision only minimal resources for earlier years.
- A sparse index can be created using a Partition Key or Sort Key that exists for only a minority of items in the table. For example, if items for a voucher-based service contain an attribute that is present only during the time between voucher issuance and fulfilment, an index based on that attribute will contain items only for the services awaiting fulfilment.

## Recommendations
1. For the Services table, use client ID as the Partition Key. Service ID would be a natural choice, but the value is not usually known when querying the table. The client ID has similar properties for producing a uniform distribution among partitions, and Client ID is available when adding a service entry or querying for all of a client's services in order to populate the History screen.
2. For producing reports, create an index on the Services table with the year of service date as the Partition Key and a combination of the full service date and service ID as the Sort Key. The year containing the report period is always available when querying, and a prefix of the Sort Key can be used to limit results to a specific month or day. The service ID needs to be added to the Sort Key in order to form a unique primary key for each record.

## References
[Dynamo DB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)