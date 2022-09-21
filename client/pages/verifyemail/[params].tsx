import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { Notification } from "../../components/form";
import { API } from "../../utilities/api";
import { useRouter } from "next/router";

// Get token from URL

const VerifyEmail: NextPage = () => {

  // Form states
  const [success, setSuccess] = useState(false);
  const [showGenericError, setShowGenericError] = useState(false);

  const router = useRouter();
  useEffect(() => {
    const { params } = router.query;
    verifyToken(params as string);
  });

  // Handle submit
  const verifyToken = async (token: string) => {
    if (!token)
      return
    setShowGenericError(false);
    try {
      const response = await API.post("/verifyemail", {token: token});
      if (response.status === 200) setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      const errorField = err.response?.data?.field;
      if (errorMessage && !errorField) {
        setShowGenericError(true);
      }
    }
  };


  // Component
  return success ? (
    <div className="columns">
      <div className="column is-half is-offset-one-quarter">
        <section className="section">
          <div className="box has-text-centered">
            <section className="section">
              <h3 className="title is-3">Email verified successfully</h3>
              <p>Please login again to continue.</p>
            </section>
          </div>
        </section>
      </div>
    </div>
  ) : (
    <div className="columns">
      <div className="column is-half is-offset-one-quarter">
        <section className="section">
          <div className="box">
            <section className="section">
              <h3 className="title is-3">
                Verifying email address. Please wait.
              </h3>

              <Notification
                notificationText="Server error. Please try again later."
                notificationState={showGenericError}
                handleClick={() => setShowGenericError(false)}
              />
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VerifyEmail;
