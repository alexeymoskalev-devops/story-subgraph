import { assert, test, clearStore, afterEach, newMockEvent } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { IPRegistered } from "../generated/IPAssetRegistry/IPAssetRegistry";
import { handleIPRegistered } from "../src/ipAsset";

afterEach(() => { clearStore(); });

function newIPRegistered(ipId: string, tokenContract: string, tokenId: i32, uri: string): IPRegistered {
  let e = changetype<IPRegistered>(newMockEvent());
  e.parameters = new Array();
  e.parameters.push(new ethereum.EventParam("ipId", ethereum.Value.fromAddress(Address.fromString(ipId))));
  e.parameters.push(new ethereum.EventParam("chainId", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1315))));
  e.parameters.push(new ethereum.EventParam("tokenContract", ethereum.Value.fromAddress(Address.fromString(tokenContract))));
  e.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenId))));
  e.parameters.push(new ethereum.EventParam("name", ethereum.Value.fromString("n")));
  e.parameters.push(new ethereum.EventParam("uri", ethereum.Value.fromString(uri)));
  e.parameters.push(new ethereum.EventParam("registrationDate", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1717000000))));
  return e;
}

test("handleIPRegistered creates an IPAsset with zeroed aggregates", () => {
  let ip = "0x0000000000000000000000000000000000000001";
  handleIPRegistered(newIPRegistered(ip, "0x00000000000000000000000000000000000000aa", 7, "ipfs://x"));
  assert.entityCount("IPAsset", 1);
  assert.fieldEquals("IPAsset", ip, "uri", "ipfs://x");
  assert.fieldEquals("IPAsset", ip, "tokenId", "7");
  assert.fieldEquals("IPAsset", ip, "parentCount", "0");
  assert.fieldEquals("IPAsset", ip, "derivativeCount", "0");
});
