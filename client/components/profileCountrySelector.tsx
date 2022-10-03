import { Country } from 'country-state-city';
import { ISelectorProfile } from '../types/types';

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

export default CountrySelector;
