

/*<div class="section group">
    <div class="col_1_of_3 span_1_of_3">
        <div class="eventGUID">-LEJHlGcTJPCaWhc9vJ_</div>
        <a href="https://www.meetup.com/full-stack-developer-il/events/248953340" target="_blank">
            <img src="https://secure.meetupstatic.com/photos/event/e/9/4/5/highres_471539717.jpeg">
        </a>
        <ul class="m_fb">
            <li>
                <span class="m_23">
                    <i>
                        <img width="30" src="images/food.png">
                    </i>
                </span>
                <span class="m_22 favorite">
                    <div class="star glyphicon glyphicon-star"></div>
                </span>
            </li>
        </ul>
        <div class="desc">
            <h4 class="m_2">24-Jun-2018</h4>
            <h3>
                <a href="https://www.meetup.com/full-stack-developer-il/events/248953340" target="_blank">Developing a Webcam Arcade Controller using DL</a>
            </h3>
            <p>Are you a developer that is continually hearing about Deep Learning and wondering what all the fuss
                is about?</p>
            <p>1.3 km</p>
        </div>
        <div class="hr"></div>
        <div class="section group center" style="padding: 0% 0% 2% 3%;">
            <label class="btn myBtn popup" style="margin-right: 10px" onclick="openSharePopup(this.children[1])">
                <img src="images/share.png" class="img-thumbnail" style="border:0;opacity: 0.5;">
                <span class="popuptext">
                    <a href="https://twitter.com/intent/tweet?text=www.ynet.co.il" target="_blank" class="fa fa-twitter"></a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=www.ynet.co.il" target="_blank" class="fa fa-facebook"></a>
                    <a href="https://api.whatsapp.com/send?text=www.ynet.co.il" target="_blank" class="fa fa-whatsapp"></a>
                </span>
            </label>
            <label class="btn myBtn" style="margin-right: 10px" onclick="showMap('!1m18!1m12!1m3!1d3380.9692511188787!2d34.79414459999999!3d32.0700804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d4b9f0fb1749d%3A0x324efdf94c60554b!2z15nXkteQ15wg15DXnNeV158gOTgsINeq15wg15DXkdeZ15Eg15nXpNeV!5e0!3m2!1siw!2sil!4v1528958580653');return false;">
                <img src="images/map.png" class="img-thumbnail" style="border:0;opacity: 0.5;">
            </label>
        </div>
    </div>
    <div class="clear"></div>
</div>*/
var mode = "desktop";
var selectedSort = "Date";
var foodFilterChecked;
var hqFilterChecked;
var filter90Checked;
var editorChoiceFilterChecked;
var allFilterChecked = true;
var myCurrentLocation;
var map;
var markers = [];
var service;
var wrap = document.getElementsByClassName("wrap")[2];
var allEvents = [];
var favoritesEventsGUIDs = [];
var favoritesEvents = [];
var filteredEvents = [];
setDisplayMode();
start();
var selectedTab = "eventsTab";
function start() {

    var config = {
        apiKey: "AIzaSyDn2VWzzsZBK_q-VwEk0FksBW-z0MNE17Q",
        authDomain: "tlfree-4b9bf.firebaseapp.com",
        databaseURL: "https://tlfree-4b9bf.firebaseio.com",
        projectId: "tlfree-4b9bf"
    };

    firebase.initializeApp(config);
    firebase.auth().signInAnonymously().catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
    });


}
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        var ref = firebase.database().ref('db_tlfree');
        var currentDate = new Date(Date.now());
        currentDate = currentDate.getFullYear() + addZeroBeforeNumberIfNecessary(currentDate.getMonth() + 1) + addZeroBeforeNumberIfNecessary(currentDate.getDate());

        ref.orderByChild('full_date').startAt(currentDate).once("value", function (snapshot) {
            var result = snapshot.val();
            $.each(result, (k, v) => {
                var date = getFormatedDate(v.full_date);
                var event = {
                    guid: k, title: v.title, banner_uri: v.banner_uri,
                    date: date, message_text: v.message_text, link_value: v.link_value,
                    label: v.labels, labels: setLabels(v.labels), location: {
                        distance: "", address: v.location.address,
                        latitude: v.location.latitude, longtitude: v.location.longtitude
                    }
                };
                allEvents.push(event);

            });
            sortEvents(allEvents);
            initFavorites();
            initFilteredEvents();
            //createEvents(allEvents);
            tryGeolocation();
        }, function (error) {
            console.log("Error: " + error.code);
        });

    } else {
        // User is signed out.
        // ...
    }
    // ...
});
function sortChanged(option) {
    selectedSort = $(option).find("option:selected").text();
    if (selectedSort == "Distance") {
        sortEvents = sortEventByDistance;
    }
    else if (selectedSort == "Publish") {
        sortEvents = sortEventByPublishDate;
    }
    else if (selectedSort == "Date") {
        sortEvents = sortEventsByDate;
    }
    sortEvents(filteredEvents);
    if (selectedTab != "mapTab") {
        createEvents(filteredEvents);
    }

}
var sortEvents = sortEventsByDate;
function sortEventsByDate(events) {
    events.sort(function (a, b) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
}
function sortEventByPublishDate(events) {
    events.sort(function (a, b) { return (a.guid > b.guid) ? -1 : ((b.guid > a.guid) ? 1 : 0); });
}
function sortEventByDistance(events) {
    events.sort(function (a, b) {
        var numA = isNaN(parseFloat(a.location.distance)) ? 1000 : parseFloat(a.location.distance);
        var numB = isNaN(parseFloat(b.location.distance)) ? 1000 : parseFloat(b.location.distance);
        return numA - numB;
    });
}
function setLabels(label) {
    var labels = [];
    if (label == 1) {
        labels = [1];
    }
    else if (label == 2) {
        labels = [2];
    }
    else if (label == 3) {
        labels = [1, 2];
    }
    else if (label == 4) {
        labels = [4];
    }
    else if (label == 6) {
        labels = [2, 4];
    }
    else if (label == 8) {
        labels = [8];
    }
    else if (label == 9) {
        labels = [1, 8];
    }
    else if (label == 10) {
        labels = [2, 8];
    }
    else if (label == 11) {
        labels = [1, 2, 8];
    }
    return labels;
}
function getFormatedDate(date) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];
    // var month = date.toString().split(' ')[1];
    // var dayNumber = date.toString().split(' ')[2];
    // var year = date.toString().split(' ')[3];
    // return dayNumber + " " + month + " " + year;
    //var date = v.full_date;
    var year = date.substring(0, 4);
    var month = date.substring(6, 4);
    var day = date.substring(8, 6);
    date = day + " " + monthNames[parseInt(month) - 1] + " " + year;
    return date;
}
function filterChanged() {
    showFilterBar(true);
    var iconFilterSelected = false;
    filteredEvents = [];
    var searchTerm = document.getElementById("searchinput").value.toUpperCase();
    var selectedDate = document.getElementById("calendar").value;

    var labels = [];
    if (foodFilterChecked) {
        labels.push(1);
        iconFilterSelected = true;
    }
    if (hqFilterChecked) {
        labels.push(2);
        iconFilterSelected = true;
    }
    if (filter90Checked) {
        labels.push(4);
        iconFilterSelected = true;
    }
    if (editorChoiceFilterChecked) {
        labels.push(8);
        iconFilterSelected = true;
    }
    if (allFilterChecked) {
        iconFilterSelected = true;
    }
    if (selectedTab == "favoritesTab") {
        addEventsToFilteredList(favoritesEvents, selectedDate, searchTerm, filteredEvents, labels, iconFilterSelected);
    }
    else {
        addEventsToFilteredList(allEvents, selectedDate, searchTerm, filteredEvents, labels, iconFilterSelected);
    }

    sortEvents(filteredEvents);

    if (selectedTab == "mapTab") {
        removeMarkers();
        addMarkers();
        document.getElementById("selectedPinEvent").innerHTML = "";
    }
    else {
        createEvents(filteredEvents);
    }
}
function addEventsToFilteredList(events, selectedDate, searchTerm, filteredEvents, labels, iconFilterSelected) {
    events.forEach(event => {
        if (iconFilterSelected) {
            if (event.title.toUpperCase().indexOf(searchTerm) > -1
                || event.message_text.toUpperCase().indexOf(searchTerm) > -1) {
                if (labels.some(label => event.labels.includes(label)) || labels.length == 0) {
                    if (selectedDate != "") {
                        var selectedDateFormated = getFormatedDate(selectedDate.replace(/-/g, ''));
                        if (event.date == selectedDateFormated) {
                            filteredEvents.push(event);
                        }
                    }
                    else {
                        filteredEvents.push(event);
                    }
                }
            }
        }
    });
}

