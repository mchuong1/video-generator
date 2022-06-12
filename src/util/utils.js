import _ from 'lodash';

export const removeUrl = (string) => {
  const parsedSelfText = _.replace(string, /\(https:\/\/.*\)/g, '');
  return parsedSelfText;
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