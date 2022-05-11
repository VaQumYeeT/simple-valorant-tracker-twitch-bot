import { createRequire } from "module";
const require = createRequire(import.meta.url);
import tmiJs from "tmi.js";
require("dotenv").config();
import fetch from "node-fetch";

const options = {
  options: { debug: true },
  connection: {
    reconnect: true,
    secure: true,
  },
  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_0AUTH_TOKEN,
  },
  channels: [process.env.TWITCH_BOT_CHANNEL],
};

const client = new tmiJs.Client(options);
client.connect().catch(console.error);

client.on("connected", () => {
  console.log("Bot connected.");
});

client.on("message", (channel, user, message, self) => {
  if (self) return;

  if (message === `!rank`) {
    fetch("https://api.henrikdev.xyz/valorant/v1/mmr/eu/paulinski/2912", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        client.say(
          channel,
          `@${user.username}, Pauli ist zurzeit ${data.data.currenttierpatched} und hat eine Elo von ${data.data.elo}. peepoWow`
        );
      });
    console.log(message);
  }

  if (message.includes("!rank ")) {
    const firstStep = message.split("!rank");
    const searchedUser = firstStep[1].split("#");
    const userID = searchedUser[0].trimStart();
    const userNumber = searchedUser[1];
    if (message === `!rank ${userID}#${userNumber}`) {
      fetch(
        `https://api.henrikdev.xyz/valorant/v1/account/${userID}/${userNumber}`,
        {
          method: "GET",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          fetch(
            `https://api.henrikdev.xyz/valorant/v1/mmr/${data.data.region}/${data.data.name}/${data.data.tag}`,
            {
              method: "GET",
            }
          )
            .then((response) => response.json())
            .then((data) => {
              client.say(
                channel,
                `@${user.username}, Der Rang von ${data.data.name} ist ${data.data.currenttierpatched}. Derzeitige Elo beträgt ${data.data.elo}. Hmmm`
              );
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    }
  }
});
