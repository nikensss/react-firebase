import { IScream, Scream } from './Scream';

export const Screams = ({ screams }: { screams: IScream[] }) => {
  return (
    <>
      {screams.map((s) => (
        <Scream scream={s} />
      ))}
    </>
  );
};
