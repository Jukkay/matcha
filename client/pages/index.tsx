import type { NextPage } from 'next'
import { useEffect, useState } from 'react';
import { API, addInterceptors } from "../utilities/api";

const Home: NextPage = () => {
  const [serverResponse, setServerResponse] = useState('')
  const authAPI = addInterceptors(API)

  const getData = async() => {
      const storedInfo = sessionStorage.getItem("userData");
      if (storedInfo) {
        const {user_id} = JSON.parse(storedInfo)
        const response = await authAPI.get(`/user/${user_id}`);
        if (response) {
          setServerResponse(JSON.stringify(response.data))
        }
      }
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
