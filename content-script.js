$(document).ready( function(){
  console.log("Loaded Clickup Turbo");
  const style = document.createElement("style");

  style.innerHTML = `.active-list-item .cu-task-row__main {
      background-color: #4b4ba6 !important;
    }

    .active-list-item .cu-task-row-main__link-text-inner {
      color: #fff !important;
    }

  `;


  document.head.appendChild(style);

  var cuTaskRows = [];
  let currentFocused = 0;

  var attempts = 0;
  var timeout;

  var domLoaded = false;


  // This starts the process

  timeout = setTimeout(waitingForDOM, 500);



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
      console.log("DOM Loaded After " + attempts + " attempts");
      clearTimeout(timeout);
      domLoadedFunction();
    }
  }


  function domLoadedFunction() {

    // Prevent multiple runs
    if (domLoaded) {
      return;
    }

    domLoaded = true;


    var observerWorking = false;

    // Change Observer
    const observer = new MutationObserver(() => {
      if (observerWorking) {
        return;
      }
      else {
        // Add 500ms delay
        setTimeout(function() {
          initializeKeyboardShortcuts();
          observerWorking = false;
        }, 500);
      }
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
        } else if (event.code === "KeyJ") {
            currentFocused = currentFocused === cuTaskRows.length - 1 ? 0 : currentFocused + 1;
            cuTaskRows.forEach((el) => el.classList.remove("active-list-item"));
            cuTaskRows[currentFocused].classList.add("active-list-item");
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

});
