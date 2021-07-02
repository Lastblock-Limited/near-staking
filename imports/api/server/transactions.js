import {SyncedCron} from 'meteor/littledata:synced-cron';

const autobahn = require("autobahn");
import {TxActions, BlockRaw} from "../nearf";
import {Meteor} from "meteor/meteor";


let session;
const connection = new autobahn.Connection({
  url: "wss://near-explorer-wamp.onrender.com/ws",
  realm: "near-explorer",
  retry_if_unreachable: true,
  max_retries: 5,
  max_retry_delay: 10
});

connection.onopen = s => {
  session = s;


    /*
    storeTransactions().then((r) => {
      console.log('done');
    }).catch((e) => {
      console.log(e);
    })
    */


};

connection.onclose = reason => {
  console.log(reason);
};

connection.open();

async function query(q) {
  const procedure = `com.nearprotocol.mainnet.explorer.select`;
  return session.call(procedure, q);
}

async function queryPostgres(q) {
  const procedure = `com.nearprotocol.mainnet.explorer.select:INDEXER_BACKEND`;
  return session.call(procedure, q);
}

async function queryNearCoreTx(q) {
  const procedure = `com.nearprotocol.mainnet.explorer.nearcore-tx`;
  return session.call(procedure, q);
}


async function getTransactions(block_timestamp) {
  return await queryPostgres([
    `SELECT t.transaction_hash,
            t.block_timestamp,
            b.block_height,
            t.signer_account_id,
            t.receiver_account_id,
            r.receiver_account_id     receipt_receiver_account_id,
            r.predecessor_account_id,
            ra.args ->> 'method_name' method_name,
            ra.args ->> 'deposit'     deposit,
            ra.args ->> 'args_base64' args_base64
     FROM transactions t,
          receipts r,
          blocks b,
          transaction_actions a,
          action_receipt_actions ra,
          execution_outcomes e
     WHERE t.transaction_hash = r.originated_from_transaction_hash
       AND r.receipt_id = e.receipt_id
       AND b.block_timestamp = r.included_in_block_timestamp
       AND ra.receipt_id = r.receipt_id
       AND t.transaction_hash = a.transaction_hash
       AND a.action_kind = 'FUNCTION_CALL'
       AND e.status = 'SUCCESS_VALUE'
       AND ra.args ->> 'method_name' IN
           ('withdraw_all_from_staking_pool', 'withdraw_from_staking_pool', 'deposit_to_staking_pool', 'deposit',
            'deposit_and_stake', 'withdraw_all', 'withdraw', 'stake', 'stake_all', 'unstake', 'unstake_all')
       AND r.predecessor_account_id != 'system'
       AND t.receiver_account_id NOT IN ('factory.bridge.near', 'bridge.near','ref-finance.near','multisender.app.near','tipbot.app.near')
       AND r.receiver_account_id NOT IN ('factory.bridge.near', 'bridge.near','ref-finance.near','multisender.app.near','tipbot.app.near')
       AND t.block_timestamp >= :block_timestamp
     ORDER BY t.block_timestamp ASC
     LIMIT :limit
    `, {
      limit: 1000,
      block_timestamp: block_timestamp
    }
  ]).then(data => {
      //console.log(data)
      console.log(data.length)
      return data;
    }
  ).catch((e) => {
    console.log(e);
  });
}

/*
async function storeTransactions() {
  let d = new Date();
  d.setDate(d.getDate() - 2);
  let blockTimestamp = d.getTime() * 1000 * 1000;
  const transactions = await getTransactions(blockTimestamp);
  transactions.map((item) => {
    try {
      TxActions.update(
        {
          transaction_hash: item.transaction_hash,
          method_name: item.method_name,
        },
        {
          transaction_hash: item.transaction_hash,
          block_timestamp: Number(item.block_timestamp),
          block_height: Number(item.block_height),
          signer_id: item.signer_account_id,
          receiver_id: item.receiver_account_id,
          receipt_receiver_id: item.receipt_receiver_account_id,
          predecessor_account_id: item.predecessor_account_id,
          account_id: item.predecessor_account_id,
          pool_id: item.receipt_receiver_account_id.includes('poolv1.near') ? item.receipt_receiver_account_id : null,
          method_name: item.method_name,
          gas: item.gas,
          deposit: Number(item.deposit),
          args: Buffer.from(item.args_base64, 'base64').toString('utf-8'),
        },
        {upsert: true}
      )

    } catch (e) {
      console.log(e);
    }
  })
}
*/

if (Meteor.isServer) {
  SyncedCron.add({
    name: 'Fetch Transactions',
    schedule: function (parser) {
      return parser.text('every 8 minutes');
    },
    job: async function () {
      await storeTransactions()
    }
  });
}



async function storeTransactions() {
  let d = new Date();
  d.setDate(d.getDate() - 3);
  let blockTimestamp = d.getTime() * 1000 * 1000;
  /* To received the data from Epoch2, uncomment below */
  //let blockTimestamp = 1598366209232845339;
  /* -------------------------------------------------- */
  let len = 1000;
  let offset = 0;
  while (len > 25) {
    const transactions = await getTransactions(blockTimestamp);
    len = transactions.length;
    blockTimestamp = transactions[transactions.length - 1].block_timestamp;
    offset = offset + len;
    transactions.map((item) => {

      try {
        TxActions.update(
          {
            transaction_hash: item.transaction_hash,
            method_name: item.method_name,
          },
          {
            transaction_hash: item.transaction_hash,
            block_timestamp: Number(item.block_timestamp),
            block_height: Number(item.block_height),
            signer_id: item.signer_account_id,
            receiver_id: item.receiver_account_id,
            receipt_receiver_id: item.receipt_receiver_account_id,
            predecessor_account_id: item.predecessor_account_id,
            account_id: item.predecessor_account_id,
            pool_id: item.receipt_receiver_account_id.includes('poolv1.near') ?  item.receipt_receiver_account_id : null,
            method_name: item.method_name,
            gas: item.gas,
            deposit: Number(item.deposit),
            args: Buffer.from(item.args_base64, 'base64').toString('utf-8'),
          },
          {upsert: true}
        )

      } catch (e) {
        console.log(e);
      }
    })
  }
}

