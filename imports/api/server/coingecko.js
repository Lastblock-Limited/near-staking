import {SyncedCron} from 'meteor/littledata:synced-cron';
import {CoinGeckoCurrencies, NearPrice, NearPriceHistorical} from "../nearf";
import {Meteor} from "meteor/meteor";

let moment = require('moment');

const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();

const getPrice = async () => {
  return CoinGeckoClient.coins.fetch('near');
};

const getCoinGeckoCurrencies = async () => {
  return CoinGeckoClient.simple.supportedVsCurrencies();
}

const getHistoricalPriceByDate = async (date) => {
  return CoinGeckoClient.coins.fetchHistory('near', {
    date: date
  });
};


/*

// Dropping existing data //
const removeHistoricalData = () => {
  NearPriceHistorical.remove({});
}

// only execute if data is lost //
const getHistoricalData = async () => {
  for (let d = new Date('2020-10-20'); d <= new Date(); d.setDate(d.getDate() + 1)) {
    let date = moment(new Date(d)).format('DD-MM-YYYY');
    let dateToStore = moment(new Date(d)).format('YYYY-MM-DD');
    const result = await getHistoricalPriceByDate(date);
    NearPriceHistorical.insert(
      {
        date: dateToStore,
        price: result.data.market_data.current_price,
        market_cap: result.data.market_data.market_cap,
        total_volume: result.data.market_data.total_volume,
      },
    )
    console.log(date + ' processed');
  }
}
removeHistoricalData()

getHistoricalData().then().catch((e) => {
  console.log(e);
})

getCoinGeckoCurrencies().then().catch((e) => {
  console.log(e);
})
*/


const getHistoricalDataDaily = async () => {
  for (let d = new Date(new Date().setDate(new Date().getDate() - 3)); d <= new Date(); d.setDate(d.getDate() + 1)) {
    let date = moment(new Date(d)).format('DD-MM-YYYY');
    let dateToStore = moment(new Date(d)).format('YYYY-MM-DD');
    const result = await getHistoricalPriceByDate(date);
    NearPriceHistorical.update(
      {
        date: dateToStore,
      },
      {
        date: dateToStore,
        price: result.data.market_data.current_price,
        market_cap: result.data.market_data.market_cap,
        total_volume: result.data.market_data.total_volume,
      },
      {upsert: true}
    )
    console.log(date + ' processed');
  }
}

/*
getHistoricalDataDaily().then().catch((e) => {
  console.log(e);
})
*/

if (Meteor.isServer) {

  SyncedCron.add({
    name: 'Pull CoinGecko Currencies',
    schedule: function (parser) {
      return parser.text('every 1 day');
    },
    job: async function () {
      try {
        const currencies = await getCoinGeckoCurrencies();
        if (currencies.success === true) {
          CoinGeckoCurrencies.update(
            {},
            {
              currencies: currencies.data
            },
            {upsert: true}
          )
        }
      } catch (e) {
        console.log(e);
      }
    }
  });

  SyncedCron.add({
    name: 'Pull Near Price Historical Daily',
    schedule: function (parser) {
      return parser.text('every 1 hour');
    },
    job: async function () {
      try {
     //   await getHistoricalDataDaily();
      } catch (e) {
        console.log(e);
      }
    }
  });


  SyncedCron.add({
    name: 'Pull Near Price',
    schedule: function (parser) {
      return parser.text('every 30 sec');
    },
    job: async function () {
      try {
       const result = await getPrice();
        if (result.success === true) {
          NearPrice.update(
            {},
            {
              near_price_data: result.data.market_data,
            },
            {upsert: true}
          )
        }
      } catch (e) {
        console.log(e);
      }
    }
  });

}
