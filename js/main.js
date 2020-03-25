"use strict";

const GROUPURL = "https://acl.hadoop.rbdev.mail.ru/getgroupusers"
const USERGROUPURL = "https://acl.hadoop.rbdev.mail.ru/getusergroup"
const ACLURL = "https://acl.hadoop.rbdev.mail.ru/getacl"
const BASEURL = "https://acl.hadoop.rbdev.mail.ru"
var db = [
    "drawLine",
    "drawCircle",
    "drawCircleMore",
    "fillLine",
    "fillCircle",
    "fillCircleMore"
];

const KEY_ENTER = 13;

let d = new Date();
// alert("Today's date is " + d);
//
//
function get_path(rawpath) {
    return rawpath.split('/').filter((x) => {return x.length !== 0})
}

function prepare_params(path) {
    switch (path.length) {
        case 0: return {};
        case 1: return {dtype: path[0]};
        case 2:
        default: return {dtype: path[0], dname: path[1]};
    }
}

async function fetch_cred(url) {
    return fetch(url, {credentials: 'include'})
}

async function query_resources(raw_path) {
    // User search query
    // Fetch External Data Source
    //const source = await fetch(`http://localhost:8080/${query}`);
    let url = new URL(BASEURL.concat('/getnestedpaths'));
    let params = {path: raw_path};
    url.search = new URLSearchParams(params).toString()

    const source = await fetch_cred(url);
    // Format data into JSON
    const data = await source.json();
    if (! "result" in data) {
        visual_log("${path} query returned no result")
        return [];
    }
    let s = new Set();
    let ret = data["result"]
//    ret = Array.from(ret);
//    ret = prepare_res(ret, rr);
    return ret;
}

function customNavigationWrapper (event, input, resListElement, onSelection, resListData) {
    //console.log("event = ", event);
    return customNavigation(input, resListElement, onSelection, resListData);

}

const customNavigation = (input, resultsList, feedback, resultsValues) => {
    // Locals
    const li = resultsList.childNodes,
        liLength = li.length - 1;
    let liSelected = undefined,
        next;
    // Remove selection class
    const removeSelection = direction => {
        liSelected.classList.remove(select.selectedResult);
        if (direction === 1) {
            next = liSelected.nextSibling;
        } else {
            next = liSelected.previousSibling;
        }
    };
    // Add selection class
    const highlightSelection = current => {
        liSelected = current;
        liSelected.classList.add(select.selectedResult);
    };
    // Keyboard action
    input.onkeydown = event => {
        if (li.length > 0) {
            switch (event.keyCode) {
                // Arrow Up
                case keys.ARROW_UP:
                    if (liSelected) {
                        removeSelection(0);
                        if (next) {
                            highlightSelection(next);
                        } else {
                            highlightSelection(li[liLength]);
                        }
                        $("#autoComplete").value = liSelected.innerText;
                    } else {
                        highlightSelection(li[liLength]);
                        $("#autoComplete").value = li[liLength].innerText;
                    }
                    break;
                // Arrow Down
                case keys.ARROW_DOWN:
                    if (liSelected) {
                        removeSelection(1);
                        if (next) {
                            highlightSelection(next);
                        } else {
                            highlightSelection(li[0]);
                        }
                        $("#autoComplete").value = liSelected.innerText;
                    } else {
                        highlightSelection(li[0]);
                        $("#autoComplete").value = li[0].innerText;
                    }
                    break;
                case keys.ENTER:
                    if (liSelected) {
                        onSelection(event, input, resultsList, feedback, resultsValues, liSelected);
                    }
            }
        }
    };
    // Mouse action
    li.forEach(selection => {
        selection.onmousedown = event => onSelection(event, input, resultsList, feedback, resultsValues);
    });
};

const autoCompletejs = new autoComplete({
    data: {                              // Data src [Array, Function, Async] | (REQUIRED)
        src: async () => {
            // User search query
            const query = $("#autoComplete").value;
            // Fetch External Data Source
            // const source = await fetch(`http://localhost:8080/${query}`);
            let data = await query_resources(query);
            data = data.slice(0,300);

            // Format data into JSON
            //console.log(data);
            console.log(data);
            return data;
        },
//        src: ['/hdfs/dwh', '/hdfs/backup', '/hdfs/data', '/hdfs/data', '/hdfs/data', '/hdfs/data', '/hdfs/data', '/hdfs/data', '/hdfs/data', '/hdfs/data', '/hdfs/data', '/hdfs/data', '/hdfs/data', '/hdfs/data', '/hdfs/data', '/hdfs/data', '/hdfs/data'],
//      key: ["title"],
      cache: false
    },
    sort: (a, b) => {                    // Sort rendered results ascendingly | (Optional)
        if (a.match < b.match) return -1;
        if (a.match > b.match) return 1;
        return 0;
    },
    placeHolder: "Resource Path",     // Place Holder text                 | (Optional)
    threshold: 1,                        // Min. Chars length to start Engine | (Optional)
    debounce: 300,                       // Post duration for engine to start | (Optional)
    searchEngine: "strict",              // Search Engine type/mode           | (Optional)
    resultsList: {                       // Rendered results list object      | (Optional)
        render: true,
//        container: source => {
//            source.setAttribute("id", "food_list");
//        },
//        destination: document.querySelector("#rb_resource_list"),
//        position: "afterend",
//        element: "ul"
        navigation: customNavigationWrapper,
    },
    maxResults: 5,                         // Max. number of rendered results | (Optional)
//    highlight: true,                       // Highlight matching results      | (Optional)
//    resultItem: {                          // Rendered result item            | (Optional)
//        content: (data, source) => {
//            source.innerHTML = data.match;
//        },
//        element: "li"
//    },
    noResults: () => {                     // Action script on noResults      | (Optional)
        const result = document.createElement("li");
        result.setAttribute("class", "no_result");
        result.setAttribute("tabindex", "1");
        result.innerHTML = "Not found! (but still can be requested :-))";
        document.querySelector("#autoComplete_list").appendChild(result);
    },
    onSelection: feedback => {             // Action script onSelection event | (Optional)
//        document.querySelector("#autoComplete").blur();
        const selection = feedback.selection.value;
        document.querySelector("#autoComplete").value = selection;
        // Change placeholder with the selected value
    },
    trigger: {
        event: ["input", "focusin", "focusout"]
    },

});


