import {ec} from 'elliptic';
import {existsSync, readFileSync, unlinkSync, writeFileSync} from 'fs';
import * as _ from 'lodash';

import {VoteData} from './blockchain';

const EC = new ec('secp256k1');
const p2pPort = parseInt(process.env.P2P_PORT) || 6001;
const privateKeyLocation = p2pPort+'_'+(process.env.PRIVATE_KEY || 'private_key');

const toHexString = (byteArray): string => {
    return Array.from(byteArray, (byte: any) => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
};

const signVoteData = (voteData: VoteData): string => {

    const privateKey = getPrivateFromWallet();

    const dataToSign = voteData.voterAddress + voteData.candidateAddress;

    const key = EC.keyFromPrivate(privateKey, 'hex');
    const signature: string = toHexString(key.sign(dataToSign).toDER());

    return signature;
};

const verifyVoteData = (voteData: VoteData): boolean => {
    const publicKey = voteData.voterAddress;
    const dataToVefify = voteData.voterAddress + voteData.candidateAddress;
    // console.log(dataToVefify);                    
    const signature = voteData.signature;
    const key = EC.keyFromPublic(publicKey, 'hex');
    // console.log(key.verify(dataToVefify, signature));
    return key.verify(dataToVefify, signature);
}

const getPrivateFromWallet = (): string => {
    const buffer = readFileSync(privateKeyLocation, 'utf8');
    return buffer.toString();
};

const getPublicFromWallet = (): string => {
    const privateKey = getPrivateFromWallet();
    const key = EC.keyFromPrivate(privateKey, 'hex');
    return key.getPublic().encode('hex', false);
};

const generatePrivateKey = (): string => {
    const keyPair = EC.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
};

const initWallet = () => {
    // let's not override existing private keys
    if (existsSync(privateKeyLocation)) {
        return;
    }
    const newPrivateKey = generatePrivateKey();

    writeFileSync(privateKeyLocation, newPrivateKey);
    console.log('new wallet with private key created to : %s', privateKeyLocation);
};

const deleteWallet = () => {
    if (existsSync(privateKeyLocation)) {
        unlinkSync(privateKeyLocation);
    }
};

export {getPublicFromWallet,
    getPrivateFromWallet, generatePrivateKey, initWallet, deleteWallet, signVoteData, verifyVoteData};
