import React, {useEffect, useState} from "react";
import {Meteor} from "meteor/meteor";
import {useGlobalMutation, useGlobalState} from "/imports/container";
import {useTracker} from "meteor/react-meteor-data";
import {sha256} from 'js-sha256';
import {Buffer} from 'buffer';
import useRouter from "../../utils/use-router";
import {BlockRaw, ValidatorStats} from "../../api/nearf";
import Navbar from "./Navbar";
import { 
  CardContent, 
  CardHeader, 
  Typography, 
  Box, 
  Container, 
  Card, 
  Grid, 
  Paper, 
  makeStyles, 
  CssBaseline, 
  Table, 
  TableHead,
  TableRow, 
  TableCell, 
  TableBody, 
  TableContainer } from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton
} from '@material-ui/data-grid';
import {withStyles} from "@material-ui/core/styles";


const yoctoNEAR = 1000000000000000000000000;
const accountToLockup = (accountId) => {
  return sha256(Buffer.from(accountId)).toString('hex').slice(0, 40);
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.type === "light" ? theme.palette.grey[600] : theme.palette.grey[500],
  },
  container: {
    backgroundColor: theme.palette.type === "light" ? theme.palette.grey[600] : theme.palette.grey[500],
    marginTop: 25,
  },
  card: {
    width: '100%',
    borderRadius: 25,
  },
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
  },
  grid: {
    marginTop: 15,
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
  toolbar: {
    marginBottom: theme.spacing(1),
  },
  button:{
    marginRight: theme.spacing(1)
  }
}));


const useStats = () =>
  useTracker(() => {
    const subscription = Meteor.subscribe("ValidatorStats");
    const stats = ValidatorStats.findOne({}, {sort: {blockHeight: -1}, limit: 1});
    const meteorStatus = Meteor.status();

    return {
      stats: stats,
      isLoading: !subscription.ready(),
      meteorStatus: meteorStatus,
    };
  }, []);

const useBStats = () =>
  useTracker(() => {
    const subscription = Meteor.subscribe("BlockRaw");
    const bStats = BlockRaw.find({}, {sort: {blockHeight: -1}, limit: 60}).fetch();
    const meteorStatus = Meteor.status();

    return {
      bStats: bStats,
      isLoading: !subscription.ready(),
      meteorStatus: meteorStatus,
    };
  }, []);


