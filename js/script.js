/* Note: I've removed all API keys in this file since it will live on Github. */



/* Set up nav bar's functionality */

const brand = $("#brand");
const about = $("#about");
const about_text = $("#about-text");
const about_hide = $("#about-close");
const address_field = $("#address");

// Clicking on brand clears all content and address field
brand.on("click", function() {
    removeContent();
    address_field.val("");
});

// Clicking on "About" toggles project description
about.on("click", function() {
    about_text.toggleClass("hidden");
});
about_hide.on("click", function() {
    about_text.toggleClass("hidden");
});
  




/* Get user address, convert to coordinates, and call API endpoints using coordinates */

const button = $("#button");

button.on("click", function(e) {
    e.preventDefault();
    // Get user address
    let address = address_field.val();
    // Check text field is not blank
    if (address === "") {
        address_field.attr("placeholder", "YOU MUST TYPE IN A CITY, ADDRESS, OR ZIP CODE!")
    }
    else {
        // Remove any existing content
        removeContent();
        // Convert user address to coordinates
        let apiCoord = "https://maps.google.com/maps/api/geocode/json?address=" + address; 
        console.log(address);
        console.log(apiCoord);
        getCoord(apiCoord);
    };
});

function getCoord(url) {
    console.log('Making request');
    $("#loading").removeClass("hidden");
    fetch(url).then(function(response) {
    if (response.ok) {
        return response.json();
    } else {
        console.log(response.statusText);
    }
    }).then(function(data) {
        console.log(data);
        // Grab latitude & longitude 
        let lat = data.results[0].geometry.location.lat;
        let long = data.results[0].geometry.location.lng;
        console.log(lat, long);
        // Form API endpoints using latitude & longitutde 
        let api511 = "https://api.511.org/Traffic/Events?api_key=API_KEY&geography=POINT+(" + lat + "+" + long + ")&tolerance=24140&event_type=WEATHER_CONDITION,ROAD_CONDITION,SPECIAL_EVENT,INCIDENT";                  
        let apiMapQuest = "https://www.mapquestapi.com/traffic/v2/incidents?key=API_KEY&boundingBox=" + (lat+0.21) + "," + (long-0.27) + "," + (lat-0.21) + "," + (long+0.27) + "&filters=incidents,congestion,construction";       // NOTE: 15 miles = ~0.21 latitude and ~0.27 longitutde 
        let apiBart = "https://api.bart.gov/api/bsa.aspx?cmd=bsa&key=API_KEY&json=y";  
        let apiEventful = "https://accesscontrolalloworiginall.herokuapp.com/http://api.eventful.com/json/events/search?app_key=API_KEY&where=" + lat + "," + long + "&date=today&within=15&sort_order=popularity"; 
        let apiNYT = "https://newsapi.org/v1/articles?source=the-new-york-times&apiKey=API_KEY&sortBy=top";       
        // Trigger calls to APIs using endpoints
        if ($("#checkbox").is(":checked")) {
            makeRequest(apiEventful, processEventful);
            makeRequest(apiMapQuest, processMapQuest);
            makeRequest(api511, process511);
            makeRequest(apiBart, processBart);
            makeRequest(apiNYT, processNYT)
            startTimeless();
        }
        else {
            makeRequest(apiEventful, processEventful);
            makeRequest(apiMapQuest, processMapQuest);
            makeRequest(apiNYT, processNYT);
            startTimeless();
        };

    });
};




/* Call other APIs to get advisory event info */

function makeRequest(url, action) {
    console.log('Making request');
    fetch(url).then(function(response) {
    if (response.ok) {
        return response.json();
    } else {
        console.log(response.statusText);
    }
    }).then(function(data) {
        action(data);

    });
  };




/* Return JSON & manipulate DOM */

