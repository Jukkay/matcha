import React, { useState, PointerEvent } from 'react';
import { FaUpload } from 'react-icons/fa';

import { EditProps, ITag, ISearchResult, ISelector } from '../types/types';
import { Country, City } from 'country-state-city';

export const EditButton = ({ setEditMode }: EditProps) => {
	return (
		<button className="button is-primary" onClick={() => setEditMode(true)}>
			Edit profile
		</button>
	);
};

export const SaveButton = ({ setEditMode, profile }: EditProps) => {
	const handleClick = () => {
		// Save inputs to db
		sessionStorage.setItem('profile', JSON.stringify(profile));
		setEditMode(false);
	};
	return (
		<button className="button is-primary" onClick={() => handleClick()}>
			Save profile
		</button>
	);
};

export const Tag = ({
	text,
	key,
	interests,
	setInterests,
	setTagError,
}: ITag) => {
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
		setSelected(!selected);
	};

	return (
		<span
			className="tag is-success is-light is-medium is-rounded is-clickable"
			key={key}
			onClick={handleTagClick}
		>
			{text}
		</span>
	);
};

export const SelectedTag = ({
	text,
	key,
	interests,
	setInterests,
	setTagError,
}: ITag) => {
	const [selected, setSelected] = useState(true);

	const handleTagClick = (event: PointerEvent<HTMLSpanElement>) => {
		setTagError(false);
		const interest = event.currentTarget.innerText;
		setInterests(interests.filter((item) => item !== interest));
		setSelected(!selected);
	};

	return (
		<span
			className="tag is-primary is-medium is-rounded is-clickable"
			key={key}
			onClick={handleTagClick}
		>
			{text}
		</span>
	);
};

export const SearchResult = ({
	result,
	interests,
	setInterests,
	setTagError,
	query,
}: ISearchResult) => {
	return (
		<div className="tags" id="interests">
			{interests.map((interest, index) => (
				<SelectedTag
					text={interest}
					key={interest.concat(index.toString())}
					interests={interests}
					setInterests={setInterests}
					setTagError={setTagError}
				/>
			))}
			{result.map((interest, index) =>
				interests.includes(interest) ? null : (
					<Tag
						text={interest}
						key={interest.concat(index.toString())}
						interests={interests}
						setInterests={setInterests}
						setTagError={setTagError}
					/>
				)
			)}
		</div>
	);
};

export const FileInput = () => {
	return (
		<div className="block">
			<label htmlFor="upload" className="label my-3">
				Upload pictures *
			</label>
			<div className="file">
				<label className="file-label">
					<input className="file-input" type="file" name="upload" />
					<span className="file-cta">
						<span className="file-icon">
							<FaUpload />
						</span>
						<span className="file-label">Choose a file…</span>
					</span>
				</label>
			</div>
			<div className="block">Uploaded pictures</div>
		</div>
	);
};

export const CountrySelector = ({
	profile,
	setProfile,
}: ISelector) => {
	return (
		<div className="block">
			<label htmlFor="county" className="label my-3">
				Country *
			</label>
			<div className="select is-primary">
				<select
					id="country"
					value={profile.country}
					onChange={(event) =>
						setProfile({
							...profile,
							country: event.target.value,
						})
					}
					required
				>
					<option value={''} disabled>
						Choose your country
					</option>
					{Country.getAllCountries().map((country) => (
						<option value={country.isoCode}>{country.name}</option>
					))}
				</select>
			</div>
		</div>
	);
};

export const CitySelector = ({
	profile,
	setProfile,
}: ISelector) => {
	return profile.country ? (
		<div className="block">
			<label htmlFor="county" className="label my-3">
				City *
			</label>
			<div className="select is-primary">
				<select
					id="city"
					value={profile.city}
					onChange={(event) =>
						setProfile({
							...profile,
							city: event.target.value,
						})
					}
					required
				>
					<option value={''} disabled>
						Choose your city
					</option>
					{City.getCitiesOfCountry(profile.country)?.map((city) => (
						<option value={city.name}>{city.name}</option>
					))}
				</select>
			</div>
		</div>
	) : (
		<div className="block">
			<label htmlFor="county" className="label my-3">
				City *
			</label>
			<div className="select is-primary disabled">
				<select
					id="city"
					value={profile.city}
					onChange={(event) =>
						setProfile({
							...profile,
							city: event.target.value,
						})
					}
					required
				>
					<option value={''} disabled>
						Choose your city
					</option>
				</select>
			</div>
		</div>
	);
};
