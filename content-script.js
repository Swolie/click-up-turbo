const clickUpTurboDebugMode = true;


var cuTaskRows = [];
let currentFocused = 0;
let toggleMarker;
let shiftPressed = false;



function getSelectedTask() {
  return cuTaskRows[currentFocused];
}

var attempts = 0;
var timeout;

var domLoaded = false;

const style = document.createElement("style");

const turbo_style = `

.active-list-item {
	background-color: #3e224a !important;
}

.active-list-item .cu-task-row-main__link-text-inner {
  color: #fff !important;
}

.dark-theme .cu-dt-controls {
	border-color: #0d1520;
	background: #0d1520 !important;
	opacity: 0;
}

.dark-theme .cu-dt-controls:hover {
  opacity: 1;
}


.dark-theme .cu-dashboard-table__scroll {
	background: #0d1520 !important;
}

body.dark-theme {
  --cu-background-main: #0d1520 !important;
}

.dark-theme .cu-task-list-header__item_main {
	background: #0d1520 !important;
	color: transparent;
}

.dark-theme .cu-task-row__main {
	background-color: #0a0c1b5c !important;
}

.dark-theme .cu-task-list-header {
	background: #0a0c1b5c !important;
	color: transparent;
}

.cu-task-row-assignee, .cu-task-row__priority, .cu-task-row-recurring-date-picker {
	background: transparent !important;
}

.cu-task-row__container {
	background: #0a0c1b5c !important;
}



`;

document.head.appendChild(style);
style.innerHTML = turbo_style;







