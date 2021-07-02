import React, {useEffect, useState} from "react";
import {useTracker} from "meteor/react-meteor-data";
import {Typography, Container, Grid, Modal, Box} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';


const Connecting = () => {
  const useStyles = makeStyles((theme) => ({
    card: {
      width: '100%',
      borderRadius: 25,
    },
    grid: {
      marginTop: 15,
    },
  }));
  const classes = useStyles();

  const status = useTracker(() => Meteor.status().status, []);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = (event) => {
    event.stopPropagation();
  };


  return (
    <>
      {status !== "connected" && show ? (
        <Dialog
          open={true}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <Typography id="modal-title" variant="h6">Updating, please wait...</Typography>
              <Typography id="modal-description" variant="overline">If you still see that message
                after 20-30 sec, please reload the page</Typography>
            </DialogContentText>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
};

export default Connecting;