function createPhotos() {
    var token = '7827332378.967b255.d814bd12122c47e1b4455ba6bf20810e'; // learn how to obtain it below
    var userid = 7827332378; // User ID - get it in source HTML of your Instagram profile or look at the next example :)
    var num_photos = 20; // how much photos do you want to get
    wrap.innerHTML = "";
    $.ajax({
        url: 'https://api.instagram.com/v1/users/' + userid + '/media/recent', // or /users/self/media/recent for Sandbox
        dataType: 'jsonp',
        type: 'GET',
        data: { access_token: token, count: num_photos },
        success: function (data) {

            var itemsCounter = 0;
            var sectionGroup;
            data.data.forEach(item => {
                if (itemsCounter % 4 == 0) {
                    sectionGroup = document.createElement("div");
                    sectionGroup.setAttribute("calss", "section group");
                    wrap.appendChild(sectionGroup);
                    clear = document.createElement("div");
                    clear.setAttribute("class", "clear");
                    wrap.appendChild(clear);
                }
                var eventCard = document.createElement("div");
                eventCard.setAttribute("class", "col_1_of_4 span_1_of_4");
                var a = document.createElement("a");
                a.href = item.link;
                a.target = "_blank";

                eventCard.appendChild(a);
                if (item.carousel_media === undefined) {
                    var img = document.createElement("img");
                    img.src = item.images.low_resolution.url;
                    a.appendChild(img);
                }
                else {
                    var carousel = document.createElement("div");
                    carousel.setAttribute("id", "myCarousel_" + item.id);
                    carousel.setAttribute("class", "carousel slide");
                    carousel.setAttribute("data-ride", "carousel");

                    var ol = document.createElement("ol");
                    ol.setAttribute("class", "carousel-indicators");
                    var carouselInner = document.createElement("div");
                    carouselInner.setAttribute("class", "carousel-inner");
                    var couner = 0;

                    item.carousel_media.forEach(media => {
                        if (media !== undefined) {
                            var li = document.createElement("li");
                            li.setAttribute("data-target", "#myCarousel_" + item.id);
                            li.setAttribute("data-slide-to", couner);
                            var item1 = document.createElement("div");
                            if (media.images !== undefined) {
                                var img = document.createElement("img");
                                img.setAttribute("src", media.images.low_resolution.url);
                                item1.appendChild(img);
                            }
                            else if (media.videos !== undefined) {
                                var video = document.createElement("video");
                                video.setAttribute("height", "247px");
                                video.setAttribute("controls", "");
                                var source = document.createElement("source");
                                source.setAttribute("src", media.videos.low_resolution.url);
                                source.setAttribute("type", "video/mp4");
                                video.appendChild(source);
                                item1.appendChild(video);
                            }
                            if (couner == 0) {
                                item1.setAttribute("class", "item active");
                                li.setAttribute("class", "active");
                            }
                            else {
                                item1.setAttribute("class", "item");
                            }
                            ol.appendChild(li);
                            carouselInner.appendChild(item1);
                        }

                        couner++;
                    });

                    var leftCarouselControl = document.createElement("a");
                    leftCarouselControl.setAttribute("class", "left carousel-control");
                    leftCarouselControl.setAttribute("href", "#myCarousel_" + item.id);
                    leftCarouselControl.setAttribute("data-slide", "prev");
                    var span = document.createElement("span");
                    span.setAttribute("class", "glyphicon glyphicon-chevron-left");
                    leftCarouselControl.appendChild(span);
                    span = document.createElement("span");
                    span.setAttribute("class", "sr-only");
                    span.innerHTML = "Previous";
                    leftCarouselControl.appendChild(span);
                    var rightCarouselControl = document.createElement("a");
                    rightCarouselControl.setAttribute("class", "right carousel-control");
                    rightCarouselControl.setAttribute("href", "#myCarousel_" + item.id);
                    rightCarouselControl.setAttribute("data-slide", "next");
                    var span = document.createElement("span");
                    span.setAttribute("class", "glyphicon glyphicon-chevron-right");
                    rightCarouselControl.appendChild(span);
                    span = document.createElement("span");
                    span.setAttribute("class", "sr-only");
                    span.innerHTML = "Next";
                    rightCarouselControl.appendChild(span);

                    a = document.createElement("a");
                    a.href = item.link;
                    a.target = "_blank";
                    a.appendChild(ol);
                    a.appendChild(carouselInner);

                    carousel.appendChild(a);
                    carousel.appendChild(leftCarouselControl);
                    carousel.appendChild(rightCarouselControl);
                    eventCard.appendChild(carousel);
                }




                var desc = document.createElement("div");
                desc.setAttribute("class", "desc");
                var h4 = document.createElement("h4");
                h4.setAttribute("class", "m_2");
                h4.innerHTML = convertFromTimestmapToDate(item.created_time);
                var p = document.createElement("p");
                p.setAttribute("style", "word-wrap: break-word;");
                p.innerHTML = item.caption.text;
                desc.appendChild(h4);
                desc.appendChild(p);
                eventCard.appendChild(desc);

                var hr = document.createElement("div");
                hr.setAttribute("class", "hr");
                eventCard.appendChild(hr);

                var div = document.createElement("div");
                div.setAttribute("class", "section group center");
                div.setAttribute("style", "padding: 0% 0% 2% 3%;");
                var label = document.createElement("label");
                label.setAttribute("class", "btn myBtn popup");
                label.setAttribute("style", "margin-right: 10px");
                label.setAttribute("title", "Share");
                label.setAttribute("onclick", "openSharePopup(this.children[1])");
                var img = document.createElement("img");
                img.src = "images/share.png";
                img.setAttribute("class", "img-thumbnail");
                img.setAttribute("style", "border:0;opacity: 0.5;");
                var span = document.createElement("span");
                span.setAttribute("class", "popuptext");
                a = document.createElement("a");
                a.href = "https://twitter.com/intent/tweet?text=" + item.link;
                a.target = "_blank";
                a.setAttribute("class", "fa fa-twitter");
                span.appendChild(a);
                a = document.createElement("a");
                a.href = "https://www.facebook.com/sharer/sharer.php?u=" + item.link;
                a.target = "_blank";
                a.setAttribute("class", "fa fa-facebook");
                span.appendChild(a);
                a = document.createElement("a");
                a.href = "https://api.whatsapp.com/send?text=" + item.link;
                a.target = "_blank";
                a.setAttribute("class", "fa fa-whatsapp");
                span.appendChild(a);
                label.appendChild(img);
                label.appendChild(span);
                div.appendChild(label);
                if (item.location != null) {
                    label = document.createElement("label");
                    label.setAttribute("class", "btn myBtn");
                    label.setAttribute("style", "margin-right: 10px");
                    label.setAttribute("onclick", "showMap('" + item.location.name + "')");
                    label.setAttribute("title", item.location.name);
                    label.setAttribute("data-toggle", "modal");
                    label.setAttribute("data-target", "#mapModal");
                    img = document.createElement("img");
                    img.src = "images/map.png";
                    img.setAttribute("class", "img-thumbnail");
                    img.setAttribute("style", "border:0;opacity: 0.5;");
                    label.appendChild(img);
                    div.appendChild(label);
                }
                eventCard.appendChild(div);
                sectionGroup.appendChild(eventCard);
                itemsCounter++;
            });
        },
        error: function (data) {
            console.log(data); // send the error notifications to console
        }
    });
}