let processEventful = function(ajax) {
    console.log(ajax);
    // Attach returned info to DOM
    let heading = `
        <div class="page-header">
            <h3>Events nearby</h3>
            <p><i>"Gonna be late because of this darn event!"</i></p>
        </div>
        `;
    $("#headingEventful").append(heading);        
    let events = "";
    for (let i=0; i<4; i++) {
        events = `
        <div class="col-sm-6 col-md-3">
            <a href=${ajax.events.event[i].url} target="_blank"><img class="img-responsive thumbnail" src=${ajax.events.event[i].image.medium.url}></a>
            <div class="caption">
                <h4><a href=${ajax.events.event[i].url} target="_blank">${ajax.events.event[i].title}</a></h4>
                <h6>${ajax.events.event[i].venue_address}, ${ajax.events.event[i].city_name}</h6>
                <p><i>Venue: ${ajax.events.event[i].venue_name}.</i></p>
            </div>
        </div>
    `;
    $("#sectionEventful").append(events);
    };
};


  let processMapQuest = function(ajax) {
    console.log(ajax);
    // Attach returned info to DOM
    let heading = `
    <div class="page-header">
        <h3>Traffic nearby</h3>
        <p><i>"Gonna be late because of this darn traffic!"</i></p>
    </div>
    `;
    $("#headingMapQuest511").append(heading);
    let events = "";
    for (let i=0; i<4; i++) {
        events = `
        <div class="col-sm-6 col-md-3">
            <img class="img-responsive thumbnail" src=${ajax.incidents[i].iconURL}>
            <div class="caption">
                <h4>${ajax.incidents[i].shortDesc}</h4>
                <h6>On ${ajax.incidents[i].parameterizedDescription.roadName}</h6>
                <p><i>${ajax.incidents[i].fullDesc}</i></p>
            </div>
        </div>
    `;
    $("#sectionMapQuest").append(events);
    };
};


let process511 = function(ajax) {
    console.log(ajax);
    // Attach returned info to DOM
    let events = "";
    for (let i=0; i<4; i++) {
        events = `
        <div class="col-sm-6 col-md-3">
            <img class="img-responsive thumbnail" src="http://www.ridethevine.com/sites/default/files/511SFBay_color_web.jpg">
            <div class="caption">
                <h4>${ajax.events[i].event_type}</h4>
                <h6>On ${ajax.events[i].roads[0].name}</h6>
                <p><i>${ajax.events[i].headline}</i></p>
            </div>
        </div>
    `;
    $("#section511").append(events);
    };
};


let processBart = function(ajax) {
    console.log(ajax);
    // Attach returned info to DOM
    let heading = `
    <div class="page-header">
        <h3>BART Alerts</h3>
        <p><i>"Gonna be late because BART is the worst... again!"</i></p>
    </div>
    `;
    $("#headingBart").append(heading);    
    let events = "";
    for (let i=0; i<ajax.root.bsa.length; i++) {
        events = `
        <div class="col-sm-6 col-md-3">
            <img class="img-responsive thumbnail" src="https://pbs.twimg.com/profile_images/838894792092205056/Nh7D02D9.jpg">
            <div class="caption">
                <h4>BART Service Advisory</h4>
                <h6>${ajax.root.bsa[i].station}</h6>
                <p><i>${ajax.root.bsa[i].description["#cdata-section"]}</i></p>
            </div>
        </div>
    `;
    $("#sectionBart").append(events);
    };
};


let processNYT = function(ajax) {
    console.log(ajax);
    // Attach returned info to DOM
    let heading = `
    <div class="page-header">
        <h3>Trending news</h3>
        <p><i>"Gonna be late because I'm too riled up about the darn news."</i></p>
    </div>
    `;
    $("#headingNYT").append(heading);    
    let events = "";
    for (let i=0; i<4; i++) {
        events = `
        <div class="col-sm-6 col-md-3">
            <a href=${ajax.articles[i].url} target="_blank"><img class="img-responsive thumbnail" src=${ajax.articles[i].urlToImage}></a>
            <div class="caption">
                <a href=${ajax.articles[i].url} target="_blank"><h4>${ajax.articles[i].title}</h4></a>
                <h6>Published at ${ajax.articles[i].publishedAt}</h6>
                <p><i>${ajax.articles[i].description}</i></p>
            </div>
        </div>
    `;
    $("#sectionNYT").append(events);
    };
    // Hide "loading" status and unhide all content
    $("#loading").addClass("hidden");
    $("#content").removeClass("hidden");
};



