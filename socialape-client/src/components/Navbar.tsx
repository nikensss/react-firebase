import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';

export const Navbar = () => {
  return (
    <AppBar>
      <Toolbar>
        <Button color='inherit'>Home</Button>
        <Button color='inherit'>Login</Button>
        <Button color='inherit'>Signup</Button>
      </Toolbar>
    </AppBar>
  );
};
