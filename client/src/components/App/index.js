import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import IssueStatus from '../IssueStatus';
import { VotingMenuContainer } from './VotingMenu';
import { IssueContainer } from '../Issue';
import Heading from '../Heading';
import { ConcludedIssueContainer } from '../ConcludedIssueList';
import '../../css/App.css';
import '../../css/Button.css';
import '../../css/flaticon.css';

const App = props => (
  <div className="App">
    <Heading link="/" title={props.title}>
      <span>{props.fullName}</span>
      <a className="Button" href={props.loggedIn ? '/logout' : '/login'}>
        Logg {props.loggedIn ? 'ut' : 'inn'}
      </a>
    </Heading>
    <div className="App-components">
      <div className="ActiveIssue-components">
        <div className="ActiveIssue-Vote-wrapper">
          <IssueContainer />
          <VotingMenuContainer />
        </div>
        <IssueStatus />
      </div>
      <ConcludedIssueContainer />
    </div>
  </div>
  );

App.defaultProps = {
  fullName: '',
  loggedIn: false,
  title: 'Super Duper Fiesta : Ingen aktiv generalforsamling',
};

App.propTypes = {
  fullName: PropTypes.string,
  loggedIn: PropTypes.bool,
  title: PropTypes.string,
};

const mapStateToProps = state => ({
  fullName: state.auth.fullName,
  loggedIn: state.auth.loggedIn,
  title: state.meeting.title,
});

export default App;
export const AppContainer = connect(
  mapStateToProps,
)(App);