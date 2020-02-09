# votebase

Blockchain based voting system

## Install

```
npm install
npm start
```

## Use API

#### Get blockchain
```
curl http://localhost:3001/blocks
```

#### Create block
```
curl -H "Content-type:application/json" --data '{"candidateAddress" : "abc"}' http://localhost:3001/mineBlock
``` 

#### Add peer
```
curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:6001"}' http://localhost:3001/addPeer
```

#### Query connected peers
```
curl http://localhost:3001/peers
```
