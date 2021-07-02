import React, {useEffect, useState} from "react";
import {useGlobalMutation, useGlobalState} from "/imports/container";
import {useTracker} from "meteor/react-meteor-data";
import {useParams} from "react-router-dom";
import {Decimal} from 'decimal.js';

import Footer from "./Footer";
import Navbar from "./Navbar";

import {Delegators} from "../../api/nearf";
import {Meteor} from "meteor/meteor";
import {sha256} from "js-sha256";
import {Buffer} from "buffer";
import {isFirefox} from "react-device-detect";
import * as nearApi from "near-api-js";
import Loading from "./Loading";
import {array} from "prop-types";
import {
  Button,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Container,
  Card,
  CardActions,
  Grid,
  Popper,
  Grow,
  ClickAwayListener,
  Chip,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Link,
  Switch,
  CssBaseline, Divider,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridPanelWrapper,
  GridPanel,
  GridFooterContainer,
  GridPagination,
  GridRow,
  GridRenderingZone,
  GridDataContainer,
  GridViewport,
  GridCell,
  GridWindow,
  GridColumnsHeader,
  GridColumnsPanel,
  GridRowData
} from '@material-ui/data-grid';
import {makeStyles} from '@material-ui/core/styles';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import {withStyles} from "@material-ui/core/styles";


let dateFormat = require('dateformat');
const yoctoNEAR = new Decimal(1000000000000000000000000);

const accountToLockup = (accountId) => {
  return sha256(Buffer.from(accountId)).toString('hex').slice(0, 40);
}

const provider = new nearApi.providers.JsonRpcProvider("https://rpc.mainnet.near.org");
const connection = new nearApi.Connection("mainnet", provider, {});


function groupBy(key) {
  return function group(array) {
    return array.reduce((acc, obj) => {
      const prop = obj[key] || 'summary';
      if (!acc.has(prop)) {
        return acc.set(prop, [obj]);
      }
      acc.get(prop).push(obj);
      return acc;
    }, new Map());
  }
}


const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    zIndex: '9999',
  },
  homeView: {
    height: '100% !Important',
  },
  paper: {
    marginRight: theme.spacing(2),
  },
  button: {
    marginRight: theme.spacing(1),
  },
}));

async function accountExists(accountId) {
  try {
    await new nearApi.Account(connection, accountId).state();
    return true;
  } catch (error) {
    return false;
  }
}

