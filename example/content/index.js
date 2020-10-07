import welcome from "shared/welcome";
require("babel-core/register");
require("babel-polyfill");

welcome("content/index.js");

const $ = document.querySelector;
const duration = 150;

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );

  // 添加群成员
  async function addMembers(list, sendResponse) {
    injectCode(`$(".add-member").click();`);
    await delay(duration);

    for (let i = 0; i < list.length; i++) {
      let qq = strip(list[i].trim());
      injectCode(`$(".dialog-search-input").val("${qq}");`);
      injectCode(
        `$(".dialog-search-input").trigger(jQuery.Event( 'keyup', { which: 67 } ))`
      );
      await delay(duration);
      injectCode(`$(".search-smart li:first-child").click()`);
      await delay(duration);

      console.log(qq);
    }
    sendResponse({ success: true });
  }

  // 下载群成员
  async function downMembers(sendResponse) {
    console.log("down members");
    let total = document.querySelector("#groupMemberTit");
    let memberNum = document.querySelector("#groupMemberNum");
    if (total && memberNum) {
      console.log(total.textContent);

      let count = parseInt(memberNum.textContent.trim());
      let query = document.querySelectorAll(
        "#groupMember>.list>tr>td:nth-child(5)"
      );

      let members = [];
      for (let i = 0; i < query.length; i++) {
        let td = query[i];
        members.push(String(td.textContent).trim());
      }
      sendResponse({ members });
      console.log("list", count, members);
    }
  }

  if (request.import && request.import.length > 0) {
    if (window.location.host !== "qun.qq.com") {
      return;
    }
    if (!document.querySelector("#groupMemberTit")) {
      return;
    }
    if (document.querySelector(".add-member")) {
      await addMembers(request.import, sendResponse);
      return;
    }
  } else if (request.download && request.download == "members") {
    await downMembers(sendResponse);
    // sendResponse({ members: [] });
    return;
  }
});

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

function sendText(input, el) {
  for (i = 0; i < input.length; i++) {
    let c = input[i];
    console.log(c.charCodeAt(0));
    let event = charEvent(c.charCodeAt(0));
    el.dispatchEvent(event);
  }
}

function charEvent(c) {
  var keyboardEvent = document.createEvent("KeyboardEvent");
  var initMethod =
    typeof keyboardEvent.initKeyboardEvent !== "undefined"
      ? "initKeyboardEvent"
      : "initKeyEvent";

  keyboardEvent[initMethod](
    "keydown", // event type: keydown, keyup, keypress
    true, // bubbles
    true, // cancelable
    window, // view: should be window
    false, // ctrlKey
    false, // altKey
    false, // shiftKey
    false, // metaKey
    c, // keyCode: unsigned long - the virtual key code, else 0
    0 // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
  );
  return keyboardEvent;
}

function injectCode(code) {
  var script = document.createElement("script");
  script.textContent = code;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

function strip(s) {
  return s.replace(/[\0\1\s]+/, "");
}
