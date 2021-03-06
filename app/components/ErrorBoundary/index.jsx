/**
 *
 * ErrorBoundary
 *
 */

import React from 'react';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { compose } from 'redux';
import injectReducer from 'utils/injectReducer';

import { Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter, Jumbotron } from 'reactstrap';
import { routeActions } from 'redux-simple-router';
import { makeSelectStatus } from 'components/ServiceBlock/selectors';
import { Link } from 'react-router-dom';
import moment from 'moment/src/moment';
import { cleanError } from './actions';
import reducer from './reducer';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      errorInfo: null,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error,
      errorInfo,
    });
  }

  componentWillUnmount() {
    this.setState({
      error: null,
      errorInfo: null,
    });
  }

  render() {
    const lastParsed = this.props.status.last_parsed;
    let content = this.props.children;

    if (this.props.st.error) {
      content = (
        <div>
          <Modal isOpen={true}>
            <ModalHeader>Something was wrong..</ModalHeader>
            <ModalBody>
              <Jumbotron>
                <h1>{this.props.st.error && this.props.st.error.toString()}</h1>
                <br/>
                <h3>
                  Please <Link onClick={()=>window.location.reload()} to="" refresh="true"><span>retry</span></Link> again in few seconds.
                </h3>
              </Jumbotron>
            </ModalBody>
          </Modal>
          {this.props.children}
        </div>
      );
    } else if (this.state.error) {
      content = (
        <div>
          <Jumbotron>
            <h1>Something was wrong..</h1>
            <hr className="my-2" />
            <br/>
            <h3>{this.state.error && this.state.error.toString()}</h3>
            <br/>
            <h5>
              Please <Link onClick={()=>window.location.reload()} to="" refresh="true"><span>retry</span></Link> again in few seconds.
            </h5>
          </Jumbotron>
        </div>
      );
    } else if (lastParsed) {
      const lastParsedDiff = moment
      .utc()
      .diff(moment.utc(lastParsed), 'minutes');

      if (lastParsedDiff > 10) {
        content = (
          <div>
            <Alert color="warning">
              <span>
                We are currently experiencing delayed updates from our backend.
                Please try again later
              </span>
            </Alert>
            {this.props.children}
          </div>
        );
      }
    }

    return content;
  }
}

ErrorBoundary.propTypes = {};
const mapStateToProps = createStructuredSelector({
  status: makeSelectStatus(),
  st: state => state.get('errorBoundary').toJS(),
});

const withReducer = injectReducer({
  key: 'errorBoundary',
  reducer,
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    cleanError: () => dispatch(cleanError()),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withReducer,
  withConnect,
)(ErrorBoundary);
