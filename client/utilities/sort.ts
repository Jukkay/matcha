import { IProfile, IResultsProfile } from "../types/types";
import { convertBirthdayToAge, distanceBetweenPoints } from "./helpers";

export const nearFirst = (results: IResultsProfile[], latitude: string, longitude: string) => {
    const sortedByDistance = [...results].sort((a, b) => a.distance - b.distance);
    return sortedByDistance
};

export const farFirst = (results: IResultsProfile[], latitude: string, longitude: string) => {
    const sortedByDistance = [...results].sort((a, b) => b.distance - a.distance);
    return sortedByDistance
};

export const youngFirst = (results: IResultsProfile[]) => {
    const sortedByAge = [...results].sort((a, b) => convertBirthdayToAge(a.birthday) - convertBirthdayToAge(b.birthday));
    return sortedByAge
};

export const oldFirst = (results: IResultsProfile[]) => {
    const sortedByAge = [...results].sort((a, b) => convertBirthdayToAge(b.birthday) - convertBirthdayToAge(a.birthday));
    return sortedByAge
};
export const moreCommonTagsFirst = (results: IResultsProfile[]) => {
    const sortedByTags = [...results].sort((a, b) =>  b.common_tags - a.common_tags);
    return sortedByTags
};
export const lessCommonTagsFirst = (results: IResultsProfile[]) => {
    const sortedByTags = [...results].sort((a, b) =>  a.common_tags - b.common_tags);
    return sortedByTags
};
export const highFameratingFirst = (results: IResultsProfile[]) => {
    const sortedByFamerating = [...results].sort((a, b) =>  b.famerating - a.famerating);
    return sortedByFamerating
}

export const lowFameratingFirst = (results: IResultsProfile[]) => {
    const sortedByFamerating = [...results].sort((a, b) =>  a.famerating - b.famerating);
    return sortedByFamerating
}