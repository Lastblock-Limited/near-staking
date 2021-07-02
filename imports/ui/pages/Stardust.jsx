import React, {useEffect, useState} from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import {Box, Container, Grid, Card, CardContent, CardHeader, Typography} from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import LaunchIcon from '@material-ui/icons/Launch';



const HeaderBlock = () => {
  const [showModal, setShowModal] = useState(false)

  const toggle = () => {
    setShowModal(!showModal);
  }
  return (
    <div>
      <Grid container>
        <Grid item xs={12} className="mb-2">
          <Card>
            <div className='text-white text-center d-flex align-items-center rgba-black-strong px-4 pb-3'>
              <Grid container>
                <Grid item xs={12} className="mb-5">
                  <Grid item xs={6} className="float-left mt-2 p-0">
                    <img src="near_logo_white.svg" width="150" height="50" className="m-0 p-0" alt="near"/>
                  </Grid>
                  <Grid item xs={6} className="float-right text-right grey-text mt-4 font-small d-none d-md-block">
                    Please note, our NEAR validator pool is not affiliated with the company <a
                    href="https://stardust.gg" target="_blank" className="grey-text">stardust.gg</a>. We hope you'll
                    enjoy staking with us!
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={12} md={6}>
                    <img src="stardust-logo.png" height="115" className="m-0 p-0"
                         alt="stardust"/>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <div className="pink-text h2-responsive mt-1">
                      <strong>stardust.poolv1.near</strong><br/>
                    </div>
                    <CardHeader className='pt-2'  title={
                      <strong>a non-custodial staking provider and validator on NEAR Protocol</strong>
                    } />                    
                  </Grid>
                </Grid>
                <Box>
                  <h2 className="text-center">our fee: <span style={{fontSize: 50}}>5%</span></h2>
                  <Typography color="textPrimary">
                    Our resilient server infrastructure provides high availability solution.
                    Customers trust us because we offer transparent server uptime reports.
                    We are low fee staking solution and provide wide customer support on our Discord channel. <br/>Our fee
                    is 5%
                  </Typography>
                  <Typography color="textPrimary">To join our Discord Server click here: <a href="https://discord.gg/6RcukM5"
                                                              target="_blank">https://discord.gg/6RcukM5</a>
                  </Typography>
                  <Typography color="textPrimary">Check out our pool on NEAR: <a
                    href="https://explorer.mainnet.near.org/accounts/stardust.poolv1.near"
                    target="_blank">https://explorer.mainnet.near.org/accounts/stardust.poolv1.near</a>
                  </Typography>
                
                <hr/>
                </Box>          
                <Grid container>
                  <Grid item xs={12}>
                    <Box component="h5" className="text-center">We recommend to use an official Wallet as the most secure form
                    of staking</Box>
                    <a className="btn btn-secondary" target="_blank"
                       href="https://wallet.near.org/staking/stardust.poolv1.near">Wallet <LaunchIcon fontSize="small"/></a>
                    <hr/>
                    <Box className="text-center font-small">disclaimer: we hold no liability against any loss, you must
                      understand the risks of using web-tools.</Box>
                  </Grid>
                </Grid>

              </Grid>
            </div>
          </Card>
        </Grid>
      </Grid>
    </div>

  )
}


const ServerBlock = () => {
  return (

    <Card className="p-0 mb-4">
      <CardContent className="elegant-color white-text">
        <CardHeader className="text-center" title=" Our Server Farm"/>
        <Container maxWidth="lg">
          <Grid container>
            <Grid item xs={12} md={6}>
              <Box container m={1}>
                <Card className="pb-2 mdb-color">
                  <CardContent className="">
                      <CardHeader title={
                        <Grid container  className="d-flex">
                        <Box className="flex-grow-1 h5-responsive">SERVER 3 - Active</Box>
                        <FiberManualRecordIcon className="green-text" fontSize="large"/>
                    </Grid>
                    }/>
                    <a className="float-left white-text" target="_blank"
                      href="https://near-stardust-poolv1.site24x7signals.com/">Server
                      Live Status <LaunchIcon  className="ml-1" fontSize="small"/></a>
                    <div className="float-right">Server is <b>VALIDATING</b></div>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box container m={1}>
                <Card className="pb-2 mdb-color">
                  <CardContent className="">
                    <CardHeader title={
                      <Grid container className="d-flex">
                      <Box className="flex-grow-1 h5-responsive">SERVER 2 - Standby</Box>
                      <FiberManualRecordIcon className="amber-text" fontSize="large" />
                    </Grid>
                    } />
                    <div className="float-right">Server is <b>ON STANDBY</b></div>
                    <a className="float-left white-text" target="_blank"
                      href="https://near-stardust-poolv1.site24x7signals.com/">Server
                      Live Status <LaunchIcon className="ml-1" fontSize="small" /></a>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </CardContent>
    </Card>

  )
}


const Stardust = () => {

  return (
    <div>
      <Box className="star-view w-100 h-100">
        {/*<MDBMask className="d-flex justify-content-center align-items-center gradient"/>*/}
        <Navbar/>
        <Container fluid className="mt-0 mb-5 container-md">
          <Grid container>
            <Grid item>
              <HeaderBlock/>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              <ServerBlock/>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer/>
    </div>
  );
};

export default Stardust;
