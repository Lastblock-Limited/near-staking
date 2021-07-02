const readDefaultState = () => {
  try {
    return JSON.parse(window.localStorage.getItem("near_staking_storage"));
  } catch (err) {
    return {};
  }
};

const defaultState = {
  status: null,
  connected: false,
  error: null,
  user: {
    loaded: false,
    username: null,
    email: null,
    firstName: null,
    lastName: null,
  },
  config: {
    activePage: "first",
    sort: "stake",
    lastEpochs: 4,
    accountMonitor: "",
    poolMonitor: "",
    currency: "usd",
    darkMode: 'light',
    ...readDefaultState(),
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "config": {
      return { ...state, config: action.payload };
    }
    case "status": {
      return { ...state, status: action.payload };
    }
    case "connected": {
      return { ...state, connected: action.payload };
    }
    case "user": {
      return { ...state, user: action.payload };
    }
    case "error": {
      return { ...state, error: action.payload };
    }
    default:
      throw new Error("mutation type not defined");
  }
};

export { reducer, defaultState };
