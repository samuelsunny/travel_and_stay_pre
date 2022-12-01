var express = require("express");
var session = require('express-session');
var app = express();
var port = 3000;
var bodyParser = require('body-parser');

// set the view engine to ejs
app.set('view engine', 'ejs');
// Setting wherre the views would accessed from.
app.set('views',__dirname+'/views');
app.set('images',__dirname+'/images');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(session({ secret: "keyboard cat", cookie: { maxAge: 60000 }, rolling: true, resave: true, saveUninitialized: false }
    // ));

app.use(session({secret:"tdfyjgj",resave:false,saveUninitialized:true}));
app.use(express.static('images'));
app.use(express.static('views'));



var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/travel_and_stay");
// Schemas for documents to be stored in MongoDB

// schema for user accounts
var userSchema = new mongoose.Schema({
    account_type:String,
    username: String,
    password: String,
    name    : String,
    address: String,
    city    : String,
    country : String,
    contact_number: String,
    name_on_card : String,
    card_number : String,
    expiry_date: String,
    cvv    : String,
    billing_address: String,    
    mileage        : Number
});

// Schema for flights
var flightSchema = new mongoose.Schema({
    flightnumber: String,
    flightname: String,
    departure_airport: String,
    arrival_airport: String,
    departure_city    : String,
    arrival_city: String,
    departure_date    : String,
    arrival_date: String,
    departure_time    : String,
    arrival_time: String,
    business_seats: String,
    economy_seats : String,
    business_seat_price: String,
    economy_seat_price : String,
    miles              : String

});

// Schema for rooms( for both suites and rooms)
var roomSchema = new mongoose.Schema({
    hotelId: String,
    hotel_name:String,
    hotel_address:String,
    name   : String,
    price  : String,
    amenities:String,
    city: String,
    country: String,
    booking_start_date: String,
    booking_end_date  : String,
    type:String,
    available: String
});

// Schema for shopping cart
var cart_schema = new mongoose.Schema({
    userId      : String,
    item_id     : String,
    details     : String
});

// Schema for bookings
var bookings_schema = new mongoose.Schema({
    userId      : String,
    item_id     : String,
    details     : String
});

// Schema for room reservations
var roomReservationsSchema = new mongoose.Schema({
    hotelId: String,
    roomId : String,
    hotel_name:String,
    hotel_address:String,
    name   : String,
    price  : String,
    amenities:String,
    city: String,
    country: String,
    booking_start_date: [String],
    booking_end_date  : [String],
    type:String,
    available: String
});

// Schema for feedback
var feedbackSchema = new mongoose.Schema({
    userId: String,
    rating:String,
    user_email : String,
    feedback:String
});


var User = mongoose.model("Users", userSchema);
var Flight = mongoose.model("Flights", flightSchema);
var Room = mongoose.model("Rooms",roomSchema);
var Cart = mongoose.model("user_cart",cart_schema);
var Booking = mongoose.model("Bookings",bookings_schema);
var roomReservation = mongoose.model("RoomReservations",roomReservationsSchema);
var Feedback = mongoose.model("feedback",feedbackSchema);




app.post("/login", (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    console.log(username,password);
    User.findOne({username: username, password:password},function(err,user){
        if(err)
        {
            console.log("Error part:",err);
            res.status(500).send();
        }
        // console.log("After err:",user,user._doc);
        // console.log(user._doc.username == username);
        if( user && user._doc.username == username)
        {
            if( user._doc.username == "admin")
            {
                req.session.user = user;
                res.render('adminhomepage',{user: req.session.user});
            }
            else if(user._doc.account_type == "hotel")
            {
                req.session.user = user;
                res.render('hotelmanagement',{user: req.session.user});
            }
            else
            {
                req.session.user = user;
                res.render('homepage',{user: req.session.user});
            }
        }
        else{
            console.log("After ejs");
            res.sendFile(__dirname + "/login.html");
        }
        });   
    });

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.sendFile(__dirname + "/login.html");
});

