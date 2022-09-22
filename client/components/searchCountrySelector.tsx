import { Country} from 'country-state-city';
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

export default CountrySearchSelector