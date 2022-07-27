import axios from 'axios';
import type { NextPage } from 'next'
import { useEffect, useState } from 'react';
import { useUserContext } from '../components/UserContext';

const Home: NextPage = () => {
  const {userData} = useUserContext()
  const [serverResponse, setServerResponse] = useState('')
  const getData = async() => {
    const response = await axios.get(`/user/${userData.user_id}`);
    console.log('response: ', response.data)
    setServerResponse(JSON.stringify(response.data))
  }
  useEffect(() => {
    getData()
  }, [])
  return (
    <section className="section">

      <h1 className="title is-1">
          Welcome to 42 Dates
      </h1>
      <div>
        {serverResponse}
      </div>

    </section>
  )
}

export default Home
