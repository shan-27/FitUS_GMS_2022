import PropTypes from 'prop-types';
import { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCurrentProfile } from '../actions/profile';
import Navbar from '../components/Navbar';
import userp from '../images/user.jpg';
import './main.css';

const Profile = ({ getCurrentProfile, auth: { user }, profile: { profile } }) => {

  useEffect(() => {
    getCurrentProfile();
  }, [getCurrentProfile]);

  return (
    <Fragment>
      <Navbar />
      <div className='container-fluid my-5 py-5'>
        <div className='text-center'>
          <h2 className='user title'>Welcome {user && user.name}</h2>
          <img src={user.avatar} alt='Profile' className='img-fluid rounded-circle' style={{ width: '10%' }} />
          {profile !== null ? (
            <Fragment>
              <div className='my-4 text-white'>
                <h3>Personal information:</h3>
                <span>First Name: {user && user.name}</span><br />
                <span>Last Name: {user && user.lastname}</span><br />
                <span>Email: {user && user.email}</span><br />
                <span>Phone Number {user && user.phone}</span><br />
                <span>Height {user && user.height} cm</span><br />
                <span>Weight {user && user.weight} kg</span><br />
                <span>Date of birth: {user && user.dob}</span>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div className='mt-1 mb-2 p-1 pb-2'>
                <p>You haven't set up a profile yet, add info.</p>
                <Link to='/create-profile' className='btn btn-primary my-1'>
                  Create Profile
                </Link>
              </div>
            </Fragment>
          )}
        </div>
      </div>
    </Fragment >
  )
};



Profile.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
  profile: state.profile
});

export default connect(mapStateToProps, { getCurrentProfile })(Profile);