function convertFromTimestmapToDate(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = date + ' ' + month + ' ' + year;
    return time;
}

function createEvents(events) {
    var itemsCounter = 0;
    wrap.innerHTML = "";
    var sectionGroup;
    events.forEach(event => {
        if (itemsCounter % 3 == 0) {
            sectionGroup = document.createElement("div");
            sectionGroup.setAttribute("calss", "section group");
            wrap.appendChild(sectionGroup);
            clear = document.createElement("div");
            clear.setAttribute("class", "clear");
            wrap.appendChild(clear);
        }
        var eventCard = document.createElement("div");
        eventCard.setAttribute("class", "col_1_of_3 span_1_of_3");
        var div = document.createElement("div");
        div.setAttribute("class", "eventGUID");
        div.innerHTML = event.guid;
        eventCard.appendChild(div);
        var a = document.createElement("a");
        a.href = event.link_value;
        a.target = "_blank";
        a.setAttribute("rel", "no-refresh");
        var img = document.createElement("img");
        img.src = event.banner_uri;
        img.setAttribute("onerror", "this.src='images/tlfree feature graphic - transparent.png';this.style='opacity: 0.5';");
        a.appendChild(img)
        eventCard.appendChild(a);

        if (event.label != 0) {
            var ul = document.createElement("ul");
            ul.setAttribute("class", "m_fb");
            var li = document.createElement("li");

            var span = document.createElement("span");
            span.setAttribute("class", "m_23");
            var i = document.createElement("i");
            var img = document.createElement("img");
            img.width = "30";
            i.appendChild(img);
            span.appendChild(i);
            li.appendChild(span);
            if (event.label == 1) {
                img.src = "images/food.png";
            }
            else if (event.label == 2) {
                img.src = "images/hq.png";
            }
            else if (event.label == 3) {
                img.src = "images/hq.png";
                li.appendChild(span);

                span = document.createElement("span");
                span.setAttribute("class", "m_23");
                i = document.createElement("i");
                img = document.createElement("img");
                img.src = "images/food.png";
                img.width = "30";
                i.appendChild(img);
                span.appendChild(i);
                li.appendChild(span);
            }
            else if (event.label == 4) {
                img.src = "images/ic_90_percent_discount.png";
            }
            else if (event.label == 6) {
                img.src = "images/hq.png";
                li.appendChild(span);
                span = document.createElement("span");
                span.setAttribute("class", "m_23");
                i = document.createElement("i");
                img = document.createElement("img");
                img.src = "images/ic_90_percent_discount.png";
                img.width = "30";
                i.appendChild(img);
                span.appendChild(i);
                li.appendChild(span);
            }
            else if (event.label == 8) {
                img.src = "images/ic_editors_choice.png";
            }
            else if (event.label == 9) {
                img.src = "images/food.png";
                li.appendChild(span);

                span = document.createElement("span");
                span.setAttribute("class", "m_23");
                i = document.createElement("i");
                img = document.createElement("img");
                img.src = "images/ic_editors_choice.png";
                img.width = "30";
                i.appendChild(img);
                span.appendChild(i);
                li.appendChild(span);
            }
            else if (event.label == 10) {
                img.src = "images/hq.png";
                li.appendChild(span);

                span = document.createElement("span");
                span.setAttribute("class", "m_23");
                i = document.createElement("i");
                img = document.createElement("img");
                img.src = "images/ic_editors_choice.png";
                img.width = "30";
                i.appendChild(img);
                span.appendChild(i);
                li.appendChild(span);
            }
            else if (event.label == 11) {
                img.src = "images/hq.png";
                li.appendChild(span);

                span = document.createElement("span");
                span.setAttribute("class", "m_23");
                i = document.createElement("i");
                img = document.createElement("img");
                img.src = "images/food.png";
                img.width = "30";
                i.appendChild(img);
                span.appendChild(i);
                li.appendChild(span);

                span = document.createElement("span");
                span.setAttribute("class", "m_23");
                i = document.createElement("i");
                img = document.createElement("img");
                img.src = "images/ic_editors_choice.png";
                img.width = "30";
                i.appendChild(img);
                span.appendChild(i);
                li.appendChild(span);
            }


            span = document.createElement("span");
            span.setAttribute("class", "m_22 favorite");
            var div = document.createElement("div");
            div.setAttribute("Title", "Favorites");
            if (favoritesEventsGUIDs.indexOf(event.guid) > -1) {
                div.setAttribute("class", "star glyphicon glyphicon-star");
            }
            else {
                div.setAttribute("class", "star glyphicon glyphicon-star-empty");
            }
            span.appendChild(div);
            li.appendChild(span);
            ul.appendChild(li);
            eventCard.appendChild(ul);
        }

        var desc = document.createElement("div");
        desc.setAttribute("class", "desc");
        var h3 = document.createElement("h3");
        h3.setAttribute("class", isRTL(event.title) ? "rtl" : "");
        a = document.createElement("a");
        a.href = event.link_value;
        a.target = "_blank";
        a.innerHTML = event.title;
        a.setAttribute("rel", "no-refresh");
        var p = document.createElement("p");
        p.setAttribute("class", isRTL(event.message_text) ? "rtl" : "");
        p.innerHTML = event.message_text;
        p.attributes
        h3.appendChild(a);
        var h4 = document.createElement("h4");
        h4.setAttribute("class", "m_2");
        h4.innerHTML = event.date;
        desc.appendChild(h4);
        desc.appendChild(h3);
        desc.appendChild(p);
        if (event.location.distance != "") {
            p = p = document.createElement("p");
            p.innerHTML = event.location.distance;
            desc.appendChild(p);
        }
        eventCard.appendChild(desc);
        var hr = document.createElement("hr");
        hr.setAttribute("class", "hr");
        eventCard.appendChild(hr);
        div = document.createElement("div");
        div.setAttribute("class", "section group center");
        div.setAttribute("style", "padding: 0% 0% 2% 3%");

        var label = document.createElement("label");
        label.setAttribute("class", "btn myBtn popup");
        label.setAttribute("style", "margin-right: 10px");
        label.setAttribute("title", "Share");
        label.setAttribute("onclick", "openSharePopup(this.children[1])");
        img = document.createElement("img");
        img.src = "images/share.png";
        img.setAttribute("class", "img-thumbnail");
        img.setAttribute("style", "border:0;opacity: 0.5");
        span = document.createElement("span");
        span.setAttribute("class", "popuptext");
        a = document.createElement("a");
        a.setAttribute("class", "fa fa-twitter");
        a.setAttribute("href", "https://twitter.com/intent/tweet?text=" + event.title + " : " + event.link_value);
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "no-refresh");
        span.appendChild(a);
        a = document.createElement("a");
        a.setAttribute("class", "fa fa-facebook");
        a.setAttribute("href", "https://www.facebook.com/sharer/sharer.php?u=" + event.link_value);
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "no-refresh");
        span.appendChild(a);
        a = document.createElement("a");
        a.setAttribute("class", "fa fa-whatsapp");
        a.setAttribute("href", "https://api.whatsapp.com/send?text=" + event.link_value);
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "no-refresh");
        span.appendChild(a);
        label.appendChild(img);
        label.appendChild(span);
        div.appendChild(label);
        if (event.location.address != "") {
            label = document.createElement("label");
            label.setAttribute("class", "btn myBtn");
            label.setAttribute("style", "margin-right: 10px");
            label.setAttribute("onclick", "showMap('" + event.location.address + "');return false;");
            label.setAttribute("title", event.location.address);
            label.setAttribute("data-toggle", "modal");
            label.setAttribute("data-target", "#mapModal");
            img = document.createElement("img");
            img.src = "images/map.png";
            img.setAttribute("class", "img-thumbnail");
            img.setAttribute("style", "border:0;opacity: 0.5;");
            label.appendChild(img);
            div.appendChild(label);
        }
        label = document.createElement("label");
        label.setAttribute("class", "btn myBtn");
        label.setAttribute("style", "margin-right: 10px");
        label.setAttribute("onclick", "window.open('https://calendar.google.com/calendar/r/eventedit?text=" + event.title + "&dates=" + getFormatedDatesForGoogleCalendar(event.date) + "&details=" + event.message_text + " " + event.link_value + "&location=" + event.location.address + "', '_blank');");
        label.setAttribute("title", "Add to Google Calendar");
        img = document.createElement("img");
        img.src = "images/calendar.png";
        img.setAttribute("class", "img-thumbnail");
        img.setAttribute("style", "border:0;opacity: 0.5;");
        label.appendChild(img);
        div.appendChild(label);

        eventCard.appendChild(div);
        sectionGroup.appendChild(eventCard);
        itemsCounter++;
    });

    favoriteClicked();


}
function getFormatedDatesForGoogleCalendar(date) {
    date = new Date(date);
    date = date.getFullYear() + addZeroBeforeNumberIfNecessary(date.getMonth() + 1) + addZeroBeforeNumberIfNecessary(date.getDate());
    date += "T150000Z/" + date + "T160000Z";
    return date;
}
function addZeroBeforeNumberIfNecessary(number) {
    return number < 10 ? '0' + number : '' + number; // ('' + month) for string result
} function addZeroBeforeNumberIfNecessary(number) {
    return number < 10 ? '0' + number : '' + number; // ('' + month) for string result
}
function favoriteClicked() {
    $(".star.glyphicon").click(function () {
        var eventGUID = $(this).parent().parent().parent().parent().children()[0].innerHTML;
        //add to favorite
        if ($(this)[0].getAttribute("class") == "star glyphicon glyphicon-star-empty") {
            favoritesEventsGUIDs.push(eventGUID);
        }
        //remove from favorites
        else {
            var index = favoritesEventsGUIDs.indexOf(eventGUID);
            if (index > -1) {
                favoritesEventsGUIDs.splice(index, 1);
            }
        }
        localStorage.setItem("favorites", JSON.stringify(favoritesEventsGUIDs));
        $(this).toggleClass("glyphicon-star glyphicon-star-empty");

    });
}
function initFavorites() {
    var favorites = localStorage.getItem("favorites");
    if (favorites != null) {
        favorites = JSON.parse(favorites);
        allEvents.forEach(event => {
            if (favorites.indexOf(event.guid) > -1) {
                favoritesEventsGUIDs.push(event.guid);
            }
        });
    }
}
function initFilteredEvents() {
    allEvents.forEach(event => {
        filteredEvents.push(event);

    });
}
function favoritesTab() {
    selectedTab = "favoritesTab";
    favoritesEvents = [];

    allEvents.forEach(event => {
        if (favoritesEventsGUIDs.indexOf(event.guid) > -1) {
            favoritesEvents.push(event);
        }
    });
    filterChanged();
    createEvents(filteredEvents);
}
function eventsTab() {
    selectedTab = "eventsTab";
    filterChanged();
    createEvents(filteredEvents);
}
function mapTab() {
    selectedTab = "mapTab";

    wrap.innerHTML = "";
    var raw = document.createElement("div");
    raw.setAttribute("class", "raw");
    var div = document.createElement("div");
    div.setAttribute("class", "col-sm-8");
    div.style.height = "600px";
    raw.appendChild(div);

    var mapDiv = document.createElement("div");
    mapDiv.setAttribute("id", "map");
    map = new google.maps.Map(mapDiv, {
        center: { lat: 32.069396, lng: 34.7869129 },
        zoom: 13.5
    });

    div.appendChild(mapDiv);
    div = document.createElement("div");
    div.setAttribute("class", "col-sm-4");
    div.setAttribute("id", "selectedPinEvent");
    raw.appendChild(div);
    div = document.createElement("div");
    div.setAttribute("class", "clear");
    raw.appendChild(div);
    wrap.appendChild(raw);

    filterChanged();
}
function photosTab() {
    selectedTab = "photosTab";
    showFilterBar(false);

    createPhotos();
}
function showFilterBar(show) {
    if (show == true) {
        document.getElementsByClassName('content-box-right')[0].style.display = 'block';
        if (mode == "mobile") {
            $('#accordion').css("display", "block");
        }
    }
    else {
        document.getElementsByClassName('content-box-right')[0].style.display = 'none';
        if (mode == "mobile") {
            $('#accordion').css("display", "none");
        }
    }
}
function clearFilters() {
    $("#searchinput").val('');
    document.getElementById("calendar").value = "";
}
function showMap(address) {
    var src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDdZD0Rsf1mCKYSh1Xu9I1d3uNIZM2hNEo&q=" + address;
    var googleMapsWindow = document.getElementById("googleMapsWindow");
    googleMapsWindow.src = src;
}

