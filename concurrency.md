# Concurrency

## Synchronization for database accesses

The database accesses are structured in such a that we can avoid needing transactions in the database or locks in the program. Multiple copies of the server connected to the same database should be able to run concurrently if necessary.

## Synchronization for any server-side in-memory data structures shared by sessions of concurrent users

Javascript is single threaded (except for WebWorkers and FFI which we don't use) so we cannot experience data races. Therefore we do not need to perform any synchronization of in-memory data structures. At worse, an outdated view of the database would be returned.

## Examples

### Edit course plan

If two users concurrently save a student's course plan, then exactly one of the two plans will be saved at the end. MongoDB guarantees [atomicity](https://docs.mongodb.com/manual/core/write-operations-atomicity/#atomicity) at the document level, which we use to guarantee that the document that is saved will not be corrupted. See line 115 in [src/server/index.ts](src/server/index.ts#L115)

### Importing while suggesting

Suggesting course plans is not yet implemented, however I expect that we will load all the relevant entries from the database into memory so that importing new files will not affect running suggestCoursePlan functions.
