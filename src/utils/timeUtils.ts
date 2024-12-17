import {
  DIGIT_THRESHOLD,
  MILLISECONDS_IN_A_MINUTE,
  MILLISECONDS_IN_A_SECOND,
  SECONDS_IN_A_MINUTE,
  SECONDS_THRESHOLD,
} from './constants';

export const formatTimeForTimer = (time: number) => {
  const minutes = Math.floor(time / SECONDS_IN_A_MINUTE);
  const seconds = time % SECONDS_IN_A_MINUTE;
  return `${minutes}:${seconds < SECONDS_THRESHOLD ? '0' : ''}${seconds}`;
};

export const formatTimeForSlider = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / MILLISECONDS_IN_A_MINUTE);
  const seconds = (
    (milliseconds % MILLISECONDS_IN_A_MINUTE) /
    MILLISECONDS_IN_A_SECOND
  ).toFixed(0);
  return (
    minutes + ':' + (parseInt(seconds) < DIGIT_THRESHOLD ? '0' : '') + seconds
  );
};
