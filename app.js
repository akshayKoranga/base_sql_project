let express = require('express');
require('dotenv').config({
    path: __dirname + '/.env'
});

let bodyParser = require('body-parser');
let app = express();
let appConstants = require('./config').appConstants;
let routes = require('./routes');

//------------------------------- use cors globaly --------------------
app.use(cors());
//--------------------------------------------------------------------
// Body parser middleware
app.use(bodyParser.json({
    limit: appConstants.bodyLimit
}));
app.use(bodyParser.urlencoded({
    extended: true
}));

// -------------- Define Static authorization --------------
// app.use(basicAuth({
//     users: { 'delivery@emilence.com': 'Emilence@1' }
// }));
// -------------- End Define Static authorization --------------

// Define App Routes
app.use('/v1', routes());
// Start application
let PORT = process.env.PORT || appConstants.port;
app.listen(PORT, () => {
    // eslint-disable-next-line no-console 
    console.log(`Connection established on Port: ${PORT}`);
});