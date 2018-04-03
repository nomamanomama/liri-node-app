require("dotenv").config();

var keys = require("./keys.js");
var fs = require('fs');
var request = require('request');

//create Spotify handle
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);


//create twitter handle
var Twitter = require('twitter');
var client = new Twitter(keys.twitter); 




//////////////////////////////////////////////////////
//
//  processInput the input and route to appropriate function
//
//get the command line arguments
var args = process.argv;
var command = args[2];
//format multiple command line words into  single input name
var input = "";
for (var i=3; i<args.length; i++){
    input += args[i] + " ";
}

function processInput() {
    switch (command) {
        case 'my-tweets':
            tweet();
        break;
        case 'spotify-this-song':
            songInfo(input);
        break;
        case 'movie-this':
            movie(input);
        break;
        case 'do-what-it-says':
            randomInfo();
        break;
        default:
            console.log("Please enter a valid command. The choices are: \n my-tweets\n spotify-this-song\n movie-this\n do-what-it-says");
        break;
    }
}


//////////////////////////////////////////////////////
//
//  TWITTER - "my-tweets"
//
function tweet(){
    console.log("show last 20 tweets");
    var params = { screen_name: 'AP' , count: 20};
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            var output = "\nMY TWEETS \n";
            tweets.forEach(element => 
                {
                    output += element.text + '\n' + element.created_at + '\n\n';
                }
            );
            console.log(output);
            logThis(output);
        }
        else 
            return error;
    });
}

//////////////////////////////////////////////////////
//
//  SPOTIFY - "spotify-this-song"
//
function songInfo(songName) {
    //console.log("show song info");

    if (songName === ""){
        songName = "The Sign";
    }
    spotify.search({ type: 'track', query: songName, limit: 5 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        var output = "\n SPOTIFY THIS SONG " + songName + "\n";
        data.tracks.items.forEach(element => {
            //console.log(element);
            // * Artist(s)
            var artistNames = "";
            
            for (var i = 0; i< element.artists.length; i++)
            {
                if (i !== 0) artistNames += ", ";
                artistNames += element.artists[i].name;
            }
            
            output += "Artist(s): " + artistNames + '\n';
            // * The song's name
            output += "Song Title: " + element.name + '\n';
            // * A preview link of the song from Spotify
            output += "Preview Link: " + element.preview_url + '\n';
            // * The album that the song is from
            output += "Album: " + element.album.name + '\n\n';

        });

        console.log(output);
        logThis(output);
    });
}



//////////////////////////////////////////////////////
//
//  OMDB - "movie-this"
//
function movie(movieName) {
    
    if (movieName === "") {
        movieName = "Mr Nobody";
        return;
    }

    // run a request to the OMDB API with the movie specified
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

    // This line is just to help us debug against the actual URL.
    //console.log(queryUrl);

    // Then create a request to the queryUrl
    request(queryUrl, function (error, response, body) {

        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
            var movie = JSON.parse(body);
            //noconsole.log(movie);
            //build output string
            var output = "\n MOVIE THIS " + movieName + "\n";
            //    * Title of the movie.
            output += "Name: " + movie.Title + '\n';
            //    * Year the movie came out.
            output += "Year: " + movie.Year + '\n';
            //    * IMDB Rating of the movie.
            output += "Rating: " + movie.Rated + '\n';
            //    * Rotten Tomatoes Rating of the movie.
            output += "Rotten Tomatoes: " + movie.Ratings[1].Value + '\n';
            //    * Country where the movie was produced.
            output += "Country: " + movie.Country + '\n';
            //    * Language of the movie.
            output += "Language: " + movie.Language + '\n';
            //    * Plot of the movie.
            output += "Plot: " + movie.Plot + '\n';
            //    * Actors in the movie.
            output += "Actors: " + movie.Actors + '\n';

            console.log(output);
            logThis(output);
        }
        else {
            console.log(response);
        }
    });
}

//////////////////////////////////////////////////////
//
//  randomInfo - "do-what-it-says"
//
function randomInfo() {
    fs.readFile("./random.txt", "utf8", function (error, data) {
        console.log ("Processing do what it says...");
        logThis ("\n DO WHAT IT SAYS \n");
        if (error) return error;

        //console.log(data);
        var dataArr = data.split(",");
        command = dataArr[0];
        input = dataArr[1];
        processInput();
    });
}

function logThis(logComment) {
    fs.appendFile("log.txt", logComment, function (err) {
        // If an error was experienced we say it.
        if (err) {
            console.log(err);
        }
    });
}

// call the function to process the input
processInput();