var apiGeolocationSuccess = function (position) {
    console.log("API geolocation success!\n\nlat = " + position.coords.latitude + "\nlng = " + position.coords.longitude);
    var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    myCurrentLocation = new google.maps.LatLng(pos.lat, pos.lng);
    service = new google.maps.DistanceMatrixService();
    setDistancesFromCurrentLocation(allEvents);
};

var tryAPIGeolocation = function () {
    $.post("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCLpwoJVhKa1uYUmnBIcM1-lRf7w0akIHY", function (success) {
        apiGeolocationSuccess({ coords: { latitude: success.location.lat, longitude: success.location.lng } });
    })
        .fail(function (err) {
            console.log("API Geolocation error! \n\n" + err);
            createEvents(allEvents);
        });
};

var browserGeolocationSuccess = function (position) {
    //alert("Browser geolocation success!\n\nlat = " + position.coords.latitude + "\nlng = " + position.coords.longitude);
    var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    myCurrentLocation = new google.maps.LatLng(pos.lat, pos.lng);
    service = new google.maps.DistanceMatrixService();
    setDistancesFromCurrentLocation(allEvents);
};

var browserGeolocationFail = function (error) {
    switch (error.code) {
        case error.TIMEOUT:
            console.log("Browser geolocation error !\n\nTimeout.");
            createEvents(allEvents);
            break;
        case error.PERMISSION_DENIED:
            if (error.message.indexOf("Only secure origins are allowed") == 0) {
                tryAPIGeolocation();
            }
            else if (error.message.indexOf("User denied Geolocation") == 0) {
                createEvents(allEvents);
            }
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Browser geolocation error !\n\nPosition unavailable.");
            createEvents(allEvents);
            break;
    }
};

