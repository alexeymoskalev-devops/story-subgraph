import { IPRegistered } from "../generated/IPAssetRegistry/IPAssetRegistry";
import { loadOrCreateIPAsset } from "./helpers";

export function handleIPRegistered(event: IPRegistered): void {
  let asset = loadOrCreateIPAsset(event.params.ipId);
  asset.nftContract = event.params.tokenContract;
  asset.tokenId = event.params.tokenId;
  asset.uri = event.params.uri;
  asset.registrationDate = event.params.registrationDate;
  asset.save();
}
