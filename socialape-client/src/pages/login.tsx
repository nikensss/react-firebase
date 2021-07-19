import {
  Button,
  CircularProgress,
  Grid,
  TextField,
  Theme,
  Typography,
  withStyles
} from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { Styles } from '@material-ui/styles/withStyles';
import axios from 'axios';
import React, {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState
} from 'react';
import { RouteComponentProps } from 'react-router-dom';
import AppIcon from '../images/icon.png';

const styles: Styles<Theme, {}, string> = (theme) => ({
  buttons: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  form: {
    textAlign: 'center',
    paddingTop: '2.4rem'
  },
  pageTitle: {
    margin: '1rem auto',
    textTransform: 'uppercase'
  },
  button: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  customError: {
    color: 'red',
    fontVariant: 'small-caps',
    fontSize: '1.2rem',
    marginTop: '0.2rem'
  },
  progress: {}
});

interface LoginErrors {
  general?: string;
  email?: string;
  password?: string;
}

export const Login = withStyles(styles)(
  ({
    classes,
    history
  }: {
    classes: ClassNameMap<string>;
    history: RouteComponentProps['history'];
  }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<LoginErrors>({});
    const [isLoading, setLoading] = useState(false);

    const setters: Record<string, Dispatch<SetStateAction<string>>> = {
      email: setEmail,
      password: setPassword
    };

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      try {
        const user = { email, password };
        const { data } = await axios.post('/login', user);
        console.log({ data });
        setLoading(false);
        history.push('/');
      } catch (ex) {
        setLoading(false); // this doesn't need to be in a finally, because if the catch block doesn't kick in, we are no longer in this page
        console.error({ ex });
        setErrors(ex.response.data);
      }
    };

    const onChange = (
      event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      const { name, value } = event.target;
      setters[name] && setters[name](value);
    };

    return (
      <Grid container className={classes.form}>
        <Grid item sm />
        <Grid item sm>
          <img src={AppIcon} alt='Social ape icon' />
          <Typography variant='h2' className={classes.pageTitle}>
            Log in
          </Typography>
          <form noValidate onSubmit={onSubmit}>
            <TextField
              id='email'
              name='email'
              type='email'
              label='email'
              fullWidth
              className={classes.textField}
              helperText={errors.email}
              error={!!errors.email}
              value={email}
              onChange={onChange}
            />

            <TextField
              id='password'
              name='password'
              type='password'
              label='password'
              fullWidth
              className={classes.textField}
              helperText={errors.password}
              error={!!errors.password}
              value={password}
              onChange={onChange}
            />

            {errors.general && (
              <Typography variant='body2' className={classes.customError}>
                {errors.general}
              </Typography>
            )}

            <div className={classes.buttons}>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={isLoading}
                className={classes.button}
              >
                {isLoading ? (
                  <CircularProgress
                    size={20}
                    className={classes.progress}
                  ></CircularProgress>
                ) : (
                  'Log in'
                )}
              </Button>
              <Button
                variant='contained'
                color='secondary'
                className={classes.button}
                onClick={() => history.push('/signup')}
              >
                Sign up
              </Button>
            </div>
          </form>
        </Grid>
        <Grid item sm />
      </Grid>
    );
  }
);
