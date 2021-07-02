import React, { createContext, useContext, useReducer, useEffect } from "react";
import { reducer, defaultState } from "./store";

const StateContext = createContext({});
const MutationContext = createContext({});

export const ContainerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  window.rootState = state;

  const methods = {
    updateConfig(params) {
      dispatch({ type: "config", payload: { ...state.config, ...params } });
    },
    setMeteorStatus(params) {
      dispatch({ type: "status", payload: params });
    },
    setMeteorConnected(params) {
      dispatch({ type: "connected", payload: params });
    },
    updateUser(params) {
      dispatch({ type: "user", payload: { ...state.user, ...params } });
    },
    setError(params) {
      dispatch({ type: "error", payload: params });
    },
  };
  
  useEffect(() => {
    window.localStorage.setItem(
      "near_staking_storage",
      JSON.stringify({
        activePage: state.config.activePage,
        sort: state.config.sort,
        lastEpochs: state.config.lastEpochs,
        accountMonitor: state.config.accountMonitor,
        poolMonitor: state.config.poolMonitor,
        currency: state.config.currency,
        darkMode: state.config.darkMode,
      })
    );
  }, [state]);

  return (
    <StateContext.Provider value={state}>
      <MutationContext.Provider value={methods}>
        {children}
      </MutationContext.Provider>
    </StateContext.Provider>
  );
};

export function useGlobalState() {
  return useContext(StateContext);
}

export function useGlobalMutation() {
  return useContext(MutationContext);
}
