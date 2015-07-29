'use strict';

var $ = require('jquery'),
    Q = require('q'),
    _ = require('underscore'),
    PouchDB = require('pouchdb'),
    Backbone = require('backbone'),
    BackbonePouch = require('backbone-pouch'),
    Marionette = require('backbone.marionette');
require('backbone-json-schema');

require('backbone-schema');
var localDB = new PouchDB('_test_db');
var remoteDB = new PouchDB('https://partymarket.cloudant.com/test');

localDB.sync(remoteDB, {
    live: true
}).on('change', function (change) {
    console.log('Change', change);
    // yo, something changed!
}).on('error', function (err) {
    console.error(err);
    //alert();
    // yo, we got an error! (maybe the user went offline?)
});

Backbone.sync = BackbonePouch.sync({
    db: localDB
});

var Model = Backbone.Model.extend({
    idAttribute: '_id',
    initialize: function () {
        console.log('Model Init');
        //alert("Welcome to this world");
    }
});

var PartyEvent = Model.extend({
    schema: {
        nickname: String
        , name: {type: String, required: true}
        , joined: Date
    }
})
//var model = new Model();

//model.save({name: "Mark"}, {
//    success: function(model) {
//        console.log('Suck', model);
//    }
//});

var Collection = Backbone.Collection.extend({
    model: Model,
    pouch: {
        options: {
            allDocs: {
                include_docs: true
            }
        }
    },
    parse: function (result) {
        return result.rows.map(function (row) {
            return row.doc
        })
    }
})

var collection = new Collection();
var model = new collection.model();
collection.fetch({
    success: function (res) {
        console.log('ALLDOCS-------------------', res);
        //t.ok(collection.length > 0, 'There should be at least one doc')
        //t.ok(collection.get(id), 'model included')
        //t.equal(collection.get(id).get('_rev'), rev, 'model should have correct _rev attribute')
        //t.equal(collection.get(id).get('foo'), 'allDocs', 'model should have correct foo attribute')
        //
        //t.end()
    }
})
//model.save({ foo: 'allDocs' }, {
//    success: function(model) {
//        var id = model.id
//        var rev = model.get('_rev')
//
//
//    }
//})


var debug = true;

var allEvents = [];
/**
 * Map holder
 */
var map;

/**
 * Facebook perms
 * @type {string}
 */
var scopeFB = 'user_friends, email, user_events, manage_pages';

/**
 * ID of the Map element
 * @type {string}
 */
var elidMap = "map-canvas",
    /**
     * HTML element for Google Maps
     * @type {Element}
     */
    elMap = document.getElementById(elidMap),

    /**
     * Options for Google Map
     * @type {{zoom: number, center: {lat: number, lng: number}}}
     */
    optMap = {
        zoom: 12,
        center: {lat: 30.2139, lng: -92.0294}
    };

/**
 * Collection promises
 * @param data
 * @returns {*|promise}
 */
function createCollection(data) {
    var deferred = Q.defer();


    return deferred.promise;
}

/**
 *
 * @returns {*|promise}
 */
function login() {
    var deferred = Q.defer();

    /**
     * Facebook Login
     * https://developers.facebook.com/docs/reference/javascript/FB.login/v2.4
     */
    FB.login(function (res) {
        if (res.status == 'connected')
            if (res.authResponse && res.authResponse.userID)
                deferred.resolve(res);
        deferred.reject(res);
    }, {scope: scopeFB});

    return deferred.promise;
}

function checkAuthorization(response) {
    var deferred = Q.defer();

    FB.api('/' + response.authResponse.userID + '/permissions', function (res) {
        deferred.resolve(response);
        console.log('User Permissions', res);

    });

    return deferred.promise;
}
function requestAuthorization() {

}


/**
 *
 * @returns {*|promise}
 */
function getLoginStatus() {
    var deferred = Q.defer();

    FB.getLoginStatus(function (res) {
        // Check login status on load, and if the user is
        // already logged in, go directly to the welcome message.
        if (res.status == 'connected') {
            deferred.resolve(res);
        } else {
            deferred.reject(res);
        }
    });
    return deferred.promise;
}

