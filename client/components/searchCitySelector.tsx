import { City } from 'country-state-city';
import { SearchParamsProps } from '../types/types';

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

export default CitySearchSelector;
