import axios from 'axios';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { createProfile } from '../../actions/profile';

const CreateProfile = () => {

  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    waistdiameter: '',
    shoulderdiameter: '',
    chestdiameter: '',
    legsdiameter: ''

  });

  const {
    weight,
    height,
    age,
    waistdiameter,
    shoulderdiameter,
    chestdiameter,
    legsdiameter
  } = formData;

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    const newUser = {
      weight,
      height,
      age,
      waistdiameter,
      shoulderdiameter,
      chestdiameter,
      legsdiameter
    }
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      }
      const body = JSON.stringify(newUser);
      const res = await axios.post('/api/profile', body, config);
      console.log(res.data);
      toast.success('Datos guardados',
        {
          position: 'top-center',
          duration: 4000,
          style: {
            borderRadius: '20px',
            background: '#f17f5c',
            border: '1px solid #f17f5c',
            padding: '1rem',
            color: '#fff',
          },
        }
      );
    } catch (error) {
      console.error(error.response.data);
    }
  }

  return (
    <section className='container-fluid profile py-4'>
      <div className='container shadow p-5 profile__form'>
        <div className='text-center'>
          <Link to='/' className='profile__logo'>
            Gym New
          </Link>
        </div>
        
      </div>
    </section>
  );
};

export default connect(null, { createProfile })(withRouter(CreateProfile));

