AutoWriteBatch
==============
AutoWriteBatch is a small wrapper for Firestore.WriteBatch in Firebase Admin SDK.

It instantly commits the pending operations when reaching the limit while the original WriteBatch fails the entire operations.

It allows developers to process a big number of documents in server-side operations without worrying about the operation limit.

Usage
-----
    const { initializeApp } = require("firebase-admin");
    const { AutoWriteBatch } = require("auto-writebatch");

    const db = initializeApp().firestore();
    const batch = AutoWriteBatch(db, 500);

    for(let i = 0; i < 700; i++) {
        batch.set(db.collection('counts').doc(), {count: i}).then(results => {
            if(results != null) {
                console.log('Auto commit:', results);
            }
        });
    }
    batch.commit().then(results => console.log('Manual commit:', results));

The usage of AutoWriteBatch basically follows the original WriteBatch.

However, since it is possible to commit operations on create(), set(), update(), delete() methods and return Promise<WriteResults[]>, method chains are not supported in AutoWriteBatch.

https://googleapis.dev/nodejs/firestore/latest/WriteBatch.html