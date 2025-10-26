const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id:
    "AXigoPvLwFQAgByJRFOSluFH_v1nWllmjsda3OVXWK5LdhfA0sdckPcWLrfqpa_L0PMZuPHOY-c8yjvD",
  client_secret:
    "EPN9e35x5SFwAZ6TleCgG8kxmlVOXGPp80hUyFj97IP7btVwHKIvK_ubAk76LoPZTT9m0a-zAxZQnfra",
});

module.exports = paypal;
