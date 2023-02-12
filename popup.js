// Get DOM components and regex.
const YT_EMBED_URL_REGEX = /^https:\/\/www\.youtube\.com\/embed\/[a-z0-9A-Z-_]+[\?autoplay=1]*$/;
const YT_WATCH_URL_REGEX = /^https:\/\/www\.youtube\.com\/watch\?v\=[a-z0-9A-Z-_]+[\&autoplay=1]*$/;
const switchWrapper = document.getElementById("switch-wrapper");
const invalidUrlMessage = document.getElementById("invalid-url-message");

validateUrl(false);

function enableSwitcher() {
    const checkbox = document.getElementById("checker");
    checkbox.addEventListener("click", function(event) {
        validateUrl(true);
    });
}

function getEmbedUrl(watchUrl, tabId) {
    chrome.scripting.executeScript({
        target: {
            tabId: tabId,
        },
        args: [chrome],
        func: (chrome) => {
            alert(chrome.tabs.query);
            chrome.tabs.query({
                active: true,
                currentWindow: true
              }, function(tabs) {
                  // 2. Validate URL
                  const tabUrl = tabs[0].url;
                  const tabId = tabs[0].id;
                  
                  const video = document.getElementsByTagName("video");
                  let embedUrl = watchUrl.replace("watch?v=", "embed/").concat("?autoplay=1");
      
                  if (video.length > 0) {
                      const startAt = video[0].currentTime;
                      embedUrl = embedUrl.concat(`&start=${startAt}`);
                  }
                  
                  chrome.tabs.update({
                      url: embedUrl
                  });
              })
        },
    });
}

function getWatchUrl(embedUrl, tabId) {
    chrome.scripting.executeScript({
        target: {
            tabId: tabId,
        },
        func: () => {
            const startAt = document.getElementsByTagName("video")[0].currentTime;
            const watchUrl = embedUrl.replace("embed/", "watch?v=").concat(`&start=${startAt}&autoplay=1`);

            chrome.tabs.update(tabId, {
                url: watchUrl
            });
        },
    });
}

function validateUrl(clickedChecker) {
    // 1. Lookup URL
    chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {          
          // 2. Validate URL
          const tabUrl = tabs[0].url;
          const tabId = tabs[0].id;
          const isValidWatchUrl = YT_WATCH_URL_REGEX.test(tabUrl);
          const isValidEmbedUrl = YT_EMBED_URL_REGEX.test(tabUrl);

          if (isValidWatchUrl || isValidEmbedUrl) {
            console.log("Valid Youtube watch URL, enabling switcher...");
            const checkbox = document.getElementById("checker");

            switchWrapper.classList.remove("hidden");
            invalidUrlMessage.classList.add("hidden");
            invalidUrlMessage.setAttribute('style', 'height: 0px');
            enableSwitcher();

            if (isValidEmbedUrl) {
                // 4. Adjust checker look
                checkbox.checked = true;

                if (clickedChecker) {
                    // 5. Redirect to watch mode
                    checkbox.checked = false;
                    getWatchUrl(tabUrl, tabId);
                }
            } else {
                // 4. Adjust checker look
                checkbox.checked = false;

                if (clickedChecker) {
                    // 5. Redirect to embed mode
                    checkbox.checked = true;
                    getEmbedUrl(tabUrl, tabId);
                }
            }
          } else {
            console.log("Invalid Youtube watch URL, disabling switcher...");
            
            switchWrapper.classList.add("hidden");
            invalidUrlMessage.classList.remove("hidden");
            invalidUrlMessage.setAttribute('style', 'height: 40px');
          };
      })
}
