import * as  bodyParser from 'body-parser';
import * as express from 'express';

const httpPort: number = parseInt(process.env.HTTP_PORT) || 8888;

const initHttpServer = ( myHttpPort: number ) => {
    const app = express();
    app.use(bodyParser.json());

    app.use(bodyParser.json());
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        next();
    });

    app.get('/candidates', (req, res) => {
        res.send({
            "candidates": [
                {
                    "name": "Bernie Sanders",
                    "address": "a"
                },
                {
                    "name": "Pete Buttigieg",
                    "address": "b"
                },
                {
                    "name": "Elizabeth Warren",
                    "address": "c"
                },
                {
                    "name": "Joe Biden",
                    "address": "d"
                },
                {
                    "name": "Amy Klobuchar",
                    "address": "e"
                },
                {
                    "name": "Andrew Yang",
                    "address": "f"
                },
                {
                    "name": "Tom Steyer",
                    "address": "g"
                }
            ]
        });
    });

    app.get('/peers', (req, res) => {
        res.send({
            "peers": ["ws://10.104.150.84:6001"]
        });
    });

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};

initHttpServer(httpPort);