function visual_log(message) {
    let node = document.createElement("p");
    let msg = document.createTextNode("> ".concat(message));
    node.appendChild(msg);
    document.querySelector("#console").appendChild(node);
}

function set_user_groups(username, groups) {
    if (! "result" in groups) {
        visual_log("Fetch error - result not found")
    }
    let info_node = $("#info");
    let result = groups['result'];
    if (result.length > 0) {
        let res = result[0]['groups'];
        let g_node = document.createElement("div");
        g_node.setAttribute("id", "groups");
        g_node.appendChild(document.createTextNode("Groups:"))
        let g_list = document.createElement("ul");
        res.forEach(g => {
            let g_list_li = document.createElement("li");
            g_list_li.appendChild(document.createTextNode(g));
            g_list.appendChild(g_list_li);
        });
        g_node.appendChild(g_list);
        info_node.appendChild(g_node);
    }
}


function set_user_info() {
    // let username = get_from_header()
    let username = "a.ryndin";
    // let groups = get_user_groups(username);
    let url = new URL(USERGROUPURL)
    let params = {user: username}

    url.search = new URLSearchParams(params).toString();


    fetch_cred(url)
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            set_user_groups(username, myJson);
        });

}

function register_listeners() {

    // Hide results list on focus loose
    ["focus", "blur"].forEach(function(eventType) {
        const resultsList = document.querySelector("#autoComplete_list");
        $("#autoComplete").addEventListener(eventType, function() {
            if (eventType === "blur") {
                resultsList.style.display = "none";
            } else if (eventType === "focus") {
                // Show results list & hide other elemennts
                resultsList.style.display = "block";
            }
        });
    });

}

function do_enter_action() {
    const result = document.createElement("li");
    result.setAttribute("class", "no_result");
    result.setAttribute("tabindex", "1");
    result.innerHTML = "Not found! (but still can be requested :-))";
    $("#autoComplete_list").appendChild(result);

}

class RR {
    constructor(user) {
        this.rrs = [];
        this.user = user;
        let rb = $("#request_button");
        this.rb = rb;
        this.error_infoblock = $("#error_infoblock");
        this.info_infoblock = $("#info_infoblock");
        let f = function(event) {
            console.log("request button pressed");
            let ret = this.make_rr();
            console.log("make_rr return value -> ", ret);
        }.bind(this)
        rb.addEventListener("click", f);
    }

    make_rr() {
        this.rb.disabled = true;
        const url = new URL(BASEURL.concat('/newrr'));
        const myHeaders = new Headers({
            'Accept-Languag': 'ProcessThisImmediately'
        });
        const body = JSON.stringify({
            paths: this.rrs,
            user: this.user,
        });
        const params = {
            body: body,
            method: "POST",
            credentials: 'include',
            headers: myHeaders,
        };
        const myRequest = new Request(BASEURL.concat('/newrr'), params);
        fetch(myRequest)
            .then(data=>data.json()
                .then(data => {
                    if ("error" in data) {
                        this.error_infoblock.innerHTML = data["error"];
                    } else {
                        this.info_infoblock.innerHTML = JSON.stringify(data);
                    }
                })
            );
    }

    render_li(id) {
        const result = document.createElement("li");
        result.innerHTML = this.rrs[id];

        const x_button = document.createElement("div");
        x_button.innerHTML = "[X]";
        x_button.setAttribute("class", "deleteMe");
        x_button.setAttribute("id", id);

        let f = function(event) {
            console.log(event.target);
            let id_todel = event.target.getAttribute("id");
            console.log(id_todel);
            this.del(id_todel);
        };
        f = f.bind(this);
        x_button.addEventListener("click", f);

        result.appendChild(x_button);

        $("#selection").appendChild(result);
    }

    push(v) {
        let ret = this.rrs.push(v);
        this.render_li(this.rrs.length-1);
        return ret;
    }

    render() {
        let selection = $("#selection");
        selection.innerHTML = "";
        for (let i=0; i<this.rrs.length; i++) {
            this.render_li(i)
        }
    }

    del(i) {
        let ret = this.rrs.splice(i, 1);
        this.render();
        return ret;
    }

}


function main() {

    let rr = new RR();

    $("#autoComplete").addEventListener("keypress", function(event) {
        if (event.keyCode === KEY_ENTER) {
            let list = $("#autoComplete_list");
            console.log(list.children.length);
            console.log(list);
            if (list && (list.style.display != "none" && list.children.length !== 0)) {
                console.log(list.children.length);
                console.log("returned");
                return
            }
            let r_text = $("#autoComplete").value;
            $("#autoComplete").setAttribute("placeholder", r_text);
            rr.push(r_text);
        } 
    });
    register_listeners();
    visual_log('initialised...');
    set_user_info();

}

main()
