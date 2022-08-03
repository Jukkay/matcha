import type { NextPage } from "next";
import React, {
  useState,
  PointerEvent,
  useEffect,
  SetStateAction,
  SyntheticEvent,
} from "react";
import { FaUser, FaLock } from "react-icons/fa";
import {
  ErrorMessage,
  FormInput,
  SubmitButton,
  Notification,
} from "../../components/form";
import { useUserContext } from "../../components/UserContext";
import { EditProps, IProfile, IFormInputField, ITag, ISearchResult } from "../../types/types";
import { API } from "../../utilities/api";
import Link from "next/link";
import { dummyData } from "./tagdata";

const NotLoggedIn = () => {
  return (
    <div>
      <section className="section">
        <p>Please log in first.</p>
      </section>
    </div>
  );
};

const LoggedIn = () => {
  const { userData, accessToken } = useUserContext();
  const [editMode, setEditMode] = useState(false);
  return editMode ? (
    <EditMode setEditMode={setEditMode} />
  ) : (
    <ViewMode setEditMode={setEditMode} />
  );
};

const EditMode = ({ setEditMode }: EditProps) => {
  const { userData, accessToken } = useUserContext();
  const [profile, setProfile] = useState<IProfile>({
    gender: "",
    looking: "",
    introduction: "",
  });
  const [tagError, setTagError] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string[]>([]);

  // Update object values
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  useEffect(() => {
    if (!query) return;
    const results = dummyData.filter((interest) => interest.toLowerCase().includes(query.toLowerCase()));
    setResult(results as string[]);
  }, [query]);

  return (
    <div>
      <section className="section">
        {/* Gender */}
        <div className="block">
          <label htmlFor="gender" className="label my-3">
            Gender *
          </label>
          <div className="select is-primary">
            <select
              id="gender"
              value={profile.gender}
              onChange={(event) =>
                setProfile({ ...profile, gender: event.target.value })
              }
              required
            >
              <option value={""} disabled>
                Choose your gender
              </option>
              <option value={"Male"}>Male</option>
              <option value={"Female"}>Female</option>
              <option value={"Non-binary"}>Non-binary</option>
              <option value={"Trans-man"}>Trans-man</option>
              <option value={"Trans-woman"}>Trans-woman</option>
              <option value={"Other"}>Other</option>
            </select>
          </div>
        </div>
        {/* Looking For */}
        <div className="block">
          <label htmlFor="looking" className="label my-3">
            Looking for *
          </label>
          <div className="select is-primary">
            <select
              id="looking"
              value={profile.looking}
              onChange={(event) =>
                setProfile({ ...profile, looking: event.target.value })
              }
              required
            >
              <option value={""} disabled>
                Choose a gender
              </option>
              <option>Male</option>
              <option>Female</option>
              <option>Non-binary</option>
              <option>Trans-man</option>
              <option>Trans-woman</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        {/* Introduction */}
        <div className="block">
          <label htmlFor="introduction" className="label my-3">
            Introduction *
          </label>
          <textarea
            id="introduction"
            className="textarea is-primary"
            rows={10}
            placeholder="Tell us about yourself"
            value={profile.introduction}
            onChange={(event) =>
              setProfile({ ...profile, introduction: event.target.value })
            }
          ></textarea>
        </div>
        {/* Interests */}
        <div className="block">
          <label htmlFor="interests" className="label my-3">
            Interests (choose at least one) *
          </label>
          <input
            className="input my-3"
            type="text"
            id="interests"
            placeholder="Search for interests"
            onChange={onChange}
          ></input>
          <ErrorMessage
            errorMessage="Maximum 5 interests. Please unselect something to select something new."
            error={tagError}
          />
          <SearchResult
            result={result}
            setResult={setResult}
            setTagError={setTagError}
			interests={interests}
			setInterests={setInterests}
            query={query}
          />
        </div>
        {/* Pictures */}
        <div className="block">Pictures</div>
        <SaveButton setEditMode={setEditMode} profile={profile} />
      </section>
    </div>
  );
};
const ViewMode = ({ setEditMode }: EditProps) => {
  const { userData, accessToken } = useUserContext();
  return (
    <div>
      <section className="section">
        <div className="block">{userData.username}</div>
        <div className="block">{userData.email}</div>
        <div className="block">{userData.name}</div>
        <div className="block">{userData.user_id}</div>

        <EditButton setEditMode={setEditMode} />
      </section>
    </div>
  );
};

const EditButton = ({ setEditMode }: EditProps) => {
  return (
    <button className="button is-primary" onClick={() => setEditMode(true)}>
      Edit profile
    </button>
  );
};

const SaveButton = ({ setEditMode, profile }: EditProps) => {
  const handleClick = () => {
    // Save inputs to db
    sessionStorage.setItem("profile", JSON.stringify(profile));
    setEditMode(false);
  };
  return (
    <button className="button is-primary" onClick={() => handleClick()}>
      Save profile
    </button>
  );
};

const Tag = ({ text, key, interests, setInterests, setTagError }: ITag) => {
  const [selected, setSelected] = useState(false);
  const handleTagClick = (event: PointerEvent<HTMLSpanElement>) => {
    setTagError(false);
    const interest = event.currentTarget.innerText;

    // check if in array and remove if so
    if (interests.includes(interest)) {
      setInterests(interests.filter((item) => item !== interest));
      setSelected(false);
      return;
    }
    // if array size is 5 show error message and return
    if (interests.length >= 5) {
      setTagError(true);
      return;
    }
    // push to array
    setInterests([...interests, interest]);
    setSelected(true);
  };
  return selected ? (
    <span
      className="tag is-primary is-medium is-rounded is-clickable"
      key={key}
      onClick={handleTagClick}
    >
      {text}
    </span>
  ) : (
    <span
      className="tag is-success is-light is-medium is-rounded is-clickable"
      key={key}
      onClick={handleTagClick}
    >
      {text}
    </span>
  );
};

const SearchResult = ({ result, interests, setInterests, setTagError, query }: ISearchResult) => {
  return (
    <div className="tags" id="interests">
      {
	  result.map((interest, index) =>
          <Tag
            text={interest}
            key={interest.concat(index.toString())}
            interests={interests}
            setInterests={setInterests}
            setTagError={setTagError}
          />
      )}
    </div>
  );
};
const Profile: NextPage = () => {
  const { accessToken } = useUserContext();
  return (
    <div className="columns is-centered">
      <div className="column is-half">
        {accessToken ? <LoggedIn /> : <NotLoggedIn />}
      </div>
    </div>
  );
};

export default Profile;
