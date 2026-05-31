import { Address, BigInt } from "@graphprotocol/graph-ts";
import { IPAsset } from "../generated/schema";

// Load an IPAsset by id, creating a stub with zeroed aggregates if absent.
// This lets a DerivativeRegistered/RoyaltyPaid that references an IP arrive
// before that IP's own IPRegistered event.
export function loadOrCreateIPAsset(ipId: Address): IPAsset {
  let asset = IPAsset.load(ipId.toHexString());
  if (asset == null) {
    asset = new IPAsset(ipId.toHexString());
    asset.parentCount = 0;
    asset.derivativeCount = 0;
    asset.royaltyPaidTotal = BigInt.zero();
  }
  return asset;
}
