const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

global.server = express();
server.use(require("morgan")("dev"));
server.use(express.static(__dirname + "/public"));
server.set("views", __dirname + "/views");
server.set("view engine", "ejs");
server.use(require("cookie-parser")());

server.use(require("express-session")({
    secret: "09e60df3-e2d7-4c10-b103-380da8d5719b",
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false
    }
}));

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

let privileges = JSON.parse(fs.readFileSync("privileges.json", {encoding: "utf-8"}));

server.use((request, response, next) => {
    if(!request.session.privileges) request.session.privileges = [];

    for(let [key, value] of Object.entries(privileges)){
        if(request.session.privileges.includes(key)) continue;

        for(let routeKey in value["routes-access"]){
            if(request.url.startsWith("/" + value["routes-access"][routeKey])){
                if(value["login-route"]){
                    response.redirect("/" + value["login-route"]);
                } else response.redirect("/");
                return;
            }
        }
    }

    next();
});

fs.readdirSync(__dirname + "/routes/").forEach(fileName => require("./routes/" + fileName));

server.get("*", (request, response) => {
    response.render("error");
    response.status(404);
});

server.listen(80);
