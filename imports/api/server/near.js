import {Meteor} from 'meteor/meteor';
import {SyncedCron} from 'meteor/littledata:synced-cron';
import nearApi from "near-api-js";

import {
  BlockRaw,
  DelegatorStats,
  ValidatorRaw,
  ValidatorStats,
  Delegators,
  NearPriceHistorical,
  TxActions
} from "../nearf";

const BN = require('bn.js');
const axios = require("axios");
const yoctoNEAR = 1000000000000000000000000;
export const NEAR_RPC_URL = 'https://rpc.mainnet.near.org'
//export const NEAR_RPC_URL = 'http://45.157.177.152:3030';
const provider = new nearApi.providers.JsonRpcProvider(NEAR_RPC_URL);
const connection = new nearApi.Connection(NEAR_RPC_URL, provider, {});
const account = new nearApi.Account(connection, '');

async function getPoolFees(poolId) {
  //return {}
  return await account.viewFunction(poolId, 'get_reward_fee_fraction', {})
}

async function getNumberOfAccounts(poolId) {
  //return {}
  return await account.viewFunction(poolId, 'get_number_of_accounts', {})
}


async function kickedOuts() {

  const validatorStats = ValidatorStats.find({}).fetch();
  let kicked = [];
  for (const item of validatorStats) {
    for (const item2 of item.validators) {
      if (!kicked[item2.account_id]) {
        kicked[item2.account_id] = [];
        kicked[item2.account_id].total_epochs = 0;
        kicked[item2.account_id].kicked_times = 0;
      }

      kicked[item2.account_id].total_epochs++;

      if (item2.prev_epoch_kickout !== "" && item2.prev_epoch_kickout.NotEnoughStake === undefined) {
        kicked[item2.account_id].kicked_times++;
      }
    }
  }
  return kicked;
}

/*
kickedOuts().then().catch((e) => {
  console.log(e);
})
*/

async function cumulativeStatsAllTime() {
  const lastDate = new Date('2020-10-21T17:00:00.000Z');

  const validatorStats = ValidatorStats.find({timestamp: {$gte: lastDate}}).fetch();
  let cumulative = [];
  for (const item of validatorStats) {
    for (const item2 of item.validators) {
      if (!cumulative[item2.account_id]) {
        cumulative[item2.account_id] = [];
      }
      if (cumulative[item2.account_id].num_expected_blocks === undefined) {
        cumulative[item2.account_id].num_expected_blocks = item2.num_expected_blocks;
      } else {
        cumulative[item2.account_id].num_expected_blocks = cumulative[item2.account_id].num_expected_blocks + item2.num_expected_blocks;
      }

      if (cumulative[item2.account_id].num_produced_blocks === undefined) {
        cumulative[item2.account_id].num_produced_blocks = item2.num_produced_blocks;
      } else {
        cumulative[item2.account_id].num_produced_blocks = cumulative[item2.account_id].num_produced_blocks + item2.num_produced_blocks;
      }
    }
  }
  return cumulative;
}


async function cumulativeStats() {
  let lastDate = new Date();
  lastDate.setDate(lastDate.getDate() - 7);

  const validatorStats = ValidatorStats.find({timestamp: {$gte: lastDate}}).fetch();
  let cumulative = [];
  for (const item of validatorStats) {
    for (const item2 of item.validators) {
      if (!cumulative[item2.account_id]) {
        cumulative[item2.account_id] = [];
      }
      if (cumulative[item2.account_id].num_expected_blocks === undefined) {
        cumulative[item2.account_id].num_expected_blocks = item2.num_expected_blocks;
      } else {
        cumulative[item2.account_id].num_expected_blocks = cumulative[item2.account_id].num_expected_blocks + item2.num_expected_blocks;
      }

      if (cumulative[item2.account_id].num_produced_blocks === undefined) {
        cumulative[item2.account_id].num_produced_blocks = item2.num_produced_blocks;
      } else {
        cumulative[item2.account_id].num_produced_blocks = cumulative[item2.account_id].num_produced_blocks + item2.num_produced_blocks;
      }
    }
  }
  return cumulative;
}


async function getPoolDelegators(poolId) {
  //return {}
  try {
    let fromIndex = 0;
    let limit = 100;
    let delegators = [];
    delegators = await account.viewFunction(poolId, 'get_accounts', {"from_index": fromIndex, "limit": limit});

    if (delegators.length === limit) {
      const accountsNumber = await getNumberOfAccounts(poolId);
      let pages = (+accountsNumber / limit).toFixed(0);
      let i;
      for (i = 1; i <= pages; i++) {
        fromIndex = limit * i;
        const delegators2 = await account.viewFunction(poolId, 'get_accounts', {
          "from_index": fromIndex,
          "limit": limit
        });
        Array.prototype.push.apply(delegators, delegators2);
      }

      return delegators;
    } else {
      return delegators;
    }
  } catch (e) {
    console.log(e)
    return [];
  }
}

