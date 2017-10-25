import React from 'react';
import { connect } from 'react-redux';
import Cookies from 'js-cookie';
import { submitAnonymousVote, submitRegularVote } from '../../actionCreators/voting';
import { getShuffledAlternatives } from '../../selectors/alternatives';
import { activeIssueExists, getIssue, getIssueId, getOwnVote } from '../../selectors/issues';
import Alternatives from '../Alternatives';
import Button from '../Button';

class VotingMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedVote: null,
      displayVote: false,
    };
  }

  handleChange(event) {
    this.setState({
      selectedVote: event.currentTarget.value,
    });
  }

  handleClick() {
    // Voting is only allowed when you have a key.
    if (this.props.loggedIn) {
      this.props.handleVote(
        this.props.issueId,
        this.state.selectedVote,
        this.props.voterKey,
      );
    }
  }

  toggleVoteDisplay() {
    this.setState({
      displayVote: !this.state.displayVote,
    });
  }

  render() {
    const isLoggedIn = this.props.loggedIn;
    const hasActiveIssue = this.props.issueIsActive;
    const hasSelectedVote = !!this.state.selectedVote;
    const hasVoted = !!this.props.selectedAlternative;
    const buttonDisabled = !isLoggedIn || !hasSelectedVote || hasVoted;
    const buttonHidden = !hasActiveIssue;

    const selectedAlternative = hasVoted ? (this.state.displayVote ? this.props.selectedAlternative : null) : this.state.selectedVote;

    return (
      <div>
        <Alternatives
          alternatives={this.props.alternatives}
          disabled={hasVoted}
          handleChange={(...a) => this.handleChange(...a)}
          selectedVote={selectedAlternative}
        />
        <Button
          background
          size="lg"
          onClick={() => this.handleClick()}
          disabled={buttonDisabled}
          hidden={buttonHidden}
        >
          {hasVoted ? 'Du har allerede stemt' : 'Avgi stemme'}
        </Button>
        {hasVoted && (
          <Button
            background
            size="lg"
            onClick={() => this.toggleVoteDisplay()}
          >
            {this.state.displayVote ?
              'Skjul min stemme' : 'Vis min stemme'}
          </Button>
        )}
      </div>
    );
  }
}

VotingMenu.defaultProps = {
  voterKey: undefined,
  alternatives: [],
  issueId: '',
  loggedIn: undefined,
  selectedAlternative: null,
};

VotingMenu.propTypes = {
  alternatives: Alternatives.propTypes.alternatives,
  handleVote: React.PropTypes.func.isRequired,
  issueId: React.PropTypes.string,
  issueIsActive: React.PropTypes.bool.isRequired,
  loggedIn: React.PropTypes.bool,
  selectedAlternative: React.PropTypes.string,
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

  // The ID, or undefined, if there is no current issue.
  issueId: getIssueId(state),
  issue: getIssue(state),

  selectedAlternative: getOwnVote(state, state.auth.id),

  voterKey: state.voterKey,
  loggedIn: state.auth.loggedIn,

  issueIsActive: activeIssueExists(state),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { dispatch } = dispatchProps;
  return {
    ...ownProps,
    ...stateProps,
    handleVote: (issue, alternative) => {
      dispatch(stateProps.issue.secret ?
        submitAnonymousVote(issue, alternative, Cookies.get('passwordHash')) : submitRegularVote(issue, alternative));
    },
  };
};


export default VotingMenu;
export const VotingMenuContainer = connect(
  mapStateToProps,
  null,
  mergeProps,
)(VotingMenu);
