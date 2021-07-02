import { Meteor } from "meteor/meteor";
import React, { Suspense, lazy, useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import useRouter from "../../utils/use-router";
import FooterPage from "./Footer";
import Connecting from "./Connecting";
import Loading from "./Loading";
import NotFound from "./NotFound";
import { useGlobalState, useGlobalMutation } from "/imports/container";
import Home from "./Home";
import Stats from "./Stats";
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.type === "light" ? theme.palette.grey[600] : theme.palette.grey[500],
    minHeight: '100vh',
  },
}));


const Index = () => {
  const router = useRouter();
  const history = router.history;
  const stateCtx = useGlobalState();
  const mutationCtx = useGlobalMutation();
  const classes = useStyles();

  useEffect(() => {
    if (stateCtx.error !== null) {
      console.log(stateCtx.error);
    }

    return () => {};
  }, [stateCtx.error]);


  return (
    <div>
      <div id="homePage" className={classes.root}>
        <Switch>
          <Route exact path="/stats">
            <Suspense fallback={<Loading />}>
              <Stats />
            </Suspense>
          </Route>

          <Route exact path="/">
            <Suspense fallback={<Loading />}>
              <Home />
            </Suspense>
          </Route>

          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </div>
      <FooterPage />
      {Meteor.status().status !== "connected" ? <Connecting /> : null}
    </div>
  );
};

export default Index;
