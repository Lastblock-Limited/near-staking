import {Meteor} from 'meteor/meteor';
import {Mongo} from "meteor/mongo";
import {check} from "meteor/check";
import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Decimal} from 'decimal.js';


export const ValidatorStats = new Mongo.Collection("validatorStats");
export const DelegatorStats = new Mongo.Collection("delegatorStats");
export const Delegators = new Mongo.Collection("delegators");
export const ValidatorRaw = new Mongo.Collection("validatorRaw");
export const BlockRaw = new Mongo.Collection("blockRaw");
export const NearPriceHistorical = new Mongo.Collection("nearPriceHistorical");
export const NearPrice = new Mongo.Collection("nearPrice");
export const CoinGeckoCurrencies = new Mongo.Collection("coinGeckoCurrencies");
export const TxActions = new Mongo.Collection("txActions");


if (Meteor.isServer) {
  Meteor.publish("ValidatorStats", function () {
    return ValidatorStats.find({}, {sort: {blockHeight: -1}, limit: 1});
  });

  Meteor.publish("NearPrice", function () {
    return NearPrice.find({});
  });

  Meteor.publish("NearPriceHistorical", function () {
    return NearPriceHistorical.find({});
  });

  Meteor.publish("CoinGeckoCurrencies", function () {
    return CoinGeckoCurrencies.find({});
  });

  Meteor.publish("Delegators", function (account_ids) {
    check(account_ids, Array);
    return Delegators.find({account_id: {$in: account_ids}}, {sort: {blockHeight: -1}});
  });

  Meteor.publish("BlockRaw", function () {
    return BlockRaw.find({}, {sort: {blockHeight: -1}, limit: 60});
  });

  Meteor.publish("TxActions", function () {
    return TxActions.find({});
  });
}


export const returnApy = new ValidatedMethod({
  name: "returnApy",
  mixins: [],
  validate() {
  },
  run() {
    if (Meteor.isServer) {
      const lastBlock =  BlockRaw.find({}, {sort: {blockHeight: -1}, limit: 1}).fetch();
      const totalSupply = lastBlock[0].total_supply;
      const validators = ValidatorRaw.find({}, {sort: {blockHeight: -1}, limit: 1}).fetch();
      let totalStake = 0;
      validators[0].validators.current_validators.map((item, key) => {
        totalStake = new Decimal(totalStake).plus(item.stake);
      })
      const maxInflationRate = 0.05;
      const epochLength = new Decimal(lastBlock[0].epoch_timestamp).minus(lastBlock[0].prev_epoch_timestamp);
      const epochsPerYear = new Decimal(31536000).div(new Decimal(epochLength).div(1e9));
      const nearTreasuryReward = 0.1;
      return totalSupply * ((1 + maxInflationRate) ** (1 / epochsPerYear) - 1) * epochsPerYear / totalStake * (1 - nearTreasuryReward);
    }
  },
});
