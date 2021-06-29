import { Theme, Tooltip, Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import { withStyles } from '@material-ui/core/styles';
import { Styles } from '@material-ui/core/styles/withStyles';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export interface IScream {
  body: string;
  commentCount: number;
  createdAt: string;
  id: string;
  likeCount: number;
  userHandle: string;
  userImage: string;
}

const styles: Styles<Theme, {}, string> = (theme) => ({
  scream: {
    marginBottom: '0.85rem',
    display: 'flex',
    padding: '0.3rem 5% 0.3rem 2.5%'
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: '100%'
  },
  content: {
    padding: 25,
    objectFit: 'cover'
  }
});

export const Scream = withStyles(styles)(
  ({ scream, classes }: { scream: IScream; classes: any }) => {
    const {
      body,
      /*commentCount, likeCount, */ userHandle,
      userImage,
      createdAt
    } = scream;
    return (
      <Card className={classes.scream}>
        <CardMedia
          className={classes.image}
          image={userImage}
          title='Profile image'
        />
        <CardContent className={classes.content}>
          <Typography
            variant='h5'
            component={Link}
            to={`/users/${userHandle}`}
            color='primary'
          >
            {userHandle}
          </Typography>
          <Tooltip
            title={format(new Date(scream.createdAt), 'yyyy/MM/dd HH:mm')}
            placement='top'
          >
            <Typography variant='body2' color='textSecondary'>
              {formatDistanceToNow(new Date(createdAt), {
                addSuffix: true
              })}
            </Typography>
          </Tooltip>
          <Typography variant='body1'>{body} </Typography>
        </CardContent>
      </Card>
    );
  }
);
