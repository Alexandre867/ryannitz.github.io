var app = new Vue({
    el: "#app",

  //------- data --------
    data: {
        API_BASE_URL: "https://api.github.com/users/ryannitz",
        api_base_object : {
          "login": "ryannitz",
          "url": "https://api.github.com/users/ryannitz",
          "html_url": "https://github.com/ryannitz",
          "followers_url": "https://api.github.com/users/ryannitz/followers",
          "following_url": "https://api.github.com/users/ryannitz/following{/other_user}",
          "gists_url": "https://api.github.com/users/ryannitz/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/ryannitz/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/ryannitz/subscriptions",
          "organizations_url": "https://api.github.com/users/ryannitz/orgs",
          "repos_url": "https://api.github.com/users/ryannitz/repos",
          "events_url": "https://api.github.com/users/ryannitz/events{/privacy}",
          "received_events_url": "https://api.github.com/users/ryannitz/received_events",
        },

        repos: [],

        siteTree: [],
    },

  //------- methods --------
    methods: {

        init() {
          //this.loadAPIBase();
          //this.loadSiteTree();
        },

        loadAPIBase() {
            axios
            .get(this.API_BASE_URL)
            .then(response => {
                this.api_base_object = response.data;
                console.log(this.api_base_object);
            })
            .catch(e => {
                //change this to be perma message banner
                if(e.response){
                    console.log(e);
                    createAlert("danger", "Could not intialize API base", 3000);
                }
            });
        },

        loadSiteTree() {
          if(this.siteTree.length == 0) {
            axios
            .get("https://api.github.com/repos/ryannitz/ryannitz.github.io/git/trees/main")
            .then(response => {
                this.siteTree = this.filteredSiteTree(response.data);
            })
            .catch(e => {
                //change this to be perma message banner
                if(e.response){
                    console.log(e);
                    createAlert("danger", "Could not fetch site tree", 3000);
                }
            });
          }
        },

        loadRepos() {
            if(this.api_base_object != null) {
                axios
                .get(this.api_base_object.repos_url)
                .then(response => {
                    this.repos = response.data;
                    console.log(this.repos);
                })
                .catch(e => {
                    //change this to be perma message banner
                    if(e.response){
                        console.log(e);
                        createAlert("danger", "Could not fetch repos", 3000);
                    }
                });
            }
        },

        filteredSiteTree(siteObj) {
          return siteObj.tree.filter(treeBranch => {
            return treeBranch.path.includes(".html") && !treeBranch.path.includes("index.html");
          })
        },

        toggleFocused(event) {
          document.querySelectorAll('.item').forEach(function(element, index) {
            element.classList.remove("focused");
          });
          event.target.classList.add("focused");
        }
    },

    beforeMount(){
        this.init();
    },

    created() {
      window.addEventListener('keydown', (e) => {
        var static_websites_focused = document.getElementById("vueStaticWebpageTrigger").classList.contains('focused');
        if (e.key == 'Enter' && static_websites_focused) {
          this.loadSiteTree();
        }
      });
    },

    computed: {

    }
});


