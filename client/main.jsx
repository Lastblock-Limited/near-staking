import React from "react";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import { ContainerProvider } from "../imports/container";

//import "bootstrap-css-only/css/bootstrap.min.css";
//import "mdbreact/dist/css/mdb.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import App from "/imports/App";
//import * as serviceWorker from './serviceWorker';

if (Meteor.settings.public.node_env !== "development") {
  console.log = function () {};
}

Meteor.startup(() => {
  render(
    <ContainerProvider>
      <App />
    </ContainerProvider>,
    document.getElementById("main")
  );
});

//serviceWorker.unregister(); 