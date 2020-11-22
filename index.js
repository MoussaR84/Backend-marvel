const express = require("express");
const axios = require("axios");
const cors = require("cors");
const md5 = require("md5");
const uid2 = require("uid2");
require("dotenv").config();

const app = express();
app.use(cors());

// http://gateway.marvel.com/v1/public/comics?ts=1&apikey=1234&hash=ffd275c5130566a2916217b101f26150
// md5(ts+privateKey+publicKey)

const date = new Date();
const timestamp = date.getTime() / 1000;
const ts = Math.floor(timestamp);

// Creation of Hash using Ts, private Marvel key and public Marvel key
const publicKey = process.env.PUBLIC_KEY;
const hash = md5(ts + process.env.PRIVATE_KEY + publicKey).toString();

//LES ROUTES

app.get("/comics", async (req, res) => {
  const { title, page } = req.query;
  let search;
  if (title !== "") {
    search = `&titleStartsWith=${title}`;
  }

  const offset = page * 100 - 100;

  try {
    const response = await axios.get(
      `https://gateway.marvel.com/v1/public/comics?orderBy=title&ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=100&offset=${offset}` +
        search
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

app.get("/character/:id/comics", async (req, res) => {
  try {
    const response = await axios.get(
      `https://gateway.marvel.com/v1/public/characters/${req.params.id}/comics?ts=${ts}&apikey=${publicKey}&hash=${hash}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// LES PERSONNAGES CHARACTERS

app.get("/character/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `https://gateway.marvel.com/v1/public/characters/${req.params.id}?ts=${ts}&apikey=${publiclKey}&hash=${hash}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});
//LA HOME

app.get("/", async (req, res) => {
  const page = req.query.page;
  const name = req.query.name;

  // prendre en compte les perso avec etoiles

  let search;
  let offset;
  if (name !== "") {
    search = `&nameStartsWith=${name}`;
    offset = 0;
  } else {
    offset = page * 100 - 100;
  }

  try {
    const response = await axios.get(
      `https://gateway.marvel.com/v1/public/characters?orderBy=name&ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=100&offset=${offset}` +
        search
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// pour les autres routes on fait appel mais on redirigera sur une erreur

app.all("*", async (req, res) => {
  res.status(404).json({ message: "Cette route n'existe pas" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server Started on port ${process.env.PORT}`);
});
