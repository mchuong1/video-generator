import _ from 'lodash';

export const removeUrl = (string) => {
  const parsedSelfText = _.replace(string, /\(https:\/\/.*\)/g, '');
  // eslint-disable-next-line no-useless-escape
  const noRemoved = _.replace(parsedSelfText, '[removed]', '');
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