$(document).ready( function(){
  timeout = setTimeout(waitingForDOM, 3000);



  function waitingForDOM() {

    testing("Start waiting for DOM");

    cuTaskRows = document.querySelectorAll("cu-task-row");
    attempts++;
      // If cutTaskRows is empty, then wait 500ms and try again
      // Make only 20 attempts

    if (cuTaskRows.length === 0) {
      testing("No task found");

      if (attempts < 20) {
        testing("Waiting for DOM — Attempt " + attempts + "");
        timeout = setTimeout(waitingForDOM, 1500);
      }
      else {
        testing("Stopping");
        clearTimeout(timeout);
        return;
      }
    }
    else {
      testing("DOM Loaded After " + attempts + " attempts");
      testing("Number of Rows = " + cuTaskRows.length);
      clearTimeout(timeout);
      domLoadedFunction();
    }
  }



  function domLoadedFunction() {
    if (domLoaded) {
      testing("Prevented multiple loading");
      return;
    }
    domLoaded = true;
    let observerWorking = false;

    const observer = new MutationObserver(() => {
      if (observerWorking) {
        return;
      }

      observerWorking = true;

      // Add 500ms delay
      setTimeout(function() {
        testing("Invoked observer function");
        initializeClickTurbo();
        observerWorking = false;
      }, 1500);
    });

    initializeClickTurbo();
    const targetNode = document.querySelector("cu-task-row");
    const config = {
        childList: true,
        subtree: true
    };
    observer.observe(targetNode, config);
  }




  function initializeClickTurbo() {
    testing("Initialize Keyboard Shortcuts");
    refreshAll();
  }


  function refreshAll() {
    refreshTasks()
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("keydown", onKeyDown);
    cuTaskRows[currentFocused].classList.add("active-list-item");
  }

  function refreshTasks() {
    cuTaskRows = document.querySelectorAll("cu-task-row");
    cuTaskRows.forEach((element, index) => {
        element.setAttribute("order", index);
    });
  }




  function onKeyUp(event) {
    if (event.code == "Shift") {
      testing("Shift Released");
      shiftPressed = false;
    }
  }



  function onKeyDown(event) {
    testing("Key Down Pressed");

    handleEscapeKey(event);
    handleShiftKey(event);
    handleNavigationKeys(event);
    handleToggleTaskCompletion(event);
    handleEnterKey(event);
    handleNewTaskKey(event);
  }

  function handleEscapeKey(event) {
    if (event.code === "Escape") {
      toggleMarker = null;
    }
  }

  function handleShiftKey(event) {
    if (event.code == "Shift") {
      testing("Shift is held");
      shiftPressed = true;
    }
  }

  function handleNavigationKeys(event) {
    if (event.code === "KeyK" || event.code === "KeyJ") {
      navigateTasks(event.code === "KeyK");
    }
  }

  function navigateTasks(up) {
    refreshTasks();

    currentFocused = up
      ? currentFocused === 0
        ? cuTaskRows.length - 1
        : currentFocused - 1
      : currentFocused === cuTaskRows.length - 1
      ? 0
      : currentFocused + 1;

    updateFocusedTask();
  }

  function updateFocusedTask() {
    console.log("Current Focused:", cuTaskRows[currentFocused]);

    const currentRow = cuTaskRows[currentFocused];

    cuTaskRows.forEach((el) => el.classList.remove("active-list-item"));

    cuTaskRows[currentFocused].classList.add("active-list-item");

    getSelectedTask().focus();
    getSelectedTask().scrollIntoView({ behavior: 'smooth', block: 'center' });

    $(".cu-dt-controls").hide();

    if (toggleMarker && !shiftPressed) {
      toggleMarker.click();
    }
    toggleMarker = $(currentRow).find(".cu-task-row-toggle__marker");
    toggleMarker.click();
  }

  function handleToggleTaskCompletion(event) {
    if (event.code === "KeyX") {
      if (cuTaskRows[currentFocused]) {
        const cuTaskRowStatus = cuTaskRows[currentFocused].querySelector(".cu-task-row-status__done-btn");
        cuTaskRowStatus.click();
      }
    }
  }

  function handleEnterKey(event) {
    if (event.key == "Enter" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
      setTimeout(function() {
        refreshTaskRows();
      }, 500);
    }
  }

  function handleNewTaskKey(event) {
    if (event.key === "n" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {

      testing("Key N Pressed");

      if(cuTaskRows[currentFocused] != null && cuTaskRows[currentFocused] != undefined) {
        event.preventDefault();
        event.stopPropagation();
        createNewTask();
      }
    }
  }

  function createNewTask() {
    const $selectedTask = $(getSelectedTask());
    const level = $selectedTask.data("level");

    if (level > 1) {
      createSubtask($selectedTask, level);
    } else {
      createMainTask($selectedTask);
    }
  }

  function createSubtask($selectedTask, level) {
    const mainTaskDiv = $selectedTask.closest(`.cu-task-row[data-level=${level - 1}]`);
    const createSubtaskButton = mainTaskDiv.find('.cu-subtasks-by-status-popup__count-add-btn');
    $(createSubtaskButton).click();
  }

  function createMainTask($selectedTask) {
    const taskListDiv = $selectedTask.parents(".cu-task-list");
    let newTaskButton = taskListDiv.find("cu-task-list-footer").find("button.cu-task-list-footer__add");
    testing("New Task Button");
    testing(newTaskButton);
    $(newTaskButton).click();
  }

}); // /jquery



// Helpers

function testing(logString) {
  if (clickUpTurboDebugMode) {
    console.log(logString);
  }
}






// function onKeyDown(event) {


//   testing("Key Down Event");

//   // Escape key

//   if (event.code === "Escape") {
//     toggleMarker = null;
//   }

//   if (event.code == "Shift") {
//     testing("Shift is held");
//     shiftPressed = true;
//   }


//   // Key K & J (Up & Down)
//   if (event.code === "KeyK" || event.code === "KeyJ") {

//     refreshTasks();

//       if (event.code === "KeyK") {
//           currentFocused = currentFocused === 0 ? cuTaskRows.length - 1 : currentFocused - 1;
//       } else {
//           currentFocused = currentFocused === cuTaskRows.length - 1 ? 0 : currentFocused + 1;
//       }



//       console.log("Current Focused:", cuTaskRows[currentFocused]);


//       const currentRow = cuTaskRows[currentFocused];

//       // find .cu-task-row-toggle__marker

//       // Remove active class from all rows
//       cuTaskRows.forEach((el) => el.classList.remove("active-list-item"));

//       // Add active class to current row
//       cuTaskRows[currentFocused].classList.add("active-list-item");

//       // Scroll to current row
//       getSelectedTask().focus()
//       getSelectedTask().scrollIntoView({ behavior: 'smooth', block: 'center' });

//       $(".cu-dt-controls").hide();

//       if (toggleMarker && !shiftPressed) {
//         toggleMarker.click();
//       }
//       toggleMarker = $(currentRow).find(".cu-task-row-toggle__marker");
//       toggleMarker.click();

//   // Key X for Toggle Task Completion

//   if (event.code === "KeyX") {
//       if (cuTaskRows[currentFocused]) {
//           const cuTaskRowStatus = cuTaskRows[currentFocused].querySelector(".cu-task-row-status__done-btn");
//           cuTaskRowStatus.click();
//       }
//   }

//   if (event.key == "Enter" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
//     //time out for 500ms
//     setTimeout(function() {
//       refreshTaskRows();
//     }, 500);
//   }


//   if (event.key === "n" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !(event.target.hasAttribute("contenteditable") && event.target.getAttribute("contenteditable") === "true")) {

//     testing("Key N Pressed");

//     if(cuTaskRows[currentFocused] != null && cuTaskRows[currentFocused] != undefined) {
//         event.preventDefault();
//         event.stopPropagation();
//         const $selectedTask = $(getSelectedTask());

//         // // check if it's a subtask -- if it's a subtask, then go to parent
//         // if ($selectedTask.hasClass("cu-task-row--subtask")) {
//         // $selectedTask.trigger("mouseenter");

//         const level = $selectedTask.data("level");
//         if (level > 1) {
//           const mainTaskDiv = $selectedTask.closest(`.cu-task-row[data-level=${level - 1}]`);
//           const createSubtaskButton = mainTaskDiv.find('.cu-subtasks-by-status-popup__count-add-btn');
//           $(createSubtaskButton).click();

//         }

//         else {
//           const taskListDiv = $selectedTask.parents(".cu-task-list");
//           let newTaskButton = taskListDiv.find("cu-task-list-footer").find("button.cu-task-list-footer__add");
//           testing("New Task Button");
//           testing(newTaskButton);
//           $(newTaskButton).click();
//         }
//       }
//     }
// }
