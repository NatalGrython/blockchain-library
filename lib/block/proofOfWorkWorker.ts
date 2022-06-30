import { workerData, parentPort } from "worker_threads";
import { deserializeBlock } from "../chain/utils";

const block = deserializeBlock(workerData.block);
let hash = block.hash();

while (block.hash().substring(0, 5) !== Array(5).fill("0").join("")) {
  block.nonce++;
  hash = block.hash();
}
parentPort.postMessage({
  type: "DONE",
  nonce: block.nonce,
  hash,
});
