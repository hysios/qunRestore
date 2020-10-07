import welcome from "shared/welcome";

welcome("background/index.js");

// Setting popup icon

// When we defined browser_action
if (chrome.browserAction) {
  chrome.browserAction.setIcon({
    path: require("icons/webpack-38.png"),
  });

  // When we defined page_action
} else if (chrome.pageAction) {
  const showPageAction = function (tabId) {
    chrome.pageAction.show(tabId);

    chrome.pageAction.setIcon({
      path: require("icons/webpack-38.png"),
      tabId: tabId,
    });
  };

  // Show page action on each page update
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    showPageAction(tabId);
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (request.greeting == "hello") sendResponse({ farewell: "goodbye" });

  if (request.found == "add_button") {
    chrome.browserAction.setBadgeText({ text: "ON" });
    sendResponse({ success: true });
  }
});

chrome.tabs.onActivated.addListener(function (tabId, windowId) {
  chrome.tabs.query({ active: true }, function (tabs) {
    tabs.map((tab) => {
      console.log("tab", tab);
    });
  });
});
