import * as CryptoJS from 'crypto-js';
import {broadcastLatest} from './p2p';
import * as _ from 'lodash';

import {getPublicFromWallet, signVoteData, verifyVoteData} from './security';

class VoteData {
    public voterAddress: string;
    public candidateAddress: string;
    public signature: string;

    constructor(voterAddress: string, candidateAddress: string, signature: string) {
        this.voterAddress = voterAddress;
        this.candidateAddress = candidateAddress;
        this.signature = signature;
    }
}

class Block {

    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public data: VoteData;

    constructor(index: number, hash: string, previousHash: string, timestamp: number, data: VoteData) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
    }
}

const genesisBlock: Block = new Block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', '', 1465154705, null
);

let blockchain: Block[] = [genesisBlock];

const getBlockchain = (): Block[] => blockchain;

const getLatestBlock = (): Block => blockchain[blockchain.length - 1];

const generateNextBlock = (candidateAddress: string) => {
    const blockData: VoteData = new VoteData(getPublicFromWallet(), candidateAddress, '');
    blockData.signature = signVoteData(blockData);
    const previousBlock: Block = getLatestBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = new Date().getTime() / 1000;
    const nextHash: string = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    const newBlock: Block = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
    if(addBlock(newBlock)) {
        console.log("added new block", newBlock);
        broadcastLatest();
        return newBlock;
    }
    newBlock.index = -1;
    return newBlock;
};

const calculateHashForBlock = (block: Block): string =>
    calculateHash(block.index, block.previousHash, block.timestamp, block.data);

const calculateHash = (index: number, previousHash: string, timestamp: number, data: VoteData): string =>
    CryptoJS.SHA256(index + previousHash + timestamp + data.voterAddress + data.candidateAddress + data.signature).toString();

const addBlock = (newBlock: Block): boolean => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
        return true;
    }
    return false;
};

const isValidBlockStructure = (block: Block): boolean => {
    if(typeof block.index !== 'number'
    || typeof block.hash !== 'string'
    || typeof block.previousHash !== 'string'
    || typeof block.timestamp !== 'number') {
        return false;
    }

    if(block.data != undefined && (
        typeof block.data.voterAddress !== 'string'
        || typeof block.data.candidateAddress !== 'string'
        || typeof block.data.signature !== 'string'
    )) {
        return false;
    }
    
    return true;
};

const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
    if (!isValidBlockStructure(newBlock)) {
        console.log('invalid structure');
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
        console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
        return false;
    } 
    // verify the signature of the vote
    else if(!verifyVoteData(newBlock.data)) {
        console.log('invalid vote: signature mismatched');
        return false;
    }
    //console.log('new', newBlock.data);
    // check for duplicate, prevent double voting
    for(let i = 1; i < blockchain.length; i++) {
        // console.log('checking', blockchain[i].data);
        if(_.isEqual(blockchain[i].data.voterAddress, newBlock.data.voterAddress)) {
            console.log('invalid vote: double voting')
            return false;
        }
    }
    return true;
};

const isValidChain = (blockchainToValidate: Block[]): boolean => {
    const isValidGenesis = (block: Block): boolean => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };

    if (!isValidGenesis(blockchainToValidate[0])) {
        return false;
    }

    for (let i = 1; i < blockchainToValidate.length; i++) {
        if (!isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
            return false;
        }
    }
    return true;
};

const addBlockToChain = (newBlock: Block) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
        return true;
    }
    return false;
};

const replaceChain = (newBlocks: Block[]) => {
    if (isValidChain(newBlocks) && newBlocks.length > getBlockchain().length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        broadcastLatest();
    } else {
        console.log('Received blockchain invalid');
    }
};

export {VoteData, Block, getBlockchain, getLatestBlock, generateNextBlock, isValidBlockStructure, replaceChain, addBlockToChain};
