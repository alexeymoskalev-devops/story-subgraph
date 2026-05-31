import { DerivativeRegistered } from "../generated/LicensingModule/LicensingModule";
import { DerivativeLink } from "../generated/schema";
import { loadOrCreateIPAsset } from "./helpers";

export function handleDerivativeRegistered(event: DerivativeRegistered): void {
  let child = loadOrCreateIPAsset(event.params.childIpId);
  let childId = event.params.childIpId.toHexString();
  let parents = event.params.parentIpIds;

  for (let i = 0; i < parents.length; i++) {
    let parent = loadOrCreateIPAsset(parents[i]);
    let parentId = parents[i].toHexString();

    let link = new DerivativeLink(childId + "-" + parentId);
    link.child = childId;
    link.parent = parentId;
    link.licenseTermsIds = event.params.licenseTermsIds;
    link.licenseTemplate = event.params.licenseTemplate;
    link.blockNumber = event.block.number;
    link.txHash = event.transaction.hash;
    link.save();

    parent.derivativeCount = parent.derivativeCount + 1;
    parent.save();
  }

  child.parentCount = child.parentCount + parents.length;
  child.save();
}