function fbApi(req, cb) {
    var deferred = Q.defer();
    console.log("fbAPI");
    FB.api(req, function (res) {
        if (res.data.length && res.data.length > 0){
            deferred.resolve(res);
            cb(res);
        } else {
            deferred.reject(res);
        }
    });

    deferred.nodeify(cb);
    return deferred.promise;
}

/**
 *
 * @param response
 */
function getFacebookEvents(response) {
    var deferred = Q.defer();
    checkAuthorization(response).then(function () {

        fbApi('/' + response.authResponse.userID + '/events', function (res) {
            console.log('User Events', res);
            if (res.data.length && res.data.length > 0) {

                res.data.forEach(function (record) {
                    allEvents.push(record);
                    console.log('UserEvent', record);
                    new PartyEvent(record).save(record, {
                        success: function (model) {
                            console.log('UserEventSaved', model);
                        }
                    });
                    if (record.place && record.place.location) {

                        var loc = record.place.location;

                        if (loc.latitude && loc.longitude) {
                            var pos = new google.maps.LatLng(loc.latitude, loc.longitude);
                            new google.maps.Marker({
                                position: pos,
                                map: map,
                                title: record.name
                            });
                            bounds.extend(pos);
                        }
                    }
                });
            }
            var welcomeBlock = document.getElementById('fb-myevents');
            welcomeBlock.innerHTML = 'My Events: ' + res.data.length;
        }, function (err) { console.error(err); })
        .then(function () {
            fbApi('/956681651041128/events', function (res) {
                console.log(res);
                if (res.data.length && res.data.length > 0) {
                    res.data.forEach(function (record) {
                        new PartyEvent(record).save();
                        console.log('PageEvent', record);
                        allEvents.push(record);
                        if (record.place && record.place.location) {
                            var loc = record.place.location;
                            if (loc.latitude && loc.longitude) {
                                var pos = new google.maps.LatLng(loc.latitude, loc.longitude);
                                new google.maps.Marker({
                                    position: pos,
                                    map: map,
                                    title: record.name
                                });
                                bounds.extend(pos);
                            }
                        }
                    });

                }
                var welcomeBlock = document.getElementById('fb-welcome');
                welcomeBlock.innerHTML = 'PartyEvents: ' + res.data.length;
                deferred.resolve(allEvents);
            })
        });
    });
    return deferred.promise;
}

/**
 *
 * @param res
 */
function log(res) {
    console.log("Loggggeeer", res);
}

/**
 *
 * @returns {*|promise}
 */
function initFacebook() {
    var deferred = Q.defer();

    FB.init({
        appId: '124709774536650',
        xfbml: true,
        version: 'v2.4'
    });

    getLoginStatus()
        .then(getFacebookEvents, login, log)
        .then(function (myEvents) {
            var list = new Backbone.Collection(allEvents);

            (new ListView({
                collection: list,
                el: 'main'
            })).render();
        });

    return deferred.promise;
}

/**
 * First time load of Google Maps
 * @param opts
 */
function initGoogleMaps() {
    //TODO: Zoom based on Geoloc
    map = new google.maps.Map(elMap, optMap);
}

/**
 * Listen to shiz
 */
function initAppListeners() {
    //Load Maps
    google.maps.event.addDomListener(window, 'load', initGoogleMaps);
    window.fbAsyncInit = initFacebook;
}

//Init the app!!
initAppListeners();


var SingleLink = Marionette.ItemView.extend({
    tagName: "li",
    template: _.template("<a href='<%-path%>'><%-path%></a>")
});

var ListView = Marionette.CollectionView.extend({
    tagName: 'ul',
    childView: SingleLink
});

//var list = new Backbone.Collection([
//    {path: 'http://google.com'},
//    {path: 'http://mojotech.com'},
//]);
//
//(new ListView({
//    collection: list,
//    el: 'main'
//})).render();

var bounds = new google.maps.LatLngBounds();

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

