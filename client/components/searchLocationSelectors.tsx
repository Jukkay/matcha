import { Country, City } from 'country-state-city';
import { ISelectorProfile, SearchParamsProps } from '../types/types';

export const CountrySearchSelector = ({
	searchParams,
	setSearchParams,
}: SearchParamsProps) => {
	return (
		<div className="block">
			<label htmlFor="country" className="label">
				Country
			</label>
			<div className="select is-primary">
				<select
					id="country"
					name="country"
					value={searchParams.country}
					onChange={(event) =>
						setSearchParams({
							...searchParams,
							country: event.target.value,
						})
					}
				>
					<option value={''}>Choose a country</option>
					{Country.getAllCountries().map((country, index) => (
						<option
							key={`${country.name}${index}`}
							value={country.isoCode}
						>
							{country.name}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

const CitySearchSelector = ({
	searchParams,
	setSearchParams,
}: SearchParamsProps) => {
	return searchParams.country ? (
		<div className="block">
			<label htmlFor="city" className="label">
				City
			</label>
			<div className="select is-primary">
				<select
					id="city"
					name="city"
					value={searchParams.city}
					onChange={(event) =>
						setSearchParams({
							...searchParams,
							city: event.target.value,
						})
					}
				>
					<option value={''}>Choose a city</option>
					{City.getCitiesOfCountry(searchParams.country)?.map(
						(city, index) => (
							<option
								key={`${city.name}${index}`}
								value={city.name}
							>
								{city.name}
							</option>
						)
					)}
				</select>
			</div>
		</div>
	) : (
		<div className="block">
			<label htmlFor="county" className="label">
				City
			</label>
			<div className="select is-primary disabled">
				<select
					id="city"
					value={searchParams?.city}
					onChange={(event) =>
						setSearchParams({
							...searchParams,
							city: event.target.value,
						})
					}
				>
					<option value={''} disabled>
						Choose a country first
					</option>
				</select>
			</div>
		</div>
	);
};


export const CountrySelector = ({
	profile,
	setProfile,
	isRequired,
}: ISelectorProfile) => {
	return (
		<div className="block">
			<label htmlFor="country" className="label my-3">
				{isRequired ? 'Country *' : 'Country'}
			</label>
			<div className="select is-primary">
				<select
					id="country"
					name="country"
					value={profile.country}
					onChange={(event) =>
						setProfile({
							...profile,
							country: event.target.value,
						})
					}
					required={isRequired}
				>
					<option value={''} disabled>
						Choose your country
					</option>
					{Country.getAllCountries().map((country, index) => (
						<option
							key={`${country.name}${index}`}
							value={country.isoCode}
						>
							{country.name}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export const CitySelector = ({
	profile,
	setProfile,
	isRequired,
}: ISelectorProfile) => {
	return profile.country ? (
		<div className="block">
			<label htmlFor="city" className="label my-3">
				{isRequired ? 'City *' : 'City'}
			</label>
			<div className="select is-primary">
				<select
					id="city"
					name="city"
					value={profile.city}
					onChange={(event) =>
						setProfile({
							...profile,
							city: event.target.value,
						})
					}
					required={isRequired}
				>
					<option value={''} disabled>
						Choose your city
					</option>
					{City.getCitiesOfCountry(profile.country)?.map(
						(city, index) => (
							<option
								key={`${city.name}${index}`}
								value={city.name}
							>
								{city.name}
							</option>
						)
					)}
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
					value={profile?.city}
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

export default CitySearchSelector