const TableRows = (data) => {
  const stateCtx = useGlobalState();
  const [aggregation, setAggregation] = React.useState(false);
  const [checked, setChecked] = React.useState({
    Year: false,
    Month: false
  });
  const [datatable, setDatatable] = React.useState({
    columns: [
      {
        headerName: 'Epoch',
        field: 'epoch',
        sortable: false,
        width: 80,
        filterable: false,
        renderCell: (props) => {
          return (
            <>
              {props.value !== 0 ? props.value : null}
            </>
          )
        }
      },
      {
        headerName: 'Date',
        field: 'epochDate',
        sortable: true,

        filterable: false
      },
      {
        headerName: 'Account',
        field: 'account',

        sortable: false,
      },
      {
        headerName: 'Operation',
        field: 'transaction',
        sortable: false,
        width: 139,
        renderCell: (props) => {
          return (
            <>
              {props.value ? props.value.map((item, key) => (
                  <Box display="flex">
                    {item}
                  </Box>
                )
              ) : null}
            </>
          )
        }
      },
      {
        headerName: 'Amount',
        field: 'transactionAmount',
        sortable: false,

        renderCell: (props) => {
          return (
            <>
              {props.value ? props.value.map((item, key) => (
                  <Box display="flex" alignItems="center">
                    {item}
                  </Box>
                )
              ) : null}
            </>
          )
        }
      },
      {
        headerName: 'Staked Balance',
        field: 'stakedBalance',
        sortable: false,
      },
      {
        headerName: 'Rewards Ⓝ',
        field: 'rewards',
        sortable: false,

        renderCell: (props) => {
          return (
            <>
              {props.value}
            </>
          )
        }
      },
      {
        headerName: 'Rate NEAR/' + stateCtx.config.currency.toUpperCase(),
        field: 'exchangeRate',
        width: 124,
        sortable: false,

      }, {
        headerName: 'Rewards in ' + stateCtx.config.currency.toUpperCase(),
        field: 'rewardsFiat',
        sortable: false,
      },
      {
        headerName: 'Unstaked Balance',
        field: 'unstakedBalance',
        sortable: false,

      },
      {
        headerName: 'Can Withdraw',
        field: 'canWithdraw',
        sortable: false,

      }
    ],
    groupedColumns: [],
    groupedRows: []
  });


  const CustomToolbar = (props) => {
    const classes = useStyles();
    return (
      <GridToolbarContainer>
        <Box display="flex" m={1}>
          <GridToolbarColumnsButton variant="outlined" size="small" color="inherit" className={classes.button}/>
          <GridToolbarExport variant="outlined" size="small" color="inherit" className={classes.button}/>
          <AggregateForm {...props}/>
        </Box>
      </GridToolbarContainer>
    );
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


  const ColumnsSummary = (props) => {

    const getColWidth = (col) => {
      let width = null;
      if (props.colWidth.length > 0) {
        for (const item of props.colWidth) {
          if (item.field === col.field) {
            width = item.width;
          }
        }
      }
      return width;
    }
    return (
      <>
        {props.columns.length > 0 ? props.columns.map((col, key) =>
          <>
            <StyledTableCell component="div"
                             style={{width: props.colWidth.length > 0 ? getColWidth(col) : 0, lineHeight: 'initial', fontWeight: 'bold'}}
                             value={props.summary[col.field]} key={key} colIndex={key} cellMode="view"
                             field={col.field}>
              {props.summary[col.field]}
            </StyledTableCell>
          </>
        ) : null}
      </>
    )
  }

  const CustomFooter = (props) => {
    let colWidth = [];
    if (props && props.colHeaders.current) {
      const nodeList = props.colHeaders.current.querySelectorAll('.MuiDataGrid-columnHeader');
      for (const el of nodeList) {
        colWidth.push({field: el.dataset.field, width: el.offsetWidth});
      }
    }

    const Summary = () => {
      return (
        <>
          <Box flexShrink="0" flexGrow="1">
            <ColumnsSummary columns={props.columns} colWidth={colWidth} summary={props.summary}/>
          </Box>
        </>
      )
    }

    return (
      <>
        <Box style={{width: '100%'}}>
          <div style={{display: 'flex', height: '100%'}}>
            <div style={{flexGrow: 1, overflow: 'hidden'}}>
              <Box display="flex" className="MuiDataGrid-summary-renderingZone">
                <Summary columns={props.columns} colWidth={colWidth} summary={props.summary}/>
              </Box>
            </div>
          </div>
        </Box>
        <GridFooterContainer>
          <GridPagination/>
        </GridFooterContainer>
      </>
    );
  }

  const AggregateForm = (props) => {

    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const toggleChecked = (event) => {
      setChecked({...checked, [event.target.name]: event.target.checked});
      switch (event.target.name) {
        case 'Year':
          if (!event.target.checked) {
            clearAggregation();
            break;
          }
          groupByYear();
          break;
        case 'Month':
          if (!event.target.checked) {
            groupByYear();
            break;
          }
          groupByMonth();
          break;
      }
    };

    const groupByYear = () => {
      let groupedRowsByYear = groupBy('epochYear');
      let tempGroupedRows = groupedRowsByYear(data.rows);
      let groupedRows = [];
      for (let [key, values] of tempGroupedRows.entries()) {
        if (key !== 'summary') {
          let rewards = new Decimal(0);
          values.forEach(curr => {
            rewards = new Decimal(rewards).plus(new Decimal(curr.rewards)).toFixed(2)
          });

          groupedRows.push({
            id: groupedRows.length + 1,
            epochYear: key,
            rewards: React.createElement('strong', {}, rewards)
          });

          for (const row of values) {
            let groupedRow = Object.assign({}, row);
            groupedRow.id = groupedRows.length + 1
            groupedRow.epochYear = React.createElement('span', {style: {display: 'none'}}, row.epochYear);
            groupedRows.push(groupedRow);
          }
        }
        if (key === 'summary') {
          // groupedRows.push({id: groupedRows.length + 1, rewards: tempGroupedRows[key][0].rewards});
        }
      }
      setDatatable({
        columns: datatable.columns,
        groupedColumns: [{
          headerName: 'Year',
          field: 'epochYear',
          sortable: false,
          renderCell: (props) => {
            return (
              <>
                {props.value}
              </>
            )
          },
          width: 90
        }, ...datatable.columns],
        groupedRows,
        rows: groupedRows
      });
    }

    const groupByMonth = () => {
      const groupedRowsByYear = groupBy('epochYear');
      const groupedRowsByMonth = groupBy('epochMonth');
      let tempYearRows = groupedRowsByYear(data.rows);
      let tempMonthRows = new Map();
      let tempGrouped = [];
      for (let [key, values] of tempYearRows.entries()) {
        if (key !== 'summary') {
          let yearRewards = new Decimal(0);
          values.forEach(curr => {
            yearRewards = new Decimal(yearRewards).plus(new Decimal(curr.rewards)).toFixed(2)
          });
          if (!tempMonthRows.has(key)) {
            tempMonthRows.set(key, []);
          }
          tempMonthRows.get(key).push(groupedRowsByMonth(values));
          if (tempMonthRows.get(key) !== 'summary') {
            tempGrouped.push({
              id: tempGrouped.length + 1,
              epochYear: key,
              rewards: React.createElement('strong', {}, yearRewards)
            });
            for (let [mkey, mvalues] of tempMonthRows.get(key)[0].entries()) {
              let monthRewards = new Decimal(0);
              mvalues.forEach(curr => {
                monthRewards = new Decimal(monthRewards).plus(new Decimal(curr.rewards)).toFixed(2)
              });
              tempGrouped.push({
                id: tempGrouped.length + 1,
                epochYear: React.createElement('span', {style: {display: 'none'}}, key),
                epochMonth: mkey,
                rewards: React.createElement('strong', {}, monthRewards)
              });
              for (const row of mvalues) {
                let groupedRow = Object.assign({}, row);
                groupedRow.id = tempGrouped.length + 1;
                groupedRow.epochYear = React.createElement('span', {style: {display: 'none'}}, row.epochYear);
                groupedRow.epochMonth = React.createElement('span', {style: {display: 'none'}}, row.epochMonth);
                tempGrouped.push(groupedRow);
              }
            }
          }
        }
        if (key === 'summary') {
          /*tempGrouped.push({
            id: tempGrouped.length + 1,
            rewards: React.createElement('strong', {}, tempYearRows[key][0].rewards)
          });*/
        }
      }
      setDatatable({
        columns: datatable.columns,
        groupedColumns: [{
          headerName: 'Year',
          field: 'epochYear',
          renderCell: (props) => {
            return (
              <>
                {props.value}
              </>
            )
          },
          sortable: false,
          width: 90
        }, {
          headerName: 'Month',
          field: 'epochMonth',
          sortable: false,
          sortingModel: {
            field: 'epochYear',
            sort: 'none'
          },
          renderCell: (props) => {
            return (
              <>
                {props.value}
              </>
            )
          },
          width: 100
        }, ...datatable.columns],
        groupedRows: tempGrouped,
        rows: tempGrouped
      })
    }

    useEffect(() => {
      (checked.Year || checked.Month) ? setAggregation(true) : setAggregation(false);
    }, [checked]);

    const anchorRef = React.useRef(null);

    const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };


    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(open);
    React.useEffect(() => {
      if (prevOpen.current === true && open === false) {
        anchorRef.current.focus();
      }
      prevOpen.current = open;
    }, [open]);

    const clearAggregation = () => {
      setChecked({Year: false, Month: false});
    }


    return (
      <div>
        <Button variant="outlined" size="small" color="inherit"
                className={classes.button}
                startIcon={<AccountTreeIcon/>}
                ref={anchorRef}
                aria-haspopup="true"
                onClick={handleToggle}>
          Aggregate
        </Button>
        <Popper style={{zIndex: '9999'}} open={open} anchorEl={anchorRef.current} role={undefined} transition
                disablePortal>
          {({TransitionProps, placement}) => (
            <Grow
              {...TransitionProps}
              style={{transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom', zIndex: '9999'}}
            >
              <Box elevation={8} style={{minWidth: '300px', maxHeight: '450px'}}>
                <Box p={1}>
                  <GridPanelWrapper>
                    <ClickAwayListener onClickAway={handleClose}>
                      <GridPanel open={open}>
                        <Card style={{minWidth: '300px', maxHeight: '450px'}}>
                          <CardContent>
                            <FormGroup row>
                              <FormControlLabel
                                control={<Switch size="small" checked={checked.Year} onChange={toggleChecked}
                                                 name='Year'/>}
                                label="By Year"
                              />
                              <FormControlLabel
                                control={<Switch size="small" checked={checked.Month} onChange={toggleChecked}
                                                 name='Month' disabled={!checked.Year}/>}
                                label="By Month"
                              />
                            </FormGroup>
                          </CardContent>
                          <CardActions>
                            <Button className={classes.button} variant="outlined" size="small" color="inherit"
                                    onClick={clearAggregation}>Clear</Button>
                            <Button className={classes.button} variant="outlined" size="small" color="inherit"
                                    onClick={handleToggle}>Close</Button>
                          </CardActions>
                        </Card>
                      </GridPanel>
                    </ClickAwayListener>
                  </GridPanelWrapper>
                </Box>
              </Box>
            </Grow>
          )}
        </Popper>
      </div>
    );
  }

  useEffect(() => {
    setDatatable({
      columns: datatable.columns,
      rows: data.rows,
    })
    return () => {
    };
  }, []);

  const gridRef = React.createRef();

  return (
    <>
      {data.rows.length > 0 ?
        <div>
          <Alert icon={false} style={{justifyContent: "center"}} variant="outlined" severity="warning">
            <Typography variant="h6">{data.rows[0].account}</Typography>
          </Alert>
          <Box>
            <Typography variant="caption">Total rewards earned: <span
              className="text-dark">Ⓝ <span>{data.summary.rewards.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span></span>
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption">Total unstaked (over period): <span
              className="text-dark">Ⓝ <span>{data.summary.unstaked.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span></span>
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption">Total staked (over period): <span
              className="text-dark">Ⓝ <span>{data.summary.staked.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span></span>
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption">Total withdrawn (over period): <span
              className="text-dark">Ⓝ <span>{data.summary.withdrawn.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span></span>
            </Typography>
          </Box>
          <Container maxWidth="false" style={{width: '100%', marginTop: 5}}>
            <div style={{display: 'flex', height: '100%'}}>
              <div style={{flexGrow: 1}}>
                <DataGrid rows={!aggregation ? data.rows : datatable.groupedRows}
                          columns={!aggregation ? datatable.columns : datatable.groupedColumns}
                          autoHeight={true}
                          pageSize={100}
                          disableColumnMenu={true}
                          disableColumnResize={true}
                          disableColumnReorder={true}
                          ref={gridRef}
                          components={
                            {
                              Toolbar: CustomToolbar,
                              Footer: CustomFooter,
                            }
                          }
                          componentsProps={{
                            toolbar: {
                              color: 'secondary',
                            },
                            footer: {
                              columns: !aggregation ? datatable.columns : datatable.groupedColumns,
                              colHeaders: gridRef,
                              summary: data.summary
                            },
                            header: {
                              columns: !aggregation ? datatable.columns : datatable.groupedColumns,
                              colHeaders: gridRef,
                              summary: data.summary
                            }
                          }}/>
              </div>
            </div>
          </Container>
        </div>
        : null}
    </>
  );

}

const TableBlock = (items) => {
    const stateCtx = useGlobalState();
    const accounts = items.accounts;
    const r = accounts.map((account, accountKey) => {
      let rows = [];
      let summary = {
        rewards: new Decimal(0).toFixed(2),
        staked: new Decimal(0).toFixed(2),
        unstaked: new Decimal(0).toFixed(2),
        withdrawn: new Decimal(0).toFixed(2),
      }

      items.items.sort((c, d) => d.blockHeight >= c.blockHeight ? 1 : -1).sort((a, b) => a.account_id >= b.account_id ? 1 : -1).map((item, key, array) => {
        if (account === item.account_id) {
          let stakedBalance = new Decimal(item.staked_balance).div(yoctoNEAR).toFixed(2);
          let stakedBalanceNext = (array[key + 1] && array[key + 1].account_id === item.account_id) ? new Decimal(array[key + 1].staked_balance).div(yoctoNEAR).toFixed(2) : 0;
          let stakeChange = (stakedBalance - stakedBalanceNext).toFixed(2);
          let unstakedBalance = new Decimal(item.unstaked_balance).div(yoctoNEAR).toFixed(2);
          let unstakedBalanceNext = (array[key + 1] && array[key + 1].account_id === item.account_id) ? new Decimal(array[key + 1].unstaked_balance).div(yoctoNEAR).toFixed(2) : 0;
          let rewards = 0;
          let deposited = 0;

          //console.log(item.transactionInfo)

          if (item.transactionInfo && item.transactionInfo.length === 1) {
            item.transactionInfo.map((i, k, a) => {
              if (item.account_id === i.account_id && i.pool_id !== null) {
                rewards = (stakedBalance - stakedBalanceNext).toFixed(2);
                let deposit = (Number(i.deposit));
                if (deposit === 0 && i.args !== '') {
                  let args = JSON.parse(i.args);
                  deposit = args.amount ? args.amount : 0;
                }
                deposit = new Decimal(deposit).div(yoctoNEAR).toFixed(6);
                if (i.method_name === 'deposit_and_stake' || i.method_name === 'deposit' || i.method_name === 'deposit_to_staking_pool') {
                  rewards = new Decimal((stakedBalance - stakedBalanceNext - deposit)).toFixed(2);
                  summary.staked = new Decimal(summary.staked).plus(deposit).toFixed(2)
                  deposited = deposit;
                }

                let doubleTrouble = ((a.some(look => look.method_name === 'deposit')
                    || a.some(look => look.method_name === 'deposit_and_stake'))
                  && (a.some(look => look.method_name === 'unstake'
                    || a.some(look => look.method_name === 'unstake_all')))
                );

                if (i.method_name === 'unstake_all') {
                  rewards = new Decimal(rewards).plus(new Decimal(unstakedBalance)).toFixed(2);
                  summary.unstaked = new Decimal(summary.unstaked).plus(unstakedBalance).toFixed(2);
                  if (doubleTrouble) {
                    rewards = new Decimal(rewards).minus(deposited).toFixed(2);
                  }
                }

                if (i.method_name === 'withdraw') {
                  rewards = (stakedBalance - stakedBalanceNext).toFixed(2);
                  summary.withdrawn = new Decimal(summary.withdrawn).plus(deposit).toFixed(2);
                }

                if (i.method_name === 'withdraw_all') {
                  rewards = (stakedBalance - stakedBalanceNext).toFixed(2);
                  summary.withdrawn = new Decimal(summary.withdrawn).plus(unstakedBalanceNext).toFixed(2)
                }

                if (i.method_name === 'unstake') {
                  rewards = new Decimal(rewards).plus(new Decimal(deposit)).toFixed(2);
                  if (doubleTrouble) {
                    rewards = new Decimal(rewards).minus(deposited).toFixed(2);
                  }
                  summary.unstaked = new Decimal(summary.unstaked).plus(deposit).toFixed(2);
                }
              }
            })
          } else if (item.transactionInfo) {
            let totalDeposit = 0;
            item.transactionInfo.map((i, k, a) => {
              if (item.account_id === i.account_id && i.pool_id !== null) {
                let deposit = (Number(i.deposit));
                if (deposit === 0 && i.args !== '') {
                  let args = JSON.parse(i.args);
                  deposit = args.amount ? args.amount : 0;
                }
                deposit = new Decimal(deposit).div(yoctoNEAR).toFixed(6);

                if (i.method_name === 'deposit_and_stake' || i.method_name === 'deposit' || i.method_name === 'deposit_to_staking_pool') {
                  summary.staked = new Decimal(summary.staked).plus(deposit).toFixed(2)
                  totalDeposit = new Decimal(totalDeposit).plus(deposit);
                }

                if (i.method_name === 'unstake_all') {
                  summary.unstaked = new Decimal(summary.unstaked).plus(unstakedBalance).toFixed(2);
                  totalDeposit = new Decimal(totalDeposit).minus(deposit);
                }

                if (i.method_name === 'withdraw' || i.method_name === 'withdraw_all') {
                  summary.withdrawn = new Decimal(summary.withdrawn).plus(deposit).toFixed(2);
                }

                if (i.method_name === 'unstake') {
                  summary.unstaked = new Decimal(summary.unstaked).plus(deposit).toFixed(2);
                  totalDeposit = new Decimal(totalDeposit).minus(deposit);
                }
              }
            })
            //console.log(totalDeposit.toString(10));
            rewards = new Decimal((stakedBalance - stakedBalanceNext - totalDeposit)).toFixed(2);

          } else {
            rewards = (stakedBalance - stakedBalanceNext).toFixed(2);

            if (unstakedBalanceNext < unstakedBalance) {
              rewards = (stakedBalance - stakedBalanceNext - (unstakedBalanceNext - unstakedBalance)).toFixed(2);
              summary.unstaked = new Decimal(summary.unstaked).plus(unstakedBalance).toFixed(2);
            }

          }


          if (array[array.length - 1].blockHeight === item.blockHeight) {
            rewards = 0
          }

          //console.log(item.account_id + ": " + rewards + " / " + key + " / " + array.length);
          let transaction = null;
          if (item.transactionInfo) {
            let a = [];
            item.transactionInfo.map((item, key) => {
              let o = {};
              let deposit = (Number(item.deposit));
              if (deposit === 0 && item.args !== '') {
                let args = JSON.parse(item.args);
                deposit = args.amount ? args.amount : 0;
              }
              o.account_id = item.account_id;
              o.pool_id = item.pool_id;
              o.signer_id = item.signer_id;
              o.receiver_id = item.receiver_id;
              o.transaction_hash = item.transaction_hash;
              o.receipt_receiver_id = item.receipt_receiver_id;
              o.method_name = item.method_name;
              o.amount = new Decimal(deposit).div(yoctoNEAR).toFixed(2)
              a.push(o);
            })

            transaction = a;
          }

          const preventDefault = (event) => event.preventDefault();

          const temp = {
            id: key,
            epoch: +item.blockHeight,
            epochDate: dateFormat(item.blockTimestamp, "yyyy-mm-dd"),
            epochYear: dateFormat(item.blockTimestamp, "yyyy"),
            epochMonth: dateFormat(item.blockTimestamp, "mm"),
            epochDay: dateFormat(item.blockTimestamp, "dd"),
            account: item.account_id,
            //transaction: item.transactionInfo ? JSON.stringify(transaction) : null,
            transaction: transaction ? transaction.map((i, k) => (
              (item.account_id === i.account_id && i.pool_id !== null) ?
                <Chip
                  color='primary'
                  size="small"
                  key={k}
                  clickable={true}
                  component={Link}
                  target="_blank"
                  href={"https://explorer.mainnet.near.org/transactions/" + i.transaction_hash}
                  label={i.method_name}/> : null)
            ) : null,


            transactionAmount: transaction ? transaction.map((i, k) => (
              (item.account_id === i.account_id && i.pool_id !== null) ?
                (i.amount > 0 ? <Chip size="small" variant="outlined" key={k}
                                      label={"Ⓝ" + i.amount}/> : null) : null)
            ) : null,
            stakedBalance: stakedBalance,
            rewards: rewards,
            exchangeRate: item.priceInfo ? (item.priceInfo[stateCtx.config.currency]).toFixed(2) : "N/A",
            rewardsFiat: item.priceInfo ? new Decimal(item.priceInfo[stateCtx.config.currency]).mul(new Decimal(rewards)).toFixed(2) : "N/A",
            unstakedBalance: unstakedBalance,
            canWithdraw: ((item.unstaked_balance < 10) ? 'N/A' : item.can_withdraw ? 'Yes' : 'No'),

          };
          summary.rewards = new Decimal(summary.rewards).plus(rewards).toFixed(2); /**/
          rows.push(temp);
        }
      });
      if (rows.length > 0) {
        //rows.push({id: rows.length + 1, rewards: summary.rewards}); /**/
      }
      return {rows, summary};
    });

    return (
      <>
        {r.map((item, key) => (
            <>
              <TableRows key={key} rows={item.rows} summary={item.summary}/>
            </>
          )
        )}
      </>
    )
  }
;

const UserPage = () => {
    let {accountId} = useParams();
    const stateCtx = useGlobalState();
    const mutationCtx = useGlobalMutation();
    const [lockupExists, setLockupExists] = useState(false);
    const [ownerAccountExists, setOwnerAccountExists] = useState(null);
    const accountMonitor = accountId;
    const lockupAccountMonitor = accountToLockup(accountId) + ".lockup.near";
    const a = [];
    a.push(accountMonitor);
    a.push(lockupAccountMonitor);

    const useStyles = makeStyles((theme) => ({
      root: {
        backgroundColor: theme.palette.type === "light" ? theme.palette.grey[600] : theme.palette.grey[500],
        minHeight: '100vh',
      },
      container: {
        backgroundColor: theme.palette.type === "light" ? theme.palette.grey[600] : theme.palette.grey[500],
        marginTop: 25,
      },
      card: {
        width: '100%',
        borderRadius: 25,
      },
      table: {
        width: '100%',
        borderRadius: 12,
        marginBottom: 10,
      },
    }));
    const classes = useStyles();

    useEffect(() => {
      accountExists(lockupAccountMonitor).then(
        (r) => {
          setLockupExists(r);
        }
      ).catch((e) => {
        console.log(e);
      })
      return () => {
      };
    }, []);

    useEffect(() => {
      accountExists(accountMonitor).then(
        (r) => {
          setOwnerAccountExists(r);
        }
      ).catch((e) => {
        console.log(e);
      })
      return () => {
      };
    }, []);


    const useDelegators = (account_ids, numRec) =>
      useTracker(() => {
        const subscription = Meteor.subscribe("Delegators", a);
        const delegators = Delegators.find({}, {limit: numRec}).fetch();
        const meteorStatus = Meteor.status();

        return {
          delegators: delegators,
          isDelegatorsLoading: !subscription.ready(),
          meteorStatus: meteorStatus,
        };
      }, []);

    const {delegators, isDelegatorsLoading} = useDelegators([accountId], 1000000000000);

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

    return (
      <div>
        <div className={classes.root}>
          <div className={classes.homeView}>
            <CssBaseline>
              <Box>
                <Navbar/>
                {ownerAccountExists ?
                  <Container maxWidth="lg"
                             style={{height: "100%", width: "100%", paddingTop: "2rem", paddingBottom: "2rem"}}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} spacing={3}>
                        <Card className={classes.card}>
                          <Box p={4}>
                            <Box><Typography variant="h6" component="span">owner
                              account: {accountMonitor}</Typography></Box>
                            <Box><Typography variant="h6" component="span">your
                              lockup: {lockupExists ? lockupAccountMonitor : "none"}</Typography></Box>
                            <Box><Typography align="right" variant="body2">
                              the pricing information is kindly provided by <Link underline="hover" color="inherit"
                                                                                  target="_blank"
                                                                                  rel="nofollow"
                                                                                  href="https://www.coingecko.com/en/api_terms">CoinGecko</Link>
                            </Typography></Box>
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>
                    <Grid container spacing={1}>
                      <Grid item xs={12} spacing={3}>
                        {!accountPools !== [] ?
                          <Box mt={2}>
                            {accountPools.map((item, key) => (
                              <Box mt={1}>
                                <Card id={"item-" + key} className={classes.card}>
                                  <CardHeader title={
                                    <Typography variant="h4" align="center"><b>{item}</b></Typography>
                                  }/>
                                  <CardContent>
                                    <TableBlock items={pools[item]} accounts={a}/>
                                  </CardContent>
                                </Card>
                              </Box>
                            ))}
                          </Box>
                          : null}
                      </Grid>
                    </Grid>
                    <Grid container spacing={1}>
                      <Grid item spacing={3}>
                      </Grid>
                    </Grid>
                  </Container>
                  :
                  <div>
                    <Card>
                      {ownerAccountExists === null ?
                        <Loading/> :
                        <>
                          <Grid container
                                spacing={0}
                                direction="column"
                                alignItems="center"
                                style={{minHeight: '100vh'}}>
                            <Grid style={{marginTop: 30}}>
                              <Alert icon={false} style={{justifyContent: "center"}} variant="outlined" severity="error">
                                <Typography align="center">User {accountMonitor} does not exits</Typography>
                              </Alert>
                            </Grid>
                          </Grid>
                        </>
                      }
                    </Card>
                  </div>
                }
              </Box>
            </CssBaseline>
          </div>
        </div>
        <Footer/>
      </div>
    );
  }
;

export default UserPage;
