import {INetwork} from "../network";
import {ILogger} from "@chainsafe/lodestar-utils";
import {CommitteeIndex, Slot, SyncingStatus} from "@chainsafe/lodestar-types";
import {IGossipHandler} from "./gossip";
import {IBeaconChain} from "../chain";
import {IBeaconConfig} from "@chainsafe/lodestar-config";
import {IBeaconDb} from "../db/api";
import {AttestationCollector} from "./utils";

export interface IBeaconSync {
  state: SyncState;
  getSyncStatus(): SyncingStatus;
  isSynced(): boolean;
  isSyncing(): boolean;
  collectAttestations(slot: Slot, committeeIndex: CommitteeIndex): Promise<void>;
}

export enum SyncState {
  /** The node is performing a long-range sync over a finalized chain */
  SyncingFinalized = "SyncingFinalized",
  /** The node is performing a long-range sync over head chains */
  SyncingHead = "SyncingHead",
  /** The node is up to date with all known peers */
  Synced = "Synced",
  /** No useful peers are connected */
  Stalled = "Stalled",
}

export interface ISyncModule {
  getHighestBlock(): Slot;
}

export interface ISlotRange {
  start: Slot;
  end: Slot;
}

export interface ISyncModules {
  config: IBeaconConfig;
  network: INetwork;
  db: IBeaconDb;
  logger: ILogger;
  chain: IBeaconChain;
  gossipHandler?: IGossipHandler;
  attestationCollector?: AttestationCollector;
}
