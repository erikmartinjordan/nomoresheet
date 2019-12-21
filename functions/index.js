const data       = require('./hosting/_data.js'); 
const fs         = require('fs');
const admin      = require('firebase-admin');
const functions  = require('firebase-functions');
const nodemailer = require('nodemailer');
const user = functions.config().gmail.user;
const pass = functions.config().gmail.pass;
const dest = functions.config().gmail.dest;
// Remember to type command before deploying → firebase functions:config:set gmail.user="EMAIL"
// Remember to type command before deploying → firebase functions:config:set gmail.pass="PASS"
// Remember to type command before deploying → firebase functions:config:set gmail.dest="DEST"

// Firebase initializing app
admin.initializeApp();

// Creating transport
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: user,
    pass: pass,
  },
});

// Sends email in case of DB change
exports.sendEmail = functions.database.ref('/posts/{postId}/{label}').onWrite( async (change, context) => {
    
    // The reference where the change took place
    const ref = change.after.ref;
    
    // Reference of the postId
    const refPostId = ref.parent;
    
    // Getting the data of the post Id
    const snapshot =  await refPostId.once('value');
    
    // Getting the name of the message
    const message = snapshot.val().message;
    
    // Defining subject and text
    const subject = context.params.label === 'message' ? 'Nuevo post' : 'Nuevo comentario';
    const text    = context.params.label === 'message' ? `Nuevo post: ${message}.` : `Nuevo comentario en: ${message}`;
    
    // Defining mail options
    const mailOptions = {
        from: 'Erik',
        to: dest,
        subject: subject,
        text: text
    };
    
    // Only sending mail if new message or reply
    if(context.params.label === 'message' || context.params.label === 'replies') 
        await mailTransport.sendMail(mailOptions);
    
    return null;
    
});

// Getting and replacing meta tags
exports.preRender = functions.https.onRequest(async (request, response) => {
    
    // Error 404
    let error404 = true;
    
    // Getting the path
    const path = request.path ? request.path.split('/') : request.path;
    // path[0] = nomoresheet.es path[1] = blog
    // path[0] = nomoresheet.es path[1] = comunidad
    // ...
    
    // Getting index.html text
    let index = fs.readFileSync('./hosting/index.html').toString();
    
    // Function to check if user exists
    const userExists = async (uid) => {
        
        // Reading database
        let capture = await admin.database().ref(`users/${uid}`).once('value');
        
        // Returning result
        return capture ? true : false;
    }
    
    // Function to check if post exists
    const postExists = async (postName) => {
        
        return data[postName] ? true : false;
    }
    
    // Checking if the link exists
    if(!path[1])                             error404 = false;
    else if(path[1].startsWith('blog'))      error404 = false; 
    else if(path[1].startsWith('comunidad')) error404 = false; 
    else if(path[1].startsWith('acerca'))    error404 = false;
    else if(path[1].startsWith('@'))         error404 = !(await userExists(path[1]));
    else if(path[1])                         error404 = !(await postExists(path[1]));
    
    // Sending res    
    error404
    ? response.status(404).send(index)
    : response.status(200).send(index);
    
});