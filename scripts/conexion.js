const params = new URLSearchParams();

params.append("Cilent_ID", process.env.TINK_CLIENT_ID);
params.append("key", process.env.TINK_CLIENT_SECRET);
params.append("grant_type", "client_credentials");
params.append("scope", "authorization:grant,user:create");

const response = await fetch("https://api.tink.com/api/v1/oauth/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: params.toString()
});

const data = await response.json();

console.log(data);