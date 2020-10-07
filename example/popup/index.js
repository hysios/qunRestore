import welcome from "shared/welcome";
import "shared/page.css";

// welcome("popup/index.js");s
function dropHandler(ev) {
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === "file") {
        var file = ev.dataTransfer.items[i].getAsFile();
        console.log("... file[" + i + "].name = " + file.name);
        console.log("filetype ", file.type);
        var textType = /^text\//;

        if (!textType.test(file.type)) {
          continue;
        }
        var reader = new FileReader();
        reader.onload = (e) => {
          console.log(e.target.result);
          let text = e.target.result,
            list = [];
          if (text) {
            list = text.split("\n");
          }

          chrome.tabs.query({ active: true, currentWindow: true }, function (
            tabs
          ) {
            // chrome.runtime.sendMessage({ import: list }, function (response) {
            //     console.log(response.success);
            //   });
            chrome.tabs.sendMessage(tabs[0].id, { import: list }, function (
              response
            ) {
              if (response.success) {
                console.log("test received");
              }
            });
          });
        };
      }
      // reader.readAsDataURL(file);
      reader.readAsText(file);
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      console.log(
        "... file[" + i + "].name = " + ev.dataTransfer.files[i].name
      );
    }
  }
}

function dragOverHandler(ev) {
  console.log("File(s) in drop zone");
  ev.target.classList.add("droppable");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

function downloadMembers(ev) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    download_members.textContent = "正在下载...";
    chrome.tabs.sendMessage(tabs[0].id, { download: "members" }, function (
      response
    ) {
      if (response.members) {
        let members = response.members.join("\n");
        download("members.txt", members);
        console.log("test received");
        download_members.textContent = "下载成员列表文件";
      }
    });
  });
}

function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// Start file download.
// download("hello.txt", "This is the content of my file :)");

drop_zone.ondrop = dropHandler;
drop_zone.ondragover = dragOverHandler;
download_members.onclick = downloadMembers;