app.get("/login", (req, res) => {
    console.log("get login 1",req.session.user);
    if(!req.session.user)
    {
        res.sendFile(__dirname + "/login.html");
    }
    else  if(req.session.user.username == "admin"){
        res.render('adminhomepage',{user: req.session.user});
        // res.sendFile(__dirname + "/adminhomepage.html");
    }
    else if (req.session.user.account_type == "hotel"){
        res.render('hotelmanagement',{user: req.session.user});
    }
    else{
        res.render('homepage',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
});
app.get("/", (req, res) => {
    console.log("User:", req.session,req.session.user);
    if(!req.session.user)
    {
        res.sendFile(__dirname + "/login.html");
    }
    // console.log("Session:",req.session.user,req.session);
    else if(req.session.user.username == "admin"){
        res.render('adminhomepage',{user: req.session.user});
        // res.sendFile(__dirname + "/adminhomepage.html");
    }
    else if (req.session.user.account_type == "hotel"){
        res.render('hotelmanagement',{user: req.session.user});
    }
    else{
        User.findOne({username: req.session.user.username},function(err,user){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();
            }
            console.log("After err:",user,user._doc);
            // console.log(user._doc.username == username);
            req.session.user = user;
            res.render('homepage',{user:user});
        });
            
    }
});

app.get("/homepage", (req, res) => {
    if(req.session.user)
    {
        if(req.session.user.username == "admin"){
            res.render('adminhomepage',{user: req.session.user});
            // res.sendFile(__dirname + "/adminhomepage.html");
        }
        else if (req.session.user.account_type == "hotel"){
            res.render('hotelmanagement',{user: req.session.user});
        }
        else{
            res.render('homepage',{user: req.session.user});
        }
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }

});

app.get("/createuser", (req, res) => {
    res.sendFile(__dirname + "/createaccount.html");
});

app.get("/createhoteluser", (req, res) => { 
    res.sendFile(__dirname + "/createhotelaccount.html");
});

app.get("/addflight", (req, res) => {
    if(req.session.user)
    {
        res.sendFile(__dirname + "/addflights.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.get("/addsuit", (req, res) => {
    if(req.session.user)
    {
        res.sendFile(__dirname + "/addsuit.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/addsuit", (req, res) => {
    if(req.session.user)
    {
        var suit_name = req.body.suit_name;
        var suit_price = req.body.suit_price;
        var amenities = req.body.amenities;
        var hotel_id = req.session.user._id;
        var city = req.session.user.city;
        var country = req.session.user.country;
        var hotel_address = req.session.user.address;
        var hotel_name = req.session.user.name;
        var suit_details ={
            hotelId             : hotel_id,
            hotel_name          : hotel_name,
            hotel_address       : hotel_address,
            name                : suit_name,
            price               : suit_price,
            amenities           : amenities,
            city                : city,
            country             : country,
            booking_start_date  : "",
            booking_end_date    : "",
            type                :"suite",
            available           : "yes"
        }
        var myData = new Room(suit_details);
        myData.save()
            .then(item => {
                var roomId = 0;
                Room.find({hotelId:req.session.user._id},function(err,room){
                    if(err)
                    {
                        console.log("Error part:",err);
                        res.status(500).send();
            
                    }
                    else{
                        console.log("Roomer:",room[0]._doc._id)
                        roomId = room[0]._doc._id;
                    }
                    var suit_reservation_details ={
                        hotelId             : hotel_id,
                        roomId              : roomId,
                        hotel_name          : hotel_name,
                        hotel_address       : hotel_address,
                        name                : suit_name,
                        price               : suit_price,
                        amenities           : amenities,
                        city                : city,
                        country             : country,
                        booking_start_date  : [],
                        booking_end_date    : [],
                        type                :"suite",
                        available           : "yes"
                    }
                var Reservation = new roomReservation(suit_reservation_details);
                Reservation.save()
                    .then(item => {
                res.sendFile(__dirname + "/success_hotel.html");
                    })
                    .catch(err => {
                        res.status(400).send("Unable to save to database");
                    });
            }).sort({_id:-1}).limit(1)
            .catch(err => {
                res.status(400).send("Unable to save to room reservation");
            })
        });
        }
        else{
            res.sendFile(__dirname + "/login.html");
        }
    });

app.get("/addroom", (req, res) => {
        if(req.session.user)
        {
            res.sendFile(__dirname + "/addroom.html");
        }
        else{
            res.sendFile(__dirname + "/login.html");
        }
    });

app.post("/addroom", (req, res) => {
    if(req.session.user)
    {
        var room_name = req.body.room_name;
        var room_price = req.body.room_price;
        var amenities = req.body.amenities;
        var hotel_id = req.session.user._id;
        var city = req.session.user.city;
        var country = req.session.user.country;
        var hotel_address = req.session.user.address;
        var hotel_name = req.session.user.name;
        var room_details ={
            hotelId             : hotel_id,
            hotel_name          : hotel_name,
            hotel_address       : hotel_address,
            name                : room_name,
            price               : room_price,
            amenities           : amenities,
            city                : city,
            country             : country,
            booking_start_date  : "",
            booking_end_date    : "",
            type                :"room",
            available           : "yes"
        }
        var myData = new Room(room_details);
        myData.save()
            .then(item => {
                var roomId = 0;
                Room.find({hotelId:req.session.user._id},function(err,room){
                    if(err)
                    {
                        console.log("Error part:",err);
                        res.status(500).send();
            
                    }
                    else{
                        console.log("Roomer:",room[0]._doc._id)
                        roomId = room[0]._doc._id;
                    }
                    var room_reservation_details ={
                        hotelId             : hotel_id,
                        roomId              : roomId,
                        hotel_name          : hotel_name,
                        hotel_address       : hotel_address,
                        name                : room_name,
                        price               : room_price,
                        amenities           : amenities,
                        city                : city,
                        country             : country,
                        booking_start_date  : [],
                        booking_end_date    : [],
                        type                :"room",
                        available           : "yes"
                    }
                var Reservation = new roomReservation(room_reservation_details);
                Reservation.save()
                    .then(item => {
                res.sendFile(__dirname + "/success_hotel.html");
            })
            .catch(err => {
                res.status(400).send("Unable to save to database");
            });
            }).sort({_id:-1}).limit(1)
            })
            .catch(err => {
                res.status(400).send("Unable to save to database");
            });

        // res.sendFile(__dirname + "/addsuit.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/adduser", (req, res) => {
    
        var account_type = "individual"
        var username = req.body.username;
        var password = req.body.password;
        var name = req.body.name;
        var address = req.body.address;
        var city = req.body.city; 
        var country = req.body.country; 
        var contact_number = req.body.contact_number;
        var name_on_card = req.body.name_on_card;
        var card_number = req.body.card_number;
        var expiry_date = req.body.expiry_date;
        var cvv = req.body.cvv;
        var billing_address = req.body.billing_address;

        var account_details = {
            account_type: account_type,
            username    : username,
            password    : password,
            name        : name,
            address     : address,
            city        : city,
            country     : country,
            contact_number : contact_number,
            name_on_card : name_on_card,
            card_number : card_number,
            expiry_date : expiry_date,
            cvv         : cvv,
            billing_address: billing_address,
            mileage : 0
        }
        User.find({username: username},function(err,user){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();    
            }
            else{
                if(user.length > 0)
                {
                    res.sendFile(__dirname + "/createaccount.html");

                }
                else
                {
                    var myData = new User(account_details);
                    myData.save()
                    .then(item => {
                        res.sendFile(__dirname + "/success.html");
                    })
                    .catch(err => {
                        res.status(400).send("Unable to save to database");
                    });  
                }
            }  
        }); 
});

app.post("/addhoteluser", (req, res) => {
    
    var account_type = "hotel"
    var username = req.body.username;
    var password = req.body.password;
    var name = req.body.name;
    var address = req.body.address;
    var city = req.body.city; 
    var country = req.body.country; 
    var contact_number = req.body.contact_number;
    var name_on_card = req.body.name_on_card;
    var card_number = req.body.card_number;
    var expiry_date = req.body.expiry_date;
    var cvv = req.body.cvv;
    var billing_address = req.body.billing_address;

    var account_details = {
        account_type: account_type,
        username    : username,
        password    : password,
        name        : name,
        address     : address,
        city        : city,
        country     : country,
        contact_number : contact_number,
        name_on_card : name_on_card,
        card_number : card_number,
        expiry_date : expiry_date,
        cvv         : cvv,
        billing_address: billing_address
    }


    var myData = new User(account_details);
    myData.save()
        .then(item => {
            res.sendFile(__dirname + "/success.html");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });  

});

app.post("/addflight", (req, res) => {

    if(req.session.user && req.session.user.username=="admin")
    {
        flight_details ={
            flightnumber : req.body.flightnumber,
            flightname : req.body.flightname,
            departure_airport : req.body.departure_airport,
            arrival_airport : req.body.arrival_airport,
            departure_city : req.body.departure_city.toLowerCase(),
            arrival_city : req.body.arrival_city.toLowerCase(),
            departure_date : req.body.departure_date,
            arrival_date : req.body.arrival_date,
            departure_time : req.body.departure_time,
            arrival_time : req.body.arrival_time,
            business_seats : req.body.business_seats,
            economy_seats : req.body.economy_seats,
            business_seat_price : req.body.business_seat_price,
            economy_seat_price : req.body.economy_seat_price,
            miles              : String(req.body.miles)
            }
        console.log("flight details:", flight_details);
        var myData = new Flight(flight_details);
        myData.save()
            .then(item => {
                res.sendFile(__dirname + "/success_flight.html");
            })
            .catch(err => {
                res.status(400).send("Unable to save to database");
            });
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

// app.post("/addhotel", (req, res) => {
//     if(req.session.user)
//     {
//         var city = req.body.city;
//         var city_name = city.toLowerCase(); 
//         var country = req.body.country;
//         var country_name = country.toLowerCase(); 
//         var myData = new Hotel(req.body);
//          myData.save()
//         .then(item => {
//             var hotel_name = req.body.hotelname;
//             Hotel.findOne({hotelname: hotel_name},function(err,hotel){
//                 if(err)
//                 {
//                     console.log("Error part:",err);
//                     res.status(500).send();

//                 }
//                 else{
//                     hotel_id = hotel._id;
//                     var suits = parseInt(req.body.suits);
//                         var rooms = parseInt(req.body.rooms);
//                         room_info={
//                             hotelId:hotel._id,
//                             city:city_name,
//                             country:country_name,
//                             booking_start_date: "",
//                             booking_end_date  : "",
//                             type:"suite",
//                             available: "Yes"    

//                         };
//                         for (let i = 1; i <= suits; i++) {
//                             var create_suits = new Room(room_info);
//                             create_suits.save();
//                         }
//                         room_info={
//                             hotelId: hotel_id,
//                             city:city_name,
//                             country:country_name,
//                             booking_start_date: "",
//                             booking_end_date  : "",
//                             type:"room",
//                             available: "Yes"    

//                         };
//                         for (let i = 1; i <= rooms; i++) {
//                             var create_rooms = new Room(room_info);
//                             create_rooms.save();
//                         }
                        
//                     }
                    
//                 });
//                 // console.log("After loop",1,2);
            
//                 res.sendFile(__dirname + "/success_hotel.html");
//             })
//             .catch(err => {
//                 console.log(err);
//                 res.status(400).send("Unable to save to database");
//             });
//     }
//     else{
//         res.sendFile(__dirname + "/login.html");
//     }   
// });

app.get("/searchhotels", (req, res) => {
    if(req.session.user)
    {
        res.render('searchhotels',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/searchhotels", (req, res) => {
    var check_in = req.body.check_in;
    var check_out = req.body.check_out;
    var city = req.body.city;
    var city_name = city.toLowerCase(); 
    var country = req.body.country;
    var people = req.body.people;
    var country_name = country.toLowerCase(); 
    var selection = req.body.selection;
    if(selection == 1)
    {
        preference = "suite";
    }
    else
    {   
        preference = "room";
    }
    console.log(city,selection);

    if(req.session.user)
    {
        
        roomReservation.find({booking_start_date: {$ne:check_in}, booking_end_date:{$ne:check_out},type:preference,
            city:city_name,country:country_name},function(err,results){
        if(err)
        {
            console.log("Error part:",err);
            res.status(500).send();

        }
        console.log("Ready:",results.length);
        var rooms = [];
        for (let i = 0; i < results.length; i++) {
            rooms[i] = results[i]._doc;
        }
        console.log("Rooms:",rooms);


        if( results.length == 0)
        {
            res.render('no_hotels_found',{user: req.session.user,city:city,
                country:country,check_in:check_in,check_out:check_out,
                people:people,preference:selection});
        }
            // req.session.user = user;
        else{
            res.render('hotel_search_results',{user: req.session.user,search_results: results,city:city,
                                                country:country,check_in:check_in,check_out:check_out,
                                                people:people,preference:selection

                                            });
        }   
        // }
        // else{
        //     console.log("After ejs");
        //     res.sendFile(__dirname + "/login.html");
        // }
    //     req.session.user = user;
    });
    // res.render('searchhotels',{user: req.session.user});
    // res.sendFile(__dirname + "/homepage.html");
        
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});


app.get("/searchflights", (req, res) => {
    if(req.session.user)
    {
        res.render('searchflights',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/searchflights", (req, res) => {
    var departure_city = req.body.departure_city;
    var departure_city_name = departure_city.toLowerCase();
    var destination_city = req.body.destination_city;
    try {
        var destination_city_name = destination_city.toLowerCase();
    }
    catch(err) {
        var destination_city_name = "";
    }

    var travel_date = req.body.travel_date;
    var return_date = req.body.return_date;

    var people =  req.body.people;
    var selection = req.body.selection;
    if(selection == 1)
    {
        preference = "Business";
    }
    else
    {   
        preference = "Economy";
    }
    console.log("search:",departure_city_name,destination_city_name,travel_date,return_date,people,preference);
    if(req.session.user)
    {
        if(return_date != "")
        {
            var to_flights = [];
            var from_flights = [];
            Flight.find({departure_date: travel_date, departure_city:String(departure_city_name),arrival_city:String(destination_city_name)},function(err,to_trip){
                if(err)
                {
                    console.log("Error part:",err);
                    res.status(500).send();
        
                }
                else
                {
                    // console.log("To flights:",to_trip);
                    for (let i = 0; i < to_trip.length; i++) {
                        // console.log("to dest:",to_trip[i]._doc);
                        to_flights[i] = to_trip[i]._doc
                    }
                    
                }
                Flight.find({departure_city:String(destination_city_name),departure_date:return_date,arrival_city:String(departure_city_name)},function(err,from_trip){
                    if(err)
                    {
                        console.log("Error part:",err);
                        res.status(500).send();
            
                    }
                    else
                    {
                        // console.log("From flights:",from_trip);
                        for (let i = 0; i < from_trip.length; i++) {
                            from_flights[i] = from_trip[i]._doc;
                        }
                        console.log("From:",from_flights);
                        console.log("To:",to_flights);
                        if(to_flights.length == 0 && from_flights.length == 0)
                        {
                            res.render('no_flights_found',{user: req.session.user});
                        }
                        else
                        {
                            res.render('round_Trip_results',{user: req.session.user,flights_to_destination: to_trip,
                                flights_from_destination: from_trip,departure_city:departure_city_name,
                                destination_city:destination_city_name,travel_date:travel_date,
                                return_date:return_date,people:people,preference:selection                                   
                            }); 
                        }
                    }
                });
            });
            
            

                // console.log("Ready:",to_trip.length);
                // var to_flights = [];
                // for (let i = 0; i < to_trip.length; i++) {
                //     to_flights[i] = to_trip[i]._doc;
                // }
                // console.log("Rooms:",rooms);


                // if( results.length == 0)
                // {
                //     res.render('no_flights_found',{user: req.session.user});
                // }
                //     // req.session.user = user;
              
                // res.render('flight_search_results',{user: req.session.user,flights_to_destination: to_flights,
                //     flights_from_destination: from_flights,departure_city:departure_city_name,
                //     destination_city:destination_city_name,travel_date:travel_date,
                //     return_date:return_date,people:people,preference:selection                                   
                // });   
                // else{
                //     console.log("After ejs");
                //     res.sendFile(__dirname + "/login.html");
                // }
            //     req.session.user = user;
            }
            // res.render('searchhotels',{user: req.session.user});
            // res.sendFile(__dirname + "/homepage.html");

        else
        {
            console.log("Inside flights");
            Flight.find({departure_date: travel_date,departure_city:String(departure_city_name),arrival_city:String(destination_city_name)},function(err,results){
                    if(err)
                    {
                        console.log("Error part:",err);
                        res.status(500).send();
            
                    }
                    console.log("Ready:",results.length);
                    var rooms = [];
                    for (let i = 0; i < results.length; i++) {
                        rooms[i] = results[i]._doc;
                    }
                    console.log("Rooms 1:",rooms);


                    if( results.length == 0)
                    {
                        res.render('no_flights_found',{user: req.session.user});
                    }
                        // req.session.user = user;
                    else{
                        res.render('flight_search_results',{user: req.session.user,search_results: results,departure_city:departure_city_name,
                            destination_city:destination_city_name,travel_date:travel_date,return_date:return_date,
                                                            people:people,preference:selection
    
                                                        });
                    }   
                    // }
                    // else{
                    //     console.log("After ejs");
                    //     res.sendFile(__dirname + "/login.html");
                    // }
                //     req.session.user = user;
                });
                // res.render('searchhotels',{user: req.session.user});
                // res.sendFile(__dirname + "/homepage.html");
        }
    }    
        else{
            res.sendFile(__dirname + "/login.html");
        }
    });

app.get("/editprofile", (req, res) => {
    if(req.session.user)
    {
        
        res.render('editprofile',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/editprofile", async (req, res) => {
    if(req.session.user)
    {
        var account_type =  req.session.user.account_type;
        var username = req.body.username;
        var password = req.body.password;
        var name = req.body.name;
        var address = req.body.address;
        var city = req.body.city; 
        var country = req.body.country; 
        var contact_number = req.body.contact_number;
        var name_on_card = req.body.name_on_card;
        var card_number = req.body.card_number;
        var expiry_date = req.body.expiry_date;
        var cvv = req.body.cvv;
        var billing_address = req.body.billing_address;

        var account_details = {
            account_type: account_type,
            username    : username,
            password    : password,
            name        : name,
            address     : address,
            city        : city,
            country     : country,
            contact_number : contact_number,
            name_on_card : name_on_card,
            card_number : card_number,
            expiry_date : expiry_date,
            cvv         : cvv,
            billing_address: billing_address
        }
        // console.log("Account details:", account_details,req.session.user._id);
        var updated_details = await User.findOneAndUpdate(
            { username: req.session.user.username },
            account_details,
            // If `new` isn't true, `findOneAndUpdate()` will return the
            // document as it was _before_ it was updated.
            { new: true }
          );
        console.log("updated details:",updated_details);
        res.render('editprofile',{user: updated_details});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/add_to_cart", (req, res) => {
    if(req.session.user)
    {
        var roomId =  req.body.roomId;
        var hotel_name =  req.body.hotel_name;
        var type =  req.body.type;

        var roomId_object = mongoose.Types.ObjectId(String(roomId));
        var people = req.body.people;
        var preference = req.body.preference;
        var check_in_date = req.body.check_in_date;
        var check_out_date = req.body.check_out_date;
        console.log("to add to cart:",roomId_object,roomId,check_in_date,check_out_date);
        Room.findById({_id: String(roomId)},function(err,room){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();

            }
            else
            {
                console.log("room details:",room);
            // var name = req.body.name;
            // var address = req.body.address;
            // var city = req.body.city; 
            // var country = req.body.country; 
            // var contact_number = req.body.contact_number;
            // var name_on_card = req.body.name_on_card;
            // var card_number = req.body.card_number;
            // var expiry_date = req.body.expiry_date;
            // var cvv = req.body.cvv;
            // var billing_address = req.body.billing_address;

                var room_details = {
                    userId      : req.session.user._id,
                    roomId      : String(roomId),
                    hotel_name  : hotel_name,
                    type        : type,
                    amenities   : room.amenities,
                    city        : room.city,
                    check_in_date  : check_in_date,
                    check_out_date : check_out_date,
                    type        : room.type,
                    price       : room.price
                }
                RoomCart.find({roomId: roomId, userId : req.session.user._id},function(err,results){
                    if(err)
                    {
                        console.log("Error part:",err);
                        res.status(500).send();
            
                    }

                    if( results.length == 0)
                    {
                        var add_rooms_to_cart = new RoomCart(room_details);
                        add_rooms_to_cart.save();
                    }
                    else{
                        Room.find({booking_start_date: {$ne:check_out_date}, booking_end_date:{$ne:check_in_date},type:room.type,
                            city:room.city,country:room.country},function(err,results){
                            if(err)
                            {
                                console.log("Error part:",err);
                                res.status(500).send();
                    
                            }
                            console.log("Ready:",results.length);
                            var rooms = [];
                            for (let i = 0; i < results.length; i++) {
                                rooms[i] = results[i]._doc;
                            }
                            console.log("Rooms:",rooms);
    
    
                            if( results.length == 0)
                            {
                                res.render('no_hotels_found',{user: req.session.user});
                            }
                                // req.session.user = user;
                            else{
                                res.render('hotel_search_results',{user: req.session.user,search_results: results,city:room.city,
                                                                    country:room.country,check_in:check_in_date,check_out:check_out_date,
                                                                    people:people,preference:preference
    
                                                                });
                            }   
                        });
                    }
                    
                });


            // console.log("Account details:", account_details,req.session.user._id);
            // var updated_details = await User.findOneAndUpdate(
            //     { username: req.session.user.username },
            //     account_details,
            //     // If `new` isn't true, `findOneAndUpdate()` will return the
            //     // document as it was _before_ it was updated.
            //     { new: true }
            //   );
            // });
            }
        });

    }
        

        // console.log("add to cart_details:",roomId,check_in_date,check_out_date);
        // res.render('editprofile',{user: updated_details});
        // // res.sendFile(__dirname + "/homepage.html");
    else{
        res.sendFile(__dirname + "/login.html");
    }

});

app.post("/add_flight_to_cart", (req, res) => {
    if(req.session.user)
    {
        var flight_id =  req.body.flight_id;
        var flight_name =  req.body.flight_name;
        var flightnumber =  req.body.flightnumber;

        var departure_airport = req.body.departure_airport;
        var arrival_airport = req.body.arrival_airport;
        var departure_date = req.body.departure_date;
        var arrival_date = req.body.arrival_date;
        var departure_time = req.body.departure_time;
        var passengers = req.body.passengers;
        var price = req.body.price;
        var miles = req.body.miles;


        var arrival_time = req.body.arrival_time;
        
        var flight_details = {
            type         : "flight_ticket",
            userId       : req.session.user._id,
            flight_id    : flight_id,
            flight_name  : flight_name,
            flightnumber        : flightnumber,
            departure_airport   : departure_airport,
            arrival_airport        : arrival_airport,
            departure_date  : departure_date,
            arrival_date : arrival_date,
            departure_time   : departure_time,
            arrival_time     : arrival_time,
            passengers       : passengers,
            price            : price,
            miles            : miles
        }

        var cart_item = {
            userId      : req.session.user._id,
            item_id     : flight_id,
            details     : JSON.stringify(flight_details)
        }
        // console.log("cart_item_flight:",cart_item);
            Cart.find({details: JSON.stringify(flight_details), userId : req.session.user._id},function(err,results){
                if(err)
                {
                    console.log("Error part:",err);
                    res.status(500).send();
        
                }

                if( results.length == 0)
                {
                    var add_flights_to_cart = new Cart(cart_item);
                    add_flights_to_cart.save();
                        res.sendFile(__dirname + "/success_cart.html");

                }
                else{
                    
                            res.sendFile(__dirname + "/flight_in_cart.html");
                       
                    }
                    // console.log(" cart:",results[0]._doc.details == JSON.stringify(flight_details));
                
                });
                
            // res.render('searchhotels',{user: req.session.user});
            // res.sendFile(__dirname + "/homepage.html");
    
    }
        
    else{
        res.sendFile(__dirname + "/login.html");
    }

});

app.post("/add_hotel_to_cart", (req, res) => {
    if(req.session.user)
    {
        var roomId =  req.body.roomId;
        var hotelId =  req.body.hotelId;
        // console.log("hotelId:", hotelId);
        var roomName = req.body.roomName;
        // console.log("Room name:", roomName);
        var hotel_name =  req.body.hotel_name;
        var type =  req.body.type;
        var hotelId =  req.body.hotelId;
        var people = req.body.people;
        var price = req.body.price;
        var preference = req.body.preference;
        var check_in_date = req.body.check_in_date;
        var check_out_date = req.body.check_out_date;
        var city = req.body.city;
        var amenities = req.body.amenities;
        var address = req.body.address;
        
        var room_details = {
            userId  : req.session.user._id,
            roomId  : roomId,
            hotelId : hotelId,
            roomName : roomName,
            hotel_name : hotel_name,
            type :  type,
            check_in_date :  check_in_date,
            check_out_date : check_out_date,
            city :  city,
            amenities : amenities,
            price : price,
            people: people,
            address: address
        }

        var cart_item = {
            userId      : req.session.user._id,
            item_id     : roomId,
            details     : JSON.stringify(room_details)
        }
        console.log("cart_item addtocart:",cart_item);
            Cart.find({details: JSON.stringify(room_details), userId : req.session.user._id},function(err,results){
                if(err)
                {
                    console.log("Error part:",err);
                    res.status(500).send();
        
                }

                if( results.length == 0)
                {
                    var add_hotels_to_cart = new Cart(cart_item);
                    add_hotels_to_cart.save();
                        res.sendFile(__dirname + "/success_cart.html");

                }
                else{
                        res.sendFile(__dirname + "/room_in_cart.html");
                        
                    }
                    
                });
    }
        
    else{
        res.sendFile(__dirname + "/login.html");
    }

});

app.post("/book_room_from_cart", (req, res) => {
    if(req.session.user)
    {
        // console.log("in bookings:");
        var roomId =  req.body.roomId;
        var hotelId =  req.body.hotelId;
        var roomName = req.body.roomName;
        // console.log("book_room_from_cart:",roomName);
        var hotel_name =  req.body.hotel_name;
        var type =  req.body.type;
        var hotelId =  req.body.hotelId;
        var people = req.body.people;
        var price = req.body.price;
        var preference = req.body.preference;
        var check_in_date = req.body.check_in_date;
        var check_out_date = req.body.check_out_date;
        var city = req.body.city;
        var amenities = req.body.amenities;
        var address = req.body.address;

        Room.findById({_id: String(roomId)},function(err,room){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();

            }
            else
            {
                console.log("room details:",room)

                var room_details = {
                    userId      : req.session.user._id,
                    hotelId     : hotelId,
                    roomName    : roomName,
                    preference  : preference,
                    roomId      : String(roomId),
                    hotel_name  : hotel_name,
                    type        : type,
                    amenities   : amenities,
                    city        : city,
                    address     : address,
                    check_in_date  : check_in_date,
                    check_out_date : check_out_date,
                    people      : people,
                    price       : price
                }
                res.render('checkout_booking',{user: req.session.user,booking_details: room_details});
            }
        });
    }
      
    else{
        res.sendFile(__dirname + "/login.html");
    }

});

app.post("/book_room", (req, res) => {
    if(req.session.user)
    {
        var roomId =  req.body.roomId;
        var hotelId =  req.body.hotelId;
        var roomName = req.body.roomName;
        var hotel_name =  req.body.hotel_name;
        var type =  req.body.type;
        var hotelId =  req.body.hotelId;
        var people = req.body.people;
        var price = req.body.price;
        var preference = req.body.preference;
        var check_in_date = req.body.check_in_date;
        var check_out_date = req.body.check_out_date;
        var city = req.body.city;
        var amenities = req.body.amenities;
        var address = req.body.address;
        
        console.log("in bookings:");
        var room_details= {
             userId : req.session.user._id, 
             roomId: roomId,
             hotelId: hotelId,
             roomName : roomName,
             hotel_name : hotel_name,
             type :  type,
             check_in_date :  check_in_date,
             check_out_date : check_out_date,
             city :  city,
             amenities : amenities,
             price : price,
             people: people,
             address: address
            };

            var cart_item = {
                userId      : req.session.user._id,
                item_id     : roomId,
                details     : JSON.stringify(room_details)
            }
       
            console.log("cart_item:",cart_item);
             Booking.find({details: JSON.stringify(room_details), userId : req.session.user._id},async function(err,results){
                if(err)
                {
                    console.log("Error part:",err);
                    res.status(500).send();
        
                }

                if( results.length == 0)
                {
                    var add_flights_to_cart = new Booking(cart_item);
                    add_flights_to_cart.save();
                    // console.log("Roomid:",roomId);
                    var updated_details = await roomReservation.findOneAndUpdate(
                        { roomId: roomId },{ $addToSet :{
                            booking_start_date:check_in_date,
                            booking_end_date:check_out_date,

                        }},
                        // If `new` isn't true, `findOneAndUpdate()` will return the
                        // document as it was _before_ it was updated.
                        { new: true }
                      );
                    await Cart.deleteOne({ details: JSON.stringify(room_details)});
                    console.log("updated booking:", updated_details);
                    res.sendFile(__dirname + "/success_booking.html");

                }
                else{
                    
                     res.sendFile(__dirname + "/flight_in_cart.html");
                       
                    }
                    // console.log(" cart:",results[0]._doc.details == JSON.stringify(flight_details));
                
                });

                
    }
       
    else{
        res.sendFile(__dirname + "/login.html");
    }

});

app.post("/book_flight_now", (req, res) => {
    if(req.session.user)
    {
        console.log("in bookings:");
        var flight_id =  req.body.flight_id;
        var flight_name =  req.body.flight_name;
        var flightnumber =  req.body.flightnumber;
        var type =  req.body.type;
        var departure_airport = req.body.departure_airport;
        var arrival_airport = req.body.arrival_airport;
        var departure_date = req.body.departure_date;
        var arrival_date = req.body.arrival_date;
        var departure_time = req.body.departure_time;
        var arrival_time = req.body.arrival_time;
        var passengers = req.body.passengers;
        var price = req.body.price;
        var miles = req.body.miles;


        Flight.findById({_id: String(flight_id)},function(err,room){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();

            }
            else
            {
                console.log("room details:",room)

                var details = {
                    type :  type,
                    userId  : req.session.user._id,
                    flight_id  : flight_id,
                    flight_name : flight_name,
                    flightnumber : flightnumber,
                    departure_airport : departure_airport,
                    arrival_airport :  arrival_airport,
                    departure_date : departure_date,
                    arrival_date :  arrival_date,
                    departure_time : departure_time,
                    arrival_time : arrival_time,
                    passengers: passengers,
                    price: price,
                    miles: miles
                }
                console.log("miles details:",details);
                res.render('checkout_flight_booking',{user: req.session.user,booking_details: details});
            }
        });
    }
      
    else{
        res.sendFile(__dirname + "/login.html");
    }

});

app.post("/book_flight_from_cart", (req, res) => {
    if(req.session.user)
    {
        var flight_id =  req.body.flight_id;
        var flight_name =  req.body.flight_name;
        var flightnumber =  req.body.flightnumber;
        var type =  req.body.type;
        var departure_airport = req.body.departure_airport;
        var arrival_airport = req.body.arrival_airport;
        var departure_date = req.body.departure_date;
        var arrival_date = req.body.arrival_date;
        var departure_time = req.body.departure_time;
        var arrival_time = req.body.arrival_time;
        var passengers = req.body.passengers;
        var price = req.body.price;
        var miles = req.body.miles;


        var details = {
            type :  type,
            userId  : req.session.user._id,
            flight_id  : flight_id,
            flight_name : flight_name,
            flightnumber : flightnumber,
            departure_airport : departure_airport,
            arrival_airport :  arrival_airport,
            departure_date : departure_date,
            arrival_date :  arrival_date,
            departure_time : departure_time,
            arrival_time : arrival_time,
            passengers: passengers,
            price: price,
            miles: miles
        }
        res.render('checkout_flight_booking',{user: req.session.user,booking_details: details});
    }
      
    else{
        res.sendFile(__dirname + "/login.html");
    }

});


app.post("/book_flight", (req, res) => {
    if(req.session.user)
    {
        var  flight_id =  req.body.flight_id;
        console.log("in bookings:",req.body.miles);
        var flight_details= { 
             type         : req.body.type, 
             userId  : req.session.user._id,
             flight_id    :  req.body.flight_id,
             flight_name :  req.body.flight_name,
             flightnumber :  req.body.flightnumber,
             departure_airport : req.body.departure_airport,
             arrival_airport : req.body.arrival_airport,
             departure_date : req.body.departure_date,
             arrival_date : req.body.arrival_date,
             departure_time : req.body.departure_time,
             arrival_time : req.body.arrival_time,
             passengers : req.body.passengers,
             price : req.body.price,
             miles : req.body.miles
            };
            var add_mileage = parseInt(req.body.miles);
            console.log("miles:",flight_details);
       
            var cart_item = {
                userId      : req.session.user._id,
                item_id     : flight_id,
                details     : JSON.stringify(flight_details)
            }
            // console.log("booking:",cart_item);
            var miles = 0;
            Booking.find({details: JSON.stringify(flight_details), userId : req.session.user._id},function(err,results){
                if(err)
                {
                    console.log("Error part:",err);
                    res.status(500).send();
        
                }

                if( results.length == 0)
                {
                    var add_flights_to_bookings = new Booking(cart_item);
                    add_flights_to_bookings.save();
                    // Get user miles here
                    User.find({_id: req.session.user._id},async function(err,user){
                        if(err)
                        {
                            console.log("Error part:",err);
                            res.status(500).send();
                
                        }
        
                        if( user.length != 0)
                        {
                            miles = miles + user[0].mileage;
                            console.log("  flight mileage:",miles,user[0].mileage);
                        }
                        var added_mileage = add_mileage + parseInt(miles);
                        console.log("added miles:",added_mileage);
                        var mileage = {mileage : String(added_mileage)}
                        var updated_details = await User.findOneAndUpdate(
                            { username: req.session.user.username },
                            mileage,
                            // If `new` isn't true, `findOneAndUpdate()` will return the
                            // document as it was _before_ it was updated.
                            { new: true }
                          );
                        console.log("just miles:",updated_details); 
                    await Cart.deleteOne({ details: JSON.stringify(flight_details)});
                    res.sendFile(__dirname + "/success_booking.html");
                });
            }
                else
                {
                    res.sendFile(__dirname + "/flight_in_cart.html");  
                }
                    });
                
                
    }
       
    else{
        res.sendFile(__dirname + "/login.html");
    }

});

app.get("/viewcart", (req, res) => {


    if(req.session.user && req.session.user.account_type == 'individual')
    {
                Cart.find({userId: req.session.user._id},function(err,results){
                    if(err)
                    {
                        console.log("Error part:",err);
                        res.status(500).send();
                    }
                    else
                    {
                        var total_cost = 0;
                        console.log("Ready:",results.length);
                        var cart_items = [];
                        for (let i = 0; i < results.length; i++) {
                            cart_items[i] = JSON.parse(results[i]._doc.details);
                            cart_item_details = JSON.parse(results[i]._doc.details);
                            if(cart_items[i].type == "flight_ticket")
                            {
                                total_cost += parseInt(cart_item_details.price)*parseInt(cart_item_details.passengers);
                            }
                            else{
                                total_cost += parseInt(cart_item_details.price);
                            }
                        }
                        // console.log("Rooms:",rooms);
                        console.log("Total items:",cart_items)
            
                        if( results.length == 0)
                        {
                            res.render('cart_empty',{user: req.session.user});
                        }
                        else{
                            res.render('viewcart',{user: req.session.user,search_results: cart_items,total_cost:total_cost});  
                        }
                            }
                        });
                    
                            }
        
        
    
    
        // res.render('viewcart',{user: req.session.user,});
        // res.sendFile(__dirname + "/homepage.html");
    else if(req.session.user && req.session.user.account_type == 'admin')
    {

        res.render('admin',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else if(req.session.user && req.session.user.account_type == 'hotel')
    {

        res.render('hotelmanagement',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});


app.post("/deletecartitem", (req, res) => {

    if(req.session.user && req.session.user.account_type == 'individual')
    {
        var type =  req.body.type;
        var flight_id =  req.body.flight_id;
        var flight_name =  req.body.flight_name;
        var flightnumber =  req.body.flightnumber;

        var departure_airport = req.body.departure_airport;
        var arrival_airport = req.body.arrival_airport;
        var departure_date = req.body.departure_date;
        var arrival_date = req.body.arrival_date;
        var departure_time = req.body.departure_time;
        var passengers = req.body.passengers;
        var miles      = req.body.miles;
        var price = req.body.price;

        var arrival_time = req.body.arrival_time;

        var details = {
            type :  type,
            userId  : req.session.user._id,
            flight_id  : flight_id,
            flight_name : flight_name,
            flightnumber : flightnumber,
            departure_airport : departure_airport,
            arrival_airport :  arrival_airport,
            departure_date : departure_date,
            arrival_date :  arrival_date,
            departure_time : departure_time,
            arrival_time : arrival_time,
            passengers: passengers,
            price: price,
            miles:miles
        }
        console.log("Inside cart del:",JSON.stringify(details));
        // var cart_item =  req.body.cart_item;
        // console.log("roomid", roomId);

        // RoomCart.deleteOne({ roomId: roomId });
        Cart.deleteOne({ details: JSON.stringify(details),userId: req.session.user._id},function(err,results){
        if(err)
        {
            console.log("Error part:",err);
            res.status(500).send();

        }
        else
        {
            Cart.find({userId: req.session.user._id},function(err,results){
                if(err)
                {
                    console.log("Error part:",err);
                    res.status(500).send();
                }
                else
                {
                    var total_cost = 0;
                    console.log("Ready:",results.length);
                    var cart_items = [];
                    for (let i = 0; i < results.length; i++) {
                        cart_items[i] = JSON.parse(results[i]._doc.details);
                        cart_item_details = JSON.parse(results[i]._doc.details);
                        total_cost += parseInt(cart_item_details.price);
                    }
                    // console.log("Rooms:",rooms);
        
        
                    if( results.length == 0)
                    {
                        res.render('cart_empty',{user: req.session.user});
                    }
                    else{
                        res.render('viewcart',{user: req.session.user,search_results: cart_items,total_cost:total_cost});  
                    }
                        }
                    });
            
        }
        });
    }
        // res.render('viewcart',{user: req.session.user,});
        // res.sendFile(__dirname + "/homepage.html");
    else if(req.session.user && req.session.user.account_type == 'admin')
    {

        res.render('admin',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else if(req.session.user && req.session.user.account_type == 'hotel')
    {

        res.render('hotelmanagement',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});


app.post("/deleteroomcartitem", (req, res) => {
    console.log("Session:",req.session);
    if(req.session.user && req.session.user.account_type == 'individual')
    {
        var roomId =  req.body.roomId;
        var hotelId =  req.body.hotelId;
        var roomName = req.body.roomName;
        var hotel_name =  req.body.hotel_name;
        var type =  req.body.type;
        var hotelId =  req.body.hotelId;
        var people = req.body.people;
        var price = req.body.price;
        var preference = req.body.preference;
        var check_in_date = req.body.check_in_date;
        var check_out_date = req.body.check_out_date;
        var city = req.body.city;
        var amenities = req.body.amenities;
        var address = req.body.address;

    
        var details = {
            userId : req.session.user._id,
            roomId: roomId,
            hotelId: hotelId,
            roomName : roomName,
            hotel_name : hotel_name,
            type :  type,
            check_in_date :  check_in_date,
            check_out_date : check_out_date,
            city :  city,
            amenities : amenities,
            price : price,
            people: people,
            address: address
        }
        console.log("Inside cart del:",JSON.stringify(details));
        // var cart_item =  req.body.cart_item;
        // console.log("roomid", roomId);

        // RoomCart.deleteOne({ roomId: roomId });
        Cart.deleteOne({ details: JSON.stringify(details),userId: req.session.user._id},function(err,results){
        if(err)
        {
            console.log("Error part:",err);
            res.status(500).send();

        }
        else
        {
            Cart.find({userId: req.session.user._id},function(err,results){
                if(err)
                {
                    console.log("Error part:",err);
                    res.status(500).send();
                }
                else
                {
                    var total_cost = 0;
                    console.log("Ready:",results.length);
                    var cart_items = [];
                    for (let i = 0; i < results.length; i++) {
                        cart_items[i] = JSON.parse(results[i]._doc.details);
                        cart_item_details = JSON.parse(results[i]._doc.details);
                        total_cost += parseInt(cart_item_details.price);
                    }
                    // console.log("Rooms:",rooms);
        
        
                    if( results.length == 0)
                    {
                        res.render('cart_empty',{user: req.session.user});
                    }
                    else{
                        res.render('viewcart',{user: req.session.user,search_results: cart_items,total_cost:total_cost});  
                    }
                        }
                    });
            
        }
        });
    }
        // res.render('viewcart',{user: req.session.user,});
        // res.sendFile(__dirname + "/homepage.html");
    else if(req.session.user && req.session.user.account_type == 'admin')
    {

        res.render('admin',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else if(req.session.user && req.session.user.account_type == 'hotel')
    {

        res.render('hotelmanagement',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.get("/mybookings", (req, res) => {
    if(req.session.user && req.session.user.account_type == 'individual')
    {
    Booking.find({userId: req.session.user._id},function(err,results){
        if(err)
        {
            console.log("Error part:",err);
            res.status(500).send();
        }
        else
        {
            // var total_cost = 0;
            // console.log("Ready:",results.length);
            var cart_items = [];
            for (let i = 0; i < results.length; i++) {
                cart_items[i] = JSON.parse(results[i]._doc.details);
                cart_item_details = JSON.parse(results[i]._doc.details);
                // total_cost += parseInt(cart_item_details.price);
            }
            // console.log("Rooms:",rooms);
            // console.log("Total items:",cart_items)

            if( results.length == 0)
            {
                res.render('no_bookings',{user: req.session.user});
            }
            else{
                res.render('bookings',{user: req.session.user,search_results: cart_items});  
            }
                }
            });
        
        } 
        else if(req.session.user && req.session.user.account_type == 'admin')
        {

            res.render('admin',{user: req.session.user});
            // res.sendFile(__dirname + "/homepage.html");
        }
        else if(req.session.user && req.session.user.account_type == 'hotel')
        {

            res.render('hotelmanagement',{user: req.session.user});
            // res.sendFile(__dirname + "/homepage.html");
        }
        else{
            res.sendFile(__dirname + "/login.html");
        }
    });

app.get("/checkin_checkout", (req, res) => {
    if(req.session.user && req.session.user.account_type == 'hotel')
    {
        roomReservation.find({hotelId: String(req.session.user._id)},function(err,results){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();
            }
            else
            {
                console.log("Ready:",results.length);
                var cart_items = [];
                // for (let i = 0; i < results.length; i++) {
                //     // cart_items[i] = JSON.parse(results[i]._doc.details);
                //     cart_item_details = JSON.parse(results[i]._doc.details);
                //     total_cost += parseInt(cart_item_details.price);
                // }
                // console.log("Rooms:",rooms);
                console.log("Total items:",cart_items)
    
                if( results.length == 0)
                {
                    res.render('cart_empty',{user: req.session.user});
                }
                else{
                    res.render('checkin_checkout',{user: req.session.user,search_results: results});  
                }
                    }
                });
        console.log("check-in and out");
        // res.render('checkin_checkout',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/checkout", async (req, res) => {

    if(req.session.user && req.session.user.account_type == 'hotel')
    {
        var booking_start_date =  req.body.booking_start_date;
        var booking_end_date =  req.body.booking_end_date;
        var roomId =  req.body.roomId;
        var updated_details = await roomReservation.findOneAndUpdate(
            { roomId: roomId, hotelId:req.session.user._id },{ $pull :{
                booking_start_date:booking_start_date,
                booking_end_date:booking_end_date,

            }},
            // If `new` isn't true, `findOneAndUpdate()` will return the
            // document as it was _before_ it was updated.
            { new: true }
          );
          roomReservation.find({hotelId: String(req.session.user._id)},function(err,results){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();
            }
            else
            {
                console.log("Ready:",results.length);
                var cart_items = [];
                // for (let i = 0; i < results.length; i++) {
                //     // cart_items[i] = JSON.parse(results[i]._doc.details);
                //     cart_item_details = JSON.parse(results[i]._doc.details);
                //     total_cost += parseInt(cart_item_details.price);
                // }
                // console.log("Rooms:",rooms);
                console.log("Total items:",cart_items)
    
                if( results.length == 0)
                {
                    res.render('cart_empty',{user: req.session.user});
                }
                else{
                    res.render('checkin_checkout',{user: req.session.user,search_results: results});  
                }
                    }
                });
        
    }
        // res.render('viewcart',{user: req.session.user,});
        // res.sendFile(__dirname + "/homepage.html");
    else if(req.session.user && req.session.user.account_type == 'admin')
    {

        res.render('admin',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else if(req.session.user && req.session.user.account_type == 'hotel')
    {

        res.render('hotelmanagement',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/cancel_booking", async (req, res) => {

    if(req.session.user && req.session.user.account_type == 'individual')
    {
        var roomId =  req.body.roomId;
        var hotelId =  req.body.hotelId;
        // console.log("hotelId:", hotelId);
        var roomName = req.body.roomName;
        // console.log("Room name:", roomName);
        var hotel_name =  req.body.hotel_name;
        var type =  req.body.type;
        var hotelId =  req.body.hotelId;
        var people = req.body.people;
        var price = req.body.price;
        var check_in_date = req.body.check_in_date;
        var check_out_date = req.body.check_out_date;
        var city = req.body.city;
        var amenities = req.body.amenities;
        var address = req.body.address;
        
        var details = {
            userId  : req.session.user._id,
            roomId  : roomId,
            hotelId : hotelId,
            roomName : roomName,
            hotel_name : hotel_name,
            type :  type,
            check_in_date :  check_in_date,
            check_out_date : check_out_date,
            city :  city,
            amenities : amenities,
            price : price,
            people: people,
            address: address
        }

        console.log("details cancel:",JSON.stringify(details));
        var updated_details = await roomReservation.findOneAndUpdate(
            { roomId: roomId, hotelId:req.session.user._id },{ $pull :{
                booking_start_date:check_in_date,
                booking_end_date:check_out_date,

            }},
            // If `new` isn't true, `findOneAndUpdate()` will return the
            // document as it was _before_ it was updated.
            { new: true }
          );
        var updated_details = await Booking.deleteOne(
            { details: JSON.stringify(details), userId:req.session.user._id },
          );
        await Cart.deleteOne({ details: JSON.stringify(details),userId : req.session.user._id});

          Booking.find({userId: req.session.user._id},function(err,results){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();
            }
            else
            {
                // var total_cost = 0;
                console.log("After deleting:",results.length);
                var cart_items = [];
                for (let i = 0; i < results.length; i++) {
                    cart_items[i] = JSON.parse(results[i]._doc.details);
                    cart_item_details = JSON.parse(results[i]._doc.details);
                    // total_cost += parseInt(cart_item_details.price);
                }
                // console.log("Rooms:",rooms);
                // console.log("Total items:",cart_items)
    
                if( results.length == 0)
                {
                    res.render('no_bookings',{user: req.session.user});
                }
                else{
                    res.render('bookings',{user: req.session.user,search_results: cart_items});  
                }
                    }
                });
        
    }
        // res.render('viewcart',{user: req.session.user,});
        // res.sendFile(__dirname + "/homepage.html");
    else if(req.session.user && req.session.user.account_type == 'admin')
    {

        res.render('admin',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else if(req.session.user && req.session.user.account_type == 'hotel')
    {

        res.render('hotelmanagement',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/clear_cart", async (req, res) => {

    if(req.session.user && req.session.user.account_type == 'individual')
    {
        Cart.deleteMany({ userId: req.session.user._id }).then(function(){
            console.log("Data deleted"); // Success
        }).catch(function(error){
            console.log(error); // Failure
        });
        Cart.find({userId: req.session.user._id},function(err,results){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();
            }
            else
            {
                var total_cost = 0;
                console.log("Ready:",results.length);
                var cart_items = [];
                for (let i = 0; i < results.length; i++) {
                    cart_items[i] = JSON.parse(results[i]._doc.details);
                    cart_item_details = JSON.parse(results[i]._doc.details);
                    total_cost += parseInt(cart_item_details.price);
                }
                // console.log("Rooms:",rooms);
                console.log("Total items:",cart_items)
    
                if( results.length == 0)
                {
                    res.render('cart_empty',{user: req.session.user});
                }
                else{
                    res.render('viewcart',{user: req.session.user,search_results: cart_items,total_cost:total_cost});  
                }
                    }
                });
    }
        // res.render('viewcart',{user: req.session.user,});
        // res.sendFile(__dirname + "/homepage.html");
    else if(req.session.user && req.session.user.account_type == 'admin')
    {

        res.render('admin',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else if(req.session.user && req.session.user.account_type == 'hotel')
    {

        res.render('hotelmanagement',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/buy_cart", async (req, res) => {

    if(req.session.user && req.session.user.account_type == 'individual')
    {
        var remaining_miles = parseInt(req.body.remaining_miles);
        if(remaining_miles >= 1)
        {
            var mileage = {mileage : String(remaining_miles)};
            var updated_details = await User.findOneAndUpdate(
                { username: req.session.user.username },
                mileage,
                // If `new` isn't true, `findOneAndUpdate()` will return the
                // document as it was _before_ it was updated.
                { new: true }
            );
        }
        Cart.find({userId: req.session.user._id},function(err,results){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();
            }
            else
            {
                var total_cost = 0;
                console.log("Ready:",results.length);
                var cart_items = [];
                for (let i = 0; i < results.length; i++) {
                    cart_items[i] = JSON.parse(results[i]._doc.details);
                    cart_item_details = JSON.parse(results[i]._doc.details);
                    total_cost += parseInt(cart_item_details.price);
                }
                // console.log("Rooms:",rooms);
                console.log("Total checkout items:",cart_items)
                var checker = 0;
                for (let j = 0; j < cart_items.length; j++) {
                    if(cart_items[j].type != "flight_ticket")
                    {
                        check_in_date = cart_items[j].check_in_date;
                        check_out_date = cart_items[j].check_out_date;
                        roomId = cart_items[j].roomId;
                        Booking.find({details: JSON.stringify(cart_items[j]), userId : req.session.user._id},async function(err,results){
                            if(err)
                            {
                                console.log("Error part:",err);
                                res.status(500).send();
                    
                            }
                            console.log("cart_items:",cart_items[j]);
                            data = cart_items[j];
                            var cart_item = {
                                userId      : req.session.user._id,
                                item_id     : data.roomId,
                                details     : JSON.stringify(data)
                            }
                            if( results.length == 0)
                            {
                                var add_item_to_cart = new Booking(cart_item);
                                add_item_to_cart.save();
                                // console.log("Roomid:",roomId);
                                var updated_details = await roomReservation.findOneAndUpdate(
                                    { roomId: roomId },{ $addToSet :{
                                        booking_start_date:check_in_date,
                                        booking_end_date:check_out_date
            
                                    }},
                                    // If `new` isn't true, `findOneAndUpdate()` will return the
                                    // document as it was _before_ it was updated.
                                    { new: true }
                                  );
                                await Cart.deleteOne({ details: JSON.stringify(data)});
                                console.log("updated booking:", updated_details);
                                res.sendFile(__dirname + "/success_booking.html");
            
                            }
                            else
                            {
                                checker = checker+ 1;
                            }
                        });
                    }
                    else
                    {
                        var miles = 0;
                        console.log("Inside buy_tickets_checkout");
                        var flight_miles = parseInt(cart_items[j].miles);
                        var flight_id = cart_items[j].flight_id;
                        console.log("Inside buy_tickets_checkout:",flight_miles,flight_id);

                        Booking.find({details: JSON.stringify(cart_items[j]), userId : req.session.user._id},function(err,results){
                            if(err)
                            {
                                console.log("Error part:",err);
                                res.status(500).send();
                    
                            }
                            var cart_item = {
                                userId      : req.session.user._id,
                                item_id     : flight_id,
                                details     : JSON.stringify(cart_items[j])
                            }
                            if( results.length == 0)
                            {
                                console.log("Booking not present: Safe");
                                var add_flights_to_bookings = new Booking(cart_item);
                                add_flights_to_bookings.save();
                                // Get user miles here
                                User.find({_id: req.session.user._id},async function(err,user){
                                    if(err)
                                    {
                                        console.log("Error part:",err);
                                        res.status(500).send();
                            
                                    }
                    
                                    if( user.length != 0)
                                    {
                                        miles = miles + user[0].mileage;
                                        console.log("  flight mileage:",miles,user[0].mileage);
                                    }
                                    var added_mileage = flight_miles + parseInt(miles);
                                    console.log("added miles:",added_mileage);
                                    var mileage = {mileage : String(added_mileage)}
                                    var updated_details = await User.findOneAndUpdate(
                                        { username: req.session.user.username },
                                        mileage,
                                        // If `new` isn't true, `findOneAndUpdate()` will return the
                                        // document as it was _before_ it was updated.
                                        { new: true }
                                      );
                                    console.log("just miles:",updated_details);
                                    await Cart.deleteOne({ details: JSON.stringify(cart_items[j])}); 
                                    res.sendFile(__dirname + "/success_booking.html");
                                    });
                            }
                            else{
                                console.log("Booking present: Not Safe");
                                checker = checker+ 1;
                            }

                                });
                                // checker = checker+ 1;
                            if(checker > 0)
                            {
                                res.sendFile(__dirname + "/flight_in_cart.html");  
                            }        
                    }
                    
                }
                

            }
            });

    }
    else if(req.session.user && req.session.user.account_type == 'admin')
    {
        res.render('admin',{user: req.session.user});
    }
    else if(req.session.user && req.session.user.account_type == 'hotel')
    {
        res.render('hotelmanagement',{user: req.session.user});
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/checkout_cart", async (req, res) => {

    if(req.session.user && req.session.user.account_type == 'individual')
    {
        var redeem_miles = parseInt(req.body.redeem_miles);
        var user_miles = 0;
        var remaining_miles = 0;
        if(redeem_miles == 1)
        {
            // Get user miles
            User.find({_id: req.session.user._id},async function(err,user){
                if(err)
                {
                    console.log("Error part:",err);
                    res.status(500).send();
        
                }

                if( user.length != 0)
                {
                    user_miles = user[0].mileage;
                    console.log("  flight mileage:",user_miles,user[0].mileage);
                }
            });
        }

        Cart.find({userId: req.session.user._id}, async function(err,results){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();
            }
            else
            {
                var total_cost = 0;
                console.log("Ready:",results.length);
                var cart_items = [];
                for (let i = 0; i < results.length; i++) {
                    cart_items[i] = JSON.parse(results[i]._doc.details);
                    cart_item_details = JSON.parse(results[i]._doc.details);
                    if(cart_items[i].type == "flight_ticket")
                    {
                        total_cost += parseInt(cart_item_details.price)*parseInt(cart_item_details.passengers);
                    }
                    else{
                        total_cost += parseInt(cart_item_details.price);
                    }
                }
                if(user_miles >= 500)
                {
                    discount = (user_miles/500)*(5/100)*total_cost;
                    total_cost = total_cost - discount;
                    remaining_miles = user_miles%500;
                }
                console.log("acrt:",cart_items);
                res.render('checkout_cart',{user: req.session.user,booking_details: JSON.stringify(cart_items),total_cost:total_cost,remaining_miles:remaining_miles});


            }
        });
    }
    else if(req.session.user && req.session.user.account_type == 'admin')
    {
        res.render('admin',{user: req.session.user});
    }
    else if(req.session.user && req.session.user.account_type == 'hotel')
    {
        res.render('hotelmanagement',{user: req.session.user});
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/cancel_flight_booking", async (req, res) => {

    if(req.session.user && req.session.user.account_type == 'individual')
    {
        var flight_id =  req.body.flight_id;
        var flight_name =  req.body.flight_name;
        // console.log("hotelId:", hotelId);
        var flightnumber = req.body.flightnumber;
        // console.log("Room name:", roomName);
        var departure_airport =  req.body.departure_airport;
        var departure_date =  req.body.departure_date;
        var type =  req.body.type;
        var arrival_airport = req.body.arrival_airport;
        var arrival_date = req.body.arrival_date;
        var departure_time = req.body.departure_time;
        var arrival_time = req.body.arrival_time;
        var passengers = req.body.passengers;
        var miles = req.body.miles;
        var price = req.body.price;
        
        var details = {
            type :  type,
            userId  : req.session.user._id,
            flight_id  : flight_id,
            flight_name : flight_name,
            flightnumber : flightnumber,
            departure_airport : departure_airport,
            arrival_airport :  arrival_airport,
            departure_date : departure_date,
            arrival_date :  arrival_date,
            departure_time : departure_time,
            arrival_time : arrival_time,
            passengers: passengers,
            price: price,
            miles: miles
        }

        console.log("details cancel:",JSON.stringify(details));
        var updated_details = await Booking.deleteOne(
            { details: JSON.stringify(details), userId:req.session.user._id },
          );
          User.find({_id: req.session.user._id},async function(err,user){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();
    
            }

            if( user.length != 0)
            {
                var user_miles = user[0].mileage;
                // console.log("  flight mileage:",user_miles,user[0].mileage);
            }
            var subtracted_mileage = parseInt(user_miles) - miles ;
            console.log("subtracted miles:",subtracted_mileage);
            var mileage = {mileage : String(subtracted_mileage)}
            var updated_details = await User.findOneAndUpdate(
                { username: req.session.user.username },
                mileage,
                // If `new` isn't true, `findOneAndUpdate()` will return the
                // document as it was _before_ it was updated.
                { new: true }
              );
            console.log("just miles:",updated_details); 
            await Cart.deleteOne({ details: JSON.stringify(details),userId : req.session.user._id});
        });
        // await Cart.deleteOne({ details: JSON.stringify(details),userId : req.session.user._id});

          Booking.find({userId: req.session.user._id},function(err,results){
            if(err)
            {
                console.log("Error part:",err);
                res.status(500).send();
            }
            else
            {
                // var total_cost = 0;
                console.log("After deleting:",results.length);
                var cart_items = [];
                for (let i = 0; i < results.length; i++) {
                    cart_items[i] = JSON.parse(results[i]._doc.details);
                    cart_item_details = JSON.parse(results[i]._doc.details);
                    // total_cost += parseInt(cart_item_details.price);
                }
                // console.log("Rooms:",rooms);
                // console.log("Total items:",cart_items)
    
                if( results.length == 0)
                {
                    res.render('no_bookings',{user: req.session.user});
                }
                else{
                    res.render('bookings',{user: req.session.user,search_results: cart_items});  
                }
                    }
                });
    }
    else if(req.session.user && req.session.user.account_type == 'admin')
    {
        res.render('admin',{user: req.session.user});
    }
    else if(req.session.user && req.session.user.account_type == 'hotel')
    {
        res.render('hotelmanagement',{user: req.session.user});
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});



app.post("/round_trip_cart", (req, res) => {
    if(req.session.user)
    {
        var to_flight = req.body.to_flight;
        var return_flight = req.body.from_flight;
        var passengers = req.body.passengers;
        var preference = req.body.preference;
        var to_miles = req.body.to_miles;
        var from_miles = req.body.from_miles;

        var price = 0;
        

        to_ticket = JSON.parse(to_flight);
        return_ticket = JSON.parse(return_flight);
        if(parseInt(preference) == 1)
        {
            to_ticket_price = to_ticket.business_seat_price;
        }
        else{
            to_ticket_price = to_ticket.economy_seat_price; 
        }

        if(parseInt(preference) == 2)
        {
            return_ticket_price = return_ticket.business_seat_price;
        }
        else{
            return_ticket_price = return_ticket.economy_seat_price; 
        }
        console.log("round trip:", to_ticket,return_ticket,passengers);
        
        var to_flight_details = {
            type         : "flight_ticket",
            userId       : req.session.user._id,
            flight_id    : to_ticket._id,
            flight_name  : to_ticket.flightname,
            flightnumber        : to_ticket.flightnumber,
            departure_airport   : to_ticket.departure_airport,
            arrival_airport        : to_ticket.arrival_airport,
            departure_date  : to_ticket.departure_date,
            arrival_date : to_ticket.arrival_date,
            departure_time   : to_ticket.departure_time,
            arrival_time     : to_ticket.arrival_time,
            passengers       : passengers,
            price            : to_ticket_price,
            miles            : to_miles
        }

        var return_flight_details = {
            type         : "flight_ticket",
            userId       : req.session.user._id,
            flight_id    : return_ticket._id,
            flight_name  : return_ticket.flightname,
            flightnumber        : return_ticket.flightnumber,
            departure_airport   : return_ticket.departure_airport,
            arrival_airport        : return_ticket.arrival_airport,
            departure_date  : return_ticket.departure_date,
            arrival_date : return_ticket.arrival_date,
            departure_time   : return_ticket.departure_time,
            arrival_time     : return_ticket.arrival_time,
            passengers       : passengers,
            price            : return_ticket_price,
            miles            : from_miles
        }

        var to_ticket_cart_item = {
            userId      : req.session.user._id,
            item_id     : to_ticket._id,
            details     : JSON.stringify(to_flight_details)
        }

        var return_ticket_cart_item = {
            userId      : req.session.user._id,
            item_id     : return_ticket._id,
            details     : JSON.stringify(return_flight_details)
        }
        // // console.log("cart_item_flight:",cart_item);
            Cart.find({details: {$in:[JSON.stringify(to_flight_details),JSON.stringify(return_flight_details)]}, userId : req.session.user._id},function(err,results){
                if(err)
                {
                    console.log("Error part:",err);
                    res.status(500).send();
        
                }

                if( results.length == 0)
                {
                    var add_to_ticket_to_cart = new Cart(to_ticket_cart_item);
                    add_to_ticket_to_cart.save();
                    var add_return_ticket_to_cart = new Cart(return_ticket_cart_item);
                    add_return_ticket_to_cart.save();
                        res.sendFile(__dirname + "/success_cart.html");

                }
                else{
                    
                            res.sendFile(__dirname + "/flight_in_cart.html");
                       
                    }
                    // console.log(" cart:",results[0]._doc.details == JSON.stringify(flight_details));
                
                });
                
            // res.render('searchhotels',{user: req.session.user});
            // res.sendFile(__dirname + "/homepage.html");
    
    }
        
    else{
        res.sendFile(__dirname + "/login.html");
    }

});

app.get("/feedback", (req, res) => {
    if(req.session.user)
    {
        res.sendFile(__dirname + "/feedback.html");
    }
    else{
        res.sendFile(__dirname + "/login.html");
    }
});

app.post("/feedback", async (req, res) => {
    if(req.session.user)
    {
        var rating = req.body.rate;
        var user_email = req.body.email;
        var feedback = req.body.feedback;
        
        var feedback_details ={
            userId          : req.session.user._id,
            rating          : rating,
            user_email      : user_email,
            feedback        : feedback
        }
        var updated_details = await Feedback.findOneAndUpdate(
        { userId: req.session.user._id },
        feedback_details,
        // If `new` isn't true, `findOneAndUpdate()` will return the
        // document as it was _before_ it was updated.
        { new: true }
        );
        console.log("update details feedback:",updated_details);
        if(updated_details == null)
        {
            var myfeedback = new Feedback(feedback_details);
            myfeedback.save()
            .then(item => {
                res.sendFile(__dirname + "/success_submitted.html");
            })
        }
        res.sendFile(__dirname + "/success_submitted.html");


    }
});

app.get("*", (req, res) => {
    console.log("User:", req.session,req.session.user);
    if(!req.session.user)
    {
        res.sendFile(__dirname + "/login.html");
    }
    // console.log("Session:",req.session.user,req.session);
    else if(req.session.user.username == "admin"){
        res.render('adminhomepage',{user: req.session.user});
        // res.sendFile(__dirname + "/adminhomepage.html");
    }
    else if (req.session.user.account_type == "hotel"){
        res.render('hotelmanagement',{user: req.session.user});
    }
    else{
        res.render('homepage',{user: req.session.user});
        // res.sendFile(__dirname + "/homepage.html");
    }
});
app.listen(port, () => {
    console.log("Server listening on port " + port);
});