import {SECONDS_IN_A_MINUTE, SECONDS_THRESHOLD} from './constants';

export const formatTime = (time: number) => {
  const minutes = Math.floor(time / SECONDS_IN_A_MINUTE);
  const seconds = time % SECONDS_IN_A_MINUTE;
  return `${minutes}:${seconds < SECONDS_THRESHOLD ? '0' : ''}${seconds}`;
};
