const mongoose = require('mongoose');
const logger = require('../logging');
const canEdit = require('./meeting').canEdit;
const permissionLevel = require('../../common/auth/permissions');
const getIssueById = require('./issue').getIssueById;

const Schema = mongoose.Schema;


const VoteSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true },
  question: { type: Schema.Types.ObjectId, required: true },
  option: { type: Schema.Types.ObjectId, required: true },
});
const Vote = mongoose.model('Vote', VoteSchema);


function getVotes(question) {
  return Vote.find({ question });
}

async function haveIVoted(issue, user) {
  const votes = await Vote.find({ question: issue, user });
  return votes.length > 0;
}

function addVote(issueId, user, option, voter) {
  return new Promise((resolve, reject) => {
    getIssueById(issueId)
    .then((issue) => {
      logger.debug('Storing vote.', { issueId, user: user.onlinewebId });
      if (!issue.active) {
        logger.warn('Tried to vote on inactive issue!', { issueId, user: user.onlinewebId });
        reject();
        return;
      }
      logger.silly('Checking permissions.', { issueId, user: user.onlinewebId });
      canEdit(permissionLevel.CAN_VOTE, user, issue.genfors).then(async () => {
        const alreadyVoted = await haveIVoted(issueId, voter);
        if (!alreadyVoted) {
          const vote = new Vote({
            user: voter,
            question: issueId,
            option,
          });
          logger.debug('Storing vote.', { issueId, user: user.onlinewebId, voter });
          vote.save().then(resolve).catch(reject);
        } else {
          logger.debug('User has already voted!', { issueId, user: user.onlinewebId, voter });
          reject(new Error('Du har allerede stemt.'));
        }
      }).catch((err) => {
        logger.warn('User tried to vote without having appropriate permissions.', {
          issueId,
          user: user.onlinewebId,
          requiredPerms: permissionLevel.CAN_VOTE,
          hadPerms: user.permissions,
        });
        reject(err);
      });
    }).catch((err) => {
      logger.error('Retrieving issue for vote failed!', err, { issueId });
    });
  });
}

const getPublicVote = (vote, secret, showOnlyWinner) => ({
  _id: vote._id, // eslint-disable-line no-underscore-dangle
  question: vote.question,
  user: (showOnlyWinner || secret) ? {} : vote.user,
  option: showOnlyWinner ? {} : vote.option,
});

const generatePublicVote = async (id, vote) => {
  let issue;
  if (typeof id === 'string') {
    issue = await getIssueById(id);
  } else issue = id;

  return getPublicVote(vote, issue.secret, issue.showOnlyWinner);
};

module.exports = {
  addVote,
  generatePublicVote,
  getPublicVote,
  getVotes,
  haveIVoted,
};