const LoadingData = () => {
  const classes= useStyles();
  return (
    <Grid container className={classes.container}>
      <Grid item md={12}>
        <Card className={classes.card}>
          <CardContent>
            <Typography align="center">
              we are updating the network data, please wait a few minutes...
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}


const CustomToolbar = (props) => {
  const classes= useStyles();

  return (
    <GridToolbarContainer className={classes.toolbar}>
      <Box display="flex" m={1}>
        <GridToolbarColumnsButton variant="outlined" size="small" color="inherit" className={classes.button}/>
        <GridToolbarExport variant="outlined" size="small" color="inherit" className={classes.button}/>
      </Box>
    </GridToolbarContainer>
  );
}

const Stats = () => {
    const router = useRouter();
    const history = router.history;
    const stateCtx = useGlobalState();
    const mutationCtx = useGlobalMutation();

    const navStyle = {height: "100%", width: "100%", paddingTop: "2rem", paddingBottom: "2rem"};

    const {stats, isLoading} = useStats();
    const {bStats, isBLoading} = useBStats();

    const [userAccount, setUserAccount] = useState({
      value: "",
      valid: true,
      message: "",
    });
    const [userFound, setUserFound] = useState(false);
    const [lockupAccount, setLockupAccount] = useState('');
    const [showLockupBtn, setShowLockupBtn] = useState(false);
    const [numberValidators, setNumberValidators] = useState(0);
    const [totalStake, setTotalStake] = useState(0);
    const [showTable, setShowTable] = useState(false);
    const [datatable, setDatatable] = React.useState({
      columns: [
        {
          headerName: 'Status',
          field: 'status',
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
          headerName: 'Validator Pool',
          field: 'validator',
          width: 124,
          attributes: {
            'aria-controls': 'DataTable',
            'aria-label': 'Validator Pool',
          },
        },
        {
          headerName: 'Fees %',
          field: 'fees',
        },
        {
          headerName: 'Deleg.',
          field: 'delegators',
        },
        {
          headerName: 'Stake',
          field: 'stake',
        },
        {
          headerName: 'Blocks Produced',
          width: 124,
          field: 'producedBlocks',
        },
        {
          headerName: 'Blocks Expected',
          width: 124,
          field: 'expectedBlocks',
        },

        {
          headerName: 'Current Uptime %',
          field: 'uptime',
          width: 124,
          sortable: true, 
          sortingOrder: 'asc',
        },
        {
          headerName: 'Last 7- days uptime %',
          width: 124,
          field: 'totalUptime',
        },
        {
          headerName: 'All time uptime %',
          width: 124,
          field: 'totalUptimeAllTime',
        },
      ],
    });
    useEffect(() => {
      if (!isLoading && stats) {
        let rows = [];
        let n = 0;
        let t = 0;
        stats.validators.map((item, key) => {
            if (item.type.indexOf('current_validators') !== -1) {

              let statusColor = classes.textSuccess;
              let statusText = "";
              if (((item.num_produced_blocks / item.num_expected_blocks) * 100).toFixed(1) <= 95) {
                statusColor = classes.textWarning;
                statusText = ((item.num_produced_blocks / item.num_expected_blocks) * 100).toFixed(1) + "% uptime";
              }
              if (((item.num_produced_blocks / item.num_expected_blocks) * 100).toFixed(1) <= 90) {
                statusColor = classes.textError;
                statusText = ((item.num_produced_blocks / item.num_expected_blocks) * 100).toFixed(1) + "% uptime";
              }

              const temp = {
                id: key,
                status: <Grid item display='flex' alignItems='center'><FiberManualRecordIcon className={statusColor} fontSize="small"/><br/>{statusText}</Grid>,
                validator: item.account_id,
                fees: +item.pool_fees.toFixed(2),
                delegators: +item.delegatorsCount,
                stake: +item.stake.toFixed(),
                producedBlocks: +item.num_produced_blocks,
                expectedBlocks: +item.num_expected_blocks,
                uptime: +((item.num_produced_blocks / item.num_expected_blocks) * 100).toFixed(2),
                totalUptime: +(item.validator_total_uptime),
                totalUptimeAllTime: +(item.validator_total_uptime_all_time),

              };
              n++;
              t = t + item.stake;
              rows.push(temp);
            }
          }
        );
        setNumberValidators(n);
        setTotalStake(t);
        console.log('columns',datatable.columns);
        setDatatable({
          columns: datatable.columns,
          rows: rows,
        })
        setShowTable(true);

      }
      return () => {
      };
    }, [isLoading, stats]);

    useEffect(() => {
      if (bStats) {
      }
      return () => {
      };
    }, [isBLoading, bStats]);

    let blockTime = 0;

    if (bStats[0] && bStats[59]) {
      let timeTook = (+bStats[0].timestamp - +bStats[59].timestamp) / 1000000000;
      blockTime = (1 / ((+bStats[0].blockHeight - +bStats[59].blockHeight) / timeTook)).toFixed(2);
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

    const classes = useStyles();

    return (
      <div className={classes.root}>
        <CssBaseline>
          <Box>
            <Navbar/>
            <Container maxWidth="lg" style={navStyle} mt={0}>
              <Grid container className={classes.grid} spacing={1}>
                <Grid item xs={12} md={8} spacing={3}>
                  <Card className={classes.card}>
                    <CardContent>
                      <TableContainer component={Paper} className={classes.table}>
                        <Table responsive="true">
                          <TableHead>
                            <StyledTableRow>
                              <StyledTableCell>current validators</StyledTableCell>
                              <StyledTableCell>total stake</StyledTableCell>
                              <StyledTableCell>current seat price</StyledTableCell>
                              <StyledTableCell>next seat price</StyledTableCell>
                            </StyledTableRow>
                          </TableHead>
                          <TableBody>
                            <StyledTableRow>
                              <StyledTableCell>{numberValidators}</StyledTableCell>
                              <StyledTableCell>{totalStake.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Ⓝ
                              </StyledTableCell>
                              <StyledTableCell>{stats && stats.seatPrice ? stats.seatPrice.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}</StyledTableCell>
                              <StyledTableCell>{stats && stats.seatPriceNext ? stats.seatPriceNext.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null}</StyledTableCell>
                            </StyledTableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4} spacing={3}>
                  <Card className={classes.card}>
                    {!isBLoading && bStats[0] ?
                      <CardContent>
                        <CardHeader  title={
                          <>
                          Latest Block: {bStats[0].blockHeight}
                          <Typography color="textSecondary" variant="body2">updated every 60s</Typography>
                          </>
                        }/>
                        <div>signed by:</div>
                        <b>{bStats[0].author}</b>
                        {blockTime !== 0 ?
                          <div>avg block time (last 60): <b>{blockTime} sec.</b></div>
                          : null}
                        <div>
                          total
                          supply: <b>{(bStats[0].total_supply / yoctoNEAR).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</b> Ⓝ
                        </div>
                      </CardContent>
                      :
                      null
                    }
                  </Card>
                </Grid>
              </Grid>
              <Grid container className={classes.grid}>
                <Grid item xs={12}>
                  <Card className={classes.card}>
                    <CardContent> 
                      <div>
                        {(!isLoading && stats && showTable) ?
                            <Container  maxWidth="false" style={{width: '100%'}}>
                              <div style={{ display: 'flex', height: '100%' }}>
                                <div style={{ flexGrow: 1 }}>
                                  <DataGrid rows={datatable.rows} columns={datatable.columns}
                                  autoHeight={true}
                                  disableColumnMenu={true}
                                  disableColumnResize={true}
                                  disableColumnReorder={true}    
                                  components={
                                    {Toolbar: CustomToolbar,}
                                  }
                                  pageSize={100}/>
                                </div>
                              </div>
                            </Container>                               
                          : null
                        }
                      </div>
                    </CardContent>
                  </Card>
                  {!stats ? <LoadingData/> : null}
                </Grid>
              </Grid>
            </Container>
          </Box>
        </CssBaseline>
      </div>
    );
  }
;


export default Stats;
