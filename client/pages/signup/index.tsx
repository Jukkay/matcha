import type { NextPage } from "next";

const Signup: NextPage = () => {
  return (
    <div className="space-y-5">
      <article className="prose mb-10">
        <h1>Sign up</h1>
      </article>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Username *</span>
          <span className="label-text-alt"></span>
        </label>
        <input
          type="text"
          placeholder="Username"
          className="input input-bordered w-full max-w-xs"
        />
        <label className="label">
          <span className="label-text-alt text-neutral">Username helper</span>
          <span className="label-text-alt text-error invisible">Error 1</span>
        </label>
      </div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Password *</span>
          <span className="label-text-alt"></span>
        </label>
        <input
          type="text"
          placeholder="Password"
          className="input input-bordered w-full max-w-xs"
        />
        <label className="label">
          <span className="label-text-alt text-neutral">Password helper</span>
          <span className="label-text-alt text-error invisible">Error 1</span>
        </label>
      </div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Confirm password *</span>
          <span className="label-text-alt"></span>
        </label>
        <input
          type="text"
          placeholder="Confirm password"
          className="input input-bordered w-full max-w-xs"
        />
        <label className="label">
          <span className="label-text-alt text-neutral">Confirm helper</span>
          <span className="label-text-alt text-error invisible">Error 1</span>
        </label>
      </div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Name</span>
          <span className="label-text-alt"></span>
        </label>
        <input
          type="text"
          placeholder="Name"
          className="input input-bordered w-full max-w-xs"
        />
        <label className="label">
          <span className="label-text-alt text-neutral">Name helper</span>
          <span className="label-text-alt text-error invisible">Error 1</span>
        </label>
      </div>
      <button className="btn btn-primary">Submit</button>
      <p>Fields marked with asterisk (*) are mandatory.</p>
    </div>
  );
};

export default Signup;
