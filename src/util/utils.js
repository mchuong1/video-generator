import _ from 'lodash';

export const removeUrl = (string) => {
  const parsedSelfText = _.replace(string, /\(https:\/\/.*\/\)/g, '');
  return parsedSelfText;
}