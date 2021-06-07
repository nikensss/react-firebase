import { deepPurple, purple } from '@material-ui/core/colors';
import { MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { Navbar } from './components/Navbar';
import { home } from './pages/home';
import { login } from './pages/login';
import { signup } from './pages/signup';

const theme = createMuiTheme({
  palette: {
    primary: deepPurple,
    secondary: purple
  }
});

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div className='App'>
        <Router>
          <Navbar />
          <div className='container'>
            <Switch>
              <Route exact path='/' component={home}></Route>
              <Route exact path='/login' component={login}></Route>
              <Route exact path='/signup' component={signup}></Route>
            </Switch>
          </div>
        </Router>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