async function getVotes() {
  //return {}
  return await account.viewFunction('transfer-vote.near', 'get_votes', {});
}

async function getTotalVotes() {
  //return {}
  return await account.viewFunction('transfer-vote.near', 'get_total_voted_stake', {});
}

/* using previous epochs data*/
const findAllPools = () => {
  const validatorStats = ValidatorStats.find({}).fetch()
  let allPools = [];
  for (const item of validatorStats) {
    for (const item2 of item.validators) {
      allPools.push(item2.account_id);
    }
  }
  return allPools;
}

async function storeData() {
  console.log("endpoint: " + NEAR_RPC_URL);

  const validators = await provider.validators(null);
  const blockHeight = validators.epoch_start_height - 1

  const data = {
    blockHeight: blockHeight,
    stats: validators,
  }
  const votes = await getVotes();

  let allValidators = [];
  let allDelegators = [];
  let totalValidatorsStake = 0;

  let cumulativeStake = 0
  for (const item of validators["current_validators"]) {
    let o = {};
    const fees = await getPoolFees(item.account_id);

    let fee = (+fees.numerator / +fees.denominator) * 100;
    o.type = 'current_validators';
    o.stake = +item.stake / yoctoNEAR;
    o.prev_stake = o.stake;
    o.second_prev_stake = o.stake;
    o.prev_epoch_kickout = '';

    for (const item2 of validators["next_validators"]) {
      if (item2.account_id === item.account_id) {
        o.type = 'current_validators,next_validators';
        o.prev_stake = o.stake;
        o.stake = +item2.stake / yoctoNEAR;
      }
    }

    for (const item3 of validators["current_proposals"]) {
      if (item3.account_id === item.account_id) {
        o.type = 'current_validators,next_validators,current_proposals';
        o.second_prev_stake = o.prev_stake;
        o.prev_stake = o.stake;
        o.stake = +item3.stake / yoctoNEAR;
      }
    }

    for (const item4 of validators["prev_epoch_kickout"]) {
      if (item4.account_id === item.account_id) {
        o.prev_epoch_kickout = item4.reason;
      }
    }

    o.account_id = item.account_id;
    o.is_slashed = item.is_slashed;
    o.num_produced_blocks = item.num_produced_blocks;
    o.num_expected_blocks = item.num_expected_blocks;
    o.pool_fees = fee;
    const delegators = await getPoolDelegators(item.account_id);

    console.log(item.account_id + ": " + delegators.length);

    if (delegators.length > 0) {
      for (const d of delegators) {
        d.pool = item.account_id;
        allDelegators.push(d);
      }
      o.delegators = delegators;
      o.vote = (votes[item.account_id]) ? +votes[item.account_id] / yoctoNEAR : 0;
      totalValidatorsStake = totalValidatorsStake + o.stake;
      allValidators.push(o);
    }
  }

  for (const item of validators["next_validators"]) {
    if (validators["current_validators"].some(item2 => item2.account_id === item.account_id)) {
      // nothing to do
    } else {
      let o = {};
      o.type = 'new_validators';
      o.stake = +item.stake / yoctoNEAR;
      o.prev_stake = +item.stake / yoctoNEAR;
      o.account_id = item.account_id;
      o.is_slashed = ''
      o.num_produced_blocks = 0;
      o.num_expected_blocks = 0;
      const fees = await getPoolFees(item.account_id);
      o.pool_fees = (+fees.numerator / +fees.denominator) * 100;
      const delegators = await getPoolDelegators(item.account_id);
      for (const d of delegators) {
        d.pool = item.account_id;
        allDelegators.push(d);
      }
      o.delegators = delegators;
      o.prev_epoch_kickout = '';
      o.vote = (votes[item.account_id]) ? +votes[item.account_id] / yoctoNEAR : 0;
      allValidators.push(o);
    }
  }

  for (const item of validators["current_proposals"]) {
    if (validators["current_validators"].some(item2 => item2.account_id === item.account_id) || validators["next_validators"].some(item2 => item2.account_id === item.account_id)) {
      // nothing to do
    } else {
      let o = {};
      o.type = 'new_proposals';
      o.stake = +item.stake / yoctoNEAR;
      o.prev_stake = +item.stake / yoctoNEAR;
      o.account_id = item.account_id;
      o.is_slashed = ''
      o.num_produced_blocks = 0;
      o.num_expected_blocks = 0;
      const fees = await getPoolFees(item.account_id);
      o.pool_fees = (+fees.numerator / +fees.denominator) * 100;
      const delegators = await getPoolDelegators(item.account_id);
      for (const d of delegators) {
        d.pool = item.account_id;
        allDelegators.push(d);
      }
      o.delegators = delegators;
      o.prev_epoch_kickout = '';
      o.vote = (votes[item.account_id]) ? +votes[item.account_id] / yoctoNEAR : 0;
      allValidators.push(o);
    }
  }


  /* Sort By Stake */
  allValidators.sort(function (a, b) {
    if (+a.stake < +b.stake) return 1;
    if (+a.stake > +b.stake) return -1;
    return 0;
  });

  let temp = [];
  const cumulatives = await cumulativeStats();
  const cumulativesAllTime = await cumulativeStatsAllTime();
  const kickedOutTimes = await kickedOuts();

  for (const item of allValidators) {
    let r = {};
    r.type = item.type;
    r.stake = item.stake;
    r.prev_stake = item.prev_stake
    r.second_prev_stake = item.second_prev_stake
    r.type = item.type
    r.account_id = item.account_id;
    r.is_slashed = item.is_slashed;
    r.num_produced_blocks = item.num_produced_blocks;
    r.num_expected_blocks = item.num_expected_blocks;
    r.pool_fees = item.pool_fees;
    r.delegatorsCount = item.delegators.length;
    r.vote = item.vote;
    r.prev_epoch_kickout = item.prev_epoch_kickout;
    cumulativeStake = cumulativeStake + (+r.stake / +totalValidatorsStake);
    r.cumulative_stake = +cumulativeStake * 100;
    if (cumulatives[item.account_id]) {
      r.validator_total_uptime = ((cumulatives[item.account_id].num_produced_blocks / cumulatives[item.account_id].num_expected_blocks) * 100).toFixed(2);
    } else {
      r.validator_total_uptime = 100;
    }
    if (cumulativesAllTime[item.account_id]) {
      r.validator_total_uptime_all_time = ((cumulativesAllTime[item.account_id].num_produced_blocks / cumulativesAllTime[item.account_id].num_expected_blocks) * 100).toFixed(2);
    } else {
      r.validator_total_uptime_all_time = 100;
    }
    if (kickedOutTimes[item.account_id]) {
      r.validator_total_epochs = (kickedOutTimes[item.account_id].total_epochs).toFixed(0);
      r.validator_total_kicked_times = (kickedOutTimes[item.account_id].kicked_times).toFixed(0);
    } else {
      r.validator_total_epochs = 0;
      r.validator_total_kicked_outs = 0;
    }
    temp.push(r);
  }

  allValidators = temp;

  const allPools = findAllPools();

  function uniqueArray(a) {
    return [...new Set(a)];
  }

  let tempPools = [];
  for (const item of allValidators) {
    tempPools.push(item.account_id);
  }
  for (const item2 of uniqueArray(allPools)) {
    if (tempPools.indexOf(item2) === -1) {
      const delegators = await getPoolDelegators(item2);
      for (const d of delegators) {
        d.pool = item2
        allDelegators.push(d);
      }
    }
  }


  const pCurrent = await nearApi.validators.findSeatPrice(validators["current_validators"], 100);
  const pNext = await nearApi.validators.findSeatPrice(validators["next_validators"], 100);
  const pProposals = await nearApi.validators.findSeatPrice(validators["current_proposals"], 100);
  const priceCurrent = +pCurrent / yoctoNEAR;
  const priceNext = +pNext / yoctoNEAR;
  const priceProposals = +pProposals / yoctoNEAR;
  //const totalVotesFunc = await getTotalVotes();


  /*
  const totalVotes = {
    'voted': +totalVotesFunc[0] / yoctoNEAR,
    'total': +totalVotesFunc[1] / yoctoNEAR,
  }
  */

  const d = new Date();
  let month = (d.getMonth().toString().length < 2 ? "0" + d.getMonth().toString() : d.getMonth());
  let date = (d.getDate().toString().length < 2 ? "0" + d.getDate().toString() : d.getDate());
  let year = d.getFullYear();
  const dateHour = year + "-" + month + "-" + date + ":" + d.getHours();

  try {
    ValidatorRaw.update(
      {
        blockHeight: blockHeight,
        dateHour: dateHour,
      },
      {
        blockHeight: blockHeight,
        timestamp: new Date(),
        dateHour: dateHour,
        validators: {
          'current_validators': validators["current_validators"],
          'next_validators': validators["next_validators"],
          'current_proposals': validators["current_proposals"],
          'current_fisherman': validators["current_fisherman"],
          'next_fisherman': validators["next_fisherman"]
        }
      },
      {upsert: true}
    )
  } catch (e) {
    console.log(e);
  }

  ValidatorStats.update(
    {blockHeight: blockHeight},
    {
      blockHeight: blockHeight,
      timestamp: new Date(),
      seatPrice: priceCurrent,
      seatPriceNext: priceNext,
      seatPriceProposals: priceProposals,
      validators: allValidators,
      totalVotes: {},
      totalValidatorsStake: totalValidatorsStake,
      totalDelegators: allDelegators.length,
    },
    {upsert: true}
  )


  DelegatorStats.update(
    {blockHeight: blockHeight},
    {
      blockHeight: blockHeight,
      timestamp: new Date(),
      delegators: allDelegators,
      hidden: false,
    },
    {upsert: true}
  )

}

