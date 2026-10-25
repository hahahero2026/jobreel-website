/**
 * Job-Video.de — Legal Pages Email Obfuscation (Spam Protection)
 * Decodes Base64 encoded email addresses and replaces them with clickable mailto links.
 * Provides noscript fallback for accessibility and legal compliance (§ 5 DDG).
 */
(function() {
    function initSafeMail() {
        // 1. Text elements replacement (.safe-mail)
        var elements = document.querySelectorAll(".safe-mail");
        elements.forEach(function(el) {
            var encoded = el.getAttribute("data-encoded");
            if (encoded) {
                try {
                    var email = atob(encoded);
                    var link = document.createElement("a");
                    link.href = "mailto:" + email;
                    link.textContent = email;
                    el.innerHTML = "";
                    el.appendChild(link);
                } catch (e) {
                    console.error("Error decoding email address:", e);
                }
            }
        });

        // 2. Button / link elements href replacement (.safe-mail-btn)
        var buttons = document.querySelectorAll(".safe-mail-btn");
        buttons.forEach(function(btn) {
            var encoded = btn.getAttribute("data-encoded");
            var subject = btn.getAttribute("data-subject");
            if (encoded) {
                try {
                    var email = atob(encoded);
                    var url = "mailto:" + email + (subject ? "?subject=" + encodeURIComponent(subject) : "");
                    btn.setAttribute("href", url);
                } catch (e) {
                    console.error("Error decoding email button:", e);
                }
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSafeMail);
    } else {
        initSafeMail();
    }
})();
