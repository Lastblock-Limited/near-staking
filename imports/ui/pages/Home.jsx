import React, {useEffect, useState} from "react";
import {Meteor} from "meteor/meteor";
import {useGlobalMutation, useGlobalState} from "../../container";
import {useTracker} from "meteor/react-meteor-data";
import {sha256} from 'js-sha256';
import {Buffer} from 'buffer';

let moment = require('moment');

import {
  BrowserView,
  MobileView,
  isBrowser,
  isFirefox
} from "react-device-detect";

import useRouter from "../../utils/use-router";
import {useMethod} from "../../utils/use-method";
import {
  ValidatorStats,
  Delegators,
  BlockRaw,
  NearPriceHistorical,
  CoinGeckoCurrencies,
  NearPrice
} from "../../api/nearf";
import Navbar from "./Navbar";
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import PersonIcon from '@material-ui/icons/Person';
import {withStyles} from "@material-ui/core/styles";
import LinearProgress from '@material-ui/core/LinearProgress';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import Badge from '@material-ui/core/Badge';
import Alert from '@material-ui/lab/Alert';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import LaunchIcon from '@material-ui/icons/Launch';
import HeightIcon from '@material-ui/icons/Height';
import {
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  makeStyles,
  Typography,
  Link,
  Button,
  CardHeader, CssBaseline, InputAdornment, Select, Chip
} from "@material-ui/core";
import {orange, green, red} from '@material-ui/core/colors';
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Icon from "@material-ui/core/Icon";

let dateFormat = require('dateformat');


const yoctoNEAR = 1000000000000000000000000;
const accountToLockup = (accountId) => {
  return sha256(Buffer.from(accountId)).toString('hex').slice(0, 40);
}


const usePriceStats = () =>
  useTracker(() => {
    const subscription = Meteor.subscribe("NearPrice");
    const priceStats = NearPrice.findOne();
    const meteorStatus = Meteor.status();

    return {
      priceStats: priceStats,
      isLoadingPriceStats: !subscription.ready(),
      meteorStatus: meteorStatus,
    };
  }, []);

const usePriceStatsHistorical = () =>
  useTracker(() => {
    const subscription = Meteor.subscribe("NearPriceHistorical");
    const priceStats = NearPriceHistorical.find({date: {$eq: moment(new Date()).format('YYYY-MM-DD')}});
    const meteorStatus = Meteor.status();

    return {
      priceStats: priceStats.fetch(),
      isLoadingPriceStatsHistorical: !subscription.ready(),
      meteorStatus: meteorStatus,
    };
  }, []);

const useCoinGeckoCurrencies = () =>
  useTracker(() => {
    const subscription = Meteor.subscribe("CoinGeckoCurrencies");
    const coinGeckoCurrencies = CoinGeckoCurrencies.findOne();
    const meteorStatus = Meteor.status();

    return {
      coinGeckoCurrencies: coinGeckoCurrencies,
      isLoadingCoinGeckoCurrencies: !subscription.ready(),
      meteorStatus: meteorStatus,
    };
  }, []);

const useBStats = () =>
  useTracker(() => {
    const subscription = Meteor.subscribe("BlockRaw");
    const bStats = BlockRaw.findOne({}, {sort: {blockHeight: -1}});
    const meteorStatus = Meteor.status();
    passed = false;

    return {
      bStats: bStats,
      isLoading: !subscription.ready(),
      meteorStatus: meteorStatus,
    };
  }, []);

const useStats = () =>
  useTracker(() => {
    const subscription = Meteor.subscribe("ValidatorStats");
    const stats = ValidatorStats.findOne({}, {sort: {blockHeight: -1}});
    const meteorStatus = Meteor.status();
    passed = false;

    return {
      stats: stats,
      isLoading: !subscription.ready(),
      meteorStatus: meteorStatus,
    };
  }, []);


const useDelegators = (account_ids, numRec) =>
  useTracker(() => {
    const subscription = Meteor.subscribe("Delegators", account_ids);
    const delegators = Delegators.find({}, {limit: numRec}).fetch();
    const meteorStatus = Meteor.status();
    passed = false;

    return {
      delegators: delegators,
      isDelegatorsLoading: !subscription.ready(),
      meteorStatus: meteorStatus,
    };
  }, []);


let passed = false;