async function updateDelegators() {

  /*
  hideDelegatorsDays().then().catch((e) => {
    console.log(e);
  })


  const firstDate = new Date('2020-10-21T17:00:00.000Z');
  let lastDate = new Date();
  lastDate.setDate(lastDate.getDate() - 2);
  Delegators.remove({blockTimestamp: {$gte: firstDate, $lt: lastDate}});
  */

  const delegatorStats = DelegatorStats.find({}, {sort: {blockHeight: -1}, limit: 4}).fetch();
  let i = -1;

  for (const item of delegatorStats) {
    let blockDate = new Date(item.timestamp).toISOString().slice(0, 10);
    console.log(item.blockHeight + " [" + blockDate + "]");
    const nearPriceHistorical = NearPriceHistorical.findOne({date: blockDate});

    for (const item2 of item.delegators) {
      const txAction = TxActions.find({
        receipt_receiver_id: item2.pool,
        block_height: {
          $lt: i === -1 ? 9999999999999 : delegatorStats[i].blockHeight,
          $gte: delegatorStats[i + 1].blockHeight
        },
        predecessor_account_id: item2.account_id,
      }).fetch();

      Delegators.update(
        {account_id: item2.account_id, blockHeight: item.blockHeight, pool: item2.pool},
        {
          account_id: item2.account_id,
          blockHeight: item.blockHeight,
          blockTimestamp: item.timestamp,
          unstaked_balance: item2.unstaked_balance,
          staked_balance: item2.staked_balance,
          can_withdraw: item2.can_withdraw,
          pool: item2.pool,
          priceInfo: nearPriceHistorical ? nearPriceHistorical.price : 0,
          transactionInfo: txAction.length > 0 ? txAction : null,
        },
        {upsert: true}
      )

    }
    i = i + 1;
  }


}

