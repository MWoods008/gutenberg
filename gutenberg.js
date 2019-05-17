// var obj = require('books.json');
const axios = require('axios');
const $ = require('cheerio');

const baseURL = 'https://www.gutenberg.org';
// requiring fs to make the JSON file
const fs = require('fs');
// empty array to push each object item to
const bookArray = [];

(async ()=> {
	const firstPage = await axios.get(`${baseURL}/browse/scores/top`);

	const top100List = $(`#books-last1`, firstPage.data).next().children().slice(0, 5);
	
	for(let i = 0; i < top100List.length; i++){
		// getting each book title
		const title = $(top100List[i]).text();
		// getting the links for each items second page
		const links = $(top100List[i]).children().first().attr('href');
		// creating access to info pages
		const info = await axios.get(`${baseURL}/${links}`);
		// getting the language from each book
		let language = $(`#bibrec div:nth-child(1) table tbody tr:nth-child(5) td`, info.data).text();
		// the first book's langueage is in a different position, all other books are in the same though so this is just a conditional statement to grab the right one
		if(i !== 0){
			language = $(`#bibrec div:nth-child(1) table tbody tr:nth-child(3) td`, info.data).text();
		} 
		// grabbing the author
		const author = $(`.bibrec th`, info.data).next().children().first().text();
		// array of possible places to find names of book links
		const bookFormat = [$(`#download div table tbody tr:nth-child(2) td.unpadded.icon_save`, info.data).text(), $(`#download div table tbody tr:nth-child(3) td.unpadded.icon_save`, info.data).text(), $(`#download div table tbody tr:nth-child(4) td.unpadded.icon_save`, info.data).text(), $(`#download div table tbody tr:nth-child(5) td.unpadded.icon_save`, info.data).text(), $(`#download div table tbody tr:nth-child(6) td.unpadded.icon_save`, info.data).text(), $(`#download div table tbody tr:nth-child(7) td.unpadded.icon_save`, info.data).text(), $(`#download div table tbody tr:nth-child(8) td.unpadded.icon_save`, info.data).text()];
		// array of possible places to find book links
		const bookLinks = [$(`#download div table tbody tr:nth-child(2) td.unpadded.icon_save a`, info.data).attr('href'), $(`#download div table tbody tr:nth-child(3) td.unpadded.icon_save a`, info.data).attr('href'), $(`#download div table tbody tr:nth-child(4) td.unpadded.icon_save a`, info.data).attr('href'), $(`#download div table tbody tr:nth-child(5) td.unpadded.icon_save a`, info.data).attr('href'), $(`#download div table tbody tr:nth-child(6) td.unpadded.icon_save a`, info.data).attr('href'), $(`#download div table tbody tr:nth-child(7) td.unpadded.icon_save a`, info.data).attr('href'), $(`#download div table tbody tr:nth-child(8) td.unpadded.icon_save a`, info.data).attr('href')];
		
		// empty object to put bookFormat and bookLinks in
		const bookFormats = {};
		for(var j = 0; j < bookFormat.length; j++) {
			if(bookFormat[j] != '') {
				// creating a key value pair for each result
				bookFormats[bookFormat[j]] = bookLinks[j];
			}
		}
		// pushing the item into our empty array in the form as an object
		bookArray.push({bookFormats, title, author, language});
		// console.log($(top100List[i]).children().first().attr('href'));
		// console.log(bookArray);
	}
	console.log(bookArray);
	// stringifying our book array to send to json file
	let data = JSON.stringify(bookArray); 
	 //creating a json file with our data 
	fs.writeFileSync('books.json', data); 
})();