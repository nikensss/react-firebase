import { Grid } from '@material-ui/core';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { IScream } from '../../components/Scream/Scream';
import { Screams } from '../../components/Scream/Screams';
import './Home.css';

export const Home = () => {
  const [screams, setScreams] = useState<IScream[]>([]);

  useEffect(() => {
    const getScreams = async () => {
      const screamsRequest = await axios.get('/screams');
      const {
        data: { screams }
      } = screamsRequest;
      setScreams(screams);
    };

    try {
      getScreams();
    } catch (ex) {
      console.error(ex);
    }
  }, []);

  return (
    <Grid container spacing={6}>
      <Grid item sm={8} xs={12}>
        <Screams screams={screams} />
      </Grid>
      <Grid item sm={4} xs={12}>
        <p>Profile...</p>
      </Grid>
    </Grid>
  );
};
