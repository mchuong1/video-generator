import _ from 'lodash';

export const removeUrl = (string) => {
  const parsedSelfText = _.replace(string, /\(https:\/\/.*\)/g, '');
  // eslint-disable-next-line no-useless-escape
  const noRemoved = _.replace(parsedSelfText, '[removed]', '');
  // eslint-disable-next-line no-useless-escape
  const noChineseChars = _.replace(noRemoved, /[^a-zA-Z\d\s,’.?!\(\)‘"'”\-“\[\]]+/g, '');
  return noChineseChars;
}

export const findComment = (id, collection) => {
  if(collection.length === 0) return undefined;
  if(_.find(collection, {id})) return _.find(collection, {id});
  for(let i = 0; i < collection.length; i++) {
    if(_.get(collection[i], 'replies', []).length > 0) {
      if(_.find(collection[i].replies, {id})) return _.find(collection[i].replies, {id})
    }
  }
  const newCollection = _.map(collection, listing => {
    return listing.replies;
  });
  return findComment(id, _.flattenDeep(newCollection));
}

export const replaceBadWords = string => {
  const parsedString = _.replace(string, /([sS][Ee][xX])/g, 'smash').replace(/([fF][uU][cC][kK])/g, 'eff').replace(/([cC][oO][cC][kK])/g, 'sausage')
  .replace(/([pP][eE][nN][iI][sS])/g, 'pencil').replace(/([sS][hH][iI][tT])/g, 'poop').replace(/([cC][uU][nN][tT])/g, 'nugget')
  .replace(/([bB][iI][cC][tT][cC][hH])/g, 'bish').replace(/([dD][aA][mM][nN])/g, 'dang').replace(/([aA][sS][sS])/g, 'butt').replace(/([bB][aA][sS][tT][aA][rR][dD])/g, 'dog')
  .replace(/([pP][iI][sS][sS])/g, 'peen');
  return parsedString;
}