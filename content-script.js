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







$(document).ready( function(){

// Begin Jquery Ready
addNewTaskEventListner();
console.log("Loaded Clickup Turbo");

// Addd Style
document.head.appendChild(style);
style.innerHTML = turbo_style;


function addNewTaskEventListner() {
  document.addEventListener("keydown", function(event) {
    if (event.key === "n") {
        event.preventDefault();
        event.stopPropagation();
    }

    if (event.key === "n" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
      if(cuTaskRows[currentFocused] != null && cuTaskRows[currentFocused] != undefined) {
          var newTaskButton = $(getSelectedTask()).parents(".cu-list-group").find("button.cu-task-list-footer__add");
          console.log("New Task Button");
          console.log(newTaskButton);
          $(newTaskButton).click();
        }
    }
  });
}


function waitingForDOM() {
  cuTaskRows = document.querySelectorAll("cu-task-row");
  attempts++;
    // If cutTaskRows is empty, then wait 500ms and try again
    // Make only 20 attempts

  if (cuTaskRows.length === 0) {
    console.log("No task found");

    if (attempts < 20) {
      console.log("Waiting for DOM — Attempt " + attempts + "");
      timeout = setTimeout(waitingForDOM, 500);
    }
    else {
      console.log("Stopping");
      clearTimeout(timeout);
      return;
    }
  }
  else {
    attempts = 20;
    console.log("DOM Loaded After " + attempts + " attempts");
    console.log("Number of Rows = " + cuTaskRows.length);
    clearTimeout(timeout);
    domLoadedFunction();
  }
}





// This starts the process

timeout = setTimeout(waitingForDOM, 500);





function domLoadedFunction() {

  // Prevent multiple runs
  if (domLoaded) {
    console.log("Prevented multiple loading");
    return;
  }
  domLoaded = true;

  var observerWorking = false;

  // Change Observer
  const observer = new MutationObserver(() => {
    if (observerWorking) {
      return;
    }

    observerWorking = true;

    // Add 500ms delay
    setTimeout(function() {
      console.log("Invoked observer function");
      initializeKeyboardShortcuts();
      observerWorking = false;
    }, 1000);
  });


  function initializeKeyboardShortcuts() {
      cuTaskRows = document.querySelectorAll("cu-task-row");
      console.log(cuTaskRows);

      cuTaskRows.forEach((element, index) => {
          element.setAttribute("order", index);
      });
      document.removeEventListener("keydown", onKeyDown);
      document.addEventListener("keydown", onKeyDown);
      cuTaskRows[currentFocused].classList.add("active-list-item");
  }

  function onKeyDown(event) {
      if (event.code === "KeyK") {
          currentFocused = currentFocused === 0 ? cuTaskRows.length - 1 : currentFocused - 1;
          cuTaskRows.forEach((el) => el.classList.remove("active-list-item"));
          cuTaskRows[currentFocused].classList.add("active-list-item");
          getSelectedTask().focus();
          getSelectedTask().scrollIntoView({ behavior: 'smooth', block: 'center' });

      } else if (event.code === "KeyJ") {
          currentFocused = currentFocused === cuTaskRows.length - 1 ? 0 : currentFocused + 1;
          cuTaskRows.forEach((el) => el.classList.remove("active-list-item"));
          cuTaskRows[currentFocused].classList.add("active-list-item");
          getSelectedTask().focus()
          getSelectedTask().scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (event.code === "KeyX") {
          if (cuTaskRows[currentFocused]) {
              const cuTaskRowStatus = cuTaskRows[currentFocused].querySelector(".cu-task-row-status__done-btn");
              cuTaskRowStatus.click();
          }
      }
  }

  initializeKeyboardShortcuts();
  const targetNode = document.querySelector("body");
  const config = {
      childList: true,
      subtree: true
  };
  observer.observe(targetNode, config);
}



// End jQuery Ready
});
