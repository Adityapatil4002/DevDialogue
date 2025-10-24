import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Project = ({  }) => {
    
    const location = useLocation();

    const navigate = useNavigate();

    console.log(navigate)


  return (
    <div>Project</div>
  )
}

export default Project