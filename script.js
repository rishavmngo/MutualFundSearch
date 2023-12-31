const dropdown = document.getElementById("dropdown")
const dropdownMenu = document.getElementById("dropdown_menu")
const fundBox = document.getElementById("fund_search_box")
const nav = document.getElementById("nav")
const showDropdown = false

//Store the initalFunds to ignore unnecessary network calls
let InitialFunds = []

//To denote that Input is Blank so instead of showing "no result" in dropdown show the initial value
let BLANKFLAG = false


async function fetchFunds() {

	let result
	try {
		result = await fetch("https://api.mfapi.in/mf")
		const resp = await result.json()
		return resp
	} catch (error) {
		console.log(error)
	}
}

async function InitialPopulate() {

	if (InitialFunds.length < 1) {
		InitialFunds = await fetchFunds()
	}
	updateDropdown(InitialFunds, "InitialPopulate");
}

async function fetchFundsSchema(id) {

	let result
	try {
		result = await fetch(`https://api.mfapi.in/mf/${id}/latest`)
		const resp = await result.json()
		return resp
	} catch (error) {
		console.log(error)
	}
}

//debounce calls the function after 1000(or speceified time) rather than for every change in the input
const fetchFundsByKeyword = _.debounce(async (key) => {

	let result
	try {
		result = await fetch(`https://api.mfapi.in/mf/search?q=${key}`)
		const resp = await result.json()
		if (!BLANKFLAG)
			updateDropdown(resp)
		else updateDropdown(InitialFunds)
		return resp
	} catch (error) {
		console.log(error)
	}
}, 1000)


//updating the dropdown
//
function updateDropdown(data) {

	let options = ""

	//If the key is not found
	if (data.length < 1) {
		options += `<div class="dropdown_menu_item_no_result">No results found</div>`
	}
	else {

		//Shows only 1000 datas at max
		data.slice(1, 1000).forEach((a) => {
			options += `<div class="dropdown_menu_item" id="${a.schemeCode}">${a.schemeName}</div>`
		})
	}
	dropdownMenu.innerHTML = options
}

//On show the dropdown when the user clicks on the input
fundBox.addEventListener("focus", () => {
	dropdownMenu.style.display = "block"
})

fundBox.addEventListener("input", (e) => {
	const keyword = e.target.value

	if (keyword.length < 1) {
		BLANKFLAG = true
	}
	else {
		BLANKFLAG = false
		fetchFundsByKeyword(keyword)
	}
})

document.addEventListener("click", (event) => {
	if (dropdown.contains(event.target)) return
	dropdownMenu.style.display = "none"
})

//capture the result here
dropdownMenu.addEventListener("click", async (event) => {
	if (!event.target.classList.contains("dropdown_menu_item")) return
	const result = await fetchFundsSchema(event.target.id)
	fundBox.value = result.meta.scheme_name
	nav.value = result.data[0].nav
	console.log(result)

})

window.addEventListener('load', () => {
	InitialPopulate()
})



