import React, {useEffect, useState} from "react";
import {Cookies} from 'meteor/ostrio:cookies';
import {
  Button,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Container,
  Card,
  Grid,
  makeStyles,
  Link
} from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
  card: {
    width: '100%',
    borderRadius: 25,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  footer: {
    fontSize: '.9rem',
    paddingTop: theme.spacing(4),
  },
  grid: {
    display: 'flex',
    alignItems: 'center',
  },
}));


const CookieConsent = () => {

  const cookies = new Cookies();
  const opts = {};
  opts.maxAge = 31536000 / 2;
  const [showConsent, setShowConsent] = useState(!cookies.get('_cookie_consent'));

  const handleClick = () => {
    cookies.set('_cookie_consent', 'true', opts);
    setShowConsent(false);
  }

  useEffect(() => {
    if (cookies.get('_cookie_consent') === undefined) {
      setShowConsent(true);
    } else {
      setShowConsent(false);
    }
    return () => {
    };
  }, [cookies.get('_cookie_consent')]);

  const classes = useStyles();

  return (
    showConsent ?
      <Container style={{bottom: 20, left: 10}} className="fixed-bottom">
        <Grid container className={classes.grid}>
          <Grid sm={12} md={4} lg={3}>
            <Card className={classes.card}>
              <Box id="modal-title">
                This website uses cookies.
              </Box>
              <Box align="justify" className="small">
                We use cookies and stores them on your computer. Some cookies are essential, others help us to improve
                your
                experience by providing insights into how the site is being used.
              </Box>
              <Button onClick={handleClick} type="submit" size="small" color="textPrimary">Accept</Button>
            </Card>
          </Grid>
        </Grid>
      </Container>
      : null
  )

}


const Footer = () => {
  const classes = useStyles();
  return (
    <Box component="footer" color="default" className={classes.footer}>
      <Container maxWidth="lg">
        <Grid container className={classes.grid}>
          <Grid item>
            <Typography color="textPrimary" variant="caption">
              THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND.
              WE DO NOT GUARANTEE, REPRESENT OR WARRANT THAT YOUR USE OF OUR SERVICE WILL BE UNINTERRUPTED, TIMELY,
              SECURE OR ERROR-FREE. WE DO NOT WARRANT THAT THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE SERVICE
              WILL BE ACCURATE OR RELIABLE. YOU AGREE THAT FROM TIME TO TIME WE MAY REMOVE THE SERVICE FOR INDEFINITE
              PERIODS OF TIME OR CANCEL THE SERVICE AT ANY TIME, WITHOUT NOTICE TO YOU. YOU EXPRESSLY AGREE THAT YOUR
              USE OF, OR INABILITY TO USE, THE SERVICE IS AT YOUR SOLE RISK. THE SERVICE AND ALL PRODUCTS AND SERVICES
              DELIVERED TO YOU THROUGH THE SERVICE ARE (EXCEPT AS EXPRESSLY STATED BY US) PROVIDED 'AS IS' AND 'AS
              AVAILABLE' FOR YOUR USE, WITHOUT ANY REPRESENTATION, WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS
              OR IMPLIED, INCLUDING ALL IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, MERCHANTABLE QUALITY,
              FITNESS FOR A PARTICULAR PURPOSE, DURABILITY, TITLE, AND NON-INFRINGEMENT.
              {" "}<i>ALL INFORMATION SHOULD BE INDEPENDENTLY VERIFIED BEFORE MAKING AN INVESTMENT OR
              DELEGATION DECISION AND/OR SUBMITTING FOR THE TAX OR OTHER REPORTING.</i>
            </Typography>

            <Typography align="center" color="textPrimary">
              <Link target="_blank" color="inherit" underline="hover"
                    href="/">near-staking.com</Link>{" "}&copy; 2020 - {new Date().getFullYear()} Copyright.<br/>
              All Rights Reserved.
            </Typography>
            <CookieConsent/>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
