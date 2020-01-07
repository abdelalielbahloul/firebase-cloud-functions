const functions = require('firebase-functions');
const gcs = require('@google-cloud/storage');
const os = require('os');
const path = require('path');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.onFileImport = functions.storage.object().onFinalize(event => {
    // we want to rename file imported
    const object = event;
    const bucket = object.bucket;
    const contentType = object.contentType;
    const filePath = object.name;
    console.log("Funcion change detected");

    //check if we have already triggered this function 
    if (path.basename(filePath).startsWith('renamedTo-')) {
        console.log("You have already renamed that file");
        
        return;
    }
    const destBucket = gcs.bucket(bucket);
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
    const metaData = { contentType: contentType };
    
    return destBucket.file(filePath).download({
        destination: tempFilePath
    }).then(() => {
        return destBucket.upload(tempFilePath, {
            destination: `renamedTo- ${path.basename(filePath)}`,
            metaData: metaData
        })
    })
    
 
});
