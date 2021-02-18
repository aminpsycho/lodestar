/** The number of head syncing chains to sync at a time. */
export const PARALLEL_HEAD_CHAINS = 2;

/** Minimum work we require a finalized chain to do before picking a chain with more peers. */
export const MIN_FINALIZED_CHAIN_VALIDATED_EPOCHS = 10;

/** The number of times to retry a batch before it is considered failed. */
export const MAX_BATCH_DOWNLOAD_ATTEMPTS = 5;

/** Consider batch faulty after downloading and processing this number of times */
export const MAX_BATCH_PROCESSING_ATTEMPTS = 3;