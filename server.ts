import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
import { incrementVoteByBreedName, doesBreedNameExists, newBreedRow  } from "./db";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();



app.get("/leaderboard", async (req, res) => {
  const dbres = await client.query('select * from votes ORDER BY votes DESC LIMIT 10');
  res.status(200).json(dbres.rows);
});

app.post<{}, {}, {breedName: string}>("/votes", async (req,res)=>{
  const {breedName} = req.body;
  if (await doesBreedNameExists(client,breedName)) {
   const voteNumber = await incrementVoteByBreedName(client, breedName)
    res.status(200).json({votes: voteNumber})
  } else {
  const newBreedRowVote = await newBreedRow(client, breedName)
    res.status(200).json({votes: newBreedRowVote})
  }
}) 


//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});