$(document).ready(function(){

  function createAlert(type, text, millis) {
      var id = Math.floor((Math.random() * 1000) + 1);
      var alerthtml = '<div id="alert-'+id+'" class="alert alert-'+type+' alert-dismissible text-center fixed-bottom w-75 mx-auto mb-5">' +
                      '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                      '<strong><i class="fas fa-info-circle"></i></strong> '+
                      text+
                  '</div>'
      $("body").append(alerthtml);
      setTimeout(function(){
          $('#alert-'+id).fadeOut(500, function(){
              $('#alert-'+id).remove();
          });
      }, millis)
  }


  //resizing code used loosely from: https://stackoverflow.com/questions/6219031/how-can-i-resize-a-div-by-dragging-just-one-side-of-it
  var resizing = false;
  $("#contentScreenTitleBar").mousedown(function(e) {
    resizing = true;
  });
  $(document).mousemove(function(e) {
    if(resizing) {
      $("body").css("cursor", "row-resize");
      var releasePosY = e.pageY;

      var upperBound = $("#mainTerminalTitleBar").height();
      if(releasePosY < upperBound) {
        releasePosY = upperBound;
      }
      var lowerBound = window.innerHeight - $("#contentScreenTitleBar").height();
      if(releasePosY > lowerBound) {
        releasePosY = lowerBound;
      }
      var percentagePosY = (releasePosY / window.innerHeight) * 100;
      var newTerminalHeight = percentagePosY;
      var newContextHeight = 100 - percentagePosY;

      $("#mainTerminal").css("height", newTerminalHeight + "%");
      $("#contextScreen").css("height", newContextHeight + "%");
    }
  })
  $(document).mouseup(function(e) {
    resizing = false;
    $("body").css("cursor", "inherit");
  })



  var elementStack = [];
  elementStack.push("#rnitz");
  
  var focusIcon = '<i class="fa-solid fa-angle-left navarrow"></i>';
  $(".item").append(focusIcon);
  var linkIcon = '<i class="fa-solid fa-link"></i> ';
  $(".link").prepend(linkIcon);
  var dirIcon = '<i class="fa-solid fa-folder"></i> ';
  $(".dir").prepend(dirIcon);
  var writeupIcon = '<i class="fa-solid fa-file"></i> ';
  $(".writeup").prepend(writeupIcon);

  $(".item").hover(function(){
    $(".item").removeClass("focused");
    $(this).addClass("focused");
    
  });


  $(".navigable").click(function(){
    $("#back").addClass("d-block");
    var toHide = elementStack[elementStack.length-1];
    $(toHide).removeClass("d-block");
    var toShow = $(this).attr("page");
    $(toShow).addClass("d-block");
    elementStack.push(toShow);

    updateTerminalPath();
  });

  function updateTerminalPath() {
    var path = 'C:\\Users';
    elementStack.forEach(element => {
      path += "\\" + element.replace("#", "");
    });
    path += ">";

    $("#terminalPath").html(path);
  }

  function updatePreviewPath(content) {
    var path = 'C:\\Users';
    elementStack.forEach(element => {
      path += "\\" + element.replace("#", "");
    });
    path += "> " + content;

    $("#previewPath").html(path);
  }

  $(".back").click(function(){
    var toHide = elementStack.pop();
    $(toHide).removeClass("d-block");
    $(elementStack[elementStack.length-1]).addClass("d-block");
    updateTerminalPath();
  });



  //This is REALLY bad code because I'm using half vue, half vanilla. Will need to transition everything to vue.
  $(document)
  .on("click", ".link", function() {
    return false;
  })
  .on("dblclick", ".link", function(){
    window.open(this.href,'_blank');
    return false;
  })
  .on("click", ".item", function() {
    var toShow = $(this).attr("preview");
    if(toShow){
      updatePreviewPath(toShow.replace("#", ""));
      $(".preview").removeClass("d-block");
      $(toShow).addClass("d-block");
    }
  })
  .on("mouseenter", ".item > span", function() {
    unscramble(750, 25, this, this)
  })    
  .on('keydown', function(e) { 
    var keyCode = e.keyCode || e.which; 
  
    if(keyCode == 40 || keyCode == 38) {
      var focused = $(".page.d-block > .focused");
      if (keyCode == 40) { 
        var nextFocus = focused.next();
        if(nextFocus.length == 0) {
          nextFocus = $(".page.d-block > .item").first();
        }
      } 
      if (keyCode == 38) {
        var nextFocus = focused.prev();
        if(nextFocus.length == 0) {
          nextFocus = $(".page.d-block > .item").last();
        }
      }
      $(".item").removeClass("focused");
      nextFocus.addClass("focused");
      nextFocus.find("span").trigger("mouseenter")
    }

    if(keyCode == 13) {
      $(".focused").trigger("click");
      if($(".focused").hasClass("link")) {
        $(".focused").trigger("dblclick");
      }
    }
    
    //return false;
  });


});