var tryGeolocation = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            browserGeolocationSuccess,
            browserGeolocationFail,
            { maximumAge: 50000, timeout: 20000, enableHighAccuracy: true });
    }
};

//tryGeolocation();


function setCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            myCurrentLocation = new google.maps.LatLng(pos.lat, pos.lng);
            service = new google.maps.DistanceMatrixService();
            setDistancesFromCurrentLocation(allEvents);
        }, function (error) {
            //if (error.message == "User denied Geolocation") {
            createEvents(allEvents);
            //}
        });

    }
}
function setDistancesFromCurrentLocation(allEvents) {
    var counter = 0;
    var numberOfEvents = allEvents.length;
    allEvents.forEach(event => {
        var address = event.location.address;
        if (address != "") {
            var destination = new google.maps.LatLng(event.location.latitude, event.location.longtitude);
            service.getDistanceMatrix(
                {
                    origins: [myCurrentLocation],
                    destinations: [destination],
                    travelMode: 'WALKING',
                }, function (response, status) {
                    if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                        console.log("OVER_QUERY_LIMIT");
                        //There is a limit of 40 calls
                    }
                    else if (status == google.maps.GeocoderStatus.OK && response.rows[0].elements[0].status != "ZERO_RESULTS") {
                        try {
                            var distance = response.rows[0].elements[0].distance.text;
                            event.location.distance = distance;
                        }
                        catch (err) {
                            console.log("error " + err + ". Event guid : " + event.guid);
                        }
                    }
                    else {
                        console.log("Error while trying to get distance. " + status + ". Event guid : " + event.guid);
                    }
                    counter++;
                    if (counter == numberOfEvents) {
                        createEvents(allEvents);
                    }
                });
        }
        else {
            counter++;
            if (counter == numberOfEvents) {
                createEvents(allEvents);
            }
        }
    });
}
function addMarkers() {
    filteredEvents.forEach(event => {
        if (event.location.address != "") {
            addMarker(event);
        }
    });
}
var addMarker = function (event) {
    var marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(event.location.latitude, event.location.longtitude),
        title: event.title,
        icon: 'images/pin.png',
        animation: google.maps.Animation.DROP,
        draggable: false,
        event: event
    });

    google.maps.event.addListener(marker, 'click', function () {
        var event = marker.event;

        var sectionGroup = document.createElement("div");
        sectionGroup.setAttribute("calss", "section group");

        var eventCard = document.createElement("div");
        eventCard.setAttribute("class", "col_1_of_3");
        eventCard.setAttribute("style", "background:white");
        var div = document.createElement("div");
        div.setAttribute("class", "eventGUID");
        div.innerHTML = event.guid;
        eventCard.appendChild(div);
        var img = document.createElement("img");
        img.src = event.banner_uri;
        img.setAttribute("onerror", "this.src='images/tlfree feature graphic - transparent.png';this.style='opacity: 0.5';");
        var a = document.createElement("a");
        a.href = event.link_value;
        a.target = "_blank";
        a.setAttribute("rel", "no-refresh");
        a.appendChild(img)
        eventCard.appendChild(a);

        if (event.label != 0) {
            var ul = document.createElement("ul");
            ul.setAttribute("class", "m_fb");
            var li = document.createElement("li");

            var span = document.createElement("span");
            span.setAttribute("class", "m_23");
            var i = document.createElement("i");
            var img = document.createElement("img");
            img.width = "30";
            i.appendChild(img);
            span.appendChild(i);
            li.appendChild(span);
            if (event.label == 1) {
                img.src = "images/food.png";
            }
            else if (event.label == 2) {
                img.src = "images/hq.png";
            }
            else if (event.label == 3) {
                img.src = "images/hq.png";
                li.appendChild(span);

                span = document.createElement("span");
                span.setAttribute("class", "m_23");
                i = document.createElement("i");
                img = document.createElement("img");
                img.src = "images/food.png";
                img.width = "30";
                i.appendChild(img);
                span.appendChild(i);
                li.appendChild(span);
            }
            else if (event.label == 4) {
                img.src = "images/ic_90_percent_discount.png";
            }
            else if (event.label == 6) {
                img.src = "images/hq.png";
                li.appendChild(span);
                span = document.createElement("span");
                span.setAttribute("class", "m_23");
                i = document.createElement("i");
                img = document.createElement("img");
                img.src = "images/ic_90_percent_discount.png";
                img.width = "30";
                i.appendChild(img);
                span.appendChild(i);
                li.appendChild(span);
            }
            else if (event.label == 8) {
                img.src = "images/ic_editors_choice.png";
            }
            else if (event.label == 9) {
                img.src = "images/food.png";
                li.appendChild(span);

                span = document.createElement("span");
                span.setAttribute("class", "m_23");
                i = document.createElement("i");
                img = document.createElement("img");
                img.src = "images/ic_editors_choice.png";
                img.width = "30";
                i.appendChild(img);
                span.appendChild(i);
                li.appendChild(span);
            }
            else if (event.label == 10) {
                img.src = "images/hq.png";
                li.appendChild(span);

                span = document.createElement("span");
                span.setAttribute("class", "m_23");
                i = document.createElement("i");
                img = document.createElement("img");
                img.src = "images/ic_editors_choice.png";
                img.width = "30";
                i.appendChild(img);
                span.appendChild(i);
                li.appendChild(span);
            }
            else if (event.label == 11) {
                img.src = "images/ic_editors_choice.png";
            }
            span = document.createElement("span");
            span.setAttribute("class", "m_22 favorite");
            var div = document.createElement("div");
            div.setAttribute("Title", "Favorites");
            if (favoritesEventsGUIDs.indexOf(event.guid) > -1) {
                div.setAttribute("class", "star glyphicon glyphicon-star");
            }
            else {
                div.setAttribute("class", "star glyphicon glyphicon-star-empty");
            }
            span.appendChild(div);
            li.appendChild(span);
            ul.appendChild(li);
            eventCard.appendChild(ul);
        }
        var desc = document.createElement("div");
        desc.setAttribute("class", "desc");
        var h3 = document.createElement("h3");
        h3.setAttribute("class", isRTL(event.title) ? "rtl" : "");
        a = document.createElement("a");
        a.href = event.link_value;
        a.target = "_blank";
        a.setAttribute("rel", "no-refresh");
        a.innerHTML = event.title;
        var p = document.createElement("p");
        p.setAttribute("class", isRTL(event.message_text) ? "rtl" : "");
        p.innerHTML = event.message_text;
        h3.appendChild(a);
        var h4 = document.createElement("h4");
        h4.setAttribute("class", "m_2");
        h4.innerHTML = event.date;
        desc.appendChild(h4);
        desc.appendChild(h3);
        desc.appendChild(p);
        if (event.location.distance != "") {
            p = p = document.createElement("p");
            p.innerHTML = event.location.distance;
            desc.appendChild(p);
        }
        eventCard.appendChild(desc);

        var hr = document.createElement("hr");
        hr.setAttribute("class", "hr");
        eventCard.appendChild(hr);
        div = document.createElement("div");
        div.setAttribute("class", "section group center");
        div.setAttribute("style", "padding: 0% 0% 2% 3%");
        var label = document.createElement("label");
        label.setAttribute("class", "btn myBtn popup");
        label.setAttribute("style", "margin-right: 10px");
        label.setAttribute("title", "Share");
        label.setAttribute("onclick", "openSharePopup(this.children[1])");
        img = document.createElement("img");
        img.src = "images/share.png";
        img.setAttribute("class", "img-thumbnail");
        img.setAttribute("style", "border:0;opacity: 0.5");
        span = document.createElement("span");
        span.setAttribute("class", "popuptext");
        a = document.createElement("a");
        a.setAttribute("class", "fa fa-twitter");
        a.setAttribute("href", "https://twitter.com/intent/tweet?text=" + event.title + " : " + event.link_value);
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "no-refresh");
        span.appendChild(a);
        a = document.createElement("a");
        a.setAttribute("class", "fa fa-facebook");
        a.setAttribute("href", "https://www.facebook.com/sharer/sharer.php?u=" + event.link_value);
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "no-refresh");
        span.appendChild(a);
        a = document.createElement("a");
        a.setAttribute("class", "fa fa-whatsapp");
        a.setAttribute("href", "https://api.whatsapp.com/send?text=" + event.link_value);
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "no-refresh");
        span.appendChild(a);
        label.appendChild(img);
        label.appendChild(span);
        div.appendChild(label);
        if (event.location.address != "") {
            label = document.createElement("label");
            label.setAttribute("class", "btn myBtn");
            label.setAttribute("style", "margin-right: 10px");
            label.setAttribute("onclick", "showMap('" + event.location.address + "');return false;");
            label.setAttribute("title", event.location.address);
            label.setAttribute("data-toggle", "modal");
            label.setAttribute("data-target", "#mapModal");
            img = document.createElement("img");
            img.src = "images/map.png";
            img.setAttribute("class", "img-thumbnail");
            img.setAttribute("style", "border:0;opacity: 0.5;");
            label.appendChild(img);
            div.appendChild(label);
        }
        label = document.createElement("label");
        label.setAttribute("class", "btn myBtn");
        label.setAttribute("style", "margin-right: 10px");
        label.setAttribute("onclick", "window.open('https://calendar.google.com/calendar/r/eventedit?text=" + event.title + "&dates=" + getFormatedDatesForGoogleCalendar(event.date) + "&details=" + event.message_text + " " + event.link_value + "&location=" + event.location.address + "', '_blank');");
        label.setAttribute("title", "Add to Google Calendar");
        img = document.createElement("img");
        img.src = "images/calendar.png";
        img.setAttribute("class", "img-thumbnail");
        img.setAttribute("style", "border:0;opacity: 0.5;");
        label.appendChild(img);
        div.appendChild(label);

        eventCard.appendChild(div);

        sectionGroup.appendChild(eventCard);

        var div = document.getElementById("selectedPinEvent");
        div.innerHTML = "";
        div.appendChild(sectionGroup);
        favoriteClicked();

        $('html, body').animate({
            scrollTop: $("#selectedPinEvent").offset().top
        }, 500);
    });
    markers.push(marker);
}

