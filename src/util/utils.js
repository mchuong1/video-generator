import _ from 'lodash';

export const removeUrl = (string) => {
  const parsedSelfText = _.replace(string, /\(https:\/\/.*\)/g, '');
  const noRemoved = _.replace(parsedSelfText, '[removed]', '');
  // eslint-disable-next-line no-useless-escape
  const noChineseChars = _.replace(noRemoved, /[^a-zA-Z\d\s,’.?!\(\)‘"'”\-“\[\]]+/g, '');
  // const noDisclaimer = _.replace(noChineseChars, /\(.*\)/g, '');
  const noEdit = _.replace(noChineseChars, /[eE][dD][iI][tT].*/g, '');
  return noEdit;
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

export const convertAcronyms = (string) => {
  const tifu = _.replace(string, /[tT][iI][fF][uU]/g, 'Today I fucked up');
  return tifu;
}

export const replaceBadWords = string => {
  const parsedString = _.replace(string, /([sS][Ee][xX])/g, 's x').replace(/([fF][uU][cC][kK])/g, 'eff').replace(/([cC][oO][cC][kK])/g, 'sausage')
  .replace(/([pP][eE][nN][iI][sS])/g, 'pencil').replace(/([sS][hH][iI][tT])/g, 'poop').replace(/([cC][uU][nN][tT])/g, 'nugget')
  .replace(/([bB][iI][tT][cC][hH])/g, 'bish').replace(/([dD][aA][mM][nN])/g, 'dang').replace(/([bB][aA][sS][tT][aA][rR][dD])/g, 'dog')
  .replace(/([pP][iI][sS][sS])/g, 'pee').replace(/([dD][iI][cC][kK])/g, 'sausage').replace(/([aA][sS][sS])/g, 'ass').replace(/[pP][oO][rR][Nn]/g, 'corn')
  .replace(/[vV][aA][gG][iI][nN][aA]/g, 'v-card').replace(/[pP][rR][Oo][sS][tT][iI][tT][uU][tT][eE]/g, 'adult fun time').replace(/[kK][iI][lL][lL]/g, 'unalive')
  .replace(/[lL][sS][dD]/g, 'drug').replace(/[pP][uU][sS][sS][yY]/g, 'kitty').replace(/[mM][uU][rR][dD][eE][Rr]/g, 'unalive')
  .replace(/[bB][oO][nN][eE][rR]/g, 'stiffy')
  .replace(/[aA][sS][sS]/g, 'butt')
  .replace(/[mM][aA][sS][tT][uU][rR][bB][aA][tT]/g, 'jerk');
  // .replace(/[dD][iI][eE]/g, 'unalive')
  // .replace(/[cC][uU][mM]/g, 'came')
  // .replace(/[tT][iI][tT]/g, 'melon')
  return parsedString;
}