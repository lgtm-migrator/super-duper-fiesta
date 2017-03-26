import React from 'react';
import { connect } from 'react-redux';
import { sendVote } from '../../actionCreators/issues';
import getShuffledAlternatives from '../../selectors/getShuffledAlternatives';
import { getIssueId, getIssueKey } from '../../selectors/issues';
import Alternatives from '../Alternatives';
import Button from '../Button';
import '../../css/VotingMenu.css';

class VotingMenu extends React.Component {
  constructor() {
    super();

    this.state = {
      selectedVote: undefined,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(event) {
    this.setState({
      selectedVote: event.currentTarget.value,
    });
  }

  handleClick() {
    // Voting is only allowed when you have a key.
    if (this.props.voterKey) {
      this.props.handleVote(
        this.props.issueId,
        this.state.selectedVote,
        this.props.voterKey,
      );
    }
  }

  render() {
    const buttonDisabled = this.state.selectedVote === undefined ||
      (this.props.votes.some(vote => vote.voter === this.props.voterKey));

    return (
      <div className="VotingMenu">
        <Alternatives
          alternatives={this.props.alternatives}
          handleChange={this.handleChange}
          selectedVote={this.state.selectedVote}
        />
        <Button
          background
          size="lg"
          onClick={this.handleClick}
          disabled={buttonDisabled}
        >
          Submit vote
        </Button>
      </div>
    );
  }
}

VotingMenu.defaultProps = {
  voterKey: undefined,
  alternatives: [],
  issueId: '',
};

VotingMenu.propTypes = {
  alternatives: Alternatives.propTypes.alternatives,
  handleVote: React.PropTypes.func.isRequired,
  issueId: React.PropTypes.string,

  votes: React.PropTypes.arrayOf(React.PropTypes.shape({
    alternative: React.PropTypes.string,
    id: React.PropTypes.string,
  })).isRequired,

  voterKey: React.PropTypes.number,
};

const mapStateToProps = state => ({
  // Alternatives are shuffled as an attempt to prevent peeking over shoulders
  // to figure out what another person has voted for. This scramble needs
  // to be syncronized between LiveVoteCount and VoteHandler, so we take
  // advantage of the memoizing provided by reselect. This keeps the
  // scrambles in sync and avoids rescrambling unless the
  // available alternatives are changed.
  alternatives: getShuffledAlternatives(state),

  votes: getIssueKey(state, 'votes', []),

  // The ID, or undefined, if there is no current issue.
  issueId: getIssueId(state),

  voterKey: state.voterKey,
});

const mapDispatchToProps = dispatch => ({
  handleVote: (id, alternative, voter) => {
    dispatch(sendVote(id, alternative, voter));
  },
});


export default VotingMenu;
export const VotingMenuContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(VotingMenu);