function removeMarkers() {
    //Loop through all the markers and remove
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
};
$(function () {
    $('li').click(function () {
        $('li.active').removeClass('active');
        $(this).addClass('active');
    });
});
$("#searchclear").click(function () {
    $("#searchinput").val('');
    filterChanged();
    ga('send', {
        hitType: 'event',
        eventCategory: 'Click',
        eventAction: 'clear'//,
        //eventLabel: 'cats.mp4'
    });
});
//Google analytics

window.ga = window.ga || function () { (ga.q = ga.q || []).push(arguments) }; ga.l = +new Date;
ga('create', 'UA-120811908-1', 'auto');
ga('send', 'pageview');

$('.img-check').on('click', function () {
    var imgClicked = $(this);
    var id = imgClicked.attr('id');
    //check
    if (imgClicked.css('opacity') == '0.5') {
        if (id == "chkHQ") {
            hqFilterChecked = true;
        }
        else if (id == "chkFood") {
            foodFilterChecked = true;
        }
        else if (id == "chk90") {
            filter90Checked = true;
        }
        else if (id == "chkEditorChoice") {
            editorChoiceFilterChecked = true;
        }
        if (id == "chkAll") {
            allFilterChecked = true;

            hqFilterChecked = false;
            foodFilterChecked = false;
            filter90Checked = false;
            editorChoiceFilterChecked = false;

            $('.img-check').css({
                'opacity': '0.5',
                'border-color': '#ddd'
            });
        }
        else {
            $('#chkAll').css({
                'opacity': '0.5',
                'border-color': '#ddd'
            });
            allFilterChecked = false;
        }
        imgClicked.css({
            'opacity': '1',
            'border-color': 'black'
        });
    }
    //uncheck
    else {
        imgClicked.css({
            'opacity': '0.5',
            'border-color': '#ddd'
        });
        if (id == "chkHQ") {
            hqFilterChecked = false;
        }
        else if (id == "chkFood") {
            foodFilterChecked = false;
        }
        else if (id == "chk90") {
            filter90Checked = false;
        }
        else if (id == "chkEditorChoice") {
            editorChoiceFilterChecked = false;
        }
        else if (id == "chkAll") {
            allFilterChecked = false;
        }
    }
    filterChanged();
});
$(window).resize(function () {
    setDisplayMode();
});

