import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { Navbar } from './components/Navbar';
import { home } from './pages/home';
import { login } from './pages/login';
import { signup } from './pages/signup';

function App() {
  return (
    <div className='App'>
      <h1>Our app</h1>
      <Router>
        <Navbar />
        <Switch>
          <Route exact path='/' component={home}></Route>
          <Route exact path='/login' component={login}></Route>
          <Route exact path='/signup' component={signup}></Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