const PriceInfo = () => {
  const stateCtx = useGlobalState();
  const mutationCtx = useGlobalMutation();
  const {priceStats, isLoadingPriceStats} = usePriceStats();
  const {coinGeckoCurrencies, isLoadingCoinGeckoCurrencies} = useCoinGeckoCurrencies();
  const [currency, setCurrency] = useState([
    {
      text: "Select Currency",
      value: ""
    },
  ])


  useEffect(() => {
    if (!isLoadingCoinGeckoCurrencies && coinGeckoCurrencies.currencies) {
      let a = [];
      coinGeckoCurrencies.currencies.sort((a, b) => a >= b ? 1 : -1).map((item, key) => {
        a.push(
          {
            text: item.toString().toUpperCase(),
            value: item,
            checked: stateCtx.config.currency === item,
          },
        )
      })
      setCurrency(a);
    }

    return () => {
    };
  }, [isLoadingCoinGeckoCurrencies]);

  const handleSelectChange = (event) => {
    mutationCtx.updateConfig({
      currency: event.target.value
    })
  }

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      '& > .fa': {
        margin: theme.spacing(2),
      },
    },
    card: {
      width: '100%',
      borderRadius: 25,
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    table: {
      width: '100%',
      borderRadius: 12,
    },
    divider: {
      marginBottom: 10,
      marginTop: 10,
    },
    grid: {
      marginTop: 15,
    },
    priceChangeUp: {
      color: green[theme.palette.type === "light" ? 700 : 500],
    },
    priceChangeDown: {
      color: red[theme.palette.type === "light" ? 700 : 500],
    },
  }));
  const classes = useStyles();

  const StyledTableCell = withStyles((theme) => ({
    head: {
      backgroundColor: theme.palette.grey[theme.palette.type === "light" ? 100 : 900],
      color: theme.palette.type === "light" ? theme.palette.common.black : theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);

  const StyledTableRow = withStyles((theme) => ({
    root: {
      backgroundColor: theme.palette.grey[theme.palette.type === "light" ? 50 : 700],
      color: theme.palette.type === "light" ? theme.palette.common.black : theme.palette.common.white,
    },
  }))(TableRow);


  return (
    <div className={classes.root}>
      <Grid container direction="row" className={classes.grid}>
        <Grid item xs>
          <Card className={classes.card}>
            <CardContent>
              <Grid container direction="row">
                <Grid item xs={6} md={9}>
                  <Typography variant="caption">the pricing information is kindly provided by{" "}
                    <Link target="_blank" color="inherit" variant="caption" rel="nofollow"
                          href="https://www.coingecko.com/en/api_terms">CoinGecko</Link>
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box>
                    <FormControl fullWidth>
                      <TextField id="selectCurrency" label="Choose currency"
                                 value={stateCtx.config.currency}
                                 defaultValue={''}
                                 variant="outlined"
                                 size="small"
                                 onChange={handleSelectChange} select>
                        {currency?.map((item) => {
                          return (
                            <MenuItem key={item.value} value={item.value}>
                              {item.text ?? item.value}
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
              <Grid container direction="row" className={classes.grid}>
                <Grid item xs>
                  <TableContainer component={Paper} className={classes.table}>
                    <Table responsive="true">
                      <TableHead>
                        {!isLoadingPriceStats && priceStats && stateCtx.config.currency ?
                          <TableRow>
                            <StyledTableCell>
                              NEAR/{stateCtx.config.currency ? stateCtx.config.currency.toString().toUpperCase() : null}:<br/>
                            </StyledTableCell>
                            <StyledTableCell>24h change</StyledTableCell>
                            <StyledTableCell>ATH</StyledTableCell>
                            <StyledTableCell>24h high</StyledTableCell>
                            <StyledTableCell>24h low</StyledTableCell>
                            <StyledTableCell>Market Cap</StyledTableCell>
                            <StyledTableCell>Volume</StyledTableCell>
                            <StyledTableCell>Circulating Supply</StyledTableCell>
                          </TableRow>
                          : null
                        }
                      </TableHead>
                      <TableBody>
                        {!isLoadingPriceStats && priceStats && stateCtx.config.currency ?
                          <StyledTableRow>
                            <StyledTableCell>
                              <Typography variant="h3">
                                {stateCtx.config.currency === 'usd' ? '$' : null}
                                {stateCtx.config.currency === 'eur' ? '€' : null}
                                {stateCtx.config.currency === 'gbp' ? '£' : null}
                                {!isLoadingPriceStats && priceStats ? priceStats.near_price_data.current_price[stateCtx.config.currency] : null}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography variant="h5"
                                          className={priceStats.near_price_data.price_change_percentage_24h_in_currency[stateCtx.config.currency] >= 0 ? classes.priceChangeUp : classes.priceChangeDown}>
                                {priceStats.near_price_data.price_change_percentage_24h_in_currency[stateCtx.config.currency] >= 0 ? "+" : ""}
                                {priceStats.near_price_data.price_change_percentage_24h_in_currency[stateCtx.config.currency].toFixed(2) + "%"}
                              </Typography>
                              <Typography
                                className={priceStats.near_price_data.price_change_24h_in_currency[stateCtx.config.currency] >= 0 ? "" : ""}>
                                {priceStats.near_price_data.price_change_24h_in_currency[stateCtx.config.currency] >= 0 ? "+" : ""}
                                {priceStats.near_price_data.price_change_24h_in_currency[stateCtx.config.currency].toFixed(6)}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography variant="h5">
                                {stateCtx.config.currency === 'usd' ? '$' : null}
                                {stateCtx.config.currency === 'eur' ? '€' : null}
                                {stateCtx.config.currency === 'gbp' ? '£' : null}
                                {!isLoadingPriceStats && priceStats ? priceStats.near_price_data.ath[stateCtx.config.currency] : null}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography>
                                {stateCtx.config.currency === 'usd' ? '$' : null}
                                {stateCtx.config.currency === 'eur' ? '€' : null}
                                {stateCtx.config.currency === 'gbp' ? '£' : null}
                                {!isLoadingPriceStats && priceStats ? priceStats.near_price_data.high_24h[stateCtx.config.currency] : null}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography>
                                {stateCtx.config.currency === 'usd' ? '$' : null}
                                {stateCtx.config.currency === 'eur' ? '€' : null}
                                {stateCtx.config.currency === 'gbp' ? '£' : null}
                                {!isLoadingPriceStats && priceStats ? priceStats.near_price_data.low_24h[stateCtx.config.currency] : null}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography>
                                {stateCtx.config.currency === 'usd' ? '$' : null}
                                {stateCtx.config.currency === 'eur' ? '€' : null}
                                {stateCtx.config.currency === 'gbp' ? '£' : null}
                                {!isLoadingPriceStats && priceStats ? priceStats.near_price_data.market_cap[stateCtx.config.currency].toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography>
                                {stateCtx.config.currency === 'usd' ? '$' : null}
                                {stateCtx.config.currency === 'eur' ? '€' : null}
                                {stateCtx.config.currency === 'gbp' ? '£' : null}
                                {!isLoadingPriceStats && priceStats ? priceStats.near_price_data.total_volume[stateCtx.config.currency].toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography>
                                Ⓝ{" "}{!isLoadingPriceStats && priceStats ? priceStats.near_price_data.circulating_supply.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}
                              </Typography>
                            </StyledTableCell>
                          </StyledTableRow>
                          : null
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

const ValidatorBlockTable = (item, key, props) => {
  const stateCtx = useGlobalState();
  const validatorStake = ((+item.data.stake.toFixed(0) / +item.totalValidatorsStake.toFixed(0)) * 100).toFixed(2);
  const cumulativeStake = item.data.cumulative_stake.toFixed(2)

  const useStyles = makeStyles((theme) => ({
    success: {
      backgroundColor: theme.palette.success.main,
    },
    warning: {
      backgroundColor: theme.palette.warning.main,
    },
    error: {
      backgroundColor: theme.palette.error.main,
    },
    textError: {
      color: theme.palette.error.main,
    },
    textWarning: {
      color: theme.palette.warning.main,
    },
    textSuccess: {
      color: theme.palette.success.main,
    }
  }));
  const classes = useStyles();

  let showWarning = false;

  if (!passed && item.sort === 'stake' && cumulativeStake >= 35) {
    passed = true;
    showWarning = true;
  }

  let kicked;
  if (+item.data.validator_total_kicked_times === 0) {
    kicked = item.data.validator_total_kicked_times;
  } else if (+item.data.validator_total_kicked_times === 1) {
    kicked = <span className={classes.textWarning}>{item.data.validator_total_kicked_times}</span>;
  } else {
    kicked = <span className={classes.textError}>{item.data.validator_total_kicked_times}</span>

  }

  const CumulativeBar = (arg) => {

    const useStyles = makeStyles((theme) => ({
      bar: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: '0px',
        top: '0px',
      },
      wrapper: {
        height: '100%',
        width: '100%',
        display: 'flex',
      },
      chart: {
        backgroundColor: theme.palette.type === 'dark' ? 'rgb(105, 245, 225)' : 'rgb(40, 102, 253)',
      },
      stakeNumber: {
        top: '0px',
        position: 'absolute',
        height: '100%',
        width: '100%',
        padding: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        fontSize: '14px',
        '& > span': {
          width: '52px',
        }
      }
    }));

    const classes = useStyles();

    const cumulativeStakeWidth = arg.cumulativeStake ? arg.cumulativeStake + '%' : '0%';
    const stakeWidth = arg.stake ? arg.stake + '%' : '0%';

    return (
      <>
        <Box className={classes.bar} value={arg.cumulativeStake}>
          <Box className={classes.wrapper}>
            <Box className={classes.chart} style={{opacity: '0.2', width: cumulativeStakeWidth, minWidth: '1px'}}/>
            <Box className={classes.chart} style={{opacity: '0.9', width: stakeWidth, minWidth: '1px'}}/>
          </Box>
          <Box className={classes.stakeNumber}>
            <Box component="span">{arg.cumulativeStake}%</Box>
          </Box>

        </Box>
      </>
    )
  }

  const StyledTableCell = withStyles((theme) => ({
    head: {
      backgroundColor: theme.palette.grey[theme.palette.type === "light" ? 400 : 900],
      color: theme.palette.type === "light" ? theme.palette.common.black : theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);

  const StyledTableRow = withStyles((theme) => ({
    root: {
      backgroundColor: theme.palette.grey[theme.palette.type === "light" ? 50 : 700],
      color: theme.palette.type === "light" ? theme.palette.common.black : theme.palette.common.white,
    },
  }))(TableRow);

  return (
    (item) ?
      <>
        {showWarning
          ?
          <StyledTableRow>
            <StyledTableCell colSpan="7"><Alert severity="warning" icon={false}>
              <Box mr={2} display="inline"><Icon className={'fa fa-arrow-circle-down ' + classes.textError}
                                                 style={{verticalAlign: 'bottom'}}/></Box>CUMULATIVE
              STAKE ABOVE CAN HALT THE NETWORK.
              IMPROVE DECENTRALIZATION AND DELEGATE TO VALIDATORS BELOW.<Box ml={2} display="inline"><Icon
              className={'fa fa-arrow-circle-up ' + classes.textSuccess}
              style={{verticalAlign: 'bottom'}}/></Box></Alert></StyledTableCell>
          </StyledTableRow> : null}
        <StyledTableRow className={stateCtx.config.poolMonitor === item.data.account_id ? "grey lighten-1" : ""}>
          <StyledTableCell>
            <Box>

            </Box>
            <Grid display="flex" m={0} p={0}>
              <Grid mr={2} mt={0}>
                {item.data.prev_epoch_kickout === "" ?
                  <>
                    {((item.data.num_produced_blocks / item.data.num_expected_blocks) * 100).toFixed(1) <= 95 ?
                      <>
                        {((item.data.num_produced_blocks / item.data.num_expected_blocks) * 100).toFixed(1) <= 90 ?
                          <FiberManualRecordIcon style={{verticalAlign: "bottom"}} className={classes.textError} fontSize="large"/>
                          :
                          <FiberManualRecordIcon style={{verticalAlign: "bottom"}} className={classes.textWarning} fontSize="large"/>
                        }
                      </>
                      :
                      <>
                        {+item.data.stake >= +item.seatPrice ?
                          <FiberManualRecordIcon style={{verticalAlign: "bottom"}} className={classes.textSuccess} fontSize="large"/>
                          :
                          <FiberManualRecordIcon style={{verticalAlign: "bottom"}} className={classes.textWarning} fontSize="large"/>
                        }
                      </>
                    }
                  </> :
                  <>
                    {(item.data.prev_epoch_kickout === "Unstaked") ?
                      <FiberManualRecordIcon style={{verticalAlign: "bottom"}} className={classes.textWarning} fontSize="small"/>
                      :
                      <FiberManualRecordIcon
                        style={{verticalAlign: "bottom"}}
                        className={+item.data.num_produced_blocks === 0 ? classes.textError : classes.textWarning}
                        fontSize="small"/>
                    }
                  </>
                }
                <Link underline="none" color="inherit" style={{display: "inline-block"}}
                      href={"https://explorer.mainnet.near.org/accounts/" + item.data.account_id}
                      target="_blank">
                  <Typography variant="h6"><b>{item.data.account_id}</b></Typography>
                </Link>
              </Grid>
              <Grid spacing={3}>
                {item.data.type.indexOf("new_validators") !== -1 ?
                  <Chip size="small" color="inherit" label="COMING NEXT EPOCH" className={classes.success}/>
                  :
                  null
                }
                {item.data.type.indexOf("new_proposals") !== -1 ?
                  <Chip size="small" label="NEW PROPOSAL" className={classes.success}/>
                  :
                  null
                }
                {+item.data.stake <= +item.seatPriceNext ?
                  <Chip size="small" label="PROPOSAL DECLINED" className={classes.error}/>
                  :
                  null
                }
                {+item.data.stake < +item.seatPriceNext ?
                  <Typography variant="h6" className={classes.textError}>not enough stake</Typography>
                  : null
                }

                {item.data.prev_epoch_kickout === "" ?
                  <>
                    {((item.data.num_produced_blocks / item.data.num_expected_blocks) * 100).toFixed(1) <= 95 ?
                      <>
                        <Typography variant="h6" className={"text-left" + classes.textError}>{
                          ((item.data.num_produced_blocks / item.data.num_expected_blocks) * 100).toFixed(1)
                        }% uptime</Typography>
                      </>
                      :
                      null
                    }
                  </> :
                  <>
                    {(item.data.prev_epoch_kickout === "Unstaked") ?
                      <div>
                        paused
                      </div>
                      :
                      <div className={classes.textError}>
                        next: kicked out
                      </div>
                    }
                  </>
                }
              </Grid>
            </Grid>
          </StyledTableCell>
          <StyledTableCell>
            <Typography>
              {Number(+item.data.pool_fees) === +item.data.pool_fees && +item.data.pool_fees % 1 === 0 ? item.data.pool_fees : item.data.pool_fees.toFixed(1)}%
            </Typography>
          </StyledTableCell>
          <StyledTableCell>
            <Typography>
              {item.data.stake.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </Typography>
            {((item.data.stake.toFixed(0) / item.totalValidatorsStake.toFixed(0)) * 100).toFixed(2)}%
            {(+item.data.stake.toFixed(0) <= +item.seatPriceNext?.toFixed(0)) ? ': not enough stake' : ''}
          </StyledTableCell>
          <StyledTableCell>
            <Typography>
              {item.data.stake.toFixed(0) - item.data.prev_stake.toFixed(0) !== 0 ?
                (item.data.stake.toFixed(0) - item.data.prev_stake.toFixed(0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : null
              }{" "}
              {+item.data.stake.toFixed(0) > +item.data.prev_stake.toFixed(0) ?
                <Icon className={'fa fa-arrow-circle-up ' + classes.textSuccess}
                      style={{verticalAlign: 'bottom'}}/>
                :
                null
              }
              {+item.data.stake.toFixed(0) < +item.data.prev_stake.toFixed(0) ?
                <Icon className={'fa fa-arrow-circle-down ' + classes.textError}
                      style={{verticalAlign: 'bottom'}}/>
                :
                null
              }
            </Typography>
          </StyledTableCell>
          <StyledTableCell>
            <Typography>{item.data.delegatorsCount}</Typography>
          </StyledTableCell>
          <StyledTableCell style={{position: 'relative', padding: '0'}}>
            {item.sort === 'stake' && cumulativeStake ?
              <CumulativeBar item={item} cumulativeStake={cumulativeStake}
                             stake={((item.data.stake.toFixed(0) / item.totalValidatorsStake.toFixed(0)) * 100).toFixed(2)}/>
              : null
            }
          </StyledTableCell>
        </StyledTableRow>
      </>
      :
      null

  )
}


const Promo = () => {
  const {bStats, isBLoading} = useBStats();
  let epochProgress = 0;
  let epochTimeProgress = 0;
  let prevEpochTime = 0;
  let nextEpochTime = 0;
  let thisEpochTime = 0;
  if (!isBLoading && bStats) {
    epochProgress = (+bStats.blockHeight - +bStats.epochBlockHeight) / (+bStats.epochBlockHeight - +bStats.prevEpochBlockHeight) * 100;
    epochTimeProgress = ((+bStats.timestamp - +bStats.epoch_timestamp) / 1000000000 / 60);
    prevEpochTime = ((+bStats.epoch_timestamp - +bStats.prev_epoch_timestamp) / 1000000000 / 60);
    thisEpochTime = (epochTimeProgress * 100) / epochProgress;
    nextEpochTime = thisEpochTime - epochTimeProgress;
  }
  //console.log((epochTimeProgress * 100 / epochProgress));
  const CustomLinearProgress = withStyles(theme => ({
    root: {
      height: 30,
      borderRadius: 5
    },
    colorPrimary: {
      backgroundColor:
        theme.palette.grey[theme.palette.type === "light" ? 200 : 700]
    },
    bar: {
      backgroundColor: orange[theme.palette.type === "light" ? 700 : 300],
    },
  }))(LinearProgress);

  const useStyles = makeStyles((theme) => ({
    card: {
      width: '100%',
      borderRadius: 25,
    },
    divider: {
      marginBottom: 10,
      marginTop: 10,
    },
    grid: {
      marginTop: 15,
    },
    percentage: {
      color: orange[theme.palette.type === "light" ? 900 : 300],
    },
    times: {
      fontSize: 20,
      fontWeight: 'bold',
      color: orange[theme.palette.type === "light" ? 900 : 300],
    }
  }));
  const classes = useStyles();

  return (
    <div>
      <CssBaseline>
        <Grid container direction="row" spacing={3}>
          <Grid item xs>
            <Card className={classes.card}>
              <CardContent>
                <CardHeader title={
                  <Typography variant="subtitle2" component="h4" align="left">
                    <span>Epoch Elapsed Time</span>: <span
                    className={classes.times}>{`${epochTimeProgress / 60 ^ 0}h ` + (epochTimeProgress % 60).toFixed(0)}m</span>{" "}
                    <span>Prev. Epoch Time:</span> <span
                    className={classes.times}>{`${prevEpochTime / 60 ^ 0}h ` + (prevEpochTime % 60).toFixed(0)}m</span>{" "}
                    <span>ETA:</span> <span
                    className={classes.times}>{`${nextEpochTime / 60 ^ 0}h ` + (nextEpochTime % 60).toFixed(0)}m</span>{" "}
                  </Typography>
                }/>
                <Box display="flex" alignItems="center">
                  <Box width="100%" mr={1}>
                    <CustomLinearProgress variant="determinate" value={+(epochProgress)?.toFixed(2)}/>
                  </Box>
                  <Box minWidth={35} className={classes.percentage}>
                    <Typography> {(epochProgress).toFixed(2)}%</Typography>
                  </Box>
                </Box>
                <Divider light className={classes.divider}/>
                <Typography mt={1} align="right">
                  <Link target="_blank" color="inherit" variant="body2"
                        href="https://starduststaking.com">
                    sponsored by Stardust Staking
                  </Link>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CssBaseline>
    </div>

  )

}

const LoadingData = () => {
  return (
    <Dialog
      open={true}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <Typography id="modal-title" variant="h6">Updating, please wait...</Typography>
          <Typography id="modal-description" variant="overline">we are updating the network data, please
            wait</Typography>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  )
}

const Home = () => {
    const router = useRouter();
    const history = router.history;
    const stateCtx = useGlobalState();
    const mutationCtx = useGlobalMutation();

    const navStyle = {height: "100%", width: "100%", paddingTop: "2rem"};
    const {stats, isLoading} = useStats();
    //const {dStats, isDLoading} = useDStats();
    const {bStats, isBLoading} = useBStats();

    const returnApy = useMethod("returnApy");


    useEffect(() => {
      returnApy
        .call()
        .then()
        .catch((error) => {
          console.log(error);
        });
    }, []);


    const accountMonitor = stateCtx.config.accountMonitor;
    const lockupAccountMonitor = accountToLockup(stateCtx.config.accountMonitor) + ".lockup.near";
    const a = [];
    a.push(accountMonitor);


    const {delegators, isDelegatorsLoading} = useDelegators(a, stateCtx.config.lastEpochs);


    const [userAccount, setUserAccount] = useState({
      value: "",
      valid: true,
      message: "",
    });

    const [userAccountMonitor, setUserAccountMonitor] = useState({
      value: "",
      valid: true,
      message: "",
    });


    const [userFound, setUserFound] = useState(false);
    const [lockupAccount, setLockupAccount] = useState('');
    const [showLockupBtn, setShowLockupBtn] = useState(false);

    let activeValidators = 0;
    let newValidators = 0;
    let newProposals = 0;
    if (stats) {
      for (const item of stats.validators) {
        if (item.type.indexOf('current_validators') !== -1) {
          activeValidators++;
        }
        if (item.type.indexOf('new_validators') !== -1) {
          newValidators++;
        }
        if (item.type.indexOf('new_proposals') !== -1) {
          newProposals++;
        }
      }
    }

    useEffect(() => {
      passed = false;
      return () => {
      };
    }, [stats]);


    const handleFeesClick = () => {
      mutationCtx.updateConfig({
        sort: 'fees',
      });
      passed = false;
    }

    const handleStakeClick = () => {
      mutationCtx.updateConfig({
        sort: 'stake',
      });
      passed = false;
    }

    const handleLockupBtnClick = () => {
      const elId = document.getElementById('userAccount');
      elId.value = lockupAccount;
      let event = new Event('change');
      changeHandler();
    }

    const changeHandlerMonitor = () => {
      const elId = document.getElementById('userAccountMonitor');
      const value = elId.value.toLowerCase();
      setUserAccountMonitor({value: value, valid: !!value});
    };


    const handleAddUserMonitorClick = () => {
      if (userAccountMonitor.valid) {
        let str = userAccountMonitor.value;
        let a = str.split('/');
        mutationCtx.updateConfig({
          accountMonitor: a[0],
        });
        if (a[1]) {
          mutationCtx.updateConfig({
            poolMonitor: a[1],
          });
        }
        location.reload();

      }
    };

    let accountPools = [];
    let pools = [];
    if (!isDelegatorsLoading && delegators) {
      let t = [];
      for (const d of delegators) {
        t.push(d.pool)
      }
      accountPools = t.filter((v, i, a) => a.indexOf(v) === i);
      for (const a of accountPools) {
        pools[a] = [];
        for (const d of delegators) {
          if (a === d.pool) {
            pools[a].push(d);
          }
        }
      }
    }

    let prevEpochTime = 0;
    if (!isBLoading && bStats) {
      prevEpochTime = ((+bStats.epoch_timestamp - +bStats.prev_epoch_timestamp) / 1000000000 / 60 / 60);
    }

    let rewards = [];
    let epochs = [];
    accountPools.map((item, key) => {
      rewards[item] = [];
      pools[item].map((item2, key2) => {
        rewards[item][item2.account_id] = [];
        let a3 = [];
        a3[item2.blockHeight] = item2;
        rewards[item][item2.account_id].push(a3);
        epochs.push(item2.blockHeight.toString());
      })
    });

    epochs = epochs.filter((v, i, a) => a.indexOf(v) === i);

    const showLastEpochs = (event) => {
      mutationCtx.updateConfig({
        lastEpochs: parseInt(event.target.value),
      });
      location.reload();
    }

    const useStyles = makeStyles((theme) => ({
      top: {
        backgroundColor: theme.palette.type === "light" ? theme.palette.grey[600] : theme.palette.grey[500],
      },
      root: {
        backgroundColor: theme.palette.type === "light" ? theme.palette.grey[600] : theme.palette.grey[500],
        marginTop: 25,
      },
      container: {
        backgroundColor: theme.palette.type === "light" ? theme.palette.grey[600] : theme.palette.grey[500],
        marginTop: 25,
      },
      card: {
        width: '100%',
        borderRadius: 25,
      },
      grid: {
        marginTop: 15,
        marginBottom: 25,
      },
      divider: {
        marginBottom: 15,
        marginTop: 10,
      },
      table: {
        width: '100%',
        borderRadius: 12,
        marginBottom: 10,
      },
    }));
    const classes = useStyles();

    const StyledTableCell = withStyles((theme) => ({
      head: {
        backgroundColor: theme.palette.grey[theme.palette.type === "light" ? 400 : 900],
        color: theme.palette.type === "light" ? theme.palette.common.black : theme.palette.common.white,
      },
      body: {
        fontSize: 14,
      },
    }))(TableCell);

    const StyledTableRow = withStyles((theme) => ({
      root: {
        backgroundColor: theme.palette.grey[theme.palette.type === "light" ? 50 : 700],
        color: theme.palette.type === "light" ? theme.palette.common.black : theme.palette.common.white,
      },
    }))(TableRow);

    return (
      <div className={classes.top}>
        <CssBaseline>
          <Navbar/>
          <Container maxWidth="lg" className={classes.root}>
            <Grid container spacing={3} direction="row">
              <Grid item xs={12}>
                <Promo/>
              </Grid>
            </Grid>
            <Grid container direction="row">
              <Grid item xs={12}>
                <PriceInfo/>
              </Grid>
            </Grid>
            <Grid container direction="row" className={classes.grid}>
              <Grid item xs={12}>
                <Card className={classes.card}>
                  <CardContent>
                    <Container maxWidth="lg">
                      {isFirefox ?
                        <Grid xs={12} alignContent="center" className={classes.grid}>
                          <Alert severity="warning" variant="outlined">
                            Stake monitoring is currently not
                            supported on Firefox, please use another browser!</Alert>
                        </Grid>
                        :
                        null
                      }
                      <Grid container direction="row" className={classes.grid}>
                        <Grid item xs={12}>
                          <Typography variant="body2">Monitor stake /
                            rewards: <b>{stateCtx.config.accountMonitor}</b>
                            <span>
                            {" "}
                              {stateCtx.config.accountMonitor !== "" ?
                                <Link color="inherit" variant="body2" target="_blank"
                                      href={"/user/" + stateCtx.config.accountMonitor}>
                                  ACCOUNT REWARDS</Link>
                                : null}
                            </span>
                          </Typography>
                          <Divider className={classes.divider}/>
                          <Grid container spacing={1} justify="space-between">
                            <Grid item xs={12} md={7}>
                              <TextField
                                size={"small"}
                                required
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <PersonIcon/>
                                    </InputAdornment>
                                  ),
                                }}
                                name="userAccountMonitor"
                                id="userAccountMonitor"
                                label="Enter Main Account ID"
                                value={userAccountMonitor.value}
                                onChange={changeHandlerMonitor}/>
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <Button variant="outlined" size="large" color="inherit"
                                      disabled={isFirefox} onClick={handleAddUserMonitorClick}
                              >SUBMIT</Button>
                            </Grid>
                            <Grid item xs={12} md={2} justify="flex-end">
                              {stateCtx.config.accountMonitor !== "" ?
                                <FormControl variant="outlined" size="small">
                                  <div>Show {" "}
                                    <Select value={stateCtx.config.lastEpochs}
                                            onChange={showLastEpochs}
                                            id="lastEpochs"
                                            variant="outlined"
                                            labelId="last-epochs-label"
                                            autoWidth={true}
                                    >
                                      <MenuItem value="4">4</MenuItem>
                                      <MenuItem value="8">8</MenuItem>
                                      <MenuItem value="16">16</MenuItem>
                                      <MenuItem value="24">24</MenuItem>
                                      <MenuItem value="48">48</MenuItem>
                                      <MenuItem value="1000000000000">All
                                      </MenuItem>
                                    </Select> records
                                  </div>
                                </FormControl>
                                : null}
                            </Grid>
                          </Grid>
                          <Divider className={classes.divider}/>

                          <div className="clear-fix"/>

                          <Box display="block">
                            {accountPools.map((item, key) => (
                              <>
                                <Grid container direction="row" className={classes.grid}>
                                  <Grid item xs>
                                    <TableContainer component={Paper} className={classes.table}>
                                      <Table responsiveSm>
                                        <TableHead>
                                          <StyledTableRow>
                                            <StyledTableCell>{item}</StyledTableCell>
                                            <StyledTableCell>Account</StyledTableCell>
                                            <StyledTableCell>Staked Balance</StyledTableCell>
                                            <StyledTableCell>Stake Change / Rewards</StyledTableCell>
                                            <StyledTableCell>Unstaked Balance</StyledTableCell>
                                            <StyledTableCell>Can Withdraw</StyledTableCell>
                                          </StyledTableRow>
                                        </TableHead>
                                        <TableBody>
                                          {pools[item].sort((c, d) => d.blockHeight >= c.blockHeight ? 1 : -1).sort((a, b) => a.account_id >= b.account_id ? 1 : -1).map((item2, key2, array2) => (
                                            <StyledTableRow id={"tbl-" + key2}>
                                              <StyledTableCell>{item2.blockHeight} / {dateFormat(item2.blockTimestamp, "yy-mm-dd")}</StyledTableCell>
                                              <StyledTableCell>{item2.account_id}</StyledTableCell>
                                              <StyledTableCell>{(item2.staked_balance / yoctoNEAR).toFixed(2)}</StyledTableCell>
                                              <StyledTableCell>
                                                {array2[key2 + 1] && array2[key2 + 1].account_id === item2.account_id ? ((item2.staked_balance - array2[key2 + 1].staked_balance) / yoctoNEAR).toFixed(2) : 0}
                                              </StyledTableCell>
                                              <StyledTableCell>{(item2.unstaked_balance / yoctoNEAR).toFixed(2)}</StyledTableCell>
                                              <StyledTableCell>{(item2.unstaked_balance < 10) ? 'N/A' : item2.can_withdraw ? 'Yes' : 'No'}</StyledTableCell>
                                            </StyledTableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Grid>
                                </Grid>
                              </>
                            ))}
                          </Box>
                        </Grid>
                      </Grid>
                    </Container>
                  </CardContent>
                </Card>
                <Grid container direction="row" className={classes.grid}>
                  <Grid item xs={12}>
                    <Card className={classes.card}>
                      <CardContent>
                        <TableContainer component={Paper} className={classes.table}>
                          <Table responsive="true">
                            <TableHead>
                              <StyledTableRow>
                                <StyledTableCell>current validators</StyledTableCell>
                                <StyledTableCell>total stake</StyledTableCell>
                                <StyledTableCell>last epoch APY</StyledTableCell>
                                <StyledTableCell>current seat price</StyledTableCell>
                                <StyledTableCell>next seat price</StyledTableCell>
                              </StyledTableRow>
                            </TableHead>
                            <TableBody>
                              <StyledTableRow>
                                <StyledTableCell><Typography
                                  variant="h3">{stats ? activeValidators : null}</Typography></StyledTableCell>
                                <StyledTableCell>
                                  <Typography variant="h5">
                                    Ⓝ {stats && stats.totalValidatorsStake ? stats.totalValidatorsStake.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}
                                  </Typography>
                                </StyledTableCell>
                                <StyledTableCell>
                                  <Typography variant="h4">
                                    {returnApy.data < 0.15 && returnApy.data > 0.1 ? (returnApy.data * 100).toFixed(2) + "%" : null}
                                  </Typography>
                                  <Typography variant="h5">our
                                    pool: {returnApy.data < 0.15 && returnApy.data > 0.1 ? (returnApy.data * 100 - (returnApy.data * 5)).toFixed(2) + "%" : null}
                                  </Typography>
                                </StyledTableCell>
                                <StyledTableCell>
                                  <Typography variant="h5">
                                    {stats && stats.seatPrice ? stats.seatPrice.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}
                                  </Typography>
                                </StyledTableCell>
                                <StyledTableCell>
                                  <Typography variant="h5">
                                    {stats && stats.seatPriceNext ? stats.seatPriceNext.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}
                                  </Typography>
                                </StyledTableCell>
                              </StyledTableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                        {newValidators > 0 ?
                          <Box>Upcoming validators: {newValidators}</Box>
                          : null
                        }
                        {newProposals > 0 ?
                          <Box>New proposals: {newProposals}</Box>
                          : null
                        }
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <Grid container className={classes.grid}>
                  <Grid item xs={12}>
                    <Card className={classes.card}>
                      <CardContent>
                        <Typography variant="body2" align="right" gutterBottom="true">In order to see cumulative stake,
                          click to sort
                          by
                          stake!
                        </Typography>
                        <TableContainer component={Paper} className={classes.table}>
                          <Table responsive="true" size="small">
                            <TableHead>
                              <StyledTableRow>
                                <StyledTableCell><Box>validator</Box></StyledTableCell>
                                <StyledTableCell>
                                  <Link underline="false" color="inherit" component="button"
                                        onClick={handleFeesClick} style={{fontSize: '0.875rem'}}>fee
                                    <HeightIcon style={{verticalAlign: 'inherit'}}
                                                fontSize="small"
                                                icon="arrows-alt-v"/></Link>
                                </StyledTableCell>
                                <StyledTableCell><Link underline="false" color="inherit" component="button"
                                                       onClick={handleStakeClick}
                                                       style={{fontSize: '0.875rem'}}>stake <HeightIcon
                                  fontSize="small"
                                  icon="arrows-alt-v" style={{verticalAlign: 'inherit'}}/></Link></StyledTableCell>
                                <StyledTableCell><Box>stake change</Box></StyledTableCell>
                                <StyledTableCell><Box>deleg.</Box></StyledTableCell>
                                {/*<StyledTableCell><Box>offline / online epochs</Box></StyledTableCell>*/}
                                <StyledTableCell><Box>cumulative stake</Box></StyledTableCell>
                              </StyledTableRow>
                            </TableHead>
                            <TableBody>
                              {
                                (stats && stateCtx.config.sort === 'fees') ?
                                  stats.validators.sort((a, b) => a.pool_fees >= b.pool_fees ? 1 : -1).map((item, key) => (
                                    <ValidatorBlockTable data={item} key={key}
                                                         totalValidatorsStake={stats.totalValidatorsStake}
                                                         totalVotes={stats.totalVotes} seatPrice={stats.seatPrice}
                                                         seatPriceNext={stats.seatPriceNext}
                                                         seatPriceProposals={stats.seatPriceProposals} sort="fees"/>
                                  ))
                                  : null}
                              {(stats && stateCtx.config.sort === 'stake') ?
                                stats.validators.sort((c, d) => d.stake > c.stake ? 1 : -1).map((item, key) => (
                                  <ValidatorBlockTable data={item} key={key}
                                                       totalValidatorsStake={stats.totalValidatorsStake}
                                                       totalVotes={stats.totalVotes} seatPrice={stats.seatPrice}
                                                       seatPriceNext={stats.seatPriceNext}
                                                       seatPriceProposals={stats.seatPriceProposals} sort="stake"/>
                                ))
                                : null
                              }
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                {!stats ? <LoadingData/> : null}
              </Grid>
            </Grid>
          </Container>
        </CssBaseline>
      </div>
    );
  }
;

export default Home;