// When the user clicks on div, open the popup
function openSharePopup(sharePopup) {
    sharePopup.classList.toggle("show");
}
function setDisplayMode() {
    // Get the snackbar DIV
    var snackbar = document.getElementById("snackbar");
    var formGroup = document.getElementsByClassName('form-group row')[0];
    if ($(window).width() < 500) {
        if (mode == "desktop") {
            mode = "mobile";
            var panelBody = document.getElementsByClassName('panel-body')[0];
            panelBody.appendChild(formGroup);
            $('#accordion').css("display", "block");

            var showGooglePlayPopup = localStorage.getItem("showGooglePlayPopup");
            if (showGooglePlayPopup == null) {
                // Add the "show" class to DIV
                snackbar.className = "show";
            }
            else {
                //Remove the "show class from DIV and add hide class
                googlePlayCloseButtonClicked($(".closeGooglePlay")[0]);
            }

        }
    }
    else {
        if (mode == "mobile") {
            mode = "desktop";
            var contentBox = document.getElementsByClassName('content-box-right')[0];
            contentBox.appendChild(formGroup);
            $('#accordion').css("display", "none");
            snackbar.className = "hide";
        }
    }
}
function googlePlayCloseButtonClicked(closeButton) {
    closeButton.parentNode.classList.remove('show');
    closeButton.parentNode.classList.add('hide');
    localStorage.setItem("showGooglePlayPopup", false);
}
//back to top scroll
if ($('#back-to-top').length) {
    var scrollTrigger = 100, // px
        backToTop = function () {
            var scrollTop = $(window).scrollTop();
            if (scrollTop > scrollTrigger) {
                $('#back-to-top').addClass('show');
            } else {
                $('#back-to-top').removeClass('show');
            }
        };
    backToTop();
    $(window).on('scroll', function () {
        backToTop();
    });
    $('#back-to-top').on('click', function (e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: 0
        }, 700);
    });
}

function isRTL(s) {
    var ltrChars = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' + '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
        rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
        rtlDirCheck = new RegExp('^[^' + ltrChars + ']*[' + rtlChars + ']');

    return rtlDirCheck.test(s);
};
    //<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCNlYlXjmjgDGoxeBxtWWUQYhxFGOyjCeo&sensor=false&language=he&libraries=visualization,places">
