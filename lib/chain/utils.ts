import { access } from "fs/promises";
import { createConnection } from "typeorm";
import { Block } from "../block";
import { BlockChainEntity } from "../entity/Blockchain";
import { Transaction } from "../transactions";
import { v4 } from "uuid";

export const createConnectionDb = (fileName: string) =>
  createConnection({
    type: "sqlite",
    name: v4(),
    database: fileName,
    entities: [BlockChainEntity],
    synchronize: true,
  });

export const checkExistsFile = async (fileName: string) => {
  try {
    await access(fileName);
    return true;
  } catch (error) {
    return false;
  }
};

export const deserializeBlock = (serializableBlock: any) => {
  let workInProgressBlock = serializableBlock;

  if (typeof serializableBlock === "string") {
    workInProgressBlock = JSON.parse(serializableBlock);
  }

  //@ts-ignore
  const currentBlock = new Block();

  const mappingData = new Map();

  for (const [key, value] of Object.entries(workInProgressBlock.mappingData)) {
    mappingData.set(key, value);
  }

  currentBlock.currentHash = workInProgressBlock.currentHash;
  currentBlock.difficulty = workInProgressBlock.difficulty;
  currentBlock.mappingData = mappingData;
  currentBlock.miner = workInProgressBlock.miner;
  currentBlock.nonce = workInProgressBlock.nonce;
  currentBlock.previousHash = workInProgressBlock.previousHash;

  currentBlock.signature = workInProgressBlock.signature
    ? Buffer.from(workInProgressBlock.signature, "base64")
    : undefined;

  currentBlock.timestamp = workInProgressBlock.timestamp;
  currentBlock.transactions = workInProgressBlock.transactions.map(
    deserializeTransaction
  );

  return currentBlock;
};

export const deserializeTransaction = (transaction: any) => {
  let workInProgressTransaction = transaction;

  if (typeof transaction === "string") {
    workInProgressTransaction = JSON.parse(transaction);
  }

  //@ts-ignore
  const currentTransaction = new Transaction();

  currentTransaction.currentHash = workInProgressTransaction.currentHash;
  currentTransaction.previousBlock = workInProgressTransaction.previousBlock;

  currentTransaction.randomBytes = Buffer.from(
    workInProgressTransaction.randomBytes,
    "base64"
  );

  currentTransaction.receiver = workInProgressTransaction.receiver;
  currentTransaction.sender = workInProgressTransaction.sender;
  currentTransaction.reason = workInProgressTransaction.reason;

  currentTransaction.signature = workInProgressTransaction.signature
    ? Buffer.from(workInProgressTransaction.signature, "base64")
    : undefined;

  currentTransaction.toStorage = workInProgressTransaction.toStorage;
  currentTransaction.value = workInProgressTransaction.value;
  return currentTransaction;
};

export const serializeBlock = (block: Block) =>
  JSON.stringify(serializeBlockJSON(block));

export const serializeTransaction = (transaction: Transaction) =>
  JSON.stringify(serializeTransactionJSON(transaction));

export const serializeTransactionJSON = (transaction: Transaction) => {
  const transactionToJSON = {
    ...transaction,
    signature: transaction.signature
      ? transaction.signature.toString("base64")
      : undefined,
    randomBytes: transaction.randomBytes.toString("base64"),
  };

  return transactionToJSON;
};

export const serializeBlockJSON = (block: Block) => {
  const mapping = {};

  for (const [key, value] of block.mappingData.entries()) {
    mapping[key] = value;
  }

  const blockToJSON = {
    ...block,
    signature: block.signature ? block.signature.toString("base64") : undefined,
    transactions: block.transactions.map((item) => ({
      ...item,
      signature: item.signature ? item.signature.toString("base64") : undefined,
      randomBytes: item.randomBytes.toString("base64"),
    })),
    mappingData: mapping,
  };

  return blockToJSON;
};
