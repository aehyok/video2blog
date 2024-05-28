export const secondsToTime = (milliseconds: number) => {
  let hours = Math.floor(milliseconds / 3600);
  let minutes = Math.floor((milliseconds % 3600) / 60);
  let seconds = milliseconds % 60;
  let formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${seconds.toFixed(3).padStart(6, '0')}`;
  return formattedTime;
}