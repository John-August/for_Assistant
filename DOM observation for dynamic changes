// SRT DOM observation for dynamic changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            console.log("DOM mutation detected. Retrying chat box search.");
            findAndTestChatBox();
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });
// END DOM observation for dynamic changes
