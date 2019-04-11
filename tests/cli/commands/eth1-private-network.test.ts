import {expect} from 'chai';
import {Eth1PrivateNetworkCommand} from "../../../src/cli/commands";
import logger from "../../../src/logger/winston";

import program from "commander";

describe('[CLI] eth1:dev', () => {

  before(async () => {
    logger.silent(true);
  });

  after(async () => {
    logger.silent(false);
  });

  it('Should be able to register', async () => {
    const command = new Eth1PrivateNetworkCommand();
    const commandCount = program.commands.length;
    await expect(
      command.register(program)
    ).to.not.throw;
    expect(program.commands.length).to.be.equal(commandCount + 1);
  });

  it('Should start private network', async () => {
    const command = new Eth1PrivateNetworkCommand();
    const network = await command.action('127.0.0.1', 33323, null, null, null);
    expect(network).to.not.be.null;
    await network.stop();
  });

});
