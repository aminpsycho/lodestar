import {ethers} from "ethers";
import {CommandBuilder} from "yargs";
import {ValidatorDirManager} from "../../../../validatorDir";
import {getAccountPaths} from "../../paths";
import {getBeaconConfig} from "../../../../util";
import {IAccountValidatorOptions} from "./options";

const DEPOSIT_GAS_LIMIT = 400000;

export const command = "deposit";

export const description = `Submits a deposit to an Eth1 validator registration contract via an IPC endpoint
of an Eth1 client (e.g., Geth, OpenEthereum, etc.). The validators must already
have been created and exist on the file-system. The process will exit immediately
with an error if any error occurs. After each deposit is submitted to the Eth1
node, a file will be saved in the validator directory with the transaction hash.
The application does not wait for confirmations so there is not guarantee that
the transaction is included in the Eth1 chain; use a block explorer and the
transaction hash to check for confirmations. The deposit contract address will
be determined by the spec config flag.`;

interface IAccountValidatorDepositOptions extends IAccountValidatorOptions {
  keystoresDir: string;
  validator: string;
  eth1Http?: string;
}

export const builder: CommandBuilder<{}, IAccountValidatorDepositOptions> = {
  validator: {
    description: "The name of the validator directory in $keystoresDir for which to deposit. \
    Set to 'all' to deposit all validators in the $keystoresDir.",
    normalize: true,
    demandOption: true,
    type: "string",
  },

  eth1Http: {
    description: "URL to an Eth1 JSON-RPC endpoint with an unlock account to sign",
    demandOption: true,
    type: "string"
  }
};

export async function handler(options: IAccountValidatorDepositOptions): Promise<void> {
  const spec = options.chain.name;
  const validatorName = options.validator;
  const eth1Http = options.eth1Http;
  const accountPaths = getAccountPaths(options);
  const config = getBeaconConfig(spec);

  if (!config.params.DEPOSIT_CONTRACT_ADDRESS)
    throw Error("deposit_contract not in configuration");
  const depositContractAddress = String(config.params.DEPOSIT_CONTRACT_ADDRESS);

  // Load validators to deposit
  // depositData is already generated when building / creating the validator dir
  const validatorDirManager = new ValidatorDirManager(accountPaths);
  const validatorDirs = validatorName === "all"
    ? validatorDirManager.openAllValidators()
    : [validatorDirManager.openValidator(validatorName)];

  const validatorDirsToSubmit = validatorDirs
    // txHash file is used as a flag of deposit submission
    .filter(validatorDir => validatorDir.eth1DepositTxHashExists());
  
  if (validatorDirsToSubmit.length === 0)
    throw Error("No validators to deposit");
  // eslint-disable-next-line no-console
  console.log(`Starting ${validatorDirsToSubmit.length} deposits`);

  const eth1Wallet = new ethers.providers.JsonRpcProvider(eth1Http).getSigner();

  for (const validatorDir of validatorDirsToSubmit) {
    const {rlp, depositData} = validatorDir.eth1DepositData(config);
    const value = depositData.amount * BigInt(1e9);
    const tx = await eth1Wallet.sendTransaction({
      to: depositContractAddress,
      gasLimit: DEPOSIT_GAS_LIMIT,
      value: value.toString(),
      data: rlp
    });
    const txHash = tx.hash || "";
    validatorDir.saveEth1DepositTxHash(txHash);
    // eslint-disable-next-line no-console
    console.log(`Submitted deposit. txHash: ${txHash}`);

    const receipt = await tx.wait();
    // eslint-disable-next-line no-console
    console.log(`Confirmed deposit. blocknumber: ${receipt.blockNumber}`);
  }
}
