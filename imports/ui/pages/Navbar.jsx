import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  Switch,
  Divider,
  InputBase,
} from "@material-ui/core";
import {fade, makeStyles} from '@material-ui/core/styles';
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from '@material-ui/icons/Search';
import React, {useState, useEffect} from "react";
import {useGlobalState, useGlobalMutation} from '../../container'
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import SvgIcon from '@material-ui/core/SvgIcon';
import Link from '@material-ui/core/Link';


const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: "darkgrey",
    paddingRight: "79px",
    paddingLeft: "118px",
    marginBottom: '200px !important',
    "@media (max-width: 900px)": {
      paddingLeft: 0,
    },
  },
  logo: {
    fontWeight: 600,
    color: "#FFFEFE",
    textAlign: "left",
  },
  menuButton: {
    fontFamily: "Open Sans, sans-serif",
    fontWeight: 700,
    size: "18px",
    marginLeft: "38px",
  },
  navBarItems: {
    marginLeft: theme.spacing(1),
  },
  navBarText: {
    marginTop: theme.spacing(3),
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    minHeight: "56px",
  },
  drawerContainer: {
    padding: "20px 30px",
  },
  title: {
    flexGrow: 1,
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.black, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.black, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));


export default function Navbar(props) {
  const classes = useStyles();
  const stateCtx = useGlobalState()
  const mutationCtx = useGlobalMutation()
  const [search, setSearch] = useState(null);

  const [state, setState] = useState({
    mobileView: false,
    drawerOpen: false,
    darkMode: stateCtx.config.darkMode === 'dark',
  });


  const handleDarkModeToggle = () => {
    //console.log(!state.darkMode);
    setState({...state, darkMode: !state.darkMode});

  };

  /*
  const handleSearchClick = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log(search);
    }
  };
  */

  const handleSearchChange = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  };

  useEffect(() => {
    mutationCtx.updateConfig({
      darkMode: state.darkMode ? 'dark' : 'light',
    })
  }, [state.darkMode]);


  const {mobileView, drawerOpen} = state;

  useEffect(() => {
    const setResponsiveness = () => {
      return window.innerWidth < 900
        ? setState((prevState) => ({...prevState, mobileView: true}))
        : setState((prevState) => ({...prevState, mobileView: false}));
    };

    setResponsiveness();

    window.addEventListener("resize", () => setResponsiveness());
  }, []);

  const searchBox = (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <SearchIcon/>
      </div>
      <InputBase
        onKeyDown={props.handleSearchClick}
        onChange={handleSearchChange}
        value={search}
        placeholder="Search for…"
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{'aria-label': 'search'}}
      />
    </div>
  )


  const displayDesktop = () => {
    return (
      <Toolbar className={classes.toolbar}>
        <LogoIcon/>
        {nearLogo}
        <Box component="nav" style={{display: 'flex', flexDirection: 'row', padding: 0}} color="textPrimary">
          <Link component={Button} underline="none" color="textPrimary" href="/">
            Home
          </Link>
          <Link component={Button} underline="none" color="textSecondary" href="/stats">Validator Stats</Link>
        </Box>
        <Box flexGrow={1} textAlign="right">
          {darkSwitch}
        </Box>
        {getMenuButtons(false)}
      </Toolbar>
    );
  };

  const displayMobile = () => {
    const handleDrawerOpen = () =>
      setState((prevState) => ({...prevState, drawerOpen: true}));
    const handleDrawerClose = () =>
      setState((prevState) => ({...prevState, drawerOpen: false}));

    return (
      <Toolbar>
        <LogoIcon/>
        <Box>
          {nearLogo}
        </Box>
        <Box flexGrow={1} textAlign="right">
          <IconButton
            {...{
              edge: "start",
              color: "inherit",
              "aria-label": "menu",
              "aria-haspopup": "true",
              onClick: handleDrawerOpen,
            }}
          >
            <MenuIcon/>
          </IconButton>
          <Drawer
            {...{
              anchor: "left",
              open: drawerOpen,
              onClose: handleDrawerClose,
            }}
          >
            <div className={classes.drawerContainer}>
              {nearLogo}
              <Divider/>
              {darkSwitch}
              <Divider/>
              {getMenuButtons(true)}
            </div>

          </Drawer>
        </Box>
      </Toolbar>
    );
  };


  const darkSwitch = (
    <Switch
      checked={state.darkMode}
      onClick={handleDarkModeToggle}
      name="toggleDarkMode"
      color="primary"
      inputProps={{'aria-label': 'secondary checkbox'}}
    />
  );

  function LogoIcon(props) {
    return (
      <SvgIcon viewBox="0 0 414 162" fontSize="large" style={{width: "70px"}}>
        <path
          d="M207.21 54.75v52.5a.76.76 0 01-.75.75H201a7.49 7.49 0 01-6.3-3.43l-24.78-38.3.85 19.13v21.85a.76.76 0 01-.75.75h-7.22a.76.76 0 01-.75-.75v-52.5a.76.76 0 01.75-.75h5.43a7.52 7.52 0 016.3 3.42l24.78 38.24-.77-19.06V54.75a.75.75 0 01.75-.75h7.22a.76.76 0 01.7.75zM281 108h-7.64a.75.75 0 01-.7-1l20.24-52.28A1.14 1.14 0 01294 54h9.57a1.14 1.14 0 011.05.72L324.8 107a.75.75 0 01-.7 1h-7.64a.76.76 0 01-.71-.48l-16.31-43a.75.75 0 00-1.41 0l-16.31 43a.76.76 0 01-.72.48zm96.84-1.21L362.66 87.4c8.57-1.62 13.58-7.4 13.58-16.27 0-10.19-6.63-17.13-18.36-17.13h-21.17a1.12 1.12 0 00-1.12 1.12 7.2 7.2 0 007.2 7.2H357c7.09 0 10.49 3.63 10.49 8.87s-3.32 9-10.49 9h-20.29a1.13 1.13 0 00-1.12 1.13v26a.75.75 0 00.75.75h7.22a.76.76 0 00.75-.75V87.87h8.33l13.17 17.19a7.51 7.51 0 006 2.94h5.48a.75.75 0 00.55-1.21zM258.17 54h-33.5a1 1 0 00-1 1 7.33 7.33 0 007.33 7.33h27.17a.74.74 0 00.75-.75v-6.83a.75.75 0 00-.75-.75zm0 45.67h-25a.76.76 0 01-.75-.75V85.38a.75.75 0 01.75-.75h23.11a.75.75 0 00.75-.75V77a.75.75 0 00-.75-.75h-31.49a1.13 1.13 0 00-1.12 1.13v29.45a1.12 1.12 0 001.12 1.13h33.38a.75.75 0 00.75-.75v-6.83a.74.74 0 00-.75-.71z"/>
        <path
          d="M46.29 126a10.29 10.29 0 007.79-3.57l70.35-81.61a10.29 10.29 0 00-8.72-4.82 10.28 10.28 0 00-7.75 3.53l-70.69 81.13a10.27 10.27 0 009.02 5.34z"
          fill="url(#linear-gradient)"/>
        <path
          d="M46.29 126a10.18 10.18 0 004.71-1.15V56.72l54.65 65.58a10.32 10.32 0 007.91 3.7h2.15A10.29 10.29 0 00126 115.71V46.29A10.29 10.29 0 00115.71 36a10.32 10.32 0 00-4.71 1.13v68.15L56.35 39.7a10.32 10.32 0 00-7.91-3.7h-2.15A10.29 10.29 0 0036 46.29v69.42A10.29 10.29 0 0046.29 126z"/>
      </SvgIcon>
    );
  }


  const nearLogo = (
    <div>
      <Typography variant="h6" component="h1" className={classes.title} noWrap
                  style={{marginRight: 7}}>NEAR-STAKING</Typography>
    </div>
  );

  const getMenuButtons = (isMobile) => {
      return (
        isMobile ?
          <List color="text.primary">
            <ListItem button component={Link} to="/">
              <ListItemText primary="Home"/>
            </ListItem>
            <ListItem button component={Link} to="/stats">
              <ListItemText primary="Stats"/>
            </ListItem>
          </List>
          : null
      );
    }
  ;

  return (
    <AppBar color="default" position="static" className="mb-3">
      {mobileView ? displayMobile() : displayDesktop()}
    </AppBar>
  );
}