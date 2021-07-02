import React, {useEffect, useState} from "react";
import {
  Typography,
  makeStyles
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

const Loading = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <>
      {show ? (
        <Dialog
          open={true}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <Typography align="center">Loading, please wait...</Typography>
            </DialogContentText>
          </DialogContent>
        </Dialog>
        ) : null}
    </>
  );
};

export default Loading;