async function hideDelegatorsDays() {
  //const firstDate = new Date('2020-10-21T17:00:00.000Z');
  let lastDate = new Date();
  lastDate.setDate(lastDate.getDate() - 2);
  DelegatorStats.update(
    {
      timestamp: {$lt: lastDate}
    },
    {$set: {"hidden": true}},
    {upsert: false, multi: true}
  )
}

/*
updateDelegators().then().catch((e) => {
  console.log(e);
})
*/

/*
storeData().then((r) => {
  console.log(r)
}).catch((e) => {
  console.log(e);
})
*/

if (Meteor.isServer) {
  SyncedCron.add({
    name: 'Pull API',

    schedule: function (parser) {
      return parser.text('every 20 minutes');
    },

    job: async function () {
      try {
        await storeData();
        console.log("Pull API")
      } catch (e) {
        console.log(e);
      }

    }
  });

  SyncedCron.add({
    name: 'Fetch Block',

    schedule: function (parser) {
      return parser.text('every 1 minute');
    },

    job: async function () {
      try {
        let finalBlock = await provider.block({finality: 'final'});
        let firstBlock = await provider.block({blockId: finalBlock.header.next_epoch_id});
        let prevBlock = await provider.block({blockId: finalBlock.header.epoch_id});
        BlockRaw.update(
          {
            blockHeight: finalBlock.header.height,
          },
          {
            author: finalBlock.author,
            prevEpochBlockHeight: prevBlock.header.height,
            epochBlockHeight: firstBlock.header.height,
            blockHeight: finalBlock.header.height,
            epoch_id: finalBlock.header.epoch_id,
            next_epoch_id: finalBlock.header.next_epoch_id,
            this_timestamp: new Date(),
            timestamp: finalBlock.header.timestamp,
            epoch_timestamp: firstBlock.header.timestamp,
            prev_epoch_timestamp: prevBlock.header.timestamp,
            validator_reward: finalBlock.header.validator_reward,
            total_supply: finalBlock.header.total_supply,
          },
          {upsert: true}
        )
      } catch (e) {
        console.log(e);
      }
    }
  });

  SyncedCron.add({
    name: 'Update delegators',

    schedule: function (parser) {
      return parser.text('every 25 minutes');
    },

    job: async function () {
      try {
      await updateDelegators()
      } catch (e) {
        console.log(e);
      }
    }
  });


}



