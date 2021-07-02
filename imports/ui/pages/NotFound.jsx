import React from "react";

import {Box, Container, Grid, Card, CardContent, Typography} from '@material-ui/core';
import Navbar from "./Navbar";
import Alert from "@material-ui/lab/Alert";

const NotFound = () => {
  const navStyle = {height: "100%", width: "100%", paddingTop: "2rem"};

  return (
    <Box>
      <Navbar/>
      <Container maxWidth="lg"
                 style={navStyle}
      >
        <Grid container>
          <Grid xs>
            <Card>
              <CardContent>
                <Alert icon={false} style={{justifyContent: "center"}} variant="outlined" severity="error">
                  <Typography align="center">404, Page Not Found</Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default NotFound;
