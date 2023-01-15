const clickUpTurboDebugMode = false;


var cuTaskRows = [];
let currentFocused = 0;



function getSelectedTask() {
  return cuTaskRows[currentFocused];
}

var attempts = 0;
var timeout;

var domLoaded = false;

const style = document.createElement("style");

const turbo_style = `.active-list-item .cu-task-row__main {
  background-color: #4b4ba6 !important;
}

.active-list-item .cu-task-row-main__link-text-inner {
  color: #fff !important;
}

`;


function testing(logString) {
  if (clickUpTurboDebugMode) {
    console.log(logString);
  }
}







$(document).ready( function(){

// Begin Jquery Ready
addNewTaskEventListner();

testing("Loaded Clickup Turbo");

// Addd Style
document.head.appendChild(style);
style.innerHTML = turbo_style;


///////////////////
///////////////////
function addNewTaskEventListner() {
///////////////////
///////////////////


  testing("Loaded Clickup Turbo");

  testing("Added Key Down Event Listener");


  document.addEventListener("keydown", function(event) {
    testing("Keydown Event Listener Triggered");


    if (event.key === "n" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {

      testing("Key N Pressed");

      if(cuTaskRows[currentFocused] != null && cuTaskRows[currentFocused] != undefined) {
          event.preventDefault();
          event.stopPropagation();
          var newTaskButton = $(getSelectedTask()).parents(".cu-list-group").find("button.cu-task-list-footer__add");
          testing("New Task Button");
          testing(newTaskButton);
          $(newTaskButton).click();
        }
    }
  });
}


///////////////////
function waitingForDOM() {
///////////////////

  testing("Start waiting for DOM");


  cuTaskRows = document.querySelectorAll("cu-task-row");
  attempts++;
    // If cutTaskRows is empty, then wait 500ms and try again
    // Make only 20 attempts

  if (cuTaskRows.length === 0) {
    testing("No task found");

    if (attempts < 20) {
      testing("Waiting for DOM — Attempt " + attempts + "");
      timeout = setTimeout(waitingForDOM, 500);
    }
    else {
      testing("Stopping");
      clearTimeout(timeout);
      return;
    }
  }
  else {
    attempts = 20;
    testing("DOM Loaded After " + attempts + " attempts");
    testing("Number of Rows = " + cuTaskRows.length);
    clearTimeout(timeout);
    domLoadedFunction();
  }
}


// This starts the process
timeout = setTimeout(waitingForDOM, 500);


///////////////////
function domLoadedFunction() {
///////////////////

  testing("Dom Loaded Function");

  // Prevent multiple runs
  if (domLoaded) {
    testing("Prevented multiple loading");
    return;
  }
  domLoaded = true;

  var observerWorking = false;





////////////////////
// Change Observer
////////////////////


  const observer = new MutationObserver(() => {
    if (observerWorking) {
      return;
    }

    observerWorking = true;

    // Add 500ms delay
    setTimeout(function() {
      testing("Invoked observer function");
      initializeKeyboardShortcuts();
      observerWorking = false;
    }, 1000);
  });





///////////////////
///////////////////
  function initializeKeyboardShortcuts() {
///////////////////
///////////////////



    testing("Initialize Keyboard Shortcuts");


    cuTaskRows = document.querySelectorAll("cu-task-row");
    testing(cuTaskRows);

    cuTaskRows.forEach((element, index) => {
        element.setAttribute("order", index);
    });
    document.removeEventListener("keydown", onKeyDown);
    document.addEventListener("keydown", onKeyDown);
    cuTaskRows[currentFocused].classList.add("active-list-item");



  }








///////////////////
///////////////////
  function onKeyDown(event) {
///////////////////
///////////////////

    testing("Key Down Event");


    // Key K & J (Up & Down)
    if (event.code === "KeyK" || event.code === "KeyJ") {

        if (event.code === "KeyK") {
            currentFocused = currentFocused === 0 ? cuTaskRows.length - 1 : currentFocused - 1;
        } else {
            currentFocused = currentFocused === cuTaskRows.length - 1 ? 0 : currentFocused + 1;
        }

        // Remove active class from all rows
        cuTaskRows.forEach((el) => el.classList.remove("active-list-item"));

        // Add active class to current row
        cuTaskRows[currentFocused].classList.add("active-list-item");

        // Scroll to current row
        getSelectedTask().focus()
        getSelectedTask().scrollIntoView({ behavior: 'smooth', block: 'center' });


    // Key X for Toggle Task Completion
    } else if (event.code === "KeyX") {
        if (cuTaskRows[currentFocused]) {
            const cuTaskRowStatus = cuTaskRows[currentFocused].querySelector(".cu-task-row-status__done-btn");
            cuTaskRowStatus.click();
        }
    }

  }

  initializeKeyboardShortcuts();
  const targetNode = document.querySelector("cu-task-row");
  const config = {
      childList: true,
      subtree: true
  };
  observer.observe(targetNode, config);
}



// End jQuery Ready
});
