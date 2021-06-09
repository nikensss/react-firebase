import { Tooltip } from '@material-ui/core';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import ModeCommentIcon from '@material-ui/icons/ModeComment';
import { format } from 'date-fns';
import formatDistance from 'date-fns/formatDistance';
import './Scream.css';
export interface IScream {
  body: string;
  commentCount: number;
  likeCount: number;
  userHandle: string;
  userImage: string;
  createdAt: string;
}

export const Scream = ({ scream }: { scream: IScream }) => {
  console.log({ createdAt: scream.createdAt });
  return (
    <div className='scream'>
      <p className='scream-body'>{scream.body}</p>
      <div className='scream-metadata'>
        <ul className='scream-likes-and-comments'>
          <li>
            <FavoriteBorderIcon /> {scream.likeCount}
          </li>
          <li>
            <ModeCommentIcon /> {scream.commentCount}
          </li>
        </ul>
        <p className='scream-author'>
          <small>
            {scream.userHandle} -{' '}
            <Tooltip
              title={format(new Date(scream.createdAt), 'yyyy/MM/dd HH:mm')}
              placement='top'
            >
              <span>
                {formatDistance(new Date(scream.createdAt), Date.now(), {
                  addSuffix: true
                })}
              </span>
            </Tooltip>
          </small>
        </p>
      </div>
    </div>
  );
};