/* Remove all content */

let removeContent = function() {
    $("#content").addClass("hidden");
    $("#timeless").addClass("hidden");
    $("#headingMapQuest511").children().remove();
    $("#sectionMapQuest").children().remove();
    $("#section511").children().remove();
    $("#headingEventful").children().remove();
    $("#sectionEventful").children().remove();
    $("#headingBart").children().remove();
    $("#sectionBart").children().remove();
    $("#headingNYT").children().remove();
    $("#sectionNYT").children().remove();
};




/* Timeless Excuses CRUD */

// Initialize Firebase
var config = {
    apiKey: "AIzaSyA4DFvDUs_VM_DKvg4ehVERHuJ8B6uDImM",
    authDomain: "gonna-be-late.firebaseapp.com",
    databaseURL: "https://gonna-be-late.firebaseio.com",
    projectId: "gonna-be-late",
    storageBucket: "",
    messagingSenderId: "547074354004"
  };
  firebase.initializeApp(config);

  let firebaseApp = firebase.database();


// Show existing excuses & show field for entering new excuses
  let startTimeless = function() {
    // Unhide section in DOM
    $("#timeless").removeClass("hidden");    
    createExcuse();
    getExcuses();
  };


// Enter new excuses
  let createExcuse = function() {
    // Create excuse when button is clicked
    $("#share_button").on("click", function(event) {
        event.preventDefault();
        let excuse = $("#excuse").val();
        $("#excuse").val("");
        let excuseRef = firebaseApp.ref("excuses");
        excuseRef.push({
            excuse: excuse,
            likes: 0
        });
    });
    // Create excuse when user presses enter in field
    $("#excuse").keypress(function (e) {
        if (e.which == 13) {
            event.preventDefault();
            let excuse = $("#excuse").val();
            $("#excuse").val("");
            let excuseRef = firebaseApp.ref("excuses");
            excuseRef.push({
                excuse: excuse,
                likes: 0
            });
        };
    });
};


// Load existing excuses and buttons
let getExcuses = function() {
    firebaseApp.ref("excuses").on("value", function(results) {
        // console.log(results);
        let excuseBoard = $("#timeless_content");
        excuseBoard.empty();
        let excuses = [];
        let allExcuses = results.val();
        console.log(allExcuses);
        for (let i in allExcuses) {

            let excuse = allExcuses[i].excuse;
            let likes = allExcuses[i].likes;
            let excuseListElement = $('<li>');
            
            let deleteElement = $('<a><i><span class="glyphicon glyphicon-trash"></span></i></a>');
            let likeElement = $('<a><i><span class="glyphicon glyphicon-heart"></span></i></a>');

            excuseListElement.attr("data-id", i);
            excuseListElement.html(excuse);
            excuseListElement.append("&nbsp;&nbsp;&nbsp;");
            excuseListElement.append(likeElement);
            excuseListElement.append('<i><span>' + "(" + likes + ")&nbsp;&nbsp;" + '</span></i>');            
            excuseListElement.append(deleteElement);
            

            excuses.push(excuseListElement);
            console.log(excuseListElement);

            // Add functionality to icon buttons
            deleteElement.on("click", function(element) {
                let id = $(this).parent().data("id");
                deleteExcuse(id);
            });

            likeElement.on("click", function(e) {
                let id = $(this).parent().data("id");
                updateExcuse(id, ++allExcuses[id].likes);
            });

        };

        excuseBoard.empty();
        for (let i in excuses) {
            excuseBoard.append(excuses[i]);
        };

    });
};


// Update number of likes for a given excuse
let updateExcuse = function(id, likes) {
    let excuseReference = firebaseApp.ref("excuses").child(id);
    excuseReference.update({
        likes: likes
    });    
};


// Delete an existing excuse
let deleteExcuse = function(id) {
    let excuseReference = firebaseApp.ref("excuses").child(id);
    excuseReference.remove();
};

