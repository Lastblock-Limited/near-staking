import {Meteor} from 'meteor/meteor';
import "../imports/api/nearf";
import "../imports/api/server/coingecko";
import "../imports/api/server/near";
import "../imports/api/server/transactions";
import {SyncedCron} from 'meteor/littledata:synced-cron';


Meteor.startup(() => {
  //SyncedCron.start();
});
