function queryFetch(query, variables) {
	return fetch("https://countries.trevorblades.com/", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			query: query,
			variables: variables,
		}),
	});
}

function getCountriesByContinent(continentCode) {
	const countries = queryFetch(
		`query getCountries($code: ID!){
            continent(code: $code){
              countries{name}
            }
          }`,
		{ code: continentCode }
	)
		.then((res) => res.json())
		.then((data) => data.data.continent.countries);

	return countries;
}

const continentSelect = document.getElementById("continent-select");
const countriesList = document.getElementById("countries-list");

queryFetch(`
query{
    continents{
      name
      code
    }
  }
`)
	.then((res) => res.json())
	.then((data) => {
		data.data.continents.forEach((continent) => {
			const option = document.createElement("option");
			option.value = continent.code;
			option.innerText = continent.name;
			continentSelect.append(option);
		});
	});

continentSelect.addEventListener("change", async (e) => {
	const continentCode = e.target.value;
	countriesList.innerHTML = "";
	const countries = await getCountriesByContinent(continentCode);
	countries.forEach((country) => {
		const paragraph = document.createElement("p");
		paragraph.innerText = country.name;
		countriesList.append(paragraph);
	});
});
