import React, {Suspense, lazy, useEffect} from "react";
import {Route, Switch} from 'react-router-dom'
import Index from './ui/pages/Index'
import {BrowserRouterHook} from './utils/use-router'
import NotFound from "./ui/pages/NotFound";
//import UserPage from "./ui/pages/UserPage";
const UserPage = lazy(() => import("./ui/pages/UserPage"));
import Loading from "./ui/pages/Loading";
import {ThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import {useGlobalState, useGlobalMutation} from './container'

function App() {
  const stateCtx = useGlobalState();
  const mutationCtx = useGlobalMutation();

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        overrides: {
          MuiOutlinedInput: {
            root: {
              position: "relative",
              "&$focused $notchedOutline": {
                borderColor: stateCtx.config.darkMode === "light" ? "#002884" : "#fff",
                borderWidth: 1
              }
            }
          },
          MuiLink: {         
            root:{      
              cursor: 'pointer !important',
              "&:hover": {
                  color: "inherit",
              }
            }
        },
          MuiDataGrid: {
            root: {            
              '& .MuiDataGrid-summary-renderingZone': {
                display: 'flex',
              },
              '& .MuiDataGrid-cellWithRenderer': {
                display: 'inline-flex',
                alignItems: 'center',
                flexWrap: 'wrap',
              },
              '& .MuiDataGrid-columnHeaderTitleContainer': {
                whiteSpace: 'normal'
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              },
              '& .MuiDataGrid-columnHeader': {
                lineHeight: 'initial',
                textAlign: 'center',
              },
              '& .MuiDataGrid-columnsContainer': {
                flexDirection: 'row',
                backgroundColor:  stateCtx.config.darkMode === "light" ? "#bdbdbd" : "#212121",
              },  
              '& .MuiDataGrid-row:not(.MuiDataGrid-summary-row)': {
                backgroundColor:  stateCtx.config.darkMode === "light" ? "#fafafa" : "#616161",   
                flexGrow: "1"            
              },  
            },
          },
        },
        palette: {
          type: stateCtx.config.darkMode,
          primary: {
            main: '#3f50b5',
            dark: 'rgb(105, 245, 225)',
            light: 'rgb(34, 90, 255)',
          },
          info: {
            main: 'rgb(105, 245, 225)'
          }
        },
        typography: {
          a: {
            '&:hover': {
              color: 'hsla(0,0%,100%,.75)',
            },
          },
          button: {
            textTransform: 'none',
            '&:hover': {
              color: 'hsla(0,0%,100%,.75)',
            },
          }
        }
      }),
    [stateCtx.config.darkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <BrowserRouterHook>
        <Switch>
          <Route exact path="/user/:accountId">
            <Suspense fallback={<Loading/>}>
              <UserPage/>
            </Suspense>
          </Route>
          <Route path="/" component={Index}/>
          <Route path="*">
            <NotFound/>
          </Route>
        </Switch>
      </BrowserRouterHook>
    </ThemeProvider>
  )
}

